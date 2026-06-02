import { useState } from "react";
import { useAllWebsiteProducts, useUpsertWebsiteProduct, useDeleteWebsiteProduct } from "@/hooks/useMarketplace";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const empty = { type: "page", name: "", slug: "", description: "", category: "", price_pkr: 0, preview_image_url: "", demo_url: "", is_enabled: true, is_popular: false, sort_order: 0 };

export default function AdminWebsiteProducts() {
  const { data = [], isLoading } = useAllWebsiteProducts();
  const upsert = useUpsertWebsiteProduct();
  const del = useDeleteWebsiteProduct();
  const { toast } = useToast();
  const [editing, setEditing] = useState<any | null>(null);

  const save = async () => {
    try {
      await upsert.mutateAsync(editing);
      toast({ title: "Saved" });
      setEditing(null);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-display">Website Products</h2>
          <p className="text-sm text-muted-foreground">Manage Pages, Sections and Popups in the marketplace.</p>
        </div>
        <Button onClick={() => setEditing({ ...empty })}><Plus className="h-4 w-4 mr-2" /> New</Button>
      </div>

      {isLoading ? <TableSkeleton columns={4} rows={5} /> : (
        <div className="grid gap-3">
          {data.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {p.preview_image_url && <img src={p.preview_image_url} alt="" className="w-16 h-12 rounded object-cover" />}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{p.name}</p>
                      <Badge variant="outline" className="capitalize text-xs">{p.type}</Badge>
                      {p.is_popular && <Badge className="text-xs">Popular</Badge>}
                      {!p.is_enabled && <Badge variant="secondary" className="text-xs">Disabled</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">PKR {p.price_pkr.toLocaleString()} {p.category && `• ${p.category}`}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => { if (confirm("Delete this item?")) del.mutate(p.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} Website Product</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Type</Label>
                  <Select value={editing.type} onValueChange={(v) => setEditing({ ...editing, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="page">Page</SelectItem>
                      <SelectItem value="section">Section</SelectItem>
                      <SelectItem value="popup">Popup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Price (PKR)</Label><Input type="number" value={editing.price_pkr} onChange={(e) => setEditing({ ...editing, price_pkr: +e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="space-y-1"><Label>Slug</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
              <div className="space-y-1"><Label>Category</Label><Input value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></div>
              <div className="space-y-1"><Label>Description</Label><Textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="space-y-1"><Label>Preview Image URL</Label><Input value={editing.preview_image_url ?? ""} onChange={(e) => setEditing({ ...editing, preview_image_url: e.target.value })} /></div>
              <div className="space-y-1"><Label>Demo URL</Label><Input value={editing.demo_url ?? ""} onChange={(e) => setEditing({ ...editing, demo_url: e.target.value })} /></div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2"><Switch checked={editing.is_enabled} onCheckedChange={(v) => setEditing({ ...editing, is_enabled: v })} /> Enabled</label>
                <label className="flex items-center gap-2"><Switch checked={editing.is_popular} onCheckedChange={(v) => setEditing({ ...editing, is_popular: v })} /> Popular</label>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
