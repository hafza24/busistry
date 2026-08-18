import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
export function useAdminInvoices() {
    const qc = useQueryClient();
    useEffect(() => {
        let isSubscribed = true;
        const channel = supabase
            .channel("admin_invoices_changes")
            .on("postgres_changes", { event: "*", schema: "public", table: "invoices" }, () => {
            if (isSubscribed) {
                qc.invalidateQueries({ queryKey: ["admin_invoices"] });
            }
        })
            .subscribe();
        return () => {
            isSubscribed = false;
            supabase.removeChannel(channel);
        };
    }, [qc]);
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
            if (error)
                throw error;
            return data;
        },
    });
}
export function useAdminInvoice(id) {
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
            if (error)
                throw error;
            return data;
        },
    });
}
export function useCreateInvoice() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ invoice, items }) => {
            // Remove items from invoice object before insert to avoid TS and DB errors
            const { items: _, ...invoiceData } = invoice;
            const { data: invData, error: invError } = await supabase
                .from("invoices")
                .insert(invoiceData)
                .select()
                .single();
            if (invError)
                throw invError;
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
                .insert(itemsToInsert);
            if (itemsError)
                throw itemsError;
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
        mutationFn: async ({ id, updates, items }) => {
            const { items: _, ...updateData } = updates;
            const { error: invError } = await supabase
                .from("invoices")
                .update(updateData)
                .eq("id", id);
            if (invError)
                throw invError;
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
                    .insert(itemsToInsert);
                if (itemsError)
                    throw itemsError;
            }
        },
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ["admin_invoices"] });
            qc.invalidateQueries({ queryKey: ["admin_invoice", variables.id] });
        },
    });
}
