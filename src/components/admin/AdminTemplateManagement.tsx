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
import { Plus, Pencil, Trash2, Upload, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import { TEMPLATE_CATEGORIES, TEMPLATE_CATEGORY_NAMES } from "@/lib/templateCategories";

interface TemplateForm {
  id?: string;
  name: string;
  niche: string;
  category: string;
  subcategory: string;
  description: string;
  demo_url: string;
  features: string[];
  is_active: boolean;
  preview_image_url: string | null;
}

const emptyForm: TemplateForm = {
  name: "", niche: "", category: "", subcategory: "", description: "", demo_url: "", features: [], is_active: true, preview_image_url: null,
};

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
        niche: t.niche,
        category: t.category || null,
        subcategory: t.subcategory || null,
        description: t.description || null,
        demo_url: t.demo_url || null,
        features: t.features,
        is_active: t.is_active,
        preview_image_url,
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
      demo_url: t.demo_url || "", features: Array.isArray(t.features) ? t.features : [],
      is_active: t.is_active, preview_image_url: t.preview_image_url,
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

  if (isLoading) return <div className="text-muted-foreground p-4">Loading templates...</div>;

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
            <div className="grid grid-cols-2 gap-3">
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
              <Label>Demo URL</Label>
              <Input value={form.demo_url} onChange={(e) => setForm((f) => ({ ...f, demo_url: e.target.value }))} placeholder="https://..." />
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

            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button disabled={!form.name || !form.niche || upsert.isPending || uploading}
              onClick={() => upsert.mutate(form)}>
              {upsert.isPending || uploading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTemplateManagement;
