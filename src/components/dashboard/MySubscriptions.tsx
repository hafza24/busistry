import { useEffect, useState } from "react";
import { useSubscriptions, useToggleAutoRenew, SubscriptionRow } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import { Repeat, CalendarClock, AlertTriangle, CheckCircle2, Package, Sparkles, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";

type BreakdownItem = { label: string; amount: number; kind: "plan" | "addon" };

const pkrFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});
const formatPKR = (n: number) => pkrFormatter.format(Number(n) || 0);

function useBreakdown(s: SubscriptionRow) {
  const [items, setItems] = useState<BreakdownItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const base: BreakdownItem[] = [];

      if (s.source_type === "website_order") {
        const { data: order } = await supabase
          .from("website_orders")
          .select("onboarding_submission_id, plans(name, price_pkr)")
          .eq("id", s.source_id)
          .maybeSingle();

        if (order?.plans) {
          base.push({ label: `${(order.plans as any).name} plan`, amount: Number((order.plans as any).price_pkr) || 0, kind: "plan" });
        }
        const submissionId = (order as any)?.onboarding_submission_id;
        if (submissionId) {
          const { data: addons } = await supabase
            .from("onboarding_addons")
            .select("quantity, price_snapshot_pkr, pricing_type_snapshot, addons(name)")
            .eq("submission_id", submissionId);
          (addons || []).forEach((a: any) => {
            const qty = a.pricing_type_snapshot === "per_unit" ? a.quantity : 1;
            base.push({
              label: `${a.addons?.name || "Add-on"}${qty > 1 ? ` × ${qty}` : ""}`,
              amount: (Number(a.price_snapshot_pkr) || 0) * qty,
              kind: "addon",
            });
          });
        }
      } else if (s.source_type === "store_addon" || s.source_type === "addon") {
        const { data: sa } = await supabase
          .from("store_addons")
          .select("price_snapshot_pkr, pricing_type_snapshot, config, addons:item_id(name)")
          .eq("id", s.source_id)
          .maybeSingle();
        if (sa) {
          base.push({
            label: (sa as any).addons?.name || s.label,
            amount: Number((sa as any).price_snapshot_pkr) || Number(s.amount_pkr) || 0,
            kind: "addon",
          });
        }
      } else if (s.source_type === "upgrade_order") {
        const { data: up } = await supabase
          .from("upgrade_orders")
          .select("upgrade_type, amount")
          .eq("id", s.source_id)
          .maybeSingle();
        if (up) {
          base.push({ label: `${(up as any).upgrade_type} upgrade`, amount: Number((up as any).amount) || 0, kind: "plan" });
        }
      }

      // Fallback: if we found nothing, show the subscription itself as one line.
      if (base.length === 0) {
        base.push({ label: s.label, amount: Number(s.amount_pkr) || 0, kind: "plan" });
      }

      if (!cancelled) {
        setItems(base);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [s.id, s.source_id, s.source_type, s.label, s.amount_pkr]);

  return { items, loading };
}

function BreakdownList({ s }: { s: SubscriptionRow }) {
  const { items, loading } = useBreakdown(s);
  const subtotal = (items || []).reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 divide-y divide-border/60">
      <div className="px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground font-medium">
        Renewal breakdown
      </div>
      {loading || !items ? (
        <div className="px-3 py-3 text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading items…
        </div>
      ) : (
        <>
          {items.map((it, idx) => (
            <div key={idx} className="px-3 py-2 flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                {it.kind === "plan" ? (
                  <Package className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                )}
                <span className="truncate">{it.label}</span>
              </div>
              <span className="font-medium tabular-nums flex-shrink-0">
                {formatPKR(it.amount)}
              </span>
            </div>
          ))}
          <div className="px-3 py-2 flex items-center justify-between gap-3 text-sm bg-muted/40">
            <span className="font-semibold">Total / {s.cycle_days} days</span>
            <span className="font-bold tabular-nums">{formatPKR(subtotal)}</span>
          </div>
        </>
      )}
    </div>
  );
}

export default function MySubscriptions() {
  const { data: subs = [], isLoading } = useSubscriptions("own");
  const toggle = useToggleAutoRenew();

  if (isLoading) return <div className="text-muted-foreground">Loading…</div>;
  if (!subs.length)
    return <EmptyState icon={Repeat} title="No active subscriptions" description="Paid plans, add-ons and upgrades will appear here." />;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <Repeat className="h-6 w-6" /> Recurring Subscriptions
        </h2>
        <p className="text-muted-foreground text-sm">
          Manage auto-renewal for your plans, add-ons and upgrades. We'll alert you 7, 3 and 1 day before each renews.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {subs.map((s) => {
          const daysLeft = differenceInDays(new Date(s.current_period_end), new Date());
          const urgent = daysLeft <= 3;
          const expired = daysLeft < 0 || s.status === "past_due" || s.status === "expired";
          return (
            <Card key={s.id} className={expired ? "border-destructive/50" : urgent ? "border-amber-500/50" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {expired ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    {s.label}
                  </CardTitle>
                  <Badge variant={expired ? "destructive" : urgent ? "secondary" : "outline"}>
                    {expired ? "Renewal due" : `${daysLeft}d left`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarClock className="h-4 w-4" />
                    Renews {format(new Date(s.current_period_end), "MMM d, yyyy")}
                  </div>
                </div>

                <BreakdownList s={s} />

                <div className={`rounded-lg border p-3 flex items-center justify-between gap-3 ${expired || urgent ? "border-primary/40 bg-primary/5" : "border-border bg-muted/30"}`}>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Renewal price</div>
                    <div className="text-lg font-bold text-foreground leading-tight">
                      PKR {Number(s.amount_pkr).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">every {s.cycle_days} days</div>
                  </div>
                  {(expired || urgent) && (
                    <Badge variant={expired ? "destructive" : "secondary"} className="whitespace-nowrap">
                      {expired ? "Renew now" : "Renew soon"}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-sm">
                    <div className="font-medium">Auto-renew reminders</div>
                    <div className="text-xs text-muted-foreground">Get notified before this expires</div>
                  </div>
                  <Switch
                    checked={s.auto_renew}
                    onCheckedChange={(v) =>
                      toggle.mutate(
                        { id: s.id, auto_renew: v },
                        {
                          onSuccess: () => toast.success(v ? "Auto-reminders on" : "Auto-reminders off"),
                          onError: (e: any) => toast.error("Update failed", { description: e.message }),
                        }
                      )
                    }
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
