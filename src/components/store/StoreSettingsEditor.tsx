import { useEffect, useState } from "react";
import { useStoreSettings, useUpsertStoreSettings } from "@/hooks/useStoreManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Save, Upload } from "lucide-react";

interface Props { storeId: string; }

const StoreSettingsEditor = ({ storeId }: Props) => {
  const { data: settings, isLoading } = useStoreSettings(storeId);
  const upsert = useUpsertStoreSettings();

  const [form, setForm] = useState({
    description: "", contact_email: "", contact_phone: "",
    address: "", primary_color: "#16a34a", secondary_color: "#f59e0b",
    logo_url: "", banner_url: "",
  });
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setForm({
        description: settings.description || "",
        contact_email: settings.contact_email || "",
        contact_phone: settings.contact_phone || "",
        address: settings.address || "",
        primary_color: settings.primary_color || "#16a34a",
        secondary_color: settings.secondary_color || "#f59e0b",
        logo_url: settings.logo_url || "",
        banner_url: settings.banner_url || "",
      });
    }
  }, [settings]);

  const handleUpload = async (field: "logo_url" | "banner_url", file: File) => {
    setUploading(field);
    const path = `${storeId}/${field}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("store-assets").upload(path, file);
    if (error) { toast.error("Upload failed"); setUploading(null); return; }
    const { data } = supabase.storage.from("store-assets").getPublicUrl(path);
    setForm((f) => ({ ...f, [field]: data.publicUrl }));
    setUploading(null);
  };

  const handleSave = async () => {
    try {
      await upsert.mutateAsync({ store_id: storeId, ...form });
      toast.success("Settings saved");
    } catch (e: any) { toast.error(e.message); }
  };

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-display text-foreground">Site Settings</h2>
        <Button onClick={handleSave} disabled={upsert.isPending}><Save className="h-4 w-4 mr-2" /> Save Changes</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Branding</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Logo</Label>
              {form.logo_url && <img src={form.logo_url} alt="Logo" className="h-16 w-16 rounded object-contain border border-border mb-2" />}
              <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload("logo_url", e.target.files[0])} disabled={uploading === "logo_url"} />
            </div>
            <div>
              <Label>Banner</Label>
              {form.banner_url && <img src={form.banner_url} alt="Banner" className="h-24 w-full rounded object-cover border border-border mb-2" />}
              <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload("banner_url", e.target.files[0])} disabled={uploading === "banner_url"} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Primary Color</Label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="h-10 w-10 rounded border-0 cursor-pointer" />
                  <Input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div>
                <Label>Secondary Color</Label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} className="h-10 w-10 rounded border-0 cursor-pointer" />
                  <Input value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} className="flex-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Contact & Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Store Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div><Label>Contact Email</Label><Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></div>
            <div><Label>Contact Phone</Label><Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} /></div>
            <div><Label>Address</Label><Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoreSettingsEditor;
