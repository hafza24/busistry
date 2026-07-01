import { useSubscriptions, useToggleAutoRenew } from "@/hooks/useNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import { Repeat, CalendarClock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";

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
