import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
export function useNotifications(audience = "user") {
    const { user } = useAuth();
    const qc = useQueryClient();
    const query = useQuery({
        queryKey: ["notifications", audience, user?.id],
        enabled: !!user,
        queryFn: async () => {
            const q = supabase
                .from("notifications")
                .select("*")
                .eq("audience", audience)
                .order("created_at", { ascending: false })
                .limit(50);
            const { data, error } = await q;
            if (error)
                throw error;
            return (data ?? []);
        },
    });
    useEffect(() => {
        if (!user)
            return;
        let isSubscribed = true;
        const channel = supabase
            .channel(`notifications-${audience}-${user.id}`)
            .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => {
            if (isSubscribed) {
                qc.invalidateQueries({ queryKey: ["notifications", audience, user.id] });
            }
        })
            .subscribe();
        return () => {
            isSubscribed = false;
            supabase.removeChannel(channel);
        };
    }, [user, audience, qc]);
    return query;
}
export function useMarkNotificationRead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (ids) => {
            const { error } = await supabase
                .from("notifications")
                .update({ read_at: new Date().toISOString() })
                .in("id", ids);
            if (error)
                throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
    });
}
export function useSubscriptions(scope = "own") {
    const { user } = useAuth();
    return useQuery({
        queryKey: ["subscriptions", scope, user?.id],
        enabled: !!user,
        queryFn: async () => {
            let q = supabase.from("subscriptions").select("*").order("current_period_end", { ascending: true });
            if (scope === "own")
                q = q.eq("user_id", user.id);
            const { data, error } = await q;
            if (error)
                throw error;
            return (data ?? []);
        },
    });
}
export function useToggleAutoRenew() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, auto_renew }) => {
            const { error } = await supabase.from("subscriptions").update({ auto_renew }).eq("id", id);
            if (error)
                throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["subscriptions"] }),
    });
}
