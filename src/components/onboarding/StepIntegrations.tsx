import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Plug, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import StepShell from "./StepShell";
import { OnboardingData } from "@/hooks/useOnboarding";

interface Props {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
}

const StepIntegrations = ({ data, update }: Props) => {
  const { data: template } = useQuery({
    queryKey: ["onboarding_template_for_integrations", data.template_id],
    queryFn: async () => {
      if (!data.template_id) return null;
      const { data: row } = await supabase
        .from("templates")
        .select("id,name,category")
        .eq("id", data.template_id)
        .maybeSingle();
      return row;
    },
    enabled: !!data.template_id,
  });

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ["onboarding_integrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .eq("is_enabled", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  // Admin-managed compatibility mapping (takes precedence over category matching)
  const { data: mapping = [] } = useQuery({
    queryKey: ["template_integrations", data.template_id],
    enabled: !!data.template_id,
    queryFn: async () => {
      const { data: rows, error } = await (supabase as any)
        .from("template_integrations")
        .select("integration_id, is_recommended")
        .eq("template_id", data.template_id as string);
      if (error) throw error;
      return rows ?? [];
    },
  });

  const compatibleIds = useMemo(
    () => new Set((mapping as any[]).map((m) => m.integration_id as string)),
    [mapping],
  );
  const recommendedIds = useMemo(
    () =>
      new Set(
        (mapping as any[]).filter((m) => m.is_recommended).map((m) => m.integration_id as string),
      ),
    [mapping],
  );

  const filtered = useMemo(() => {
    // 1. Admin-defined mapping wins
    if (compatibleIds.size > 0) {
      return integrations.filter((i: any) => compatibleIds.has(i.id));
    }
    // 2. Fall back to template-category matching
    if (template?.category) {
      const matched = integrations.filter(
        (i: any) => !i.category || i.category === template.category,
      );
      return matched.length > 0 ? matched : integrations;
    }
    // 3. All enabled integrations
    return integrations;
  }, [integrations, template, compatibleIds]);

  const matchSource: "admin" | "category" | "all" =
    compatibleIds.size > 0 ? "admin" : template?.category ? "category" : "all";

  const selectedIds = data.selected_integration_ids ?? [];

  const toggle = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    const total = filtered
      .filter((i: any) => next.includes(i.id))
      .reduce((sum: number, i: any) => sum + (i.price_pkr ?? 0), 0);
    update({ selected_integration_ids: next, integrations_total_pkr: total });
  };

  const total = data.integrations_total_pkr ?? 0;

  return (
    <StepShell
      title="Add integrations"
      subtitle={
        template
          ? `Recommended for ${template.name}. All integrations are a one-time charge.`
          : "Add tools like WhatsApp, analytics, forms and more. One-time charges."
      }
    >
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">
          No integrations available for this template yet.
        </p>
      ) : (
        <>
          {data.template_id && (
            <TooltipProvider delayDuration={150}>
              <div className="flex items-center gap-1.5 text-[11px] mb-3">
                <span className="uppercase tracking-wide bg-primary/10 text-primary rounded-lg px-2 py-0.5">
                  {matchSource === "admin"
                    ? "Matched by admin mapping"
                    : matchSource === "category"
                      ? "Matched by template category"
                      : "Showing all integrations"}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="How were these integrations matched?" className="inline-flex">
                      <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs text-xs">
                    {matchSource === "admin"
                      ? "Our team manually approved these integrations for this template in the admin dashboard (template_integrations mapping)."
                      : matchSource === "category"
                        ? `No admin mapping exists yet, so we matched integrations to the template's category (${template?.category}).`
                        : "No admin mapping and no template category found, so all active integrations are shown."}
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            {filtered.map((i: any) => {
              const selected = selectedIds.includes(i.id);
              const isFree = !i.price_pkr || i.price_pkr === 0;
              const isRecommended = recommendedIds.has(i.id);
              return (
                <Card
                  key={i.id}
                  className={`cursor-pointer transition-all ${
                    selected
                      ? "border-primary ring-2 ring-primary/40"
                      : "border-border/60 hover:border-primary/40"
                  }`}
                  onClick={() => toggle(i.id)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    {i.icon ? (
                      <img src={i.icon} alt="" className="w-10 h-10 rounded" />
                    ) : (
                      <Plug className="w-9 h-9 text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm truncate">{i.name}</p>
                        {selected && (
                          <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      {i.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{i.description}</p>
                      )}
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <Badge variant={isFree ? "secondary" : "default"} className="text-[10px]">
                          {isFree ? "Free" : `PKR ${i.price_pkr.toLocaleString()}`}
                        </Badge>
                        {isRecommended && (
                          <Badge className="bg-primary/15 text-primary hover:bg-primary/20 text-[10px]">
                            Recommended
                          </Badge>
                        )}
                        {i.is_popular && !isRecommended && (
                          <Badge variant="outline" className="text-[10px]">Popular</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {selectedIds.length > 0 && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex items-center justify-between mt-4">
          <span className="text-sm">
            {selectedIds.length} integration{selectedIds.length > 1 ? "s" : ""} selected
          </span>
          <span className="text-sm font-semibold text-primary tabular-nums">
            PKR {total.toLocaleString()}
          </span>
        </div>
      )}
    </StepShell>
  );
};

export default StepIntegrations;
