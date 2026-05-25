import { useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Lock, Sparkles } from "lucide-react";
import StepShell from "./StepShell";
import { OnboardingData } from "@/hooks/useOnboarding";
import { usePlan } from "@/hooks/usePlan";
import { useTemplate } from "@/hooks/useTemplate";
import { getPresetForTemplate, FIELD_LABELS, ConditionalField, CATEGORY_TO_BUSINESS_TYPE, CATEGORY_TO_PROJECT_TYPE } from "@/lib/templatePresets";

interface Props {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
}

const setDetail = (
  data: OnboardingData,
  update: (p: Partial<OnboardingData>) => void,
  key: string,
  value: any,
) => {
  update({ project_details: { ...(data.project_details ?? {}), [key]: value } });
};

const YesNo = ({ value, onChange }: { value?: string; onChange: (v: string) => void }) => (
  <RadioGroup value={value ?? ""} onValueChange={onChange} className="flex gap-6">
    <label className="flex items-center gap-2 cursor-pointer">
      <RadioGroupItem value="yes" /> <span className="text-sm">Yes</span>
    </label>
    <label className="flex items-center gap-2 cursor-pointer">
      <RadioGroupItem value="no" /> <span className="text-sm">No</span>
    </label>
  </RadioGroup>
);

const ConditionalInput = ({
  field,
  data,
  update,
}: {
  field: ConditionalField;
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
}) => {
  const d = data.project_details ?? {};
  const val = d[field];
  const set = (v: any) => setDetail(data, update, field, v);
  const label = FIELD_LABELS[field];

  switch (field) {
    case "shipping_regions":
      return (
        <div className="space-y-2">
          <Label>{label}</Label>
          <Input value={val ?? ""} onChange={(e) => set(e.target.value)} placeholder="e.g. Pakistan, UAE, Worldwide" />
        </div>
      );
    case "payment_gateway":
      return (
        <div className="space-y-2">
          <Label>{label}</Label>
          <Select value={val ?? ""} onValueChange={set}>
            <SelectTrigger><SelectValue placeholder="Pick a gateway" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cod">Cash on Delivery</SelectItem>
              <SelectItem value="jazzcash_easypaisa">JazzCash / Easypaisa</SelectItem>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    case "tax_setup":
      return (
        <div className="space-y-2">
          <Label>{label} required?</Label>
          <YesNo value={val} onChange={set} />
        </div>
      );
    case "dine_in_takeaway":
      return (
        <div className="space-y-2">
          <Label>{label}</Label>
          <Select value={val ?? ""} onValueChange={set}>
            <SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dine_in">Dine-in</SelectItem>
              <SelectItem value="takeaway">Takeaway</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    case "menu_type":
      return (
        <div className="space-y-2">
          <Label>{label}</Label>
          <Input value={val ?? ""} onChange={(e) => set(e.target.value)} placeholder="e.g. À la carte, Buffet, Set menu" />
        </div>
      );
    case "reservation_system":
      return (
        <div className="space-y-2">
          <Label>{label}?</Label>
          <YesNo value={val} onChange={set} />
        </div>
      );
    case "event_date":
      return (
        <div className="space-y-2">
          <Label>{label}</Label>
          <Input type="date" value={val ?? ""} onChange={(e) => set(e.target.value)} />
        </div>
      );
    case "venue":
      return (
        <div className="space-y-2">
          <Label>{label}</Label>
          <Input value={val ?? ""} onChange={(e) => set(e.target.value)} placeholder="Venue name & address" />
        </div>
      );
    case "rsvp_limit":
      return (
        <div className="space-y-2">
          <Label>{label}</Label>
          <Input type="number" min={0} value={val ?? ""} onChange={(e) => set(e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 200" />
        </div>
      );
    case "num_authors":
      return (
        <div className="space-y-2">
          <Label>{label}</Label>
          <Input type="number" min={1} value={val ?? ""} onChange={(e) => set(e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 3" />
        </div>
      );
    case "newsletter":
      return (
        <div className="space-y-2">
          <Label>{label}?</Label>
          <YesNo value={val} onChange={set} />
        </div>
      );
    case "departments":
      return (
        <div className="space-y-2">
          <Label>{label}</Label>
          <Textarea rows={2} value={val ?? ""} onChange={(e) => set(e.target.value)} placeholder="e.g. Programs, Volunteers, Fundraising" />
        </div>
      );
    case "donation_system":
      return (
        <div className="space-y-2">
          <Label>{label}?</Label>
          <YesNo value={val} onChange={set} />
        </div>
      );
    case "member_portal":
      return (
        <div className="space-y-2">
          <Label>{label}?</Label>
          <YesNo value={val} onChange={set} />
        </div>
      );
  }
};

const Step2ProjectDetails = ({ data, update }: Props) => {
  const { data: plan } = usePlan(data.plan_id);
  const { data: template } = useTemplate(data.template_id);
  const preset = useMemo(() => getPreset(template?.category, template?.subcategory), [template]);

  // Mark details as auto-configured so step validation passes
  useEffect(() => {
    if (!template) return;
    const d = data.project_details ?? {};
    const category = template.category ?? "";
    const autoBusinessType = CATEGORY_TO_BUSINESS_TYPE[category];
    const autoProjectType = CATEGORY_TO_PROJECT_TYPE[category];
    const patch: Partial<OnboardingData> = {};
    if (autoBusinessType && data.business_type !== autoBusinessType) patch.business_type = autoBusinessType;
    if (autoProjectType && !data.project_type) patch.project_type = autoProjectType;
    if (!d.auto_configured) {
      patch.project_details = {
        ...d,
        auto_configured: true,
        included_pages: preset.pages,
        included_modules: preset.modules,
        num_products: plan?.max_products,
        num_pages: plan?.max_pages,
      };
    }
    if (Object.keys(patch).length) update(patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, plan]);

  if (!template) {
    return (
      <StepShell title="Select a template first" subtitle="Pick a template so we can auto-configure your pages and modules.">
        <p className="text-sm text-muted-foreground">
          Head to the <a href="/templates" className="text-primary underline">templates page</a> and choose one to continue.
        </p>
      </StepShell>
    );
  }

  return (
    <StepShell
      title="Auto-configured for you"
      subtitle="Your template and plan already define most of the structure. Just confirm the details below."
    >
      {/* Locked pages */}
      <section className="rounded-xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-background p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Included pages
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Lock className="h-3 w-3" /> Configured by template
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {preset.pages.map((p) => (
            <span key={p} className="text-xs px-2.5 py-1 rounded-md border border-primary/20 bg-primary/5 text-foreground/90">
              {p}
            </span>
          ))}
        </div>
        {plan?.max_pages != null && preset.pages.length > plan.max_pages && (
          <p className="text-[11px] text-muted-foreground">
            Your plan covers {plan.max_pages} pages. Extra pages can be purchased from the marketplace.
          </p>
        )}
      </section>

      {/* Locked modules */}
      {preset.modules.length > 0 && (
        <section className="rounded-xl border border-accent/20 bg-gradient-to-br from-accent/5 via-background to-background p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-accent" />
              Included modules
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Lock className="h-3 w-3" /> Included in template
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {preset.modules.map((m) => (
              <span key={m} className="text-xs px-2.5 py-1 rounded-md border border-accent/20 bg-accent/5 text-foreground/90">
                {m}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Conditional, template-specific questions */}
      {preset.conditionalFields.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="text-sm font-semibold text-foreground">A few quick details</div>
          {preset.conditionalFields.map((f) => (
            <ConditionalInput key={f} field={f} data={data} update={update} />
          ))}
        </div>
      )}

      {preset.conditionalFields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Everything's pre-configured for this template — continue to the next step.
        </p>
      )}
    </StepShell>
  );
};

export default Step2ProjectDetails;
