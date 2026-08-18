import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
const TABLE_ITEMS = "catalog_items";
const TABLE_ORDERS = "catalog_orders";
const normalizeItem = (row) => ({
    ...row,
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    features: Array.isArray(row.features) ? row.features : [],
    faq: Array.isArray(row.faq) ? row.faq : [],
    applicable_plans: row.applicable_plans ?? [],
    applicable_types: row.applicable_types ?? [],
    related_item_ids: row.related_item_ids ?? [],
});
// ===== Catalog items =====
export function useCatalogItems(opts) {
    return useQuery({
        queryKey: ["catalog_items", opts?.type ?? "all", opts?.includeDisabled ? "all" : "enabled"],
        queryFn: async () => {
            let q = supabase.from(TABLE_ITEMS).select("*").order("sort_order").order("name");
            if (!opts?.includeDisabled)
                q = q.eq("is_enabled", true);
            if (opts?.type)
                q = q.eq("type", opts.type);
            const { data, error } = await q;
            if (error)
                throw error;
            return (data ?? []).map(normalizeItem);
        },
    });
}
export function useCatalogItem(slug) {
    return useQuery({
        queryKey: ["catalog_item", slug],
        enabled: !!slug,
        queryFn: async () => {
            const { data, error } = await supabase
                .from(TABLE_ITEMS)
                .select("*")
                .eq("slug", slug)
                .maybeSingle();
            if (error)
                throw error;
            return data ? normalizeItem(data) : null;
        },
    });
}
export function useRelatedCatalogItems(ids) {
    return useQuery({
        queryKey: ["catalog_items_related", [...ids].sort().join(",")],
        enabled: ids.length > 0,
        queryFn: async () => {
            const { data, error } = await supabase.from(TABLE_ITEMS).select("*").in("id", ids);
            if (error)
                throw error;
            return (data ?? []).map(normalizeItem);
        },
    });
}
export function useUpsertCatalogItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (values) => {
            const payload = { ...values };
            if (payload.id) {
                const { id, ...rest } = payload;
                const { error } = await supabase.from(TABLE_ITEMS).update(rest).eq("id", id);
                if (error)
                    throw error;
            }
            else {
                const { error } = await supabase.from(TABLE_ITEMS).insert(payload);
                if (error)
                    throw error;
            }
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["catalog_items"] });
            qc.invalidateQueries({ queryKey: ["catalog_item"] });
        },
    });
}
export function useDeleteCatalogItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from(TABLE_ITEMS).delete().eq("id", id);
            if (error)
                throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog_items"] }),
    });
}
// ===== Catalog orders =====
export function useMyCatalogOrders(userId) {
    const qc = useQueryClient();
    useEffect(() => {
        if (!userId)
            return;
        let isSubscribed = true;
        const channel = supabase
            .channel(`catalog_orders_user_${userId}`)
            .on("postgres_changes", { event: "*", schema: "public", table: "catalog_orders", filter: `user_id=eq.${userId}` }, () => {
            if (isSubscribed) {
                qc.invalidateQueries({ queryKey: ["my_catalog_orders", userId] });
            }
        })
            .subscribe();
        return () => {
            isSubscribed = false;
            supabase.removeChannel(channel);
        };
    }, [userId, qc]);
    return useQuery({
        queryKey: ["my_catalog_orders", userId],
        enabled: !!userId,
        queryFn: async () => {
            const { data, error } = await supabase
                .from(TABLE_ORDERS)
                .select("*, stores(name, id, subdomain_slug)")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });
            if (error)
                throw error;
            return (data ?? []);
        },
    });
}
export function useAllCatalogOrders() {
    const qc = useQueryClient();
    useEffect(() => {
        let isSubscribed = true;
        const channel = supabase
            .channel("catalog_orders_admin")
            .on("postgres_changes", { event: "*", schema: "public", table: "catalog_orders" }, () => {
            if (isSubscribed) {
                qc.invalidateQueries({ queryKey: ["catalog_orders_admin"] });
            }
        })
            .subscribe();
        return () => {
            isSubscribed = false;
            supabase.removeChannel(channel);
        };
    }, [qc]);
    return useQuery({
        queryKey: ["catalog_orders_admin"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from(TABLE_ORDERS)
                .select("*, stores(name, id, subdomain_slug)")
                .order("created_at", { ascending: false });
            if (error)
                throw error;
            return (data ?? []);
        },
    });
}
export function useCreateCatalogOrder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (values) => {
            const { error } = await supabase.from(TABLE_ORDERS).insert({
                quantity: 1,
                config: {},
                ...values,
            });
            if (error)
                throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["my_catalog_orders"] });
            qc.invalidateQueries({ queryKey: ["catalog_orders_admin"] });
        },
    });
}
export function useUpdateCatalogOrder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...values }) => {
            const { error } = await supabase.from(TABLE_ORDERS).update(values).eq("id", id);
            if (error)
                throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog_orders_admin"] }),
    });
}
export function useDeleteCatalogOrder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from(TABLE_ORDERS).delete().eq("id", id);
            if (error)
                throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog_orders_admin"] }),
    });
}
export function useApplyCatalogOrder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.rpc("apply_catalog_order", { p_order_id: id });
            if (error)
                throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["catalog_orders_admin"] });
            qc.invalidateQueries({ queryKey: ["stores"] });
        },
    });
}
// ===== Utilities =====
export const CATALOG_TYPE_META = {
    addon: { label: "Add-on", plural: "Add-ons", storeScoped: true },
    integration: { label: "Integration", plural: "Integrations", storeScoped: true },
    page: { label: "Page", plural: "Pages", storeScoped: true },
    section: { label: "Section", plural: "Sections", storeScoped: true },
    popup: { label: "Popup", plural: "Popups", storeScoped: true },
    plan_upgrade: { label: "Plan upgrade", plural: "Plan upgrades", storeScoped: true, needsConfig: "plan" },
    product_limit: { label: "Product limit", plural: "Product limits", storeScoped: true, needsConfig: "quantity" },
    category_limit: { label: "Category limit", plural: "Category limits", storeScoped: true, needsConfig: "quantity" },
    extend_duration: { label: "Extend hosting", plural: "Extensions", storeScoped: true, needsConfig: "days" },
    content_tweak: { label: "Content tweak", plural: "Content tweaks", storeScoped: true },
};
export const STATUS_COLORS = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-primary/10 text-primary border-primary/30",
    in_progress: "bg-primary/10 text-primary border-primary/30",
    active: "bg-primary/10 text-primary border-primary/30",
    completed: "bg-primary/10 text-primary border-primary/30",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
};
