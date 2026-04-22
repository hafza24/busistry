import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StepShell from "./StepShell";
import { OnboardingData } from "@/hooks/useOnboarding";

interface Props {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
}

const Step1Business = ({ data, update }: Props) => (
  <StepShell title="Business basics" subtitle="This helps us build your store accurately. Takes less than 3 minutes.">
    <div className="space-y-2">
      <Label htmlFor="business_name">Business name</Label>
      <Input
        id="business_name"
        value={data.business_name ?? ""}
        onChange={(e) => update({ business_name: e.target.value })}
        placeholder="Acme Studio"
        maxLength={100}
      />
    </div>

    <div className="space-y-2">
      <Label>Business type</Label>
      <Select value={data.business_type ?? ""} onValueChange={(v) => update({ business_type: v })}>
        <SelectTrigger><SelectValue placeholder="Select a business type" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ecommerce">eCommerce</SelectItem>
          <SelectItem value="agency">Agency</SelectItem>
          <SelectItem value="portfolio">Portfolio</SelectItem>
          <SelectItem value="saas">SaaS</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label htmlFor="business_description">Short description</Label>
      <Textarea
        id="business_description"
        value={data.business_description ?? ""}
        onChange={(e) => update({ business_description: e.target.value })}
        placeholder="What does your business do? Who do you serve?"
        rows={4}
        maxLength={500}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="country">Country / location</Label>
      <Input
        id="country"
        value={data.country ?? ""}
        onChange={(e) => update({ country: e.target.value })}
        placeholder="Pakistan"
        maxLength={80}
      />
    </div>
  </StepShell>
);

export default Step1Business;
