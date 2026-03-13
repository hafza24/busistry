import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useIsAdmin() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["is_admin", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user!.id,
        _role: "admin",
      });
      if (error) throw error;
      return data as boolean;
    },
  });
}

export function useAllStoreRequests() {
  return useQuery({
    queryKey: ["admin_store_requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_requests")
        .select("*, plans(name, type, price_pkr), templates(name, niche)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAllStores() {
  return useQuery({
    queryKey: ["admin_stores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*, plans(name, type, price_pkr), templates(name, niche)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAllProfiles() {
  return useQuery({
    queryKey: ["admin_profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateRequestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      admin_notes,
    }: {
      id: string;
      status: string;
      admin_notes?: string;
    }) => {
      const { error } = await supabase
        .from("store_requests")
        .update({ status: status as any, admin_notes, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_store_requests"] });
    },
  });
}

export function useActivateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      storeName,
      userId,
      planId,
      templateId,
      durationDays,
    }: {
      requestId: string;
      storeName: string;
      userId: string;
      planId: string;
      templateId: string;
      durationDays: number | null;
    }) => {
      const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const now = new Date();
      const expiresAt = durationDays
        ? new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error: storeError } = await supabase.from("stores").insert({
        name: storeName,
        subdomain_slug: slug,
        user_id: userId,
        plan_id: planId,
        template_id: templateId,
        status: "activated" as any,
        activated_at: now.toISOString(),
        expires_at: expiresAt,
      });
      if (storeError) throw storeError;

      const { error: reqError } = await supabase
        .from("store_requests")
        .update({ status: "activated" as any, updated_at: now.toISOString() })
        .eq("id", requestId);
      if (reqError) throw reqError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_store_requests"] });
      qc.invalidateQueries({ queryKey: ["admin_stores"] });
    },
  });
}

export function useUpdateStoreStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("stores")
        .update({ status: status as any })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_stores"] });
    },
  });
}
