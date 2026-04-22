import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import StepShell from "./StepShell";
import { OnboardingData } from "@/hooks/useOnboarding";

interface Props {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
}

const Step6Payment = ({ data, update }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const { data: plan } = useQuery({
    queryKey: ["plan", data.plan_id],
    queryFn: async () => {
      if (!data.plan_id) return null;
      const { data: row } = await supabase.from("plans").select("*").eq("id", data.plan_id).maybeSingle();
      return row;
    },
    enabled: !!data.plan_id,
  });

  const isFree = plan?.type === "free" || plan?.price_pkr === 0;

  const handleScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/onboarding-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("payment-screenshots").upload(path, file);
      if (error) throw error;
      const { data: pub } = supabase.storage.from("payment-screenshots").getPublicUrl(path);
      update({ screenshot_url: pub.publicUrl });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <StepShell title="Confirm & pay" subtitle="Review your selection and confirm payment.">
      <Card className="border-border/60">
        <CardContent className="pt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium text-foreground">{plan?.name ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span className="capitalize text-foreground">{plan?.type ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price</span>
            <span className="font-semibold text-foreground">
              {isFree ? "Free" : plan ? `PKR ${plan.price_pkr.toLocaleString()}` : "—"}
            </span>
          </div>
          {plan?.duration_days && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="text-foreground">{plan.duration_days} days</span>
            </div>
          )}
        </CardContent>
      </Card>

      {!isFree && (
        <>
          <div className="space-y-2">
            <Label>Billing cycle</Label>
            <RadioGroup
              value={data.billing_cycle ?? ""}
              onValueChange={(v) => update({ billing_cycle: v })}
              className="grid grid-cols-3 gap-2"
            >
              {["monthly", "yearly", "one-time"].map((c) => (
                <Label
                  key={c}
                  htmlFor={`bc-${c}`}
                  className="flex items-center gap-2 rounded-lg border border-border p-3 cursor-pointer hover:border-primary/50 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                >
                  <RadioGroupItem value={c} id={`bc-${c}`} />
                  <span className="capitalize text-sm">{c.replace("-", " ")}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Payment method</Label>
            <Select value={data.payment_method ?? ""} onValueChange={(v) => update({ payment_method: v })}>
              <SelectTrigger><SelectValue placeholder="Pick a method" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easypaisa">Easypaisa</SelectItem>
                <SelectItem value="jazzcash">JazzCash</SelectItem>
                <SelectItem value="nayapay">NayaPay</SelectItem>
                <SelectItem value="raast">Raast</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tx">Transaction ID</Label>
              <Input
                id="tx"
                value={data.transaction_id ?? ""}
                onChange={(e) => update({ transaction_id: e.target.value })}
                placeholder="TXN123456"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amt">Amount paid (PKR)</Label>
              <Input
                id="amt"
                type="number"
                value={data.amount ?? ""}
                onChange={(e) => update({ amount: e.target.value ? Number(e.target.value) : undefined })}
                placeholder={plan?.price_pkr?.toString()}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment screenshot (optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input type="file" accept="image/*" id="pay-ss" className="hidden" onChange={handleScreenshot} />
              <label htmlFor="pay-ss" className="cursor-pointer block">
                {uploading ? (
                  <Loader2 className="h-6 w-6 mx-auto text-muted-foreground animate-spin" />
                ) : (
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                )}
                <p className="text-sm text-muted-foreground">
                  {data.screenshot_url ? "Screenshot uploaded — click to replace" : "Upload payment proof"}
                </p>
              </label>
            </div>
          </div>
        </>
      )}

      <div className="flex items-start gap-3 rounded-lg border border-border p-4">
        <Checkbox
          id="terms"
          checked={!!data.terms_accepted}
          onCheckedChange={(v) => update({ terms_accepted: !!v })}
        />
        <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer font-normal">
          I agree to Busistry's terms & conditions and authorize the team to begin building my store using the
          information I've shared.
        </Label>
      </div>
    </StepShell>
  );
};

export default Step6Payment;
