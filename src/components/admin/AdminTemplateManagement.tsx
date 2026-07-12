import { TableSkeleton } from "@/components/ui/loading-skeletons";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Upload, LayoutTemplate, Search, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { TEMPLATE_CATEGORIES, TEMPLATE_CATEGORY_NAMES } from "@/lib/templateCategories";
import { ALL_CONDITIONAL_FIELDS, FIELD_LABELS, ConditionalField, getPreset } from "@/lib/templatePresets";

interface TemplateForm {
  id?: string;
  name: string;
  niche: string;
  category: string;
  subcategory: string;
  description: string;
  long_description: string;
  demo_url: string;
  features: string[];
  admin_features: string[];
  is_active: boolean;
  preview_image_url: string | null;
  preset_pages: string[];
  preset_modules: string[];
  preset_conditional_fields: ConditionalField[];
  price_pkr: number;
  original_price_pkr: number | null;
  price_without_admin_pkr: number | null;
  price_with_admin_pkr: number | null;
  slug: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
  og_image_url: string;
  image_alt: string;
}

const emptyForm: TemplateForm = {
  name: "", niche: "", category: "", subcategory: "", description: "", long_description: "", demo_url: "", features: [], admin_features: [], is_active: true, preview_image_url: null,
  preset_pages: [], preset_modules: [], preset_conditional_fields: [], price_pkr: 0, original_price_pkr: null,
  price_without_admin_pkr: null, price_with_admin_pkr: null,
  slug: "", meta_title: "", meta_description: "", meta_keywords: [], og_image_url: "", image_alt: "",
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");



const AdminTemplateManagement = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TemplateForm>(emptyForm);
  const [featureInput, setFeatureInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ["admin_templates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("templates").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async (t: TemplateForm) => {
      let preview_image_url = t.preview_image_url;

      if (imageFile) {
        setUploading(true);
        const ext = imageFile.name.split(".").pop();
        const path = `templates/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("store-assets").upload(path, imageFile, { upsert: true });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("store-assets").getPublicUrl(path);
        preview_image_url = urlData.publicUrl;
        setUploading(false);
      }

      const payload = {
        name: t.name,
        niche: t.niche || t.subcategory || t.category,
        category: t.category || null,
        subcategory: t.subcategory || null,
        description: t.description || null,
        long_description: t.long_description || null,
        demo_url: t.demo_url || null,
        features: t.features,
        admin_features: t.admin_features,
        is_active: t.is_active,
        preview_image_url,
        preset_pages: t.preset_pages,
        preset_modules: t.preset_modules,
        preset_conditional_fields: t.preset_conditional_fields,
        price_pkr: t.price_pkr || 0,
        original_price_pkr: t.original_price_pkr && t.original_price_pkr > 0 ? t.original_price_pkr : null,
        price_without_admin_pkr: t.price_without_admin_pkr && t.price_without_admin_pkr > 0 ? t.price_without_admin_pkr : null,
        price_with_admin_pkr: t.price_with_admin_pkr && t.price_with_admin_pkr > 0 ? t.price_with_admin_pkr : null,
        slug: t.slug?.trim() ? slugify(t.slug) : (t.name ? slugify(t.name) : null),
        meta_title: t.meta_title?.trim() || null,
        meta_description: t.meta_description?.trim() || null,
        meta_keywords: t.meta_keywords,
        og_image_url: t.og_image_url?.trim() || null,
        image_alt: t.image_alt?.trim() || null,
      };


      if (t.id) {
        const { error } = await supabase.from("templates").update(payload).eq("id", t.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("templates").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_templates"] });
      toast.success(form.id ? "Template updated" : "Template created");
      closeDialog();
    },
    onError: () => toast.error("Failed to save template"),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_templates"] });
      toast.success("Template deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const closeDialog = () => { setOpen(false); setForm(emptyForm); setImageFile(null); setFeatureInput(""); };

  const openEdit = (t: any) => {
    setForm({
      id: t.id, name: t.name, niche: t.niche,
      category: t.category || "", subcategory: t.subcategory || "",
      description: t.description || "",
      long_description: t.long_description || "",
      demo_url: t.demo_url || "", features: Array.isArray(t.features) ? t.features : [],
      admin_features: Array.isArray(t.admin_features) ? t.admin_features : [],
      is_active: t.is_active, preview_image_url: t.preview_image_url,
      preset_pages: Array.isArray(t.preset_pages) ? t.preset_pages : [],
      preset_modules: Array.isArray(t.preset_modules) ? t.preset_modules : [],
      preset_conditional_fields: Array.isArray(t.preset_conditional_fields) ? t.preset_conditional_fields : [],
      price_pkr: t.price_pkr ?? 0,
      original_price_pkr: t.original_price_pkr != null ? Number(t.original_price_pkr) : null,
      price_without_admin_pkr: t.price_without_admin_pkr != null ? Number(t.price_without_admin_pkr) : null,
      price_with_admin_pkr: t.price_with_admin_pkr != null ? Number(t.price_with_admin_pkr) : null,
      slug: t.slug || "",
      meta_title: t.meta_title || "",
      meta_description: t.meta_description || "",
      meta_keywords: Array.isArray(t.meta_keywords) ? t.meta_keywords : [],
      og_image_url: t.og_image_url || "",
      image_alt: t.image_alt || "",
    });
    setOpen(true);
  };


  const addFeature = () => {
    if (featureInput.trim()) {
      setForm((f) => ({ ...f, features: [...f.features, featureInput.trim()] }));
      setFeatureInput("");
    }
  };

  const removeFeature = (idx: number) => {
    setForm((f) => ({ ...f, features: f.features.filter((_, i) => i !== idx) }));
  };

  if (isLoading) return <TableSkeleton columns={5} rows={6} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="h-5 w-5 text-primary" />
          <span className="font-semibold text-lg">{templates?.length ?? 0} Templates</span>
        </div>
        <Button onClick={() => { setForm(emptyForm); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Template
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates?.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    {t.preview_image_url ? (
                      <img src={t.preview_image_url} alt={t.name} className="h-12 w-20 object-cover rounded border border-border" />
                    ) : (
                      <div className="h-12 w-20 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">No img</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {t.category && <Badge variant="default" className="w-fit text-[10px]">{t.category}</Badge>}
                      {t.subcategory && <Badge variant="outline" className="w-fit text-[10px]">{t.subcategory}</Badge>}
                      <Badge variant="secondary" className="w-fit text-[10px]">{t.niche}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {Array.isArray(t.features) ? (t.features as string[]).slice(0, 3).join(", ") : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.is_active ? "default" : "outline"}>
                      {t.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMut.mutate(t.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!templates || templates.length === 0) && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No templates yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); else setOpen(true); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Template" : "Add Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v, subcategory: "" }))}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_CATEGORY_NAMES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subcategory</Label>
                <Select value={form.subcategory} onValueChange={(v) => setForm((f) => ({ ...f, subcategory: v }))} disabled={!form.category}>
                  <SelectTrigger><SelectValue placeholder={form.category ? "Select subcategory" : "Pick category first"} /></SelectTrigger>
                  <SelectContent>
                    {(TEMPLATE_CATEGORIES[form.category] || []).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Niche (legacy tag)</Label>
              <Input value={form.niche} onChange={(e) => setForm((f) => ({ ...f, niche: e.target.value }))} placeholder="e.g. Clothing" />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
            </div>

            <div>
              <Label>Long description (detail page)</Label>
              <Textarea value={form.long_description} onChange={(e) => setForm((f) => ({ ...f, long_description: e.target.value }))} rows={4} placeholder="Full description shown on the template detail page." />
            </div>


            <div>
              <Label>Demo URL</Label>
              <Input value={form.demo_url} onChange={(e) => setForm((f) => ({ ...f, demo_url: e.target.value }))} placeholder="https://..." />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Sale price (PKR) — 0 for free</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.price_pkr}
                  onChange={(e) => setForm((f) => ({ ...f, price_pkr: Number(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Original price (PKR) — optional</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="Leave blank if not on sale"
                  value={form.original_price_pkr ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, original_price_pkr: e.target.value === "" ? null : Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="rounded-lg border border-border/60 p-4 space-y-3">
              <div>
                <Label className="text-base font-semibold">Admin panel variants</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Prices for the "Website only" vs. "Website + admin panel" options shown on the detail page.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Price without admin panel (PKR)</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Falls back to sale price"
                    value={form.price_without_admin_pkr ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, price_without_admin_pkr: e.target.value === "" ? null : Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Price with admin panel (PKR)</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Higher price with dashboard"
                    value={form.price_with_admin_pkr ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, price_with_admin_pkr: e.target.value === "" ? null : Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div>
                <Label>Admin panel features (one per line)</Label>
                <Textarea
                  rows={4}
                  placeholder={"Secure login\nManage content\nOrders & customers\nAnalytics"}
                  value={form.admin_features.join("\n")}
                  onChange={(e) => setForm((f) => ({ ...f, admin_features: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) }))}
                />
              </div>
            </div>






            <div>
              <Label>Preview Image</Label>
              <div className="flex items-center gap-3 mt-1">
                {(form.preview_image_url || imageFile) && (
                  <img
                    src={imageFile ? URL.createObjectURL(imageFile) : form.preview_image_url!}
                    alt="preview"
                    className="h-16 w-24 object-cover rounded border border-border"
                  />
                )}
                <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-2 rounded-md border border-input bg-background text-sm hover:bg-accent transition-colors">
                  <Upload className="h-4 w-4" />
                  {imageFile ? imageFile.name : "Upload"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
                </label>
              </div>
            </div>

            <div>
              <Label>Features</Label>
              <div className="flex gap-2 mt-1">
                <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="Add feature"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }} />
                <Button type="button" size="sm" variant="outline" onClick={addFeature}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {form.features.map((f, i) => (
                  <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeFeature(i)}>
                    {f} ×
                  </Badge>
                ))}
              </div>
            </div>


            {/* Onboarding presets */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Onboarding presets</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={!form.category}
                  onClick={() => {
                    const base = getPreset(form.category, form.subcategory);
                    setForm((f) => ({
                      ...f,
                      preset_pages: f.preset_pages.length ? f.preset_pages : base.pages,
                      preset_modules: f.preset_modules.length ? f.preset_modules : base.modules,
                      preset_conditional_fields: f.preset_conditional_fields.length ? f.preset_conditional_fields : base.conditionalFields,
                    }));
                  }}
                >
                  Fill from category defaults
                </Button>
              </div>

              <TagListEditor
                label="Included pages"
                placeholder="e.g. Home"
                value={form.preset_pages}
                onChange={(v) => setForm((f) => ({ ...f, preset_pages: v }))}
              />
              <TagListEditor
                label="Included modules"
                placeholder="e.g. Reviews"
                value={form.preset_modules}
                onChange={(v) => setForm((f) => ({ ...f, preset_modules: v }))}
              />

              <div>
                <Label className="text-xs text-muted-foreground">Conditional questions to ask</Label>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {ALL_CONDITIONAL_FIELDS.map((f) => {
                    const active = form.preset_conditional_fields.includes(f);
                    return (
                      <Badge
                        key={f}
                        variant={active ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() =>
                          setForm((s) => ({
                            ...s,
                            preset_conditional_fields: active
                              ? s.preset_conditional_fields.filter((x) => x !== f)
                              : [...s.preset_conditional_fields, f],
                          }))
                        }
                      >
                        {FIELD_LABELS[f]}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                If left empty, defaults from the selected category/subcategory will be used.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button disabled={!form.name || !form.category || upsert.isPending || uploading}
              onClick={() => upsert.mutate(form)}>
              {upsert.isPending || uploading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const TagListEditor = ({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  value: string[];
  onChange: (v: string[]) => void;
}) => {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim();
    if (!t || value.includes(t)) return;
    onChange([...value, t]);
    setDraft("");
  };
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex gap-2 mt-1">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        />
        <Button type="button" size="sm" variant="outline" onClick={add}>Add</Button>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {value.map((v, i) => (
          <Badge
            key={`${v}-${i}`}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
          >
            {v} ×
          </Badge>
        ))}
        {value.length === 0 && <span className="text-[11px] text-muted-foreground">None — using defaults</span>}
      </div>
    </div>
  );
};

export default AdminTemplateManagement;
