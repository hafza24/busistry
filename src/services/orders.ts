import { supabase } from "@/integrations/supabase/client";
import { callApi, unwrap, validate } from "./core/api";
import {
  AdminOrderTrackingSchema,
  CreateStoreOrderSchema,
  type AdminOrderTrackingInput,
  type CreateStoreOrderInput,
} from "./schemas";

export interface CreatedOrder {
  order_id: string;
  order_number: string;
  subtotal: number;
  total: number;
}

/**
 * Places a storefront order.
 * Server path recomputes prices from the products table and checks stock.
 * Fallback path uses the existing `create_order_with_items` RPC.
 */
export async function createStoreOrder(input: CreateStoreOrderInput): Promise<CreatedOrder> {
  const data = validate(CreateStoreOrderSchema, input);

  return callApi<CreatedOrder>("orders.create", data, {
    fallback: async () => {
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
      const items = data.items.map((i) => ({
        product_id: i.product_id,
        product_name: i.product_name,
        quantity: i.quantity,
        price: i.price,
        total: i.price * i.quantity,
      }));
      const subtotal = items.reduce((s, i) => s + i.total, 0);

      const res = await supabase.rpc("create_order_with_items", {
        p_store_id: data.store_id,
        p_order_number: orderNumber,
        p_customer_name: data.customer_name,
        p_customer_email: data.customer_email || "",
        p_customer_phone: data.customer_phone,
        p_customer_address: data.customer_address,
        p_subtotal: subtotal,
        p_total: subtotal,
        p_items: items as any,
      });
      const rows = unwrap(res as any) as { order_id: string }[] | null;
      return {
        order_id: rows?.[0]?.order_id ?? "",
        order_number: orderNumber,
        subtotal,
        total: subtotal,
      };
    },
  });
}

/** Admin: update order status + tracking. */
export async function setOrderStatus(input: AdminOrderTrackingInput) {
  const data = validate(AdminOrderTrackingSchema, input);

  return callApi("admin.orders.set_status", data, {
    fallback: async () => {
      const patch: Record<string, unknown> = { status: data.status };
      if (data.tracking_number !== undefined) patch.tracking_number = data.tracking_number || null;
      if (data.tracking_carrier !== undefined) patch.tracking_carrier = data.tracking_carrier || null;
      if (data.tracking_url !== undefined) patch.tracking_url = data.tracking_url || null;
      if (data.status === "shipped") patch.shipped_at = new Date().toISOString();
      const res = await supabase.from("orders").update(patch).eq("id", data.id).select("id").single();
      unwrap(res);
      return { id: data.id, status: data.status };
    },
  });
}

/** Read: order list for a store (RLS-scoped, safe to read directly). */
export async function listStoreOrders(storeId: string) {
  const res = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, status, total, created_at, tracking_number, tracking_carrier"
    )
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });
  return unwrap(res);
}
