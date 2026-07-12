import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Categories
export function useCategories(storeId: string | undefined) {
  return useQuery({
    queryKey: ["categories", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("store_id", storeId!)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { store_id: string; name: string; slug: string; description?: string; image_url?: string }) => {
      const { data, error } = await supabase.from("categories").insert(values).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["categories", v.store_id] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, store_id, ...values }: { id: string; store_id: string; name?: string; slug?: string; description?: string; image_url?: string; is_active?: boolean }) => {
      const { error } = await supabase.from("categories").update({ ...values, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["categories", v.store_id] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, store_id }: { id: string; store_id: string }) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["categories", v.store_id] }),
  });
}

// Products
export function useProducts(storeId: string | undefined) {
  return useQuery({
    queryKey: ["products", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("store_id", storeId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      store_id: string; name: string; slug: string; description?: string;
      price: number; compare_at_price?: number; stock: number;
      category_id?: string; images?: string[]; is_active?: boolean;
    }) => {
      const { data, error } = await supabase.from("products").insert({
        ...values,
        images: values.images || [],
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["products", v.store_id] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, store_id, ...values }: {
      id: string; store_id: string; name?: string; slug?: string; description?: string;
      price?: number; compare_at_price?: number; stock?: number;
      category_id?: string | null; images?: string[]; is_active?: boolean;
    }) => {
      const { error } = await supabase.from("products").update({ ...values, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["products", v.store_id] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, store_id }: { id: string; store_id: string }) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["products", v.store_id] }),
  });
}

// Orders
export function useOrders(storeId: string | undefined) {
  return useQuery({
    queryKey: ["orders", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("store_id", storeId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      store_id,
      status,
      notes,
      tracking_number,
      tracking_carrier,
      tracking_url,
    }: {
      id: string;
      store_id: string;
      status: string;
      notes?: string;
      tracking_number?: string | null;
      tracking_carrier?: string | null;
      tracking_url?: string | null;
    }) => {
      const patch: Record<string, any> = {
        status,
        notes,
        updated_at: new Date().toISOString(),
      };
      // Only touch tracking fields when caller sends them (undefined = leave as-is)
      if (tracking_number !== undefined) patch.tracking_number = tracking_number || null;
      if (tracking_carrier !== undefined) patch.tracking_carrier = tracking_carrier || null;
      if (tracking_url !== undefined) patch.tracking_url = tracking_url || null;
      // Stamp shipped_at the first time we move into shipped/delivered
      if (status === "shipped" || status === "delivered") {
        patch.shipped_at = new Date().toISOString();
      }
      const { error } = await supabase.from("orders").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["orders", v.store_id] }),
  });
}

// Store Settings
export function useStoreSettings(storeId: string | undefined) {
  return useQuery({
    queryKey: ["store_settings", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .eq("store_id", storeId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertStoreSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      store_id: string; logo_url?: string; banner_url?: string;
      description?: string; contact_email?: string; contact_phone?: string;
      address?: string; primary_color?: string; secondary_color?: string;
      brand_name?: string; custom_domain?: string; accent_color?: string; favicon_url?: string;
    }) => {
      const { data, error } = await supabase.from("store_settings").upsert(
        { ...values, updated_at: new Date().toISOString() },
        { onConflict: "store_id" }
      ).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["store_settings", v.store_id] }),
  });
}
