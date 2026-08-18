import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useCreateInvoice, useUpdateInvoice } from "@/hooks/useInvoices";
import { toast } from "sonner";
import { format } from "date-fns";
export function InvoiceFormDialog({ open, onOpenChange, invoice, order }) {
    const createInvoice = useCreateInvoice();
    const updateInvoice = useUpdateInvoice();
    const [formData, setFormData] = useState({
        invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        invoice_type: 'manual',
        status: 'draft',
        customer_name: '',
        company_name: '',
        customer_email: '',
        customer_phone: '',
        customer_address: '',
        tax_number: '',
        issue_date: format(new Date(), 'yyyy-MM-dd'),
        due_date: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        currency: 'PKR',
        notes: '',
        discount_total: 0,
        tax_total: 0,
        shipping_total: 0,
    });
    const [items, setItems] = useState([
        { description: '', quantity: 1, unit_price: 0, tax_rate: 0, tax_amount: 0, line_total: 0 }
    ]);
    useEffect(() => {
        if (invoice) {
            setFormData(invoice);
            setItems(invoice.items || []);
        }
        else if (order) {
            setFormData({
                ...formData,
                invoice_type: 'order',
                order_id: order.id,
                customer_id: order.user_id,
                customer_name: order.store_name || '',
                customer_email: order.contact_email || '',
                customer_phone: order.contact_phone || '',
                customer_address: order.address || '',
                grand_total: order.amount || 0,
                amount_due: order.amount || 0,
            });
            setItems([{
                    description: `Website Setup - ${order.store_name} (${order.plans?.name || 'Starter'})`,
                    quantity: 1,
                    unit_price: order.amount || 0,
                    tax_rate: 0,
                    tax_amount: 0,
                    line_total: order.amount || 0
                }]);
        }
    }, [invoice, order, open]);
    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unit_price: 0, tax_rate: 0, tax_amount: 0, line_total: 0 }]);
    };
    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };
    const updateItem = (index, field, value) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };
        // Recalculate line total
        const qty = field === 'quantity' ? value : (item.quantity || 0);
        const price = field === 'unit_price' ? value : (item.unit_price || 0);
        const taxRate = field === 'tax_rate' ? value : (item.tax_rate || 0);
        item.line_total = qty * price;
        item.tax_amount = (item.line_total * taxRate) / 100;
        newItems[index] = item;
        setItems(newItems);
    };
    const totals = items.reduce((acc, item) => ({
        subtotal: acc.subtotal + (item.line_total || 0),
        tax: acc.tax + (item.tax_amount || 0)
    }), { subtotal: 0, tax: 0 });
    const grandTotal = totals.subtotal + totals.tax + (Number(formData.shipping_total) || 0) - (Number(formData.discount_total) || 0);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const finalInvoice = {
                ...formData,
                total_amount: totals.subtotal,
                tax_total: totals.tax,
                grand_total: grandTotal,
                amount_due: grandTotal - (formData.amount_paid || 0)
            };
            if (invoice?.id) {
                await updateInvoice.mutateAsync({ id: invoice.id, updates: finalInvoice, items });
                toast.success("Invoice updated successfully");
            }
            else {
                await createInvoice.mutateAsync({ invoice: finalInvoice, items });
                toast.success("Invoice created successfully");
            }
            onOpenChange(false);
        }
        catch (error) {
            toast.error(error.message || "Failed to save invoice");
        }
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{invoice ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <Input value={formData.invoice_number} onChange={e => setFormData({ ...formData, invoice_number: e.target.value })} required/>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Customer Info</h4>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={formData.customer_name} onChange={e => setFormData({ ...formData, customer_name: e.target.value })} required/>
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input value={formData.company_name || ''} onChange={e => setFormData({ ...formData, company_name: e.target.value })}/>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.customer_email || ''} onChange={e => setFormData({ ...formData, customer_email: e.target.value })}/>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Invoice Dates</h4>
                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  <Input type="date" value={formData.issue_date} onChange={e => setFormData({ ...formData, issue_date: e.target.value })} required/>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={formData.due_date || ''} onChange={e => setFormData({ ...formData, due_date: e.target.value })}/>
                </div>
                <div className="space-y-2">
                  <Label>Tax/VAT/NTN Number</Label>
                  <Input value={formData.tax_number || ''} onChange={e => setFormData({ ...formData, tax_number: e.target.value })}/>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Items</h4>
                <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="h-4 w-4 mr-1"/> Add Item</Button>
              </div>
              
              <div className="space-y-2">
                {items.map((item, index) => (<div key={index} className="flex gap-2 items-start bg-muted/30 p-2 rounded">
                    <div className="flex-1 space-y-2">
                      <Input placeholder="Description" value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} required/>
                    </div>
                    <div className="w-20">
                      <Input type="number" placeholder="Qty" value={item.quantity} onChange={e => updateItem(index, 'quantity', Number(e.target.value))} required/>
                    </div>
                    <div className="w-32">
                      <Input type="number" placeholder="Price" value={item.unit_price} onChange={e => updateItem(index, 'unit_price', Number(e.target.value))} required/>
                    </div>
                    <div className="w-24">
                      <Input type="number" placeholder="Tax %" value={item.tax_rate} onChange={e => updateItem(index, 'tax_rate', Number(e.target.value))}/>
                    </div>
                    <div className="w-32 py-2 px-3 bg-muted text-right font-mono">
                      {item.line_total?.toLocaleString()}
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={items.length === 1}>
                      <Trash2 className="h-4 w-4 text-destructive"/>
                    </Button>
                  </div>))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 border-t pt-4">
              <div className="space-y-2">
                <Label>Notes / Payment Instructions</Label>
                <Textarea value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Bank account details, JazzCash/Easypaisa info..." className="h-32"/>
              </div>
              <div className="space-y-2 bg-muted/50 p-4 rounded">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">{totals.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-mono">{totals.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b items-center">
                  <Label className="text-muted-foreground">Discount</Label>
                  <Input type="number" className="w-24 h-8 text-right font-mono" value={formData.discount_total || 0} onChange={e => setFormData({ ...formData, discount_total: Number(e.target.value) })}/>
                </div>
                <div className="flex justify-between py-1 border-b items-center">
                  <Label className="text-muted-foreground">Shipping</Label>
                  <Input type="number" className="w-24 h-8 text-right font-mono" value={formData.shipping_total || 0} onChange={e => setFormData({ ...formData, shipping_total: Number(e.target.value) })}/>
                </div>
                <div className="flex justify-between py-2 mt-2 border-t-2 border-primary/20">
                  <span className="font-bold">Grand Total</span>
                  <span className="font-bold text-primary text-lg font-mono">{formData.currency} {grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createInvoice.isPending || updateInvoice.isPending}>
              {invoice ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}
