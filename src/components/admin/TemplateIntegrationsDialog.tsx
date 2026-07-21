import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plug } from "lucide-react";
import { toast } from "sonner";

interface Props {
  templateId: string | null;
  templateName?: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type Row = { integration_id: string; is_recommended: boolean };

const TemplateIntegrationsDialog = ({ templateId, templateName, open, onOpenChange }: Props) => {
  const qc = useQueryClient();
  const [rows, setRows] = useState<Record<string, Row>>({});

  const { data: integrations = [] } = useQuery({
    queryKey: ["admin_all_integrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: existing = [], isLoading } = useQuery({
    queryKey: ["template_integrations_admin", templateId],
    enabled: !!templateId && open,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("template_integrations")
        .select("integration_id, is_recommended")
        .eq("template_id", templateId as string);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  useEffect(() => {
    if (!open) return;
    const map: Record<string, Row> = {};
    existing.forEach((r) => {
      map[r.integration_id] = { integration_id: r.integration_id, is_recommended: r.is_recommended };
    });
    setRows(map);
  }, [existing, open]);

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!templateId) return;
      const { error: delErr } = await (supabase as any)
        .from("template_integrations")
        .delete()
        .eq("template_id", templateId);
      if (delErr) throw delErr;

      const inserts = Object.values(rows);
      if (inserts.length > 0) {
        const { error: insErr } = await (supabase as any).from("template_integrations").insert(
          inserts.map((r) => ({
            template_id: templateId,
            integration_id: r.integration_id,
            is_recommended: r.is_recommended,
          })),
        );
        if (insErr) throw insErr;
      }
    },
    onSuccess: () => {
      toast.success("Integrations saved");
      qc.invalidateQueries({ queryKey: ["template_integrations_admin", templateId] });
      qc.invalidateQueries({ queryKey: ["template_integrations"] });
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to save"),
  });

  const toggle = (id: string) => {
    setRows((cur) => {
      const next = { ...cur };
      if (next[id]) delete next[id];
      else next[id] = { integration_id: id, is_recommended: false };
      return next;
    });
  };

  const setRecommended = (id: string, val: boolean) => {
    setRows((cur) => (cur[id] ? { ...cur, [id]: { ...cur[id], is_recommended: val } } : cur));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Compatible integrations{templateName ? ` — ${templateName}` : ""}</DialogTitle>
          <DialogDescription>
            Select which integrations customers can add to this template. Leave empty to fall back to automatic
            category matching.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-2 max-h-[55vh] overflow-y-auto">
            {integrations.map((i: any) => {
              const enabled = !!rows[i.id];
              const isFree = !i.price_pkr || i.price_pkr === 0;
              return (
                <div key={i.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Checkbox checked={enabled} onCheckedChange={() => toggle(i.id)} className="mt-1" />
                    {i.icon ? (
                      <img src={i.icon} alt="" className="w-8 h-8 rounded shrink-0" />
                    ) : (
                      <Plug className="w-7 h-7 text-muted-foreground shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">{i.name}</p>
                        {i.category && <Badge variant="outline" className="text-[10px] capitalize">{i.category}</Badge>}
                        {!i.is_enabled && <Badge variant="secondary" className="text-[10px]">Disabled</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isFree ? "Free" : `PKR ${Number(i.price_pkr).toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                    <span>Recommended</span>
                    <Switch
                      checked={!!rows[i.id]?.is_recommended}
                      onCheckedChange={(v) => setRecommended(i.id, v)}
                      disabled={!enabled}
                    />
                  </div>
                </div>
              );
            })}
            {integrations.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No integrations exist yet.</p>
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

export default TemplateIntegrationsDialog;
