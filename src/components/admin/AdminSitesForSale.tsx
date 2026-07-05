import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { TableSkeleton } from "@/components/ui/loading-skeletons";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const empty = {
  id: "" as string | undefined,
  title: "",
  slug: "",
  description: "",
  category: "",
  tech_stack: "",
  preview_image_url: "",
  demo_url: "",
  price_pkr: 0,
  original_price_pkr: "" as string | number,
  features: "",
  status: "available",
  is_active: true,
  sort_order: 0,
};

const statuses = ["available", "reserved", "sold"];

const AdminSitesForSale = () => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<typeof empty | null>(null);

  const { data: sites, isLoading } = useQuery({
    queryKey: ["admin_sites_for_sale"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sites_for_sale")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (values: typeof empty) => {
      const payload = {
        title: values.title,
        slug: values.slug || null,
        description: values.description || null,
        category: values.category || null,
        tech_stack: values.tech_stack
          ? values.tech_stack.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        preview_image_url: values.preview_image_url || null,
        demo_url: values.demo_url || null,
        price_pkr: Number(values.price_pkr) || 0,
        original_price_pkr: values.original_price_pkr === "" ? null : Number(values.original_price_pkr),
        features: values.features
          ? values.features.split("\n").map((s) => s.trim()).filter(Boolean)
          : [],
        status: values.status,
        is_active: values.is_active,
        sort_order: Number(values.sort_order) || 0,
      };
      if (values.id) {
        const { error } = await supabase.from("sites_for_sale").update(payload).eq("id", values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("sites_for_sale").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_sites_for_sale"] });
      qc.invalidateQueries({ queryKey: ["sites_for_sale"] });
      toast.success(editing?.id ? "Listing updated" : "Listing created");
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sites_for_sale").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_sites_for_sale"] });
      qc.invalidateQueries({ queryKey: ["sites_for_sale"] });
      toast.success("Listing deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const openEdit = (s: any) => {
    setEditing({
      id: s.id,
      title: s.title || "",
      slug: s.slug || "",
      description: s.description || "",
      category: s.category || "",
      tech_stack: Array.isArray(s.tech_stack) ? s.tech_stack.join(", ") : "",
      preview_image_url: s.preview_image_url || "",
      demo_url: s.demo_url || "",
      price_pkr: s.price_pkr || 0,
      original_price_pkr: s.original_price_pkr ?? "",
      features: Array.isArray(s.features) ? (s.features as string[]).join("\n") : "",
      status: s.status || "available",
      is_active: s.is_active,
      sort_order: s.sort_order || 0,
    });
  };

  if (isLoading) return <TableSkeleton columns={6} rows={5} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{sites?.length || 0} listings</p>
        <Button onClick={() => setEditing({ ...empty })}>
          <Plus className="h-4 w-4 mr-1" /> New Listing
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price (PKR)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Created</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites?.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.title}</TableCell>
                <TableCell>{s.category || "—"}</TableCell>
                <TableCell>{Number(s.price_pkr).toLocaleString()}</TableCell>
                <TableCell><Badge variant="secondary">{s.status}</Badge></TableCell>
                <TableCell>{s.is_active ? "Yes" : "No"}</TableCell>
                <TableCell>{format(new Date(s.created_at), "dd MMM yyyy")}</TableCell>
                <TableCell className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(s)} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => confirm(`Delete "${s.title}"?`) && remove.mutate(s.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>{editing.id ? "Edit Listing" : "New Listing"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input placeholder="Ecommerce / Portfolio…" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Preview Image URL</Label>
                    <Input value={editing.preview_image_url} onChange={(e) => setEditing({ ...editing, preview_image_url: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Demo URL</Label>
                    <Input value={editing.demo_url} onChange={(e) => setEditing({ ...editing, demo_url: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tech Stack (comma-separated)</Label>
                  <Input placeholder="React, WordPress, WooCommerce" value={editing.tech_stack} onChange={(e) => setEditing({ ...editing, tech_stack: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Features (one per line)</Label>
                  <Textarea value={editing.features} onChange={(e) => setEditing({ ...editing, features: e.target.value })} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Price (PKR) *</Label>
                    <Input type="number" value={editing.price_pkr} onChange={(e) => setEditing({ ...editing, price_pkr: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Original Price</Label>
                    <Input type="number" value={editing.original_price_pkr} onChange={(e) => setEditing({ ...editing, original_price_pkr: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Sort Order</Label>
                    <Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Active (visible on site)</Label>
                    <div className="flex items-center h-10">
                      <Switch checked={editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={() => save.mutate(editing)} disabled={save.isPending || !editing.title}>
                  {save.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSitesForSale;
