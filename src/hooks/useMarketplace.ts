import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ===== Website Products (Pages / Sections / Popups) =====
export function useWebsiteProducts(typeFilter?: string) {
  return useQuery({
    queryKey: ["website_products", typeFilter ?? "all"],
    queryFn: async () => {
      let q = supabase.from("website_products").select("*").eq("is_enabled", true).order("sort_order");
      if (typeFilter) q = q.eq("type", typeFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useAllWebsiteProducts() {
  return useQuery({
    queryKey: ["website_products_admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("website_products").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertWebsiteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      if (values.id) {
        const { id, ...rest } = values;
        const { error } = await supabase.from("website_products").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("website_products").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["website_products_admin"] });
      qc.invalidateQueries({ queryKey: ["website_products"] });
    },
  });
}

export function useDeleteWebsiteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("website_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["website_products_admin"] }),
  });
}

// ===== Integrations =====
export function useIntegrations() {
  return useQuery({
    queryKey: ["integrations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("integrations").select("*").eq("is_enabled", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useAllIntegrations() {
  return useQuery({
    queryKey: ["integrations_admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("integrations").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      if (values.id) {
        const { id, ...rest } = values;
        const { error } = await supabase.from("integrations").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("integrations").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["integrations_admin"] });
      qc.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
}

export function useDeleteIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("integrations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["integrations_admin"] }),
  });
}

// ===== Store Add-ons (installations / orders) =====
export function useStoreAddons(storeId?: string) {
  return useQuery({
    queryKey: ["store_addons", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_addons")
        .select("*")
        .eq("store_id", storeId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAllStoreAddons() {
  return useQuery({
    queryKey: ["store_addons_admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_addons")
        .select("*, stores(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateStoreAddon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      store_id: string;
      user_id: string;
      item_type: "product" | "integration";
      item_id: string;
      price_snapshot_pkr: number;
      pricing_type_snapshot: string;
      config?: any;
      payment_method?: string;
      transaction_id?: string;
      screenshot_url?: string;
    }) => {
      const { error } = await supabase.from("store_addons").insert(values);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["store_addons", v.store_id] });
      qc.invalidateQueries({ queryKey: ["store_addons_admin"] });
    },
  });
}

export function useUpdateStoreAddonStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: string; admin_notes?: string }) => {
      const { error } = await supabase.from("store_addons").update({ status, admin_notes }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store_addons_admin"] }),
  });
}

// ===== Upgrade Orders =====
export function useUpgradeOptions() {
  return useQuery({
    queryKey: ["upgrade_options"],
    queryFn: async () => {
      const { data, error } = await supabase.from("upgrade_options").select("*").eq("is_enabled", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useAllUpgradeOptions() {
  return useQuery({
    queryKey: ["upgrade_options_admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("upgrade_options").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertUpgradeOption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      if (values.id) {
        const { id, ...rest } = values;
        const { error } = await supabase.from("upgrade_options").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("upgrade_options").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["upgrade_options_admin"] });
      qc.invalidateQueries({ queryKey: ["upgrade_options"] });
    },
  });
}

export function useDeleteUpgradeOption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("upgrade_options").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["upgrade_options_admin"] }),
  });
}

export function useUpgradeOrders(storeId?: string) {
  return useQuery({
    queryKey: ["upgrade_orders", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("upgrade_orders")
        .select("*")
        .eq("store_id", storeId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAllUpgradeOrders() {
  return useQuery({
    queryKey: ["upgrade_orders_admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("upgrade_orders")
        .select("*, stores(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateUpgradeOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      user_id: string;
      store_id: string;
      upgrade_type: string;
      details: any;
      amount: number;
      payment_method?: string;
      transaction_id?: string;
      screenshot_url?: string;
    }) => {
      const { error } = await supabase.from("upgrade_orders").insert(values);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["upgrade_orders", v.store_id] });
      qc.invalidateQueries({ queryKey: ["upgrade_orders_admin"] });
    },
  });
}

export function useUpdateUpgradeOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: string; admin_notes?: string }) => {
      const { error } = await supabase.from("upgrade_orders").update({ status, admin_notes }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["upgrade_orders_admin"] }),
  });
}

export function useApplyUpgradeOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("apply_upgrade_order", { p_order_id: id } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["upgrade_orders_admin"] });
      qc.invalidateQueries({ queryKey: ["admin_stores"] });
      qc.invalidateQueries({ queryKey: ["stores"] });
    },
  });
}

export function useUpdateUpgradeOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: { id: string; status?: string; admin_notes?: string; amount?: number; transaction_id?: string; payment_method?: string; upgrade_type?: string; details?: any }) => {
      const { error } = await supabase.from("upgrade_orders").update({ ...values, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["upgrade_orders_admin"] }),
  });
}

export function useDeleteUpgradeOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("upgrade_orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["upgrade_orders_admin"] }),
  });
}

// All upgrade orders for the current user across their stores
export function useMyUpgradeOrders(userId?: string) {
  return useQuery({
    queryKey: ["my_upgrade_orders", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("upgrade_orders")
        .select("*, stores(name, id)")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
