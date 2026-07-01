import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface NotificationRow {
  id: string;
  user_id: string | null;
  audience: "user" | "admin";
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  subscription_id: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export function useNotifications(audience: "user" | "admin" = "user") {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", audience, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const q = supabase
        .from("notifications" as any)
        .select("*")
        .eq("audience", audience)
        .order("created_at", { ascending: false })
        .limit(50);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as NotificationRow[];
    },
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications-${audience}-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => {
        qc.invalidateQueries({ queryKey: ["notifications", audience, user.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, audience, qc]);

  return query;
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("notifications" as any)
        .update({ read_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  source_type: string;
  source_id: string;
  store_id: string | null;
  label: string;
  amount_pkr: number;
  cycle_days: number;
  current_period_start: string;
  current_period_end: string;
  status: string;
  auto_renew: boolean;
  last_reminder_day: number | null;
  created_at: string;
}

export function useSubscriptions(scope: "own" | "all" = "own") {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["subscriptions", scope, user?.id],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase.from("subscriptions" as any).select("*").order("current_period_end", { ascending: true });
      if (scope === "own") q = q.eq("user_id", user!.id);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as SubscriptionRow[];
    },
  });
}

export function useToggleAutoRenew() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, auto_renew }: { id: string; auto_renew: boolean }) => {
      const { error } = await supabase.from("subscriptions" as any).update({ auto_renew }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscriptions"] }),
  });
}
