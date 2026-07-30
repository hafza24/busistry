import { supabase } from "@/integrations/supabase/client";
import { callApi, ServiceError, unwrap, validate } from "./core/api";
import {
  CreateCatalogOrderSchema,
  CreateUpgradeOrderSchema,
  type CreateCatalogOrderInput,
  type CreateUpgradeOrderInput,
} from "./schemas";

/** Purchase a marketplace catalog item. Pricing is authoritative on the server. */
export async function createCatalogOrder(input: CreateCatalogOrderInput) {
  const data = validate(CreateCatalogOrderSchema, input);

  return callApi("catalog_orders.create", data, {
    fallback: async () => {
      const { data: user } = await supabase.auth.getUser();
      const userId = user?.user?.id;
      if (!userId) throw new ServiceError("Authentication required", 401);

      const item = unwrap(
        await supabase
          .from("catalog_items")
          .select("id, name, type, price_pkr, pricing_type, is_enabled")
          .eq("id", data.item_id)
          .maybeSingle()
      );
      if (!item || !item.is_enabled) throw new ServiceError("Item is not available", 409);

      return unwrap(
        await supabase
          .from("catalog_orders")
          .insert({
            user_id: userId,
            store_id: data.store_id ?? null,
            item_id: item.id,
            item_type_snapshot: item.type,
            name_snapshot: item.name,
            price_snapshot_pkr: Number(item.price_pkr) * data.quantity,
            pricing_type_snapshot: item.pricing_type,
            quantity: data.quantity,
            config: data.config as never,
            status: "pending",
            payment_method: data.payment_method ?? null,
            transaction_id: data.transaction_id || null,
            screenshot_url: data.screenshot_url || null,
          })
          .select("id, status, price_snapshot_pkr")
          .single()
      );
    },
  });
}

/** Request a store upgrade (limits, duration, plan change). */
export async function createUpgradeOrder(input: CreateUpgradeOrderInput) {
  const data = validate(CreateUpgradeOrderSchema, input);

  return callApi("upgrade_orders.create", data, {
    fallback: async () => {
      const { data: user } = await supabase.auth.getUser();
      const userId = user?.user?.id;
      if (!userId) throw new ServiceError("Authentication required", 401);

      return unwrap(
        await supabase
          .from("upgrade_orders")
          .insert({
            user_id: userId,
            store_id: data.store_id,
            upgrade_type: data.upgrade_type,
            details: data.details as never,
            amount: data.amount,
            payment_method: data.payment_method ?? null,
            transaction_id: data.transaction_id || null,
            screenshot_url: data.screenshot_url || null,
            status: "pending",
          })
          .select("id, status")
          .single()
      );
    },
  });
}

/** Read: enabled catalog items (public data, safe to read directly). */
export async function listCatalogItems(type?: string) {
  let q = supabase
    .from("catalog_items")
    .select(
      "id, slug, name, short_description, type, category, price_pkr, pricing_type, icon, cover_image, is_popular, is_recommended, sort_order"
    )
    .eq("is_enabled", true)
    .order("sort_order");
  if (type) q = q.eq("type", type as never);
  return unwrap(await q);
}
