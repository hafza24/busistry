import { z } from "npm:zod@3.23.8";

/**
 * Canonical server-side validation schemas.
 * Mirrored (structurally) in src/services/schemas.ts for the client layer.
 */

export const uuid = z.string().uuid();
export const money = z.number().finite().min(0).max(100_000_000);
export const shortText = z.string().trim().min(1).max(255);
export const longText = z.string().trim().max(5000);

export const OrderItemSchema = z.object({
  product_id: uuid,
  product_name: shortText,
  quantity: z.number().int().min(1).max(999),
  price: money,
});

export const CreateStoreOrderSchema = z.object({
  store_id: uuid,
  customer_name: z.string().trim().min(2).max(100),
  customer_phone: z.string().trim().min(7).max(30).regex(/^[+0-9()\-\s]+$/),
  customer_email: z.string().trim().max(255).email().optional().or(z.literal("")),
  customer_address: z.string().trim().min(5).max(600),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  items: z.array(OrderItemSchema).min(1).max(100),
});

export const CreateCatalogOrderSchema = z.object({
  item_id: uuid,
  store_id: uuid.nullable().optional(),
  quantity: z.number().int().min(1).max(999).default(1),
  config: z.record(z.unknown()).default({}),
  payment_method: z.enum(["easypaisa", "jazzcash", "nayapay", "raast", "bank_transfer"]).optional(),
  transaction_id: z.string().trim().max(120).optional().or(z.literal("")),
  screenshot_url: z.string().trim().url().max(1000).optional().or(z.literal("")),
});

export const CreateUpgradeOrderSchema = z.object({
  store_id: uuid,
  upgrade_type: z.enum([
    "product_limit",
    "category_limit",
    "extend_duration",
    "plan_change",
    "content_tweak",
  ]),
  details: z.record(z.unknown()).default({}),
  amount: z.number().int().min(0).max(100_000_000),
  payment_method: z.string().trim().max(50).optional(),
  transaction_id: z.string().trim().max(120).optional().or(z.literal("")),
  screenshot_url: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const CreateSupportTicketSchema = z.object({
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(5000),
  category: z.string().trim().min(1).max(60),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
});

export const CreateContactMessageSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(5000),
});

export const CreateReviewSchema = z.object({
  target_type: z.enum(["order", "template", "plan", "website_product", "platform"]),
  target_id: uuid,
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(160).optional().or(z.literal("")),
  comment: z.string().trim().max(3000).optional().or(z.literal("")),
});

export const NewsletterSubscribeSchema = z.object({
  email: z.string().trim().email().max(255),
  source: z.string().trim().max(60).default("website"),
});

export const AdminStatusSchema = z.object({
  id: uuid,
  status: z.string().trim().min(1).max(40),
  admin_notes: z.string().trim().max(2000).optional(),
});

export const AdminOrderTrackingSchema = z.object({
  id: uuid,
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
  tracking_number: z.string().trim().max(120).optional().or(z.literal("")),
  tracking_carrier: z.string().trim().max(120).optional().or(z.literal("")),
  tracking_url: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type ActionName =
  | "orders.create"
  | "catalog_orders.create"
  | "upgrade_orders.create"
  | "support_tickets.create"
  | "contact_messages.create"
  | "reviews.create"
  | "newsletter.subscribe"
  | "admin.catalog_orders.set_status"
  | "admin.store_addons.set_status"
  | "admin.upgrade_orders.set_status"
  | "admin.orders.set_status";
