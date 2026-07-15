import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CatalogItemType =
  | "addon"
  | "integration"
  | "page"
  | "section"
  | "popup"
  | "plan_upgrade"
  | "product_limit"
  | "category_limit"
  | "extend_duration"
  | "content_tweak";

export type CatalogPricingType = "one_time" | "monthly" | "per_unit";

export type CatalogOrderStatus =
  | "pending"
  | "approved"
  | "in_progress"
  | "active"
  | "completed"
  | "rejected";

export interface CatalogItem {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
  type: CatalogItemType;
  category: string | null;
  price_pkr: number;
  pricing_type: CatalogPricingType;
  per_unit_label: string | null;
  icon: string | null;
  cover_image: string | null;
  demo_url: string | null;
  gallery: string[];
  features: string[];
  faq: { q: string; a: string }[];
  applicable_plans: string[];
  applicable_types: string[];
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_image: string | null;
  is_enabled: boolean;
  is_recommended: boolean;
  is_popular: boolean;
  sort_order: number;
  related_item_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface CatalogOrder {
  id: string;
  user_id: string;
  store_id: string | null;
  item_id: string | null;
  item_type_snapshot: CatalogItemType;
  name_snapshot: string;
  price_snapshot_pkr: number;
  pricing_type_snapshot: CatalogPricingType;
  quantity: number;
  config: Record<string, any>;
  status: CatalogOrderStatus;
  payment_method: string | null;
  transaction_id: string | null;
  screenshot_url: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const TABLE_ITEMS = "catalog_items" as any;
const TABLE_ORDERS = "catalog_orders" as any;

const normalizeItem = (row: any): CatalogItem => ({
  ...row,
  gallery: Array.isArray(row.gallery) ? row.gallery : [],
  features: Array.isArray(row.features) ? row.features : [],
  faq: Array.isArray(row.faq) ? row.faq : [],
  applicable_plans: row.applicable_plans ?? [],
  applicable_types: row.applicable_types ?? [],
  related_item_ids: row.related_item_ids ?? [],
});

// ===== Catalog items =====

export function useCatalogItems(opts?: { type?: CatalogItemType; includeDisabled?: boolean }) {
  return useQuery({
    queryKey: ["catalog_items", opts?.type ?? "all", opts?.includeDisabled ? "all" : "enabled"],
    queryFn: async () => {
      let q = supabase.from(TABLE_ITEMS).select("*").order("sort_order").order("name");
      if (!opts?.includeDisabled) q = q.eq("is_enabled", true);
      if (opts?.type) q = q.eq("type", opts.type);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map(normalizeItem);
    },
  });
}

export function useCatalogItem(slug?: string) {
  return useQuery({
    queryKey: ["catalog_item", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLE_ITEMS)
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data ? normalizeItem(data) : null;
    },
  });
}

export function useRelatedCatalogItems(ids: string[]) {
  return useQuery({
    queryKey: ["catalog_items_related", [...ids].sort().join(",")],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from(TABLE_ITEMS).select("*").in("id", ids);
      if (error) throw error;
      return (data ?? []).map(normalizeItem);
    },
  });
}

export function useUpsertCatalogItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Partial<CatalogItem> & { id?: string }) => {
      const payload: any = { ...values };
      if (payload.id) {
        const { id, ...rest } = payload;
        const { error } = await supabase.from(TABLE_ITEMS).update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(TABLE_ITEMS).insert(payload);
        if (error) throw error;
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
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(TABLE_ITEMS).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog_items"] }),
  });
}

// ===== Catalog orders =====

export function useMyCatalogOrders(userId?: string) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`catalog_orders_user_${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "catalog_orders", filter: `user_id=eq.${userId}` },
        () => qc.invalidateQueries({ queryKey: ["my_catalog_orders", userId] }),
      )
      .subscribe();
    return () => {
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
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as (CatalogOrder & { stores: any })[];
    },
  });
}

export function useAllCatalogOrders() {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("catalog_orders_admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "catalog_orders" },
        () => qc.invalidateQueries({ queryKey: ["catalog_orders_admin"] }),
      )
      .subscribe();
    return () => {
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
      if (error) throw error;
      return (data ?? []) as unknown as (CatalogOrder & { stores: any })[];
    },
  });
}

export function useCreateCatalogOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      user_id: string;
      store_id?: string | null;
      item_id: string;
      item_type_snapshot: CatalogItemType;
      name_snapshot: string;
      price_snapshot_pkr: number;
      pricing_type_snapshot: CatalogPricingType;
      quantity?: number;
      config?: Record<string, any>;
      payment_method?: string;
      transaction_id?: string;
      screenshot_url?: string;
    }) => {
      const { error } = await supabase.from(TABLE_ORDERS).insert({
        quantity: 1,
        config: {},
        ...values,
      });
      if (error) throw error;
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
    mutationFn: async ({ id, ...values }: { id: string } & Partial<CatalogOrder>) => {
      const { error } = await supabase.from(TABLE_ORDERS).update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog_orders_admin"] }),
  });
}

export function useDeleteCatalogOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(TABLE_ORDERS).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog_orders_admin"] }),
  });
}

export function useApplyCatalogOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("apply_catalog_order" as any, { p_order_id: id } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalog_orders_admin"] });
      qc.invalidateQueries({ queryKey: ["stores"] });
    },
  });
}

// ===== Utilities =====

export const CATALOG_TYPE_META: Record<
  CatalogItemType,
  { label: string; plural: string; storeScoped: boolean; needsConfig?: "quantity" | "days" | "plan" }
> = {
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

export const STATUS_COLORS: Record<CatalogOrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};
