import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import {
  AdminOrderTrackingSchema,
  AdminStatusSchema,
  CreateCatalogOrderSchema,
  CreateContactMessageSchema,
  CreateReviewSchema,
  CreateStoreOrderSchema,
  CreateSupportTicketSchema,
  CreateUpgradeOrderSchema,
  NewsletterSubscribeSchema,
} from "../_shared/schemas.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const fail = (message: string, status = 400, details?: unknown) =>
  json({ ok: false, error: { message, details } }, status);

interface Ctx {
  db: SupabaseClient;
  userId: string | null;
  isAdmin: boolean;
}

async function buildContext(req: Request): Promise<Ctx> {
  const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const authHeader = req.headers.get("Authorization");
  let userId: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const authClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
    const { data } = await authClient.auth.getClaims(token);
    userId = (data?.claims?.sub as string | undefined) ?? null;
  }

  let isAdmin = false;
  if (userId) {
    const { data } = await db
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    isAdmin = !!data;
  }

  return { db, userId, isAdmin };
}

function requireUser(ctx: Ctx): string {
  if (!ctx.userId) throw new HttpError("Authentication required", 401);
  return ctx.userId;
}

function requireAdmin(ctx: Ctx): string {
  const uid = requireUser(ctx);
  if (!ctx.isAdmin) throw new HttpError("Forbidden", 403);
  return uid;
}

class HttpError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

type Handler = (payload: unknown, ctx: Ctx) => Promise<unknown>;

const handlers: Record<string, Handler> = {
  /** Guest or signed-in storefront checkout. Totals are recomputed server-side. */
  "orders.create": async (payload, ctx) => {
    const input = CreateStoreOrderSchema.parse(payload);

    const { data: store, error: storeErr } = await ctx.db
      .from("stores")
      .select("id, status, expires_at")
      .eq("id", input.store_id)
      .maybeSingle();
    if (storeErr) throw storeErr;
    if (!store || store.status !== "activated") throw new HttpError("Store is not accepting orders", 409);
    if (store.expires_at && new Date(store.expires_at) < new Date())
      throw new HttpError("Store subscription has expired", 409);

    const ids = [...new Set(input.items.map((i) => i.product_id))];
    const { data: products, error: prodErr } = await ctx.db
      .from("products")
      .select("id, name, price, stock, is_active, store_id")
      .in("id", ids);
    if (prodErr) throw prodErr;

    const byId = new Map((products ?? []).map((p) => [p.id, p]));
    const priced = input.items.map((item) => {
      const p = byId.get(item.product_id);
      if (!p || !p.is_active || p.store_id !== input.store_id)
        throw new HttpError(`Product unavailable: ${item.product_name}`, 409);
      if (p.stock !== null && p.stock < item.quantity)
        throw new HttpError(`Insufficient stock for ${p.name}`, 409);
      const price = Number(p.price);
      return {
        product_id: p.id,
        product_name: p.name,
        quantity: item.quantity,
        price,
        total: price * item.quantity,
      };
    });

    const subtotal = priced.reduce((s, i) => s + i.total, 0);
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

    const { data: order, error: orderErr } = await ctx.db
      .from("orders")
      .insert({
        store_id: input.store_id,
        order_number: orderNumber,
        customer_name: input.customer_name,
        customer_email: input.customer_email || null,
        customer_phone: input.customer_phone,
        customer_address: input.customer_address,
        notes: input.notes || null,
        subtotal,
        shipping_fee: 0,
        total: subtotal,
        status: "pending",
      })
      .select("id, order_number")
      .single();
    if (orderErr) throw orderErr;

    const { error: itemsErr } = await ctx.db
      .from("order_items")
      .insert(priced.map((i) => ({ ...i, order_id: order.id })));
    if (itemsErr) {
      await ctx.db.from("orders").delete().eq("id", order.id);
      throw itemsErr;
    }

    return { order_id: order.id, order_number: order.order_number, subtotal, total: subtotal };
  },

  /** Marketplace catalog purchase — price is taken from the catalog, never the client. */
  "catalog_orders.create": async (payload, ctx) => {
    const userId = requireUser(ctx);
    const input = CreateCatalogOrderSchema.parse(payload);

    const { data: item, error } = await ctx.db
      .from("catalog_items")
      .select("id, name, type, price_pkr, pricing_type, is_enabled")
      .eq("id", input.item_id)
      .maybeSingle();
    if (error) throw error;
    if (!item || !item.is_enabled) throw new HttpError("Item is not available", 409);

    if (input.store_id) {
      const { data: store } = await ctx.db
        .from("stores")
        .select("id, user_id")
        .eq("id", input.store_id)
        .maybeSingle();
      if (!store || store.user_id !== userId) throw new HttpError("Store does not belong to you", 403);
    }

    const { data: created, error: insErr } = await ctx.db
      .from("catalog_orders")
      .insert({
        user_id: userId,
        store_id: input.store_id ?? null,
        item_id: item.id,
        item_type_snapshot: item.type,
        name_snapshot: item.name,
        price_snapshot_pkr: Number(item.price_pkr) * input.quantity,
        pricing_type_snapshot: item.pricing_type,
        quantity: input.quantity,
        config: input.config,
        status: "pending",
        payment_method: input.payment_method ?? null,
        transaction_id: input.transaction_id || null,
        screenshot_url: input.screenshot_url || null,
      })
      .select("id, status, price_snapshot_pkr")
      .single();
    if (insErr) throw insErr;
    return created;
  },

  "upgrade_orders.create": async (payload, ctx) => {
    const userId = requireUser(ctx);
    const input = CreateUpgradeOrderSchema.parse(payload);

    const { data: store } = await ctx.db
      .from("stores")
      .select("id, user_id")
      .eq("id", input.store_id)
      .maybeSingle();
    if (!store || store.user_id !== userId) throw new HttpError("Store does not belong to you", 403);

    const { data, error } = await ctx.db
      .from("upgrade_orders")
      .insert({
        user_id: userId,
        store_id: input.store_id,
        upgrade_type: input.upgrade_type,
        details: input.details,
        amount: input.amount,
        payment_method: input.payment_method ?? null,
        transaction_id: input.transaction_id || null,
        screenshot_url: input.screenshot_url || null,
        status: "pending",
      })
      .select("id, status")
      .single();
    if (error) throw error;
    return data;
  },

  "support_tickets.create": async (payload, ctx) => {
    const userId = requireUser(ctx);
    const input = CreateSupportTicketSchema.parse(payload);
    const { data, error } = await ctx.db
      .from("support_tickets")
      .insert({ ...input, user_id: userId, status: "open" })
      .select("id, status")
      .single();
    if (error) throw error;
    return data;
  },

  "contact_messages.create": async (payload, ctx) => {
    const input = CreateContactMessageSchema.parse(payload);
    const { data, error } = await ctx.db
      .from("contact_messages")
      .insert({ ...input, status: "new" })
      .select("id")
      .single();
    if (error) throw error;
    return data;
  },

  /** Reviews are only accepted from users with a matching fulfilled purchase. */
  "reviews.create": async (payload, ctx) => {
    const userId = requireUser(ctx);
    const input = CreateReviewSchema.parse(payload);

    if (input.target_type !== "platform") {
      const { data: allowed, error: rpcErr } = await ctx.db.rpc("can_review", {
        _user_id: userId,
        _target_type: input.target_type,
        _target_id: input.target_id,
      });
      if (rpcErr) throw rpcErr;
      if (!allowed) throw new HttpError("You can only review items you have purchased", 403);
    }

    const { data, error } = await ctx.db
      .from("reviews")
      .insert({
        user_id: userId,
        target_type: input.target_type,
        target_id: input.target_id,
        rating: input.rating,
        title: input.title || null,
        comment: input.comment || null,
        is_approved: false,
      })
      .select("id, is_approved")
      .single();
    if (error) throw error;
    return data;
  },

  "newsletter.subscribe": async (payload, ctx) => {
    const input = NewsletterSubscribeSchema.parse(payload);
    const email = input.email.toLowerCase();
    const { data: existing } = await ctx.db
      .from("newsletter_subscribers")
      .select("id, status")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      if (existing.status === "subscribed") return { id: existing.id, already: true };
      const { error } = await ctx.db
        .from("newsletter_subscribers")
        .update({ status: "subscribed", subscribed_at: new Date().toISOString(), unsubscribed_at: null })
        .eq("id", existing.id);
      if (error) throw error;
      return { id: existing.id, resubscribed: true };
    }

    const { data, error } = await ctx.db
      .from("newsletter_subscribers")
      .insert({ email, source: input.source, status: "subscribed" })
      .select("id")
      .single();
    if (error) throw error;
    return data;
  },

  "admin.catalog_orders.set_status": async (payload, ctx) => {
    requireAdmin(ctx);
    const input = AdminStatusSchema.parse(payload);
    const { error } = await ctx.db
      .from("catalog_orders")
      .update({ status: input.status, admin_notes: input.admin_notes ?? undefined })
      .eq("id", input.id);
    if (error) throw error;
    return { id: input.id, status: input.status };
  },

  "admin.store_addons.set_status": async (payload, ctx) => {
    requireAdmin(ctx);
    const input = AdminStatusSchema.parse(payload);
    const { error } = await ctx.db
      .from("store_addons")
      .update({ status: input.status, admin_notes: input.admin_notes ?? undefined })
      .eq("id", input.id);
    if (error) throw error;
    return { id: input.id, status: input.status };
  },

  "admin.upgrade_orders.set_status": async (payload, ctx) => {
    requireAdmin(ctx);
    const input = AdminStatusSchema.parse(payload);
    const { error } = await ctx.db
      .from("upgrade_orders")
      .update({ status: input.status, admin_notes: input.admin_notes ?? undefined })
      .eq("id", input.id);
    if (error) throw error;
    return { id: input.id, status: input.status };
  },

  "admin.orders.set_status": async (payload, ctx) => {
    requireAdmin(ctx);
    const input = AdminOrderTrackingSchema.parse(payload);
    const patch: Record<string, unknown> = { status: input.status };
    if (input.tracking_number !== undefined) patch.tracking_number = input.tracking_number || null;
    if (input.tracking_carrier !== undefined) patch.tracking_carrier = input.tracking_carrier || null;
    if (input.tracking_url !== undefined) patch.tracking_url = input.tracking_url || null;
    if (input.status === "shipped") patch.shipped_at = new Date().toISOString();

    const { error } = await ctx.db.from("orders").update(patch).eq("id", input.id);
    if (error) throw error;
    return { id: input.id, status: input.status };
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return fail("Method not allowed", 405);

  let body: { action?: string; payload?: unknown };
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const action = body.action;
  if (!action || !(action in handlers)) return fail(`Unknown action: ${action ?? "(none)"}`, 404);

  try {
    const ctx = await buildContext(req);
    const data = await handlers[action](body.payload ?? {}, ctx);
    return json({ ok: true, data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return fail("Validation failed", 400, err.flatten().fieldErrors);
    }
    if (err instanceof HttpError) return fail(err.message, err.status);
    console.error(`[api] ${action} failed:`, err);
    return fail((err as Error)?.message ?? "Unexpected server error", 500);
  }
});
