import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Info, Loader2, TrendingUp } from "lucide-react";
import StepShell from "./StepShell";
import { OnboardingData } from "@/hooks/useOnboarding";
import { Addon, useAddons, useSubmissionAddons, calcAddonTotals, isPagesAddon } from "@/hooks/useAddons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
}

const fmtPKR = (n: number) => `PKR ${n.toLocaleString()}`;

const StepAddons = ({ data }: Props) => {
  // Resolve plan type for filtering
  const { data: plan } = useQuery({
    queryKey: ["plan_for_addons", data.plan_id],
    queryFn: async () => {
      if (!data.plan_id) return null;
      const { data: row } = await supabase.from("plans").select("type, price_pkr, name").eq("id", data.plan_id).maybeSingle();
      return row;
    },
    enabled: !!data.plan_id,
  });

  const { data: addons, isLoading } = useAddons(plan?.type ?? null);
  const { data: selections = [], toggle, setQuantity } = useSubmissionAddons(data.id);

  const selectedIds = useMemo(() => new Set(selections.map((s) => s.addon_id)), [selections]);
  const totals = useMemo(() => calcAddonTotals(selections), [selections]);

  const recommended = useMemo(
    () => (addons ?? []).filter((a) => a.is_recommended && !selectedIds.has(a.id)),
    [addons, selectedIds]
  );

  // One-shot bundle suggestion: pre-select recommended set if user hasn't touched anything yet.
  const [bundlePromptDismissed, setBundlePromptDismissed] = useState(false);
  const showBundlePrompt = !bundlePromptDismissed && recommended.length >= 2 && selections.length === 0;

  const acceptBundle = async () => {
    for (const a of recommended) {
      await toggle(a, true);
    }
    setBundlePromptDismissed(true);
  };

  if (isLoading) {
    return (
      <StepShell title="Enhance your store" subtitle="Pick the add-ons you'd like — the live total updates as you go.">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </StepShell>
    );
  }

  return (
    <StepShell
      title="Enhance your store"
      subtitle="Optional paid extras to make your store more powerful. You can always add these later."
    >
      {showBundlePrompt && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-foreground">Recommended bundle</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Most businesses choose these {recommended.length} add-ons. Add them all in one click — you can remove
              any of them.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="ghost" onClick={() => setBundlePromptDismissed(true)}>
              Dismiss
            </Button>
            <Button size="sm" onClick={acceptBundle}>
              Add bundle
            </Button>
          </div>
        </div>
      )}

      <TooltipProvider delayDuration={150}>
        <div className="grid sm:grid-cols-2 gap-3">
          {(addons ?? []).map((addon) => {
            const selection = selections.find((s) => s.addon_id === addon.id);
            const isOn = !!selection;
            const qty = selection?.quantity ?? 1;
            const lineTotal = (selection?.price_snapshot_pkr ?? addon.price_pkr) * qty;

            return (
              <AddonCard
                key={addon.id}
                addon={addon}
                isOn={isOn}
                qty={qty}
                lineTotal={lineTotal}
                onToggle={(v) => toggle(addon, v, addon.per_unit_label ? Math.max(1, qty) : 1)}
                onQuantity={(q) => setQuantity(addon.id, q)}
              />
            );
          })}
          {(!addons || addons.length === 0) && (
            <div className="col-span-full text-sm text-muted-foreground text-center py-10 border border-dashed rounded-xl">
              No add-ons available right now.
            </div>
          )}
        </div>
      </TooltipProvider>

      {/* Live totals */}
      {(() => {
        const planRent = plan?.price_pkr ?? 0;
        const newRent = planRent + totals.monthly;
        return (
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Website rent ({plan?.name ?? "—"})</span>
              <span className="font-medium text-foreground">{plan ? `${fmtPKR(planRent)} / mo` : "—"}</span>
            </div>
            {totals.monthly > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Add-ons (recurring)</span>
                <span className="font-medium text-foreground">+ {fmtPKR(totals.monthly)} / mo</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm border-t border-border pt-2 mt-2">
              <span className="text-sm font-semibold text-foreground">New monthly rent</span>
              <span className="text-lg font-bold text-primary">{fmtPKR(newRent)} / mo</span>
            </div>
            {totals.oneTime > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Add-ons (one-time)</span>
                <span className="font-medium text-foreground">{fmtPKR(totals.oneTime)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Due today</span>
              <span className="text-base font-bold text-foreground">{fmtPKR(newRent + totals.oneTime)}</span>
            </div>
          </div>
        );
      })()}

      {selections.length === 0 && !showBundlePrompt && (
        <p className="text-xs text-muted-foreground text-center">
          No add-ons selected — that's totally fine. You can add these from your dashboard later.
        </p>
      )}
    </StepShell>
  );
};

const AddonCard = ({
  addon,
  isOn,
  qty,
  lineTotal,
  onToggle,
  onQuantity,
}: {
  addon: Addon;
  isOn: boolean;
  qty: number;
  lineTotal: number;
  onToggle: (v: boolean) => void;
  onQuantity: (q: number) => void;
}) => (
  <div
    className={`group relative rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
      isOn ? "border-primary/60 bg-primary/[0.03]" : "border-border bg-card"
    }`}
  >
    <div className="flex items-start gap-3">
      <div
        className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
          isOn ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
        }`}
      >
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <h4 className="text-sm font-semibold text-foreground leading-tight">{addon.name}</h4>
          {addon.is_recommended && (
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-primary/15 text-primary hover:bg-primary/15">
              Recommended
            </Badge>
          )}
          {addon.is_popular && (
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
              Popular
            </Badge>
          )}
          {addon.description && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground">
                  <Info className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                {addon.description}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        {addon.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{addon.description}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <div className="text-sm">
            <span className="font-semibold text-foreground">{fmtPKR(addon.price_pkr)}</span>
            <span className="text-xs text-muted-foreground ml-1">
              {addon.pricing_type === "monthly" ? "/ mo" : addon.per_unit_label ? `/ ${addon.per_unit_label}` : "one-time"}
            </span>
          </div>
          <Switch checked={isOn} onCheckedChange={onToggle} />
        </div>

        {isOn && addon.per_unit_label && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-2">
            <label className="text-xs text-muted-foreground">Quantity</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => onQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="h-7 w-16 text-sm"
              />
              <span className="text-xs font-semibold text-primary tabular-nums">{fmtPKR(lineTotal)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default StepAddons;
