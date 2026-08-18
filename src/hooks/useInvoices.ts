import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
export type InvoiceType = 'manual' | 'order';

export interface InvoiceItem {
  id?: string;
  invoice_id: string;
  product_id?: string | null;
  item_name?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  tax_amount: number;
  line_total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: InvoiceType;
  order_id: string | null;
  customer_id: string | null;
  customer_name: string;
  company_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  tax_number: string | null;
  issue_date: string;
  due_date: string | null;
  status: InvoiceStatus;
  total_amount: number;
  discount_total: number;
  tax_total: number;
  shipping_total: number;
  grand_total: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  items?: InvoiceItem[];
}

export function useAdminInvoices() {
  return useQuery({
    queryKey: ["admin_invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          items:invoice_items(*)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as unknown as Invoice[];
    },
  });
}

export function useAdminInvoice(id: string) {
  return useQuery({
    queryKey: ["admin_invoice", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          items:invoice_items(*)
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as unknown as Invoice;
    },
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ invoice, items }: { invoice: Partial<Invoice>; items: Partial<InvoiceItem>[] }) => {
      // Remove items from invoice object before insert to avoid TS and DB errors
      const { items: _, ...invoiceData } = invoice as any;
      
      const { data: invData, error: invError } = await supabase
        .from("invoices")
        .insert(invoiceData)
        .select()
        .single();
      
      if (invError) throw invError;

      const itemsToInsert = items.map(item => ({
        invoice_id: invData.id,
        description: item.description || "",
        quantity: item.quantity || 1,
        unit_price: item.unit_price || 0,
        tax_rate: item.tax_rate || 0,
        tax_amount: item.tax_amount || 0,
        line_total: item.line_total || 0,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(itemsToInsert as any);
      
      if (itemsError) throw itemsError;

      return invData;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_invoices"] });
    },
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates, items }: { id: string; updates: Partial<Invoice>; items?: Partial<InvoiceItem>[] }) => {
      const { items: _, ...updateData } = updates as any;
      
      const { error: invError } = await supabase
        .from("invoices")
        .update(updateData)
        .eq("id", id);
      
      if (invError) throw invError;

      if (items) {
        await supabase.from("invoice_items").delete().eq("invoice_id", id);
        
        const itemsToInsert = items.map(item => ({
          invoice_id: id,
          description: item.description || "",
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          tax_rate: item.tax_rate || 0,
          tax_amount: item.tax_amount || 0,
          line_total: item.line_total || 0,
        }));

        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(itemsToInsert as any);
        
        if (itemsError) throw itemsError;
      }
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["admin_invoices"] });
      qc.invalidateQueries({ queryKey: ["admin_invoice", variables.id] });
    },
  });
}
