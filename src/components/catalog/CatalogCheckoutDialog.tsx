import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useStores } from "@/hooks/useStores";
import { useQuery } from "@tanstack/react-query";
import { useCreateCatalogOrder, CATALOG_TYPE_META, type CatalogItem } from "@/hooks/useCatalog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: CatalogItem;
}

export default function CatalogCheckoutDialog({ open, onOpenChange, item }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stores = [] } = useStores();
  const create = useCreateCatalogOrder();

  const meta = CATALOG_TYPE_META[item.type];
  const [storeId, setStoreId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [days, setDays] = useState<number>(30);
  const [targetPlanId, setTargetPlanId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [txId, setTxId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("jazzcash");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: plans = [] } = useQuery({
    queryKey: ["plans_for_upgrade"],
    enabled: item.type === "plan_upgrade" && open,
    queryFn: async () => {
      const { data, error } = await supabase.from("plans").select("id, name, price_pkr").eq("is_active", true).order("price_pkr");
      if (error) throw error;
      return data ?? [];
    },
  });

  if (!user) return null;

  const unitPrice = Number(item.price_pkr || 0);
  const qty = meta.needsConfig === "quantity" ? quantity : meta.needsConfig === "days" ? days : 1;
  const total = item.pricing_type === "per_unit" ? unitPrice * qty : unitPrice;

  const handleSubmit = async () => {
    if (meta.storeScoped && !storeId) {
      toast.error("Please pick a website");
      return;
    }
    if (item.type === "plan_upgrade" && !targetPlanId) {
      toast.error("Please pick the target plan");
      return;
    }
    if (!txId.trim()) {
      toast.error("Please enter your transaction ID");
      return;
    }

    let screenshot_url: string | undefined;
    if (file) {
      setUploading(true);
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("payment-screenshots").upload(path, file);
      setUploading(false);
      if (upErr) {
        toast.error(`Upload failed: ${upErr.message}`);
        return;
      }
      const { data: pub } = supabase.storage.from("payment-screenshots").getPublicUrl(path);
      screenshot_url = pub.publicUrl;
    }

    const config: Record<string, any> = {};
    if (notes.trim()) config.notes = notes.trim();
    if (meta.needsConfig === "quantity") config.quantity = quantity;
    if (meta.needsConfig === "days") config.days = days;
    if (meta.needsConfig === "plan") config.target_plan_id = targetPlanId;

    try {
      await create.mutateAsync({
        user_id: user.id,
        store_id: meta.storeScoped ? storeId : null,
        item_id: item.id,
        item_type_snapshot: item.type,
        name_snapshot: item.name,
        price_snapshot_pkr: total,
        pricing_type_snapshot: item.pricing_type,
        quantity: qty,
        config,
        payment_method: paymentMethod,
        transaction_id: txId.trim(),
        screenshot_url,
      });
      toast.success("Request submitted. We'll review and get in touch.");
      onOpenChange(false);
      navigate("/dashboard?view=requests");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to submit");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add {item.name} to your site</DialogTitle>
          <DialogDescription>Complete the details below to submit your request.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {meta.storeScoped && (
            <div className="space-y-1.5">
              <Label>Website</Label>
              <Select value={storeId} onValueChange={setStoreId}>
                <SelectTrigger><SelectValue placeholder="Pick a website" /></SelectTrigger>
                <SelectContent>
                  {stores.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {stores.length === 0 && (
                <p className="text-xs text-muted-foreground">You don't have a website yet. <a href="/onboarding" className="underline">Start one</a>.</p>
              )}
            </div>
          )}

          {meta.needsConfig === "quantity" && (
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))} />
            </div>
          )}
          {meta.needsConfig === "days" && (
            <div className="space-y-1.5">
              <Label>Extend by (days)</Label>
              <Input type="number" min={1} value={days} onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))} />
            </div>
          )}
          {meta.needsConfig === "plan" && (
            <div className="space-y-1.5">
              <Label>Target plan</Label>
              <Select value={targetPlanId} onValueChange={setTargetPlanId}>
                <SelectTrigger><SelectValue placeholder="Pick a plan" /></SelectTrigger>
                <SelectContent>
                  {plans.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} — PKR {Number(p.price_pkr).toLocaleString()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything we should know?" rows={3} />
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm space-y-1">
            <p className="font-semibold text-primary">Amount to pay: PKR {Number(total).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Send to JazzCash / Easypaisa: <span className="font-mono">0300-0000000</span></p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Payment method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="jazzcash">JazzCash</SelectItem>
                  <SelectItem value="easypaisa">Easypaisa</SelectItem>
                  <SelectItem value="bank">Bank transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Transaction ID</Label>
              <Input value={txId} onChange={(e) => setTxId(e.target.value)} placeholder="e.g. TX12345" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Screenshot (optional)</Label>
            <label className="flex items-center gap-2 border border-dashed border-border rounded-lg p-3 cursor-pointer hover:border-primary/40 transition-colors">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground truncate">{file?.name ?? "Attach payment screenshot"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={create.isPending || uploading}>
            {(create.isPending || uploading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Submit request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
