import { useEffect } from "react";
import StepShell from "./StepShell";
import { OnboardingData } from "@/hooks/useOnboarding";
import { ShoppingBag, Briefcase, Calendar, Globe, LayoutDashboard, Lock } from "lucide-react";
import { useTemplate } from "@/hooks/useTemplate";
import { CATEGORY_TO_PROJECT_TYPE } from "@/lib/templatePresets";

interface Props {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
}

export const PROJECT_TYPES = [
  { value: "ecommerce", label: "eCommerce Store", desc: "Sell physical or digital products online.", icon: ShoppingBag },
  { value: "agency", label: "Agency Website", desc: "Showcase services and win new clients.", icon: Briefcase },
  { value: "booking", label: "Booking System", desc: "Appointments, hotels, or events.", icon: Calendar },
  { value: "business", label: "Business Website", desc: "Company site with services and contact.", icon: Globe },
  { value: "management", label: "Management System", desc: "CRM, inventory, school, etc.", icon: LayoutDashboard },
];

const Step1ProjectType = ({ data, update }: Props) => {
  const select = (value: string) => {
    // Reset project_details when type changes
    if (data.project_type !== value) {
      update({ project_type: value, project_details: {} });
    } else {
      update({ project_type: value });
    }
  };

  return (
    <StepShell title="What are you building?" subtitle="Pick the option closest to your project — we'll tailor the next step.">
      <div className="grid sm:grid-cols-2 gap-3">
        {PROJECT_TYPES.map((t) => {
          const selected = data.project_type === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => select(t.value)}
              className={`text-left p-5 rounded-xl border-2 transition-all hover:shadow-md ${
                selected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 ${
                selected ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
              }`}>
                <t.icon className="h-5 w-5" />
              </div>
              <div className="font-semibold text-foreground">{t.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{t.desc}</div>
            </button>
          );
        })}
      </div>
    </StepShell>
  );
};

export default Step1ProjectType;
