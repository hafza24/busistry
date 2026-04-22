import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StepShell from "./StepShell";
import { OnboardingData } from "@/hooks/useOnboarding";

interface Props {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
}

const Step5Contact = ({ data, update }: Props) => (
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
        />
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
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={data.phone ?? ""}
          onChange={(e) => update({ phone: e.target.value })}
          placeholder="+92 300 0000000"
          maxLength={30}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatsapp">WhatsApp (optional)</Label>
        <Input
          id="whatsapp"
          value={data.whatsapp ?? ""}
          onChange={(e) => update({ whatsapp: e.target.value })}
          placeholder="+92 300 0000000"
          maxLength={30}
        />
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

export default Step5Contact;
