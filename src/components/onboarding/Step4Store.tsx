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

const Step4Store = ({ data, update }: Props) => (
  <StepShell title="Store requirements" subtitle="The technical bits — kept simple.">
    <div className="space-y-2">
      <Label>Type of store</Label>
      <Select value={data.store_type ?? ""} onValueChange={(v) => update({ store_type: v })}>
        <SelectTrigger><SelectValue placeholder="What are you selling?" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="physical">Physical products</SelectItem>
          <SelectItem value="digital">Digital products</SelectItem>
          <SelectItem value="services">Services</SelectItem>
          <SelectItem value="mixed">Mixed</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label htmlFor="product_count">Approximate number of products</Label>
      <Input
        id="product_count"
        type="number"
        min={0}
        value={data.product_count_estimate ?? ""}
        onChange={(e) => update({ product_count_estimate: e.target.value ? Number(e.target.value) : undefined })}
        placeholder="e.g. 25"
      />
    </div>

    <div className="space-y-2">
      <Label>Payment gateway preference</Label>
      <Select value={data.payment_gateway ?? ""} onValueChange={(v) => update({ payment_gateway: v })}>
        <SelectTrigger><SelectValue placeholder="Pick a gateway" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="stripe">Stripe</SelectItem>
          <SelectItem value="paypal">PayPal</SelectItem>
          <SelectItem value="cod">Cash on Delivery</SelectItem>
          <SelectItem value="jazzcash_easypaisa">JazzCash / Easypaisa</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label htmlFor="shipping">Shipping requirements</Label>
      <Textarea
        id="shipping"
        value={data.shipping_requirements ?? ""}
        onChange={(e) => update({ shipping_requirements: e.target.value })}
        placeholder="Domestic, international, free shipping rules, carriers, etc."
        rows={3}
        maxLength={500}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="features">Special features needed</Label>
      <Textarea
        id="features"
        value={data.special_features ?? ""}
        onChange={(e) => update({ special_features: e.target.value })}
        placeholder="Custom checkout, subscriptions, reviews, multilingual, etc."
        rows={3}
        maxLength={500}
      />
    </div>
  </StepShell>
);

export default Step4Store;
