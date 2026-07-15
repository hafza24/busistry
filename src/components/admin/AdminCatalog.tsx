import { useMemo, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import {
  useCatalogItems,
  useUpsertCatalogItem,
  useDeleteCatalogItem,
  CATALOG_TYPE_META,
  type CatalogItem,
  type CatalogItemType,
  type CatalogPricingType,
} from "@/hooks/useCatalog";

const emptyItem: Partial<CatalogItem> = {
  slug: "",
  name: "",
  short_description: "",
  long_description: "",
  type: "addon",
  category: "",
  price_pkr: 0,
  pricing_type: "one_time",
  per_unit_label: "",
  icon: "",
  cover_image: "",
  demo_url: "",
  gallery: [],
  features: [],
  faq: [],
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  og_image: "",
  is_enabled: true,
  is_recommended: false,
  is_popular: false,
  sort_order: 0,
};

export default function AdminCatalog() {
  const { data: items = [], isLoading } = useCatalogItems({ includeDisabled: true });
  const upsert = useUpsertCatalogItem();
  const del = useDeleteCatalogItem();

  const [editing, setEditing] = useState<Partial<CatalogItem> | null>(null);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | CatalogItemType>("all");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((i) => {
      if (typeFilter !== "all" && i.type !== typeFilter) return false;
      if (!term) return true;
      return i.name.toLowerCase().includes(term) || i.slug.toLowerCase().includes(term);
    });
  }, [items, q, typeFilter]);

  const openNew = () => setEditing({ ...emptyItem });
  const openEdit = (i: CatalogItem) => setEditing({ ...i });

  const save = async () => {
    if (!editing) return;
    if (!editing.name?.trim() || !editing.slug?.trim() || !editing.type) {
      toast.error("Name, slug and type are required");
      return;
    }
    try {
      const payload: any = { ...editing };
      // Normalize array-likes
      payload.gallery = Array.isArray(payload.gallery) ? payload.gallery : [];
      payload.features = Array.isArray(payload.features) ? payload.features : [];
      payload.faq = Array.isArray(payload.faq) ? payload.faq : [];
      await upsert.mutateAsync(payload);
      toast.success("Saved");
      setEditing(null);
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this catalog item?")) return;
    try {
      await del.mutateAsync(id);
      toast.success("Deleted");
    } catch (e: any) {
      toast.error(e.message ?? "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Catalog</h2>
          <p className="text-sm text-muted-foreground">Unified catalog: add-ons, integrations, website products, and store upgrades.</p>
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {Object.entries(CATALOG_TYPE_META).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.plural}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="w-56" />
          <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> New item</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Items ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>
                      <div className="font-medium">{i.name}</div>
                      <div className="text-xs text-muted-foreground">{i.slug}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{CATALOG_TYPE_META[i.type].label}</Badge></TableCell>
                    <TableCell>PKR {Number(i.price_pkr).toLocaleString()}</TableCell>
                    <TableCell>
                      {i.is_enabled ? <Badge variant="secondary">Enabled</Badge> : <Badge variant="outline">Disabled</Badge>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(i.updated_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(i)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(i.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">No items.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit catalog item" : "New catalog item"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Name">
                  <Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </Field>
                <Field label="Slug">
                  <Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
                </Field>
                <Field label="Type">
                  <Select value={editing.type} onValueChange={(v) => setEditing({ ...editing, type: v as CatalogItemType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATALOG_TYPE_META).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Category">
                  <Input value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
                </Field>
                <Field label="Price (PKR)">
                  <Input type="number" min={0} value={editing.price_pkr ?? 0} onChange={(e) => setEditing({ ...editing, price_pkr: Number(e.target.value) || 0 })} />
                </Field>
                <Field label="Pricing type">
                  <Select value={editing.pricing_type} onValueChange={(v) => setEditing({ ...editing, pricing_type: v as CatalogPricingType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_time">One-time</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="per_unit">Per unit</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Per-unit label">
                  <Input value={editing.per_unit_label ?? ""} onChange={(e) => setEditing({ ...editing, per_unit_label: e.target.value })} placeholder="e.g. product" />
                </Field>
                <Field label="Sort order">
                  <Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) || 0 })} />
                </Field>
              </div>

              <Field label="Short description">
                <Textarea rows={2} value={editing.short_description ?? ""} onChange={(e) => setEditing({ ...editing, short_description: e.target.value })} />
              </Field>
              <Field label="Long description">
                <Textarea rows={6} value={editing.long_description ?? ""} onChange={(e) => setEditing({ ...editing, long_description: e.target.value })} />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Cover image URL">
                  <Input value={editing.cover_image ?? ""} onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })} />
                </Field>
                <Field label="Demo URL">
                  <Input value={editing.demo_url ?? ""} onChange={(e) => setEditing({ ...editing, demo_url: e.target.value })} />
                </Field>
                <Field label="Icon (name or URL)">
                  <Input value={editing.icon ?? ""} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} />
                </Field>
              </div>

              <Field label="Gallery image URLs (one per line)">
                <Textarea
                  rows={3}
                  value={(editing.gallery ?? []).join("\n")}
                  onChange={(e) => setEditing({ ...editing, gallery: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) })}
                />
              </Field>

              <Field label="Features (one per line)">
                <Textarea
                  rows={4}
                  value={(editing.features ?? []).join("\n")}
                  onChange={(e) => setEditing({ ...editing, features: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) })}
                />
              </Field>

              <Field label="FAQ (JSON: [{&quot;q&quot;:&quot;...&quot;,&quot;a&quot;:&quot;...&quot;}])">
                <Textarea
                  rows={4}
                  value={JSON.stringify(editing.faq ?? [], null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value || "[]");
                      setEditing({ ...editing, faq: Array.isArray(parsed) ? parsed : [] });
                    } catch { /* ignore until valid */ }
                  }}
                />
              </Field>

              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-sm font-semibold">SEO</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Meta title">
                    <Input value={editing.meta_title ?? ""} onChange={(e) => setEditing({ ...editing, meta_title: e.target.value })} />
                  </Field>
                  <Field label="OG image URL">
                    <Input value={editing.og_image ?? ""} onChange={(e) => setEditing({ ...editing, og_image: e.target.value })} />
                  </Field>
                </div>
                <Field label="Meta description">
                  <Textarea rows={2} value={editing.meta_description ?? ""} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} />
                </Field>
                <Field label="Meta keywords">
                  <Input value={editing.meta_keywords ?? ""} onChange={(e) => setEditing({ ...editing, meta_keywords: e.target.value })} />
                </Field>
              </div>

              <div className="flex flex-wrap gap-6 pt-2">
                <ToggleField label="Enabled" value={!!editing.is_enabled} onChange={(v) => setEditing({ ...editing, is_enabled: v })} />
                <ToggleField label="Recommended" value={!!editing.is_recommended} onChange={(v) => setEditing({ ...editing, is_recommended: v })} />
                <ToggleField label="Popular" value={!!editing.is_popular} onChange={(v) => setEditing({ ...editing, is_popular: v })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={upsert.isPending}>
              {upsert.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={value} onCheckedChange={onChange} />
      <Label className="cursor-pointer">{label}</Label>
    </div>
  );
}
