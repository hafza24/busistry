import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Invoice, useUpdateInvoice } from "@/hooks/useInvoices";
import { toast } from "sonner";
import { format } from "date-fns";
import { Wallet } from "lucide-react";

interface PaymentRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
}

export function PaymentRecordDialog({ open, onOpenChange, invoice }: PaymentRecordDialogProps) {
  const updateInvoice = useUpdateInvoice();
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [method, setMethod] = useState<string>('bank_transfer');
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  if (!invoice) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newAmountPaid = (invoice.amount_paid || 0) + amount;
      const newAmountDue = invoice.grand_total - newAmountPaid;
      
      let newStatus = invoice.status;
      if (newAmountPaid >= invoice.grand_total) {
        newStatus = 'paid';
      } else if (newAmountPaid > 0) {
        newStatus = 'partially_paid';
      }

      await updateInvoice.mutateAsync({
        id: invoice.id,
        updates: {
          amount_paid: newAmountPaid,
          amount_due: newAmountDue,
          status: newStatus as any,
          notes: invoice.notes + `\n[Payment recorded: ${amount} via ${method} on ${date}. Ref: ${reference}]`
        }
      });

      toast.success("Payment recorded successfully");
      onOpenChange(false);
      // Reset form
      setAmount(0);
      setReference('');
      setNotes('');
    } catch (error: any) {
      toast.error(error.message || "Failed to record payment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Record Payment
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Invoice Total:</span>
                <span className="font-mono">{invoice.currency} {invoice.grand_total?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Total Paid:</span>
                <span className="font-mono">{invoice.currency} {invoice.amount_paid?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-red-600 pt-1 border-t">
                <span>Balance Due:</span>
                <span className="font-mono">{invoice.currency} {invoice.amount_due?.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground font-mono text-sm">{invoice.currency}</span>
                <Input 
                  type="number" 
                  className="pl-12 font-mono" 
                  value={amount} 
                  onChange={e => setAmount(Number(e.target.value))} 
                  max={invoice.amount_due}
                  required 
                />
              </div>
              <p className="text-[10px] text-muted-foreground italic">Max amount: {invoice.amount_due}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="jazzcash">JazzCash</SelectItem>
                    <SelectItem value="easypaisa">Easypaisa</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Transaction Reference / ID</Label>
              <Input value={reference} onChange={e => setReference(e.target.value)} placeholder="TID-123456789" />
            </div>

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional payment notes..." className="h-20" />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={updateInvoice.isPending}>Record Payment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
