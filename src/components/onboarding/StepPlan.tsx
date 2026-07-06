import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import StepShell from "./StepShell";
import { OnboardingData } from "@/hooks/useOnboarding";

interface Props {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
}

const StepPlan = ({ data, update }: Props) => {
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["onboarding_plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("price_pkr");
      if (error) throw error;
      return data;
    },
  });

  return (
    <StepShell title="Choose your plan" subtitle="Includes hosting, limits, and support. The Free plan is fine to start — you can upgrade anytime.">
      {isLoading ? (
        <div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {plans.map((p: any) => {
            const selected = data.plan_id === p.id;
            const isFree = p.type === "free" || p.price_pkr === 0;
            const features: string[] = Array.isArray(p.features) ? p.features : [];
            return (
              <Card
                key={p.id}
                className={`cursor-pointer transition-all ${selected ? "border-primary ring-2 ring-primary/40" : "border-border/60 hover:border-primary/40"}`}
                onClick={() => update({ plan_id: p.id })}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{p.name}</p>
                        {selected && (
                          <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-lg font-bold text-primary mt-1">
                        {isFree ? "Free" : `PKR ${p.price_pkr.toLocaleString()}`}
                      </p>
                      {p.duration_days && !isFree && (
                        <p className="text-[11px] text-muted-foreground">{p.duration_days} days</p>
                      )}
                    </div>
                    {isFree && <Badge variant="secondary">Starter</Badge>}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-muted-foreground">
                    <span>{p.max_products} products</span>
                    <span>{p.max_categories} categories</span>
                    <span>{p.max_pages ?? 5} pages</span>
                    <span>{p.team_users ?? 1} team users</span>
                  </div>
                  {features.length > 0 && (
                    <ul className="space-y-1 pt-1 border-t border-border/40">
                      {features.slice(0, 4).map((f) => (
                        <li key={f} className="text-xs text-foreground/80 flex items-start gap-1.5">
                          <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </StepShell>
  );
};

export default StepPlan;
