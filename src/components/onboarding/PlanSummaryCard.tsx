import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Lock, Pencil } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import LockedTile from "./LockedTile";

interface Props {
  planId?: string | null;
}

const PlanSummaryCard = ({ planId }: Props) => {
  const navigate = useNavigate();
  const { data: plan, isLoading } = usePlan(planId);

  if (!planId) {
    return (
      <Card className="border-dashed border-border/70 bg-muted/30">
        <CardContent className="py-4 flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            No plan selected yet — pick one to auto-fill your store limits.
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate("/pricing")}>
            See plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !plan) {
    return (
      <Card className="border-border/60">
        <CardContent className="py-4 text-sm text-muted-foreground">Loading your plan…</CardContent>
      </Card>
    );
  }

  const features: string[] = Array.isArray(plan.features) ? (plan.features as string[]) : [];
  const isFree = plan.type === "free" || plan.price_pkr === 0;

  const tiles = [
    { label: "Pages", value: `${plan.max_pages ?? 5}` },
    { label: "Products", value: `${plan.max_products}` },
    { label: "Categories", value: `${plan.max_categories}` },
    { label: "Team users", value: `${plan.team_users ?? 1}` },
    { label: "Email accounts", value: `${plan.email_accounts ?? 0}` },
    { label: "Domain", value: plan.domain_type === "own" ? "Own domain" : "Subdomain" },
    { label: "Platform", value: (plan.platform_type ?? "wordpress").replace(/^\w/, (c) => c.toUpperCase()) },
    ...(plan.duration_days ? [{ label: "Duration", value: `${plan.duration_days} days` }] : []),
  ];

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background shadow-soft overflow-hidden">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Crown className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{plan.name} Plan</h3>
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">Selected</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isFree ? "Free" : `PKR ${plan.price_pkr.toLocaleString()}`}
                {plan.duration_days ? ` · ${plan.duration_days} days` : ""}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate("/pricing")}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-3 w-3 mr-1.5" /> Change plan
          </Button>
        </div>

        <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
          {tiles.map((t) => (
            <LockedTile key={t.label} label={t.label} value={t.value} />
          ))}
        </div>

        {features.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
            {features.map((f) => (
              <span key={f} className="inline-flex items-center gap-1.5 text-xs text-foreground/80">
                <Check className="h-3.5 w-3.5 text-primary" /> {f}
              </span>
            ))}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1 border-t border-border/40">
          <Lock className="h-3 w-3" />
          Limits above are included in your plan. Need more? Buy upgrades from the marketplace anytime.
        </p>
      </CardContent>
    </Card>
  );
};

export default PlanSummaryCard;
