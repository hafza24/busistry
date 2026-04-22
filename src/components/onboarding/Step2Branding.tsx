import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import StepShell from "./StepShell";
import { OnboardingData } from "@/hooks/useOnboarding";

interface Props {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
}

const Step2Branding = ({ data, update }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/onboarding-logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("store-assets").upload(path, file);
      if (error) throw error;
      const { data: pub } = supabase.storage.from("store-assets").getPublicUrl(path);
      update({ logo_url: pub.publicUrl });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <StepShell title="Branding & design" subtitle="Tell us how your brand should look and feel.">
      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div className="space-y-0.5">
          <Label className="text-base">I need logo design</Label>
          <p className="text-xs text-muted-foreground">Toggle on if you don't have a logo yet.</p>
        </div>
        <Switch
          checked={!!data.needs_logo_design}
          onCheckedChange={(v) => update({ needs_logo_design: v })}
        />
      </div>

      {!data.needs_logo_design && (
        <div className="space-y-2">
          <Label>Upload logo</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <input type="file" accept="image/*" id="logo-upload" className="hidden" onChange={handleLogoUpload} />
            <label htmlFor="logo-upload" className="cursor-pointer block">
              {uploading ? (
                <Loader2 className="h-8 w-8 mx-auto text-muted-foreground animate-spin" />
              ) : (
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              )}
              <p className="text-sm text-muted-foreground">
                {data.logo_url ? "Logo uploaded — click to replace" : "Click to upload your logo"}
              </p>
              {data.logo_url && (
                <img src={data.logo_url} alt="Uploaded logo" className="h-16 mx-auto mt-3 object-contain" />
              )}
            </label>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="color_palette">Preferred color palette</Label>
        <Input
          id="color_palette"
          value={data.color_palette ?? ""}
          onChange={(e) => update({ color_palette: e.target.value })}
          placeholder="#0F172A, #3B82F6 — or describe the mood"
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label>Font style</Label>
        <Select value={data.font_style ?? ""} onValueChange={(v) => update({ font_style: v })}>
          <SelectTrigger><SelectValue placeholder="Pick a style" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="modern">Modern</SelectItem>
            <SelectItem value="classic">Classic</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
            <SelectItem value="bold">Bold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reference_websites">Reference websites (optional)</Label>
        <Textarea
          id="reference_websites"
          value={data.reference_websites ?? ""}
          onChange={(e) => update({ reference_websites: e.target.value })}
          placeholder="One URL per line — sites whose look you admire"
          rows={3}
          maxLength={1000}
        />
      </div>
    </StepShell>
  );
};

export default Step2Branding;
