import { useState } from "react";
import { useAllCaseStudies, useUpsertCaseStudy, useDeleteCaseStudy, type CaseStudy } from "@/hooks/useCaseStudies";
import { TableSkeleton } from "@/components/ui/loading-skeletons";
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

const empty: Partial<CaseStudy> = {
  title: "",
  slug: "",
  tag: "Case study",
  excerpt: "",
  content: "",
  cover_image_url: "",
  customer_name: "",
  customer_role: "",
  is_published: true,
  is_featured: false,
  sort_order: 0,
  seo_title: "",
  seo_description: "",
  seo_keywords: [],
  og_image_url: "",
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function AdminCaseStudies() {
  const { data = [], isLoading } = useAllCaseStudies();
  const upsert = useUpsertCaseStudy();
  const del = useDeleteCaseStudy();
  const { toast } = useToast();
  const [editing, setEditing] = useState<any | null>(null);
  const [keywordInput, setKeywordInput] = useState("");

  const patch = (v: Partial<any>) => setEditing((e: any) => ({ ...e, ...v }));

  const save = async () => {
    if (!editing?.title?.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    try {
      const payload = {
        ...editing,
        slug: (editing.slug || slugify(editing.title)).trim(),
        seo_keywords: editing.seo_keywords ?? [],
      };
      await upsert.mutateAsync(payload);
      toast({ title: "Saved" });
      setEditing(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const openNew = () => { setEditing({ ...empty }); setKeywordInput(""); };
  const openEdit = (p: CaseStudy) => {
    setEditing({ ...empty, ...p, seo_keywords: Array.isArray(p.seo_keywords) ? p.seo_keywords : [] });
    setKeywordInput("");
  };

  const addKeyword = () => {
    const v = keywordInput.trim();
    if (!v) return;
    patch({ seo_keywords: [...(editing.seo_keywords ?? []), v] });
    setKeywordInput("");
  };
  const removeKeyword = (i: number) => patch({ seo_keywords: editing.seo_keywords.filter((_: any, idx: number) => idx !== i) });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-display">Case Studies</h2>
          <p className="text-sm text-muted-foreground">Customer stories & interviews shown on the Reviews page.</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> New</Button>
      </div>

      {isLoading ? <TableSkeleton columns={4} rows={5} /> : (
        <div className="grid gap-3">
          {data.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No case studies yet. Click "New" to add one.</p>
          )}
          {data.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {p.cover_image_url && <img src={p.cover_image_url} alt="" className="w-20 h-14 rounded object-cover" />}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold truncate">{p.title}</p>
                      <Badge variant="outline" className="text-xs">{p.tag}</Badge>
                      {p.is_featured && <Badge className="text-xs">Featured</Badge>}
                      {!p.is_published && <Badge variant="secondary" className="text-xs">Draft</Badge>}
                      {p.seo_title && <Badge variant="outline" className="text-xs">SEO</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">/{p.slug}{p.customer_name ? ` • ${p.customer_name}` : ""}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => { if (confirm("Delete this case study?")) del.mutate(p.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} Case Study</DialogTitle></DialogHeader>
          {editing && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-3 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Tag</Label>
                    <Select value={editing.tag} onValueChange={(v) => patch({ tag: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Case study">Case study</SelectItem>
                        <SelectItem value="Interview">Interview</SelectItem>
                        <SelectItem value="Story">Story</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label>Sort Order</Label><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => patch({ sort_order: +e.target.value })} /></div>
                </div>
                <div className="space-y-1"><Label>Title</Label><Input value={editing.title} onChange={(e) => patch({ title: e.target.value })} /></div>
                <div className="space-y-1">
                  <Label>Slug</Label>
                  <div className="flex gap-2">
                    <Input value={editing.slug} onChange={(e) => patch({ slug: e.target.value })} placeholder="auto from title" />
                    <Button type="button" variant="outline" size="sm" onClick={() => patch({ slug: slugify(editing.title) })}>Auto</Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Customer Name</Label><Input value={editing.customer_name ?? ""} onChange={(e) => patch({ customer_name: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Customer Role</Label><Input value={editing.customer_role ?? ""} onChange={(e) => patch({ customer_role: e.target.value })} placeholder="Founder, CEO…" /></div>
                </div>
                <div className="space-y-1">
                  <Label>Cover Image</Label>
                  <ImageUploader value={editing.cover_image_url ?? ""} onChange={(url) => patch({ cover_image_url: url })} folder="case-studies" aspect="video" />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2"><Switch checked={editing.is_published} onCheckedChange={(v) => patch({ is_published: v })} /> Published</label>
                  <label className="flex items-center gap-2"><Switch checked={editing.is_featured} onCheckedChange={(v) => patch({ is_featured: v })} /> Featured</label>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-3 pt-3">
                <div className="space-y-1">
                  <Label>Excerpt <span className="text-xs text-muted-foreground">(shown on cards)</span></Label>
                  <Textarea rows={2} value={editing.excerpt ?? ""} onChange={(e) => patch({ excerpt: e.target.value })} placeholder="Short summary shown on the Reviews page card" />
                </div>
                <div className="space-y-1">
                  <Label>Body Content</Label>
                  <Textarea rows={10} value={editing.content ?? ""} onChange={(e) => patch({ content: e.target.value })} placeholder="Full case study content. Plain text with line breaks." />
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-3 pt-3">
                <div className="space-y-1">
                  <Label>SEO Title <span className="text-xs text-muted-foreground">({(editing.seo_title ?? "").length}/60)</span></Label>
                  <Input maxLength={70} value={editing.seo_title ?? ""} onChange={(e) => patch({ seo_title: e.target.value })} placeholder="Defaults to title" />
                </div>
                <div className="space-y-1">
                  <Label>Meta Description <span className="text-xs text-muted-foreground">({(editing.seo_description ?? "").length}/160)</span></Label>
                  <Textarea rows={3} maxLength={200} value={editing.seo_description ?? ""} onChange={(e) => patch({ seo_description: e.target.value })} placeholder="Defaults to excerpt" />
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
                        <button onClick={() => removeKeyword(i)}><X className="h-3 w-3" /></button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Social Preview Image (og:image)</Label>
                  <ImageUploader value={editing.og_image_url ?? ""} onChange={(url) => patch({ og_image_url: url })} folder="case-studies/seo" aspect="video" />
                  <p className="text-xs text-muted-foreground">1200×630 recommended. Falls back to cover image.</p>
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
