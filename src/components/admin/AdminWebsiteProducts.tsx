import { TableSkeleton } from "@/components/ui/loading-skeletons";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageUploader from "./ImageUploader";

const empty = {
  type: "page",
  name: "",
  slug: "",
  description: "",
  long_description: "",
  category: "",
  price_pkr: 0,
  preview_image_url: "",
  demo_url: "",
  is_enabled: true,
  is_popular: false,
  sort_order: 0,
  features: [] as string[],
  gallery_images: [] as string[],
  faq: [] as { q: string; a: string }[],
  seo_title: "",
  seo_description: "",
  seo_keywords: [] as string[],
  og_image_url: "",
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function AdminWebsiteProducts() {
  const { data = [], isLoading } = useAllWebsiteProducts();
  const upsert = useUpsertWebsiteProduct();
  const del = useDeleteWebsiteProduct();
  const { toast } = useToast();
  const [editing, setEditing] = useState<any | null>(null);
  const [featureInput, setFeatureInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [galleryInput, setGalleryInput] = useState("");

  const patch = (v: Partial<any>) => setEditing((e: any) => ({ ...e, ...v }));

  const save = async () => {
    try {
      const payload = {
        ...editing,
        slug: editing.slug || slugify(editing.name),
        features: editing.features ?? [],
        gallery_images: editing.gallery_images ?? [],
        faq: editing.faq ?? [],
        seo_keywords: editing.seo_keywords ?? [],
      };
      await upsert.mutateAsync(payload);
      toast({ title: "Saved" });
      setEditing(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const openNew = () => {
    setEditing({ ...empty });
    setFeatureInput(""); setKeywordInput(""); setGalleryInput("");
  };

  const openEdit = (p: any) => {
    setEditing({
      ...empty,
      ...p,
      features: Array.isArray(p.features) ? p.features : [],
      gallery_images: Array.isArray(p.gallery_images) ? p.gallery_images : [],
      faq: Array.isArray(p.faq) ? p.faq : [],
      seo_keywords: Array.isArray(p.seo_keywords) ? p.seo_keywords : [],
    });
    setFeatureInput(""); setKeywordInput(""); setGalleryInput("");
  };

  const addFeature = () => {
    const v = featureInput.trim();
    if (!v) return;
    patch({ features: [...(editing.features ?? []), v] });
    setFeatureInput("");
  };
  const addKeyword = () => {
    const v = keywordInput.trim();
    if (!v) return;
    patch({ seo_keywords: [...(editing.seo_keywords ?? []), v] });
    setKeywordInput("");
  };
  const addGallery = () => {
    const v = galleryInput.trim();
    if (!v) return;
    patch({ gallery_images: [...(editing.gallery_images ?? []), v] });
    setGalleryInput("");
  };
  const addFaq = () => patch({ faq: [...(editing.faq ?? []), { q: "", a: "" }] });
  const updateFaq = (i: number, key: "q" | "a", v: string) => {
    const next = [...editing.faq];
    next[i] = { ...next[i], [key]: v };
    patch({ faq: next });
  };
  const removeAt = (field: string, i: number) => {
    patch({ [field]: editing[field].filter((_: any, idx: number) => idx !== i) });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-display">Website Products</h2>
          <p className="text-sm text-muted-foreground">Manage Pages, Sections and Popups with rich details and SEO.</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> New</Button>
      </div>

      {isLoading ? <TableSkeleton columns={4} rows={5} /> : (
        <div className="grid gap-3">
          {data.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {p.preview_image_url && <img src={p.preview_image_url} alt="" className="w-16 h-12 rounded object-cover" />}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold truncate">{p.name}</p>
                      <Badge variant="outline" className="capitalize text-xs">{p.type}</Badge>
                      {p.is_popular && <Badge className="text-xs">Popular</Badge>}
                      {!p.is_enabled && <Badge variant="secondary" className="text-xs">Disabled</Badge>}
                      {Array.isArray(p.features) && p.features.length > 0 && (
                        <Badge variant="outline" className="text-xs">{p.features.length} features</Badge>
                      )}
                      {p.seo_title && <Badge variant="outline" className="text-xs">SEO</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">PKR {p.price_pkr.toLocaleString()} {p.category && `• ${p.category}`}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => { if (confirm("Delete this item?")) del.mutate(p.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} Website Product</DialogTitle></DialogHeader>
          {editing && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-3 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Type</Label>
                    <Select value={editing.type} onValueChange={(v) => patch({ type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="page">Page</SelectItem>
                        <SelectItem value="section">Section</SelectItem>
                        <SelectItem value="popup">Popup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label>Price (PKR)</Label><Input type="number" value={editing.price_pkr} onChange={(e) => patch({ price_pkr: +e.target.value })} /></div>
                </div>
                <div className="space-y-1"><Label>Name</Label><Input value={editing.name} onChange={(e) => patch({ name: e.target.value })} /></div>
                <div className="space-y-1">
                  <Label>Slug</Label>
                  <div className="flex gap-2">
                    <Input value={editing.slug} onChange={(e) => patch({ slug: e.target.value })} placeholder="auto from name" />
                    <Button type="button" variant="outline" size="sm" onClick={() => patch({ slug: slugify(editing.name) })}>Auto</Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Category</Label><Input value={editing.category ?? ""} onChange={(e) => patch({ category: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Sort Order</Label><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => patch({ sort_order: +e.target.value })} /></div>
                </div>
                <div className="space-y-1"><Label>Short Description</Label><Textarea rows={2} value={editing.description ?? ""} onChange={(e) => patch({ description: e.target.value })} placeholder="One-line summary shown in cards" /></div>
                <div className="space-y-1"><Label>Demo URL</Label><Input value={editing.demo_url ?? ""} onChange={(e) => patch({ demo_url: e.target.value })} placeholder="https://…" /></div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2"><Switch checked={editing.is_enabled} onCheckedChange={(v) => patch({ is_enabled: v })} /> Enabled</label>
                  <label className="flex items-center gap-2"><Switch checked={editing.is_popular} onCheckedChange={(v) => patch({ is_popular: v })} /> Popular</label>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4 pt-3">
                <div className="space-y-1">
                  <Label>Long Description</Label>
                  <Textarea rows={6} value={editing.long_description ?? ""} onChange={(e) => patch({ long_description: e.target.value })} placeholder="Detailed description shown on the addon detail page. Supports plain text with line breaks." />
                </div>

                <div className="space-y-2">
                  <Label>Features / What's included</Label>
                  <div className="flex gap-2">
                    <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())} placeholder="Add a feature and press Enter" />
                    <Button type="button" variant="outline" onClick={addFeature}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(editing.features ?? []).map((f: string, i: number) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {f}
                        <button onClick={() => removeAt("features", i)}><X className="h-3 w-3" /></button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>FAQ</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addFaq}><Plus className="h-3 w-3 mr-1" /> Add FAQ</Button>
                  </div>
                  {(editing.faq ?? []).map((f: any, i: number) => (
                    <div key={i} className="border rounded-md p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Q&A #{i + 1}</span>
                        <Button size="sm" variant="ghost" onClick={() => removeAt("faq", i)}><X className="h-3 w-3" /></Button>
                      </div>
                      <Input placeholder="Question" value={f.q} onChange={(e) => updateFaq(i, "q", e.target.value)} />
                      <Textarea placeholder="Answer" rows={2} value={f.a} onChange={(e) => updateFaq(i, "a", e.target.value)} />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4 pt-3">
                <div className="space-y-1">
                  <Label>Preview Image (main)</Label>
                  <ImageUploader value={editing.preview_image_url ?? ""} onChange={(url) => patch({ preview_image_url: url })} folder="website-products" aspect="video" />
                </div>
                <div className="space-y-2">
                  <Label>Gallery Images</Label>
                  <div className="flex gap-2">
                    <Input value={galleryInput} onChange={(e) => setGalleryInput(e.target.value)} placeholder="Paste image URL and Add" />
                    <Button type="button" variant="outline" onClick={addGallery}>Add</Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(editing.gallery_images ?? []).map((src: string, i: number) => (
                      <div key={i} className="relative group">
                        <img src={src} alt="" className="w-full aspect-video object-cover rounded border" />
                        <button onClick={() => removeAt("gallery_images", i)} className="absolute top-1 right-1 bg-background/90 border rounded p-0.5 opacity-0 group-hover:opacity-100"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-3 pt-3">
                <div className="space-y-1">
                  <Label>SEO Title <span className="text-xs text-muted-foreground">({(editing.seo_title ?? "").length}/60)</span></Label>
                  <Input maxLength={70} value={editing.seo_title ?? ""} onChange={(e) => patch({ seo_title: e.target.value })} placeholder="Defaults to product name" />
                </div>
                <div className="space-y-1">
                  <Label>Meta Description <span className="text-xs text-muted-foreground">({(editing.seo_description ?? "").length}/160)</span></Label>
                  <Textarea rows={3} maxLength={200} value={editing.seo_description ?? ""} onChange={(e) => patch({ seo_description: e.target.value })} placeholder="Defaults to short description" />
                </div>
                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <div className="flex gap-2">
                    <Input value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())} placeholder="Add keyword and press Enter" />
                    <Button type="button" variant="outline" onClick={addKeyword}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(editing.seo_keywords ?? []).map((k: string, i: number) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {k}
                        <button onClick={() => removeAt("seo_keywords", i)}><X className="h-3 w-3" /></button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Social Preview Image (og:image)</Label>
                  <ImageUploader value={editing.og_image_url ?? ""} onChange={(url) => patch({ og_image_url: url })} folder="website-products/seo" aspect="video" />
                  <p className="text-xs text-muted-foreground">1200×630 recommended. Falls back to preview image.</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={upsert.isPending}>{upsert.isPending ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
