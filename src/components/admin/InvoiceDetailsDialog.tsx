import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Invoice } from "@/hooks/useInvoices";
import { Printer, Download, Mail, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface InvoiceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
}

export function InvoiceDetailsDialog({ open, onOpenChange, invoice }: InvoiceDetailsDialogProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4 mb-4 flex-row justify-between items-center print:hidden">
          <DialogTitle>Invoice Details - {invoice.invoice_number}</DialogTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-4 w-4 mr-2" /> Print</Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> PDF</Button>
            <Button variant="default" size="sm"><Mail className="h-4 w-4 mr-2" /> Send</Button>
          </div>
        </DialogHeader>

        <div className="p-8 bg-white text-slate-900 min-h-[800px] border shadow-sm print:border-0 print:shadow-none" id="invoice-printable">
          {/* Header */}
          <div className="flex justify-between mb-12">
            <div className="space-y-2">
              <div className="h-12 w-48 bg-emerald-50 rounded flex items-center px-4">
                <span className="text-2xl font-bold text-emerald-600 tracking-tighter">BUSISTREE</span>
              </div>
              <p className="text-sm text-slate-500 max-w-xs">
                Your one-stop hub for all business requirements.
                Planning, Presence, Design & Marketing.
              </p>
            </div>
            <div className="text-right space-y-1">
              <h1 className="text-4xl font-bold uppercase tracking-tight text-slate-800">Invoice</h1>
              <p className="text-slate-500 font-mono">#{invoice.invoice_number}</p>
              <div className="mt-4 inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded uppercase">
                {invoice.status}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Bill To</h4>
                <div className="font-bold text-lg text-slate-800">{invoice.customer_name}</div>
                {invoice.company_name && <div className="text-slate-600">{invoice.company_name}</div>}
                {invoice.customer_address && <div className="text-slate-600 whitespace-pre-line">{invoice.customer_address}</div>}
                {invoice.customer_email && <div className="text-slate-500 mt-1">{invoice.customer_email}</div>}
                {invoice.customer_phone && <div className="text-slate-500">{invoice.customer_phone}</div>}
                {invoice.tax_number && <div className="text-slate-400 text-xs mt-2">Tax ID: {invoice.tax_number}</div>}
              </div>
            </div>
            <div className="space-y-4 text-right">
              <div className="grid grid-cols-2 gap-4 ml-auto w-fit">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date Issued:</span>
                <span className="text-slate-700 font-medium">{format(new Date(invoice.issue_date), 'dd MMM yyyy')}</span>
                
                {invoice.due_date && (
                  <>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Due Date:</span>
                    <span className="text-slate-700 font-medium">{format(new Date(invoice.due_date), 'dd MMM yyyy')}</span>
                  </>
                )}
                
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Type:</span>
                <span className="text-slate-700 font-medium uppercase">{invoice.invoice_type}</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mb-12">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center w-24">Qty</th>
                  <th className="py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right w-32">Price</th>
                  <th className="py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right w-40">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-4">
                      <div className="font-bold text-slate-800">{item.description}</div>
                      {item.item_name && <div className="text-xs text-slate-500">{item.item_name}</div>}
                    </td>
                    <td className="py-4 text-center text-slate-600">{item.quantity}</td>
                    <td className="py-4 text-right text-slate-600 font-mono">{invoice.currency} {item.unit_price?.toLocaleString()}</td>
                    <td className="py-4 text-right font-bold text-slate-800 font-mono">{invoice.currency} {item.line_total?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-between gap-12">
            <div className="flex-1">
              {invoice.notes && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Notes & Instructions</h4>
                  <p className="text-sm text-slate-600 whitespace-pre-line bg-slate-50 p-4 rounded border border-slate-100 italic">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </div>
            <div className="w-72 space-y-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono">{invoice.currency} {invoice.total_amount?.toLocaleString()}</span>
              </div>
              {invoice.tax_total > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax Total</span>
                  <span className="font-mono">{invoice.currency} {invoice.tax_total?.toLocaleString()}</span>
                </div>
              )}
              {invoice.discount_total > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span className="font-mono">-{invoice.currency} {invoice.discount_total?.toLocaleString()}</span>
                </div>
              )}
              {invoice.shipping_total > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-mono">{invoice.currency} {invoice.shipping_total?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t-2 border-slate-200 text-xl font-bold text-slate-800">
                <span>Total</span>
                <span className="font-mono">{invoice.currency} {invoice.grand_total?.toLocaleString()}</span>
              </div>
              
              <div className="pt-6 space-y-2">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Amount Paid</span>
                  <span className="font-mono">{invoice.currency} {invoice.amount_paid?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-red-600 bg-red-50 p-2 rounded">
                  <span>Balance Due</span>
                  <span className="font-mono">{invoice.currency} {invoice.amount_due?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-20 pt-12 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-400">
              Thank you for choosing Busistree. If you have any questions about this invoice, please contact support@busistree.com
            </p>
          </div>
        </div>

        <style>
          {`
            @media print {
              body * {
                visibility: hidden;
              }
              #invoice-printable, #invoice-printable * {
                visibility: visible;
              }
              #invoice-printable {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 0;
                border: none;
              }
              .print\\:hidden {
                display: none !important;
              }
            }
          `}
        </style>
      </DialogContent>
    </Dialog>
  );
}
