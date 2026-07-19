import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useComingSoon } from "@/hooks/useComingSoon";
import { useQueryClient } from "@tanstack/react-query";
import { Rocket } from "lucide-react";

const ComingSoonToggle = () => {
  const { data: enabled = false, isLoading } = useComingSoon();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);

  const toggle = async (next: boolean) => {
    setSaving(true);
    const { data: userRes } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("site_settings")
      .update({
        coming_soon_enabled: next,
        updated_at: new Date().toISOString(),
        updated_by: userRes.user?.id ?? null,
      })
      .eq("id", true);
    setSaving(false);
    if (error) {
      toast.error("Failed to update: " + error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["site_settings", "coming_soon"] });
    toast.success(next ? "Coming Soon mode enabled" : "Coming Soon mode disabled");
  };

  return (
    <Card className="p-4 flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Rocket className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Coming Soon Mode</h3>
            {enabled ? (
              <Badge className="bg-primary/15 text-primary hover:bg-primary/15">Live</Badge>
            ) : (
              <Badge variant="outline">Off</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            When on, visitors are redirected to /coming-soon. Admins keep full access.
          </p>
        </div>
      </div>
      <Switch
        checked={enabled}
        disabled={isLoading || saving}
        onCheckedChange={toggle}
        aria-label="Toggle coming soon mode"
      />
    </Card>
  );
};

export default ComingSoonToggle;
