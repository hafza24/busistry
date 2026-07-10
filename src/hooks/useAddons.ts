import { useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Addon = {
  id: string;
  name: string;
  description: string | null;
  price_pkr: number;
  pricing_type: "one_time" | "monthly";
  is_enabled: boolean;
  is_recommended: boolean;
  is_popular: boolean;
  sort_order: number;
  icon: string | null;
  applicable_plans: string[];
  per_unit_label: string | null;
};

export type AddonSelection = {
  addon_id: string;
  price_snapshot_pkr: number;
  pricing_type_snapshot: "one_time" | "monthly";
  quantity: number;
  // joined for display:
  addon?: Addon;
};

/** "Pages" add-ons always roll into monthly rent, regardless of their configured pricing_type. */
export const isPagesAddon = (name?: string | null) =>
  !!name && /\bpage(s)?\b/i.test(name);

/** Effective pricing type for a selection — forces monthly for Pages add-ons. */
export const effectivePricingType = (s: AddonSelection): "one_time" | "monthly" =>
  isPagesAddon(s.addon?.name) ? "monthly" : s.pricing_type_snapshot;


/** Public catalog query — visible to everyone (RLS gates is_enabled). */
export const useAddons = (planType?: string | null) => {
  const query = useQuery({
    queryKey: ["public_addons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("addons")
        .select("*")
        .eq("is_enabled", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Addon[];
    },
  });

  const filtered = useMemo(() => {
    if (!query.data) return [];
    if (!planType) return query.data;
    return query.data.filter((a) => {
      const plans = Array.isArray(a.applicable_plans) ? a.applicable_plans : [];
      return plans.length === 0 || plans.includes(planType);
    });
  }, [query.data, planType]);

  return { ...query, data: filtered };
};

/** Manage selections for a given onboarding submission. */
export const useSubmissionAddons = (submissionId?: string | null) => {
  const qc = useQueryClient();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = useQuery({
    queryKey: ["submission_addons", submissionId],
    enabled: !!submissionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("onboarding_addons")
        .select("addon_id, price_snapshot_pkr, pricing_type_snapshot, quantity, addon:addons(*)")
        .eq("submission_id", submissionId!);
      if (error) throw error;
      return (data ?? []) as unknown as AddonSelection[];
    },
  });

  /** Toggle an add-on. If on, inserts with current price snapshot; if off, deletes. */
  const toggle = async (addon: Addon, on: boolean, quantity = 1) => {
    if (!submissionId) return;
    if (on) {
      await supabase.from("onboarding_addons").upsert(
        {
          submission_id: submissionId,
          addon_id: addon.id,
          price_snapshot_pkr: addon.price_pkr,
          // Pages add-ons are always rolled into monthly rent
          pricing_type_snapshot: isPagesAddon(addon.name) ? "monthly" : addon.pricing_type,
          quantity,
        },
        { onConflict: "submission_id,addon_id" }
      );
    } else {
      await supabase
        .from("onboarding_addons")
        .delete()
        .eq("submission_id", submissionId)
        .eq("addon_id", addon.id);
    }
    qc.invalidateQueries({ queryKey: ["submission_addons", submissionId] });
  };

  /** Debounced quantity update for per-unit add-ons. */
  const setQuantity = (addonId: string, quantity: number) => {
    if (!submissionId) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    // Optimistic update
    qc.setQueryData<AddonSelection[]>(["submission_addons", submissionId], (prev) =>
      (prev ?? []).map((s) => (s.addon_id === addonId ? { ...s, quantity } : s))
    );
    debounceTimer.current = setTimeout(async () => {
      await supabase
        .from("onboarding_addons")
        .update({ quantity })
        .eq("submission_id", submissionId)
        .eq("addon_id", addonId);
    }, 400);
  };

  useEffect(
    () => () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    },
    []
  );

  return { ...query, toggle, setQuantity };
};

export const calcAddonTotals = (selections: AddonSelection[]) => {
  let oneTime = 0;
  let monthly = 0;
  for (const s of selections) {
    const total = s.price_snapshot_pkr * (s.quantity ?? 1);
    if (s.pricing_type_snapshot === "monthly") monthly += total;
    else oneTime += total;
  }
  return { oneTime, monthly };
};
