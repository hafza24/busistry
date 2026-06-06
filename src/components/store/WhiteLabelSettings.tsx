import { useEffect, useState } from "react";
import { useStoreSettings, useUpsertStoreSettings } from "@/hooks/useStoreManagement";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props { storeId: string }

const WhiteLabelSettings = ({ storeId }: Props) => {
  const { data: settings, isLoading } = useStoreSettings(storeId);
  const upsert = useUpsertStoreSettings();
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    brand_name: "",
    custom_domain: "",
    accent_color: "#16a34a",
    favicon_url: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        brand_name: (settings as any).brand_name ?? "",
        custom_domain: (settings as any).custom_domain ?? "",
        accent_color: (settings as any).accent_color ?? settings.primary_color ?? "#16a34a",
        favicon_url: (settings as any).favicon_url ?? "",
      });
    }
  }, [settings]);

  const uploadFavicon = async (file: File) => {
    setUploading(true);
    try {
      const path = `${storeId}/favicon/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("store-assets").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("store-assets").getPublicUrl(path);
      setForm((f) => ({ ...f, favicon_url: data.publicUrl }));
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await upsert.mutateAsync({ store_id: storeId, ...form });
      toast.success("White-label settings saved");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" /> White-Label
          </h2>
          <p className="text-sm text-muted-foreground">
            Customize how your storefront looks and the domain it lives on.
          </p>
        </div>
        <Button onClick={handleSave} disabled={upsert.isPending}>
          <Save className="h-4 w-4 mr-2" aria-hidden="true" /> Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Brand identity</CardTitle>
          <CardDescription>Shown to your customers across the storefront.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="brand-name">Brand name</Label>
            <Input
              id="brand-name"
              value={form.brand_name}
              onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
              placeholder="My Awesome Store"
            />
          </div>
          <div>
            <Label htmlFor="accent">Accent color</Label>
            <div className="flex gap-2 items-center">
              <input
                id="accent"
                type="color"
                value={form.accent_color}
                onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                className="h-10 w-12 rounded border border-input cursor-pointer"
                aria-label="Accent color picker"
              />
              <Input
                value={form.accent_color}
                onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                className="flex-1 font-mono"
              />
            </div>
          </div>
          <div>
            <Label>Favicon</Label>
            {form.favicon_url && (
              <img src={form.favicon_url} alt="Favicon" className="h-10 w-10 rounded border border-border mb-2 object-contain" />
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && uploadFavicon(e.target.files[0])}
              disabled={uploading}
              aria-label="Upload favicon"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom domain</CardTitle>
          <CardDescription>Use your own domain instead of a Busistree subdomain.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="custom-domain">Custom domain</Label>
            <Input
              id="custom-domain"
              value={form.custom_domain}
              onChange={(e) => setForm({ ...form, custom_domain: e.target.value })}
              placeholder="shop.yourbrand.pk"
            />
            <p className="text-xs text-muted-foreground mt-2">
              After saving, point a CNAME record from <code className="font-mono">{form.custom_domain || "shop.yourbrand.pk"}</code> to
              <code className="font-mono"> stores.busistree.com</code>. Our team verifies and provisions SSL within 24 hours.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhiteLabelSettings;
