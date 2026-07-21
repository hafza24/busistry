import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, AlertTriangle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import StepShell from "./StepShell";
import { OnboardingData } from "@/hooks/useOnboarding";

interface Props {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
}

/** Infer the platform a template runs on from its tech_stack tags. */
const inferTemplatePlatform = (techStack: string[] | null | undefined): "wordpress" | "custom" | null => {
  if (!techStack || techStack.length === 0) return null; // unknown → allow all
  const joined = techStack.join(" ").toLowerCase();
  if (joined.includes("wordpress") || joined.includes("woocommerce") || joined.includes("bookly")) {
    return "wordpress";
  }
  if (
    joined.includes("react") ||
    joined.includes("next") ||
    joined.includes("vite") ||
    joined.includes("custom") ||
    joined.includes("coded") ||
    joined.includes("node")
  ) {
    return "custom";
  }
  return null;
};

const StepPlan = ({ data, update }: Props) => {
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["onboarding_plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("price_pkr");
      if (error) throw error;
      return data;
    },
  });

  const { data: template } = useQuery({
    queryKey: ["onboarding_template_platform", data.template_id],
    enabled: !!data.template_id,
    queryFn: async () => {
      const { data: t, error } = await supabase
        .from("templates")
        .select("id, name, tech_stack")
        .eq("id", data.template_id as string)
        .maybeSingle();
      if (error) throw error;
      return t;
    },
  });

  // Admin-managed compatibility mapping (takes precedence over tech-stack inference)
  const { data: mapping = [] } = useQuery({
    queryKey: ["template_plans", data.template_id],
    enabled: !!data.template_id,
    queryFn: async () => {
      const { data: rows, error } = await (supabase as any)
        .from("template_plans")
        .select("plan_id, is_recommended")
        .eq("template_id", data.template_id as string);
      if (error) throw error;
      return rows ?? [];
    },
  });

  const compatibleIds = useMemo(
    () => new Set((mapping as any[]).map((m) => m.plan_id as string)),
    [mapping],
  );
  const recommendedIds = useMemo(
    () => new Set((mapping as any[]).filter((m) => m.is_recommended).map((m) => m.plan_id as string)),
    [mapping],
  );

  const templatePlatform = useMemo(
    () => inferTemplatePlatform(template?.tech_stack as string[] | null),
    [template],
  );

  const isPlanCompatible = (plan: any) => {
    // If admin has defined an explicit mapping for this template, honour it.
    if (compatibleIds.size > 0) return compatibleIds.has(plan.id);
    // Otherwise fall back to tech-stack inference
    if (!templatePlatform) return true;
    const planPlatform = (plan.platform_type ?? "wordpress").toLowerCase();
    if (templatePlatform === "wordpress") return planPlatform === "wordpress";
    return planPlatform !== "wordpress";
  };

  const compatiblePlans = plans.filter(isPlanCompatible);
  const incompatiblePlans = plans.filter((p: any) => !isPlanCompatible(p));

  // Auto-clear an incompatible selection
  useEffect(() => {
    if (!data.plan_id || plans.length === 0) return;
    const selected = plans.find((p: any) => p.id === data.plan_id);
    if (selected && !isPlanCompatible(selected)) {
      update({ plan_id: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans, templatePlatform]);

  const subtitle = compatibleIds.size > 0
    ? "The plans below are approved by our team for this template."
    : templatePlatform === "custom"
      ? "This template is a custom-coded build, so WordPress plans aren't available for it."
      : templatePlatform === "wordpress"
        ? "This template runs on WordPress. Pick a WordPress-compatible plan below."
        : "Includes hosting, limits, and support. The Free plan is fine to start — you can upgrade anytime.";

  const renderCard = (p: any, disabled = false) => {
    const selected = data.plan_id === p.id;
    const isFree = p.type === "free" || p.price_pkr === 0;
    const features: string[] = Array.isArray(p.features) ? p.features : [];
    return (
      <Card
        key={p.id}
        className={`transition-all ${
          disabled
            ? "opacity-60 cursor-not-allowed border-border/40"
            : `cursor-pointer ${selected ? "border-primary ring-2 ring-primary/40" : "border-border/60 hover:border-primary/40"}`
        }`}
        onClick={() => !disabled && update({ plan_id: p.id })}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{p.name}</p>
                {selected && !disabled && (
                  <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
              <p className="text-lg font-bold text-primary mt-1">
                {isFree ? "Free" : `PKR ${p.price_pkr.toLocaleString()}`}
              </p>
              {p.duration_days && !isFree && (
                <p className="text-[11px] text-muted-foreground">{p.duration_days} days</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              {recommendedIds.has(p.id) && !disabled && <Badge className="bg-primary/15 text-primary hover:bg-primary/20 text-[10px]">Recommended</Badge>}
              {isFree && <Badge variant="secondary">Starter</Badge>}
              {disabled && <Badge variant="outline" className="text-[10px]">Not compatible</Badge>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-muted-foreground">
            <span>{p.max_products} products</span>
            <span>{p.max_categories} categories</span>
            <span>{p.max_pages ?? 5} pages</span>
            <span>{p.team_users ?? 1} team users</span>
            <span className="col-span-2 capitalize">Platform: {p.platform_type ?? "wordpress"}</span>
          </div>
          {features.length > 0 && (
            <ul className="space-y-1 pt-1 border-t border-border/40">
              {features.slice(0, 4).map((f) => (
                <li key={f} className="text-xs text-foreground/80 flex items-start gap-1.5">
                  <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <StepShell title="Choose your plan" subtitle={subtitle}>
      {isLoading ? (
        <div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-4">
          {compatiblePlans.length === 0 && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
              <div>
                <p className="font-medium text-foreground">No compatible plan available yet</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {templatePlatform === "custom"
                    ? "This template is custom-coded and doesn't run on our WordPress plans. Please contact support to arrange a custom quote, or pick a different template."
                    : "We couldn't find a plan that matches this template. Please pick another template or contact support."}
                </p>
              </div>
            </div>
          )}

          {compatiblePlans.length > 0 && data.template_id && (
            <TooltipProvider delayDuration={150}>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="uppercase tracking-wide">
                  {compatibleIds.size > 0 ? "Matched by admin mapping" : "Matched by tech stack"}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="How were these plans matched?" className="inline-flex">
                      <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs text-xs">
                    {compatibleIds.size > 0
                      ? "Our team manually approved these plans for this template in the admin dashboard (template_plans mapping)."
                      : templatePlatform
                        ? `No admin mapping exists yet, so we inferred compatibility from the template's tech stack (detected: ${templatePlatform}).`
                        : "No admin mapping and no tech-stack hints found, so all active plans are shown."}
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          )}

          {compatiblePlans.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {compatiblePlans.map((p: any) => renderCard(p, false))}
            </div>
          )}

          {incompatiblePlans.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Not compatible with this template
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {incompatiblePlans.map((p: any) => renderCard(p, true))}
              </div>
            </div>
          )}
        </div>
      )}
    </StepShell>
  );
};

export default StepPlan;
