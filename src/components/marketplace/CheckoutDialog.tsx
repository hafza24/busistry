import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useStores } from "@/hooks/useStores";
import { useToast } from "@/hooks/use-toast";
import { useProfileGate } from "@/hooks/useProfileGate";


interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  amount: number;
  storeId?: string;
  /** Renders custom config fields (e.g. WhatsApp number) above the payment area */
  configFields?: React.ReactNode;
  configValues?: Record<string, any>;
  onSubmit: (args: { storeId: string; payment_method: string; transaction_id: string; screenshot_url: string | null }) => Promise<void>;
}

const PAYMENT_METHODS = [
  { value: "jazzcash", label: "JazzCash" },
  { value: "easypaisa", label: "Easypaisa" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

export default function CheckoutDialog({ open, onOpenChange, title, amount, storeId, configFields, onSubmit }: Props) {
  const { user } = useAuth();
  const { data: stores } = useStores();
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState(storeId ?? "");
  const [method, setMethod] = useState("jazzcash");
  const [txn, setTxn] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const activeStores = (stores ?? []).filter((s: any) => s.status === "activated" || s.status === "approved");
  const { requireComplete, dialog: profileGateDialog } = useProfileGate();

  const handleSubmit = async () => {
    if (!requireComplete()) return;
    const sId = storeId || selectedStore;
    if (!sId) { toast({ title: "Select a store", variant: "destructive" }); return; }
    if (!txn) { toast({ title: "Transaction ID required", variant: "destructive" }); return; }

    setSubmitting(true);
    try {
      let screenshot_url: string | null = null;
      if (file && user) {
        setUploading(true);
        const path = `${user.id}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from("payment-screenshots").upload(path, file);
        if (error) throw error;
        screenshot_url = path;
        setUploading(false);
      }
      await onSubmit({ storeId: sId, payment_method: method, transaction_id: txn, screenshot_url });
      toast({ title: "Order placed", description: "Your request is pending admin approval." });
      onOpenChange(false);
      setTxn(""); setFile(null);
    } catch (e: any) {
      toast({ title: "Order failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false); setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Total: <span className="font-semibold text-foreground">PKR {amount.toLocaleString()}</span></DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!storeId && (
            <div className="space-y-2">
              <Label>Apply to store</Label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger><SelectValue placeholder="Choose your store" /></SelectTrigger>
                <SelectContent>
                  {activeStores.length === 0 && <SelectItem value="_none" disabled>No active stores</SelectItem>}
                  {activeStores.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {activeStores.length === 0 && <p className="text-xs text-muted-foreground">You need an active website first. Order one from Templates.</p>}
            </div>
          )}

          {configFields}

          <div className="space-y-2">
            <Label>Payment method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PAYMENT_METHODS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Transaction ID</Label>
            <Input value={txn} onChange={e => setTxn(e.target.value)} placeholder="TXN123456789" />
          </div>

          <div className="space-y-2">
            <Label>Payment screenshot (optional)</Label>
            <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-md cursor-pointer hover:bg-muted/50">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground truncate">{file?.name ?? "Upload screenshot"}</span>
              <input type="file" className="hidden" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting || uploading}>
            {(submitting || uploading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Place Order
          </Button>
        </DialogFooter>
      </DialogContent>
      {profileGateDialog}

    </Dialog>
  );
}
