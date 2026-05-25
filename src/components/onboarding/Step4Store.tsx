import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StepShell from "./StepShell";
import { OnboardingData } from "@/hooks/useOnboarding";
import { usePlan } from "@/hooks/usePlan";
import LockedTile from "./LockedTile";

interface Props {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
}

const Step4Store = ({ data, update }: Props) => {
  const { data: plan } = usePlan(data.plan_id);
  const planProducts = plan?.max_products;

  // Keep store-level product count in sync with the plan + default payment to COD
  useEffect(() => {
    const patch: Partial<OnboardingData> = {};
    if (planProducts != null && data.product_count_estimate !== planProducts) {
      patch.product_count_estimate = planProducts;
    }
    if (!data.payment_gateway) {
      patch.payment_gateway = data.project_details?.payment_gateway ?? "cod";
    }
    if (Object.keys(patch).length) update(patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planProducts]);

  return (
    <StepShell title="Store requirements" subtitle="Just the bits we can't pre-configure.">
      {/* Locked plan summary tiles */}
      {plan && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <LockedTile label="Products" value={`${plan.max_products}`} hint={`${plan.name} plan`} />
          <LockedTile label="Categories" value={`${plan.max_categories}`} />
          <LockedTile label="Pages" value={`${plan.max_pages ?? 5}`} />
          <LockedTile
            label="Platform"
            value={(plan.platform_type ?? "wordpress").replace(/^\w/, (c) => c.toUpperCase())}
          />
        </div>
      )}

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
        <Label htmlFor="features">Anything special?</Label>
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
};

export default Step4Store;
