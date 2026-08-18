import { supabase } from "@/integrations/supabase/client";
import { callApi, unwrap, validate } from "./core/api";
import { CreateInvoiceSchema, type CreateInvoiceInput } from "./schemas";

export async function createInvoice(input: CreateInvoiceInput) {
  const data = validate(CreateInvoiceSchema, input);

  // Fallback to direct supabase insert for now as we don't have the edge function implementation yet
  // but keeping the pattern for future migration
  return callApi("admin.invoices.create", data, {
    fallback: async () => {
      // 1. Generate invoice number (simple sequential-like client-side logic for now)
      const date = new Date().getFullYear();
      const countResult = await supabase.from("invoices").select("id", { count: "exact", head: true });
      const count = (countResult.count || 0) + 1;
      const invoiceNumber = `INV-${date}-${count.toString().padStart(4, "0")}`;

      // 2. Calculate totals
      const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

      // 3. Insert invoice
      const invoiceData = {
        invoice_number: invoiceNumber,
        customer_id: data.customer_id || null,
        customer_name: data.customer_name,
        customer_email: data.customer_email || null,
        customer_phone: data.customer_phone || null,
        customer_address: data.customer_address || null,
        status: data.status,
        issue_date: data.issue_date,
        due_date: data.due_date || null,
        total_amount: totalAmount,
        currency: data.currency,
        notes: data.notes || null,
      };

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert(invoiceData)
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // 4. Insert items
      const itemsData = data.items.map((item) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.quantity * item.unit_price,
      }));

      const { error: itemsError } = await supabase.from("invoice_items").insert(itemsData);
      if (itemsError) throw itemsError;

      return invoice;
    },
  });
}

export async function getInvoices() {
  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      invoice_items (*)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getInvoice(id: string) {
  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      invoice_items (*)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateInvoiceStatus(id: string, status: "pending" | "paid" | "cancelled") {
  const { data, error } = await supabase
    .from("invoices")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
