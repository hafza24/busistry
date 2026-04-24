import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import StepShell from "./StepShell";
import { OnboardingData } from "@/hooks/useOnboarding";
import { useSubmissionAddons, calcAddonTotals } from "@/hooks/useAddons";

interface Props {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
  onEdit?: (step: number) => void;
}

const fmt = (v: unknown): string => {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.length ? v.join(", ") : "—";
  return String(v);
};

const PROJECT_TYPE_LABELS: Record<string, string> = {
  ecommerce: "eCommerce Store",
  agency: "Agency Website",
  booking: "Booking System",
  business: "Business Website",
  management: "Management System",
};

const projectDetailRows = (type: string | undefined, d: Record<string, any>) => {
  if (!type) return [];
  switch (type) {
    case "ecommerce":
      return [
        { label: "Selling", value: fmt(d.selling) },
        { label: "Products", value: fmt(d.num_products) },
        { label: "Payment gateway setup", value: fmt(d.payment_gateway_setup) },
        { label: "Has product images", value: fmt(d.has_images) },
      ];
    case "agency":
      return [
        { label: "Services offered", value: fmt(d.services_offered) },
        { label: "Pages", value: fmt(d.num_pages) },
        { label: "Portfolio section", value: fmt(d.portfolio) },
      ];
    case "booking":
      return [
        { label: "Booking type", value: fmt(d.booking_type) },
        { label: "Time slots", value: fmt(d.time_slots) },
        { label: "Payment at booking", value: fmt(d.booking_payment) },
      ];
    case "business":
      return [
        { label: "Business type", value: fmt(d.business_subtype) },
        { label: "Pages", value: fmt(d.pages) },
        { label: "Contact method", value: fmt(d.contact_method) },
      ];
    case "management":
      return [
        { label: "System type", value: fmt(d.system_type) },
        { label: "User roles", value: fmt(d.user_roles_text) },
        { label: "Complexity", value: fmt(d.complexity) },
      ];
    default:
      return [];
  }
};

const RecapSection = ({
  step,
  title,
  rows,
  onEdit,
}: {
  step: number;
  title: string;
  rows: { label: string; value: React.ReactNode }[];
  onEdit?: (step: number) => void;
}) => (
  <div className="rounded-lg border border-border/60 bg-card/40">
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-muted-foreground tabular-nums">
          0{step}
        </span>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      {onEdit && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(step)}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-3 w-3 mr-1.5" />
          Edit
        </Button>
      )}
    </div>
    <dl className="divide-y divide-border/40">
      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-3 gap-3 px-4 py-2 text-sm">
          <dt className="text-muted-foreground col-span-1">{r.label}</dt>
          <dd className="text-foreground col-span-2 break-words">{r.value}</dd>
        </div>
      ))}
    </dl>
  </div>
);

const Step6Payment = ({ data, update, onEdit }: Props) => {
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

  const { data: selections = [] } = useSubmissionAddons(data.id);
  const addonTotals = calcAddonTotals(selections);
  const planPrice = plan?.price_pkr ?? 0;
  const grandToday = planPrice + addonTotals.oneTime;

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
    <StepShell title="Confirm & pay" subtitle="Review every detail below. You can jump back to any step to make changes before submitting.">
      {/* Recap of all previous steps */}
      <div className="space-y-3">
        <RecapSection
          step={1}
          title="Project type"
          onEdit={onEdit}
          rows={[
            { label: "Type", value: data.project_type ? PROJECT_TYPE_LABELS[data.project_type] ?? data.project_type : "—" },
          ]}
        />
        <RecapSection
          step={2}
          title="Project details"
          onEdit={onEdit}
          rows={projectDetailRows(data.project_type, data.project_details ?? {})}
        />
        <RecapSection
          step={3}
          title="Business basics"
          onEdit={onEdit}
          rows={[
            { label: "Business name", value: fmt(data.business_name) },
            { label: "Business type", value: fmt(data.business_type) },
            { label: "Description", value: fmt(data.business_description) },
            { label: "Country", value: fmt(data.country) },
          ]}
        />
        <RecapSection
          step={4}
          title="Branding & design"
          onEdit={onEdit}
          rows={[
            {
              label: "Logo",
              value: data.logo_url ? (
                <a href={data.logo_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  View upload
                </a>
              ) : data.needs_logo_design ? (
                "Needs design by Busistry"
              ) : (
                "—"
              ),
            },
            { label: "Color palette", value: fmt(data.color_palette) },
            { label: "Font style", value: fmt(data.font_style) },
            { label: "References", value: fmt(data.reference_websites) },
          ]}
        />
        <RecapSection
          step={5}
          title="Team"
          onEdit={onEdit}
          rows={[
            { label: "Team size", value: fmt(data.team_size) },
            { label: "Roles", value: fmt(data.team_roles) },
            {
              label: "Members",
              value:
                data.team_members && data.team_members.length
                  ? data.team_members.map((m, i) => (
                      <div key={i}>
                        {m.name || "Unnamed"} <span className="text-muted-foreground">— {m.role || "—"}</span>
                      </div>
                    ))
                  : "—",
            },
          ]}
        />
        <RecapSection
          step={6}
          title="Store requirements"
          onEdit={onEdit}
          rows={[
            { label: "Store type", value: fmt(data.store_type) },
            { label: "Products (est.)", value: fmt(data.product_count_estimate) },
            { label: "Payment gateway", value: fmt(data.payment_gateway) },
            { label: "Shipping", value: fmt(data.shipping_requirements) },
            { label: "Special features", value: fmt(data.special_features) },
          ]}
        />
        <RecapSection
          step={7}
          title="Add-ons"
          onEdit={onEdit}
          rows={
            selections.length > 0
              ? selections.map((s) => ({
                  label: s.addon?.name ?? "Add-on",
                  value: (
                    <span className="tabular-nums">
                      PKR {(s.price_snapshot_pkr * (s.quantity ?? 1)).toLocaleString()}
                      {s.pricing_type_snapshot === "monthly" && (
                        <span className="text-muted-foreground"> / mo</span>
                      )}
                      {s.quantity > 1 && (
                        <span className="text-muted-foreground text-xs ml-1">×{s.quantity}</span>
                      )}
                    </span>
                  ),
                }))
              : [{ label: "Selected", value: "None — you can add these later" }]
          }
        />
        <RecapSection
          step={8}
          title="Contact"
          onEdit={onEdit}
          rows={[
            { label: "Full name", value: fmt(data.full_name) },
            { label: "Email", value: fmt(data.email) },
            { label: "Phone", value: fmt(data.phone) },
            { label: "WhatsApp", value: fmt(data.whatsapp) },
            { label: "Address", value: fmt(data.business_address) },
          ]}
        />
      </div>

      <div className="pt-2">
        <h3 className="text-sm font-semibold text-foreground">Order summary</h3>
      </div>

      <Card className="border-border/60">
        <CardContent className="pt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plan ({plan?.name ?? "—"})</span>
            <span className="font-medium text-foreground tabular-nums">
              {isFree ? "Free" : plan ? `PKR ${planPrice.toLocaleString()}` : "—"}
            </span>
          </div>

          {selections.length > 0 && (
            <div className="border-t border-border/50 pt-2 mt-2 space-y-1.5">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Add-ons
              </div>
              {selections.map((s) => (
                <div key={s.addon_id} className="flex justify-between text-sm">
                  <span className="text-foreground">
                    {s.addon?.name ?? "Add-on"}
                    {s.quantity > 1 && (
                      <span className="text-muted-foreground"> × {s.quantity}</span>
                    )}
                  </span>
                  <span className="tabular-nums text-foreground">
                    PKR {(s.price_snapshot_pkr * (s.quantity ?? 1)).toLocaleString()}
                    {s.pricing_type_snapshot === "monthly" && (
                      <span className="text-muted-foreground text-xs"> / mo</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-border/50 pt-3 mt-2 flex justify-between items-baseline">
            <span className="font-semibold text-foreground">Total today</span>
            <span className="text-lg font-bold text-primary tabular-nums">
              PKR {grandToday.toLocaleString()}
            </span>
          </div>
          {addonTotals.monthly > 0 && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Recurring monthly</span>
              <span className="tabular-nums">PKR {addonTotals.monthly.toLocaleString()} / mo</span>
            </div>
          )}
          {plan?.duration_days && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Plan duration</span>
              <span>{plan.duration_days} days</span>
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
                placeholder={grandToday ? grandToday.toString() : plan?.price_pkr?.toString()}
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
