import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StepShell from "./StepShell";
import { OnboardingData } from "@/hooks/useOnboarding";
import { step5ContactSchema } from "@/lib/validation";
import { useMemo } from "react";

interface Props {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
}

const Step5Contact = ({ data, update }: Props) => {
  const errors = useMemo(() => {
    const parsed = step5ContactSchema.safeParse({
      full_name: data.full_name ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      whatsapp: data.whatsapp ?? "",
      business_address: data.business_address ?? "",
    });
    if (parsed.success) return {} as Record<string, string>;
    const map: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const k = i.path[0] as string;
      // Only show errors once a user has typed something for that field
      const value = (data as any)[k];
      if (value !== undefined && value !== "") map[k] = map[k] ?? i.message;
    }
    return map;
  }, [data]);

  const fieldErr = (key: string, id: string) =>
    errors[key] ? (
      <p id={`${id}-err`} className="text-sm text-destructive">{errors[key]}</p>
    ) : null;

  return (
  <StepShell title="How can we reach you?" subtitle="We'll use this to share progress and your finished store.">
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input
          id="full_name"
          value={data.full_name ?? ""}
          onChange={(e) => update({ full_name: e.target.value })}
          placeholder="Jane Doe"
          maxLength={100}
          aria-invalid={!!errors.full_name}
          aria-describedby={errors.full_name ? "full_name-err" : undefined}
        />
        {fieldErr("full_name", "full_name")}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={data.email ?? ""}
          onChange={(e) => update({ email: e.target.value })}
          placeholder="you@example.com"
          maxLength={255}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-err" : undefined}
        />
        {fieldErr("email", "email")}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={data.phone ?? ""}
          onChange={(e) => update({ phone: e.target.value })}
          placeholder="+92 300 0000000"
          maxLength={30}
          inputMode="tel"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "phone-err" : undefined}
        />
        {fieldErr("phone", "phone")}
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatsapp">WhatsApp (optional)</Label>
        <Input
          id="whatsapp"
          value={data.whatsapp ?? ""}
          onChange={(e) => update({ whatsapp: e.target.value })}
          placeholder="+92 300 0000000"
          maxLength={30}
          inputMode="tel"
          aria-invalid={!!errors.whatsapp}
          aria-describedby={errors.whatsapp ? "whatsapp-err" : undefined}
        />
        {fieldErr("whatsapp", "whatsapp")}
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="business_address">Business address (optional)</Label>
      <Textarea
        id="business_address"
        value={data.business_address ?? ""}
        onChange={(e) => update({ business_address: e.target.value })}
        placeholder="Street, city, postal code, country"
        rows={3}
        maxLength={300}
      />
    </div>
  </StepShell>
  );
};

export default Step5Contact;
