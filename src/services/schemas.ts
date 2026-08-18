import { z } from "zod";

/**
 * Client-side mirror of supabase/functions/_shared/schemas.ts.
 * Every mutation is validated here before it leaves the browser and again
 * on the server, so the API can never be driven purely from the UI.
 */

export const uuid = z.string().uuid();

export const OrderItemSchema = z.object({
  product_id: uuid,
  product_name: z.string().trim().min(1).max(255),
  quantity: z.number().int().min(1).max(999),
  price: z.number().finite().min(0),
});
export type OrderItemInput = z.infer<typeof OrderItemSchema>;

export const CreateStoreOrderSchema = z.object({
  store_id: uuid,
  customer_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  customer_phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(30)
    .regex(/^[+0-9()\-\s]+$/, "Only digits, spaces, +, -, ()"),
  customer_email: z.string().trim().max(255).email("Enter a valid email").optional().or(z.literal("")),
  customer_address: z.string().trim().min(5, "Address is required").max(600),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  items: z.array(OrderItemSchema).min(1, "Your cart is empty").max(100),
});
export type CreateStoreOrderInput = z.infer<typeof CreateStoreOrderSchema>;

export const CreateCatalogOrderSchema = z.object({
  item_id: uuid,
  store_id: uuid.nullable().optional(),
  quantity: z.number().int().min(1).max(999).default(1),
  config: z.record(z.string(), z.unknown()).default({}),
  payment_method: z
    .enum(["easypaisa", "jazzcash", "nayapay", "raast", "bank_transfer"])
    .optional(),
  transaction_id: z.string().trim().max(120).optional().or(z.literal("")),
  screenshot_url: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type CreateCatalogOrderInput = z.infer<typeof CreateCatalogOrderSchema>;

export const CreateUpgradeOrderSchema = z.object({
  store_id: uuid,
  upgrade_type: z.enum([
    "product_limit",
    "category_limit",
    "extend_duration",
    "plan_change",
    "content_tweak",
  ]),
  details: z.record(z.string(), z.unknown()).default({}),
  amount: z.number().int().min(0),
  payment_method: z.string().trim().max(50).optional(),
  transaction_id: z.string().trim().max(120).optional().or(z.literal("")),
  screenshot_url: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type CreateUpgradeOrderInput = z.infer<typeof CreateUpgradeOrderSchema>;

export const CreateSupportTicketSchema = z.object({
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10, "Please describe your issue").max(5000),
  category: z.string().trim().min(1).max(60),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
});
export type CreateSupportTicketInput = z.infer<typeof CreateSupportTicketSchema>;

export const CreateContactMessageSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(5000),
});
export type CreateContactMessageInput = z.infer<typeof CreateContactMessageSchema>;

export const CreateReviewSchema = z.object({
  target_type: z.enum(["order", "template", "plan", "website_product", "platform"]),
  target_id: uuid,
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(160).optional().or(z.literal("")),
  comment: z.string().trim().max(3000).optional().or(z.literal("")),
});
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

export const NewsletterSubscribeSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  source: z.string().trim().max(60).default("website"),
});
export type NewsletterSubscribeInput = z.infer<typeof NewsletterSubscribeSchema>;

export const AdminStatusSchema = z.object({
  id: uuid,
  status: z.string().trim().min(1).max(40),
  admin_notes: z.string().trim().max(2000).optional(),
});
export type AdminStatusInput = z.infer<typeof AdminStatusSchema>;

export const AdminOrderTrackingSchema = z.object({
  id: uuid,
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
  tracking_number: z.string().trim().max(120).optional().or(z.literal("")),
  tracking_carrier: z.string().trim().max(120).optional().or(z.literal("")),
  tracking_url: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type AdminOrderTrackingInput = z.infer<typeof AdminOrderTrackingSchema>;
