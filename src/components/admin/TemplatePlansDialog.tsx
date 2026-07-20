import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  templateId: string | null;
  templateName?: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type Row = { plan_id: string; is_recommended: boolean };

const TemplatePlansDialog = ({ templateId, templateName, open, onOpenChange }: Props) => {
  const qc = useQueryClient();
  const [rows, setRows] = useState<Record<string, Row>>({});

  const { data: plans = [] } = useQuery({
    queryKey: ["admin_all_plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plans").select("*").order("price_pkr");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: existing = [], isLoading } = useQuery({
    queryKey: ["template_plans_admin", templateId],
    enabled: !!templateId && open,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("template_plans")
        .select("plan_id, is_recommended")
        .eq("template_id", templateId as string);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  useEffect(() => {
    if (!open) return;
    const map: Record<string, Row> = {};
    existing.forEach((r) => { map[r.plan_id] = { plan_id: r.plan_id, is_recommended: r.is_recommended }; });
    setRows(map);
  }, [existing, open]);

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!templateId) return;
      // Replace all mappings for this template
      const { error: delErr } = await (supabase as any)
        .from("template_plans")
        .delete()
        .eq("template_id", templateId);
      if (delErr) throw delErr;

      const inserts = Object.values(rows);
      if (inserts.length > 0) {
        const { error: insErr } = await (supabase as any).from("template_plans").insert(
          inserts.map((r) => ({
            template_id: templateId,
            plan_id: r.plan_id,
            is_recommended: r.is_recommended,
          })),
        );
        if (insErr) throw insErr;
      }
    },
    onSuccess: () => {
      toast.success("Compatibility saved");
      qc.invalidateQueries({ queryKey: ["template_plans_admin", templateId] });
      qc.invalidateQueries({ queryKey: ["template_plans"] });
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to save"),
  });

  const toggle = (planId: string) => {
    setRows((cur) => {
      const next = { ...cur };
      if (next[planId]) delete next[planId];
      else next[planId] = { plan_id: planId, is_recommended: false };
      return next;
    });
  };

  const setRecommended = (planId: string, val: boolean) => {
    setRows((cur) => cur[planId] ? { ...cur, [planId]: { ...cur[planId], is_recommended: val } } : cur);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Compatible plans{templateName ? ` — ${templateName}` : ""}</DialogTitle>
          <DialogDescription>
            Select which plans customers can pick for this template. Leave empty to fall back to automatic tech-stack matching.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-2 max-h-[55vh] overflow-y-auto">
            {plans.map((p: any) => {
              const enabled = !!rows[p.id];
              return (
                <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Checkbox checked={enabled} onCheckedChange={() => toggle(p.id)} className="mt-1" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">{p.name}</p>
                        <Badge variant="outline" className="text-[10px] capitalize">{p.platform_type}</Badge>
                        <Badge variant="secondary" className="text-[10px] capitalize">{p.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {p.price_pkr === 0 ? "Free" : `PKR ${Number(p.price_pkr).toLocaleString()}`}
                        {p.duration_days ? ` · ${p.duration_days}d` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                    <span>Recommended</span>
                    <Switch
                      checked={!!rows[p.id]?.is_recommended}
                      onCheckedChange={(v) => setRecommended(p.id, v)}
                      disabled={!enabled}
                    />
                  </div>
                </div>
              );
            })}
            {plans.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No plans exist yet.</p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
            {saveMut.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePlansDialog;
