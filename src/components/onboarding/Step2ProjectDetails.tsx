import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock } from "lucide-react";
import StepShell from "./StepShell";
import { OnboardingData } from "@/hooks/useOnboarding";
import { usePlan } from "@/hooks/usePlan";

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

const Step2ProjectDetails = ({ data, update }: Props) => {
  const d = data.project_details ?? {};
  const type = data.project_type;
  const { data: plan } = usePlan(data.plan_id);
  const planProducts = plan?.max_products;

  // Auto-fill ecommerce num_products from plan when available
  useEffect(() => {
    if (type === "ecommerce" && planProducts != null && d.num_products !== planProducts) {
      setDetail(data, update, "num_products", planProducts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planProducts, type]);

  // ECOMMERCE
  if (type === "ecommerce") {
    return (
      <StepShell title="Tell us about your store" subtitle="A few quick details so we can build it right.">
        <div className="space-y-2">
          <Label>What are you selling?</Label>
          <Select value={d.selling ?? ""} onValueChange={(v) => setDetail(data, update, "selling", v)}>
            <SelectTrigger><SelectValue placeholder="Pick a category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="clothing">Clothing & Fashion</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="beauty">Beauty & Cosmetics</SelectItem>
              <SelectItem value="home">Home & Lifestyle</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="num_products" className="flex items-center gap-1.5">
              Products included
              {planProducts != null && <Lock className="h-3 w-3 text-muted-foreground" />}
            </Label>
            {planProducts != null && (
              <span className="text-[11px] text-muted-foreground">Included in {plan?.name}</span>
            )}
          </div>
          <Input
            id="num_products"
            type="number"
            min={0}
            value={planProducts ?? d.num_products ?? ""}
            onChange={(e) => setDetail(data, update, "num_products", e.target.value ? Number(e.target.value) : undefined)}
            placeholder="e.g. 25"
            readOnly={planProducts != null}
            className={planProducts != null ? "bg-muted/50 cursor-not-allowed" : ""}
          />
          {planProducts != null && (
            <p className="text-xs text-muted-foreground">
              Need more? Buy extra product capacity from the marketplace anytime.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Need payment gateway setup?</Label>
          <YesNo value={d.payment_gateway_setup} onChange={(v) => setDetail(data, update, "payment_gateway_setup", v)} />
        </div>

        <div className="space-y-2">
          <Label>Do you have product images ready?</Label>
          <YesNo value={d.has_images} onChange={(v) => setDetail(data, update, "has_images", v)} />
          <p className="text-xs text-muted-foreground">You'll be able to send images later — we'll guide you.</p>
        </div>
      </StepShell>
    );
  }

  // AGENCY
  if (type === "agency") {
    return (
      <StepShell title="Tell us about your agency" subtitle="Help us shape the right structure.">
        <div className="space-y-2">
          <Label htmlFor="services_offered">Services offered</Label>
          <Textarea
            id="services_offered"
            value={d.services_offered ?? ""}
            onChange={(e) => setDetail(data, update, "services_offered", e.target.value)}
            placeholder="e.g. Marketing, Design, Development"
            rows={3}
            maxLength={400}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="num_pages">Number of pages needed</Label>
          <Input
            id="num_pages"
            type="number"
            min={1}
            value={d.num_pages ?? ""}
            onChange={(e) => setDetail(data, update, "num_pages", e.target.value ? Number(e.target.value) : undefined)}
            placeholder="e.g. 5"
          />
        </div>

        <div className="space-y-2">
          <Label>Portfolio section required?</Label>
          <YesNo value={d.portfolio} onChange={(v) => setDetail(data, update, "portfolio", v)} />
        </div>
      </StepShell>
    );
  }

  // BOOKING
  if (type === "booking") {
    return (
      <StepShell title="Booking system details" subtitle="What kind of bookings do you take?">
        <div className="space-y-2">
          <Label>Booking type</Label>
          <Select value={d.booking_type ?? ""} onValueChange={(v) => setDetail(data, update, "booking_type", v)}>
            <SelectTrigger><SelectValue placeholder="Pick a type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="appointments">Appointments</SelectItem>
              <SelectItem value="hotel">Hotel / Stays</SelectItem>
              <SelectItem value="events">Events</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Time slot system needed?</Label>
          <YesNo value={d.time_slots} onChange={(v) => setDetail(data, update, "time_slots", v)} />
        </div>

        <div className="space-y-2">
          <Label>Payment required at booking?</Label>
          <YesNo value={d.booking_payment} onChange={(v) => setDetail(data, update, "booking_payment", v)} />
        </div>
      </StepShell>
    );
  }

  // BUSINESS
  if (type === "business") {
    const pages = (d.pages ?? []) as string[];
    const togglePage = (p: string) => {
      setDetail(data, update, "pages", pages.includes(p) ? pages.filter((x) => x !== p) : [...pages, p]);
    };
    return (
      <StepShell title="Business website details" subtitle="A few details about your company.">
        <div className="space-y-2">
          <Label htmlFor="business_subtype">Business type</Label>
          <Input
            id="business_subtype"
            value={d.business_subtype ?? ""}
            onChange={(e) => setDetail(data, update, "business_subtype", e.target.value)}
            placeholder="e.g. Law firm, Clinic, Restaurant"
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label>Pages needed</Label>
          <div className="grid grid-cols-2 gap-2">
            {["Home", "About", "Services", "Contact", "Blog", "Gallery"].map((p) => (
              <label key={p} className="flex items-center gap-2 p-2.5 rounded-lg border border-border cursor-pointer hover:bg-secondary/50">
                <Checkbox checked={pages.includes(p)} onCheckedChange={() => togglePage(p)} />
                <span className="text-sm">{p}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Preferred contact method</Label>
          <RadioGroup
            value={d.contact_method ?? ""}
            onValueChange={(v) => setDetail(data, update, "contact_method", v)}
            className="flex gap-6"
          >
            {["Form", "WhatsApp", "Both"].map((m) => (
              <label key={m} className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value={m.toLowerCase()} /> <span className="text-sm">{m}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
      </StepShell>
    );
  }

  // MANAGEMENT
  if (type === "management") {
    return (
      <StepShell title="Management system details" subtitle="So we can scope it correctly.">
        <div className="space-y-2">
          <Label>System type</Label>
          <Select value={d.system_type ?? ""} onValueChange={(v) => setDetail(data, update, "system_type", v)}>
            <SelectTrigger><SelectValue placeholder="Pick a system" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="inventory">Inventory</SelectItem>
              <SelectItem value="crm">CRM</SelectItem>
              <SelectItem value="school">School / LMS</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="user_roles_text">User roles required</Label>
          <Input
            id="user_roles_text"
            value={d.user_roles_text ?? ""}
            onChange={(e) => setDetail(data, update, "user_roles_text", e.target.value)}
            placeholder="e.g. Admin, Manager, Staff"
            maxLength={200}
          />
        </div>

        <div className="space-y-2">
          <Label>Dashboard complexity</Label>
          <RadioGroup
            value={d.complexity ?? ""}
            onValueChange={(v) => setDetail(data, update, "complexity", v)}
            className="flex gap-6"
          >
            {["Basic", "Advanced"].map((m) => (
              <label key={m} className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value={m.toLowerCase()} /> <span className="text-sm">{m}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
      </StepShell>
    );
  }

  return (
    <StepShell title="Project details" subtitle="Pick a project type in the previous step to continue.">
      <p className="text-sm text-muted-foreground">No project type selected yet.</p>
    </StepShell>
  );
};

export default Step2ProjectDetails;
