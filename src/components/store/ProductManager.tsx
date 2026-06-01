import { useState } from "react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useCategories } from "@/hooks/useStoreManagement";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props { storeId: string; }

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const emptyForm = { name: "", slug: "", description: "", price: "", compare_at_price: "", stock: "0", category_id: "", is_active: true, images: [] as string[] };

const ProductManager = ({ storeId }: Props) => {
  const { data: products, isLoading } = useProducts(storeId);
  const { data: categories } = useCategories(storeId);
  const createMut = useCreateProduct();
  const updateMut = useUpdateProduct();
  const deleteMut = useDeleteProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const openNew = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, description: p.description || "",
      price: String(p.price), compare_at_price: p.compare_at_price ? String(p.compare_at_price) : "",
      stock: String(p.stock), category_id: p.category_id || "",
      is_active: p.is_active, images: (p.images as string[]) || [],
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${storeId}/products/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("store-assets").upload(path, file);
    if (error) { toast.error("Upload failed"); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("store-assets").getPublicUrl(path);
    setForm((f) => ({ ...f, images: [...f.images, urlData.publicUrl] }));
    setUploading(false);
  };

  const removeImage = (idx: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (!form.price || isNaN(Number(form.price))) { toast.error("Valid price is required"); return; }
    const slug = form.slug || slugify(form.name);
    const payload = {
      name: form.name, slug, description: form.description,
      price: Number(form.price), compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : undefined,
      stock: Number(form.stock) || 0, category_id: form.category_id || undefined,
      is_active: form.is_active, images: form.images,
    };
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, store_id: storeId, ...payload, category_id: payload.category_id || null });
        toast.success("Product updated");
      } else {
        await createMut.mutateAsync({ store_id: storeId, ...payload });
        toast.success("Product created");
      }
      setDialogOpen(false);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try { await deleteMut.mutateAsync({ id, store_id: storeId }); toast.success("Deleted"); } catch (e: any) { toast.error(e.message); }
  };

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Loading products...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-display text-foreground">Products</h2>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!products || products.length === 0) ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No products yet</TableCell></TableRow>
              ) : products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {(p.images as string[])?.length > 0 ? (
                      <img src={(p.images as string[])[0]} alt={p.name} className="h-10 w-10 rounded object-cover" />
                    ) : <div className="h-10 w-10 rounded bg-muted" />}
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{(p as any).categories?.name || "—"}</TableCell>
                  <TableCell>PKR {Number(p.price).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={p.stock > 0 ? "secondary" : "destructive"}>{p.stock}</Badge></TableCell>
                  <TableCell><Badge variant={p.is_active ? "default" : "outline"}>{p.is_active ? "Yes" : "No"}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Edit product"><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} aria-label="Delete product"><Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Product" : "New Product"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Price (PKR)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              <div><Label>Compare Price</Label><Input type="number" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
              <div>
                <Label>Category</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Active</Label>
            </div>
            <div>
              <Label>Images</Label>
              <div className="flex gap-2 flex-wrap mt-2">
                {form.images.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="h-16 w-16 rounded object-cover" />
                    <button onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">×</button>
                  </div>
                ))}
              </div>
              <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="mt-2" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>{editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManager;
