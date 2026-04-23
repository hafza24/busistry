import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type OnboardingData = {
  id?: string;
  plan_id?: string | null;
  template_id?: string | null;

  // Step 1 — Project type
  project_type?: string;

  // Step 2 — Conditional answers (depends on project_type)
  project_details?: Record<string, any>;

  // Step 3 — Business basics
  business_name?: string;
  business_type?: string;
  business_description?: string;
  country?: string;

  // Step 2
  logo_url?: string;
  needs_logo_design?: boolean;
  color_palette?: string;
  font_style?: string;
  reference_websites?: string;

  // Step 3
  team_size?: number;
  team_roles?: string[];
  team_members?: { name: string; role: string }[];

  // Step 4
  store_type?: string;
  product_count_estimate?: number;
  payment_gateway?: string;
  shipping_requirements?: string;
  special_features?: string;

  // Step 5
  full_name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  business_address?: string;

  // Step 6
  billing_cycle?: string;
  payment_method?: string;
  transaction_id?: string;
  amount?: number;
  screenshot_url?: string;
  terms_accepted?: boolean;

  current_step?: number;
  status?: "draft" | "submitted";
};

const STORAGE_KEY = "busistry_onboarding_plan";
const TEMPLATE_KEY = "busistry_onboarding_template";

export const setPendingPlan = (planId: string) => {
  try { localStorage.setItem(STORAGE_KEY, planId); } catch {}
};
export const getPendingPlan = () => {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
};
export const clearPendingPlan = () => {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
};

export const setPendingTemplate = (templateId: string) => {
  try { localStorage.setItem(TEMPLATE_KEY, templateId); } catch {}
};
export const getPendingTemplate = () => {
  try { return localStorage.getItem(TEMPLATE_KEY); } catch { return null; }
};
export const clearPendingTemplate = () => {
  try { localStorage.removeItem(TEMPLATE_KEY); } catch {}
};

export const useOnboarding = (initialPlanId?: string | null, initialTemplateId?: string | null) => {
  const { user } = useAuth();
  const [data, setData] = useState<OnboardingData>({
    plan_id: initialPlanId ?? null,
    template_id: initialTemplateId ?? null,
    needs_logo_design: false,
    terms_accepted: false,
    current_step: 1,
    status: "draft",
    team_roles: [],
    team_members: [],
    project_details: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing draft for this user (most recent)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data: rows } = await supabase
        .from("onboarding_submissions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "draft")
        .order("updated_at", { ascending: false })
        .limit(1);

      if (cancelled) return;
      const row = rows?.[0];
      if (row) {
        setData((d) => ({
          ...d,
          ...(row as any),
          team_roles: Array.isArray(row.team_roles) ? (row.team_roles as string[]) : [],
          team_members: Array.isArray(row.team_members) ? (row.team_members as any[]) : [],
          project_details: (row as any).project_details && typeof (row as any).project_details === "object"
            ? (row as any).project_details
            : {},
          plan_id: initialPlanId ?? row.plan_id,
          template_id: initialTemplateId ?? (row as any).template_id ?? null,
          status: (row.status === "submitted" ? "submitted" : "draft") as "draft" | "submitted",
        }));
      } else {
        // Create a fresh draft so we have an id for autosave
        const { data: created } = await supabase
          .from("onboarding_submissions")
          .insert({
            user_id: user.id,
            plan_id: initialPlanId ?? null,
            template_id: initialTemplateId ?? null,
            email: user.email ?? null,
            current_step: 1,
            status: "draft",
          } as any)
          .select("*")
          .single();
        if (created && !cancelled) {
          setData((d) => ({
            ...d,
            id: created.id,
            plan_id: created.plan_id,
            template_id: (created as any).template_id ?? null,
          }));
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, initialPlanId]);

  const update = (patch: Partial<OnboardingData>) => {
    setData((d) => ({ ...d, ...patch }));
  };

  // Debounced autosave whenever data changes (after initial load)
  useEffect(() => {
    if (!user || !data.id || loading) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      const { id, ...rest } = data;
      await supabase
        .from("onboarding_submissions")
        .update({
          ...rest,
          team_roles: rest.team_roles ?? [],
          team_members: rest.team_members ?? [],
          project_details: rest.project_details ?? {},
        } as any)
        .eq("id", id);
      setSaving(false);
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const submit = async () => {
    if (!data.id) return { error: new Error("No draft id") };
    const { error } = await supabase
      .from("onboarding_submissions")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (!error) clearPendingPlan();
    return { error };
  };

  return { data, update, loading, saving, submit };
};
