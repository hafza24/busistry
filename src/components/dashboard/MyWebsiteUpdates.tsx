import { useAuth } from "@/contexts/AuthContext";
import { useMyUpgradeOrders } from "@/hooks/useMarketplace";
import { useStores } from "@/hooks/useStores";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowRight, Package, FolderTree, CalendarClock, Crown, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const TYPE_META: Record<string, { label: string; icon: any }> = {
  plan_change: { label: "Plan upgrade", icon: Crown },
  product_limit: { label: "More products", icon: Package },
  category_limit: { label: "More categories", icon: FolderTree },
  extend_duration: { label: "Extend hosting", icon: CalendarClock },
  content_tweak: { label: "Design / content tweak", icon: Wand2 },
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function MyWebsiteUpdates() {
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useMyUpgradeOrders(user?.id);
  const { data: stores = [] } = useStores();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold flex items-center gap-2"><TrendingUp className="h-6 w-6" /> Website Updates</h2>
        <p className="text-muted-foreground">Request more products, categories, or design tweaks for your live sites.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Your sites</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stores.length === 0 && <p className="text-sm text-muted-foreground">You don't have any stores yet.</p>}
          {stores.map((s: any) => (
            <Card key={s.id} className="border-border/60">
              <CardContent className="p-4 space-y-2">
                <p className="font-semibold">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.subdomain_slug}</p>
                <Button size="sm" className="w-full" onClick={() => navigate(`/store/${s.id}?view=upgrade`)}>
                  Request update <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Update history</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!isLoading && orders.length === 0 && <p className="text-sm text-muted-foreground">No update requests yet.</p>}
          {orders.map((o: any) => {
            const meta = TYPE_META[o.upgrade_type];
            const Icon = meta?.icon ?? TrendingUp;
            return (
              <div key={o.id} className="flex items-start justify-between gap-3 border-b border-border last:border-0 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm flex items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0" />
                    {meta?.label ?? o.upgrade_type} — {o.details?.label || o.details?.target_plan_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.stores?.name} • {format(new Date(o.created_at), "MMM d, yyyy")} • PKR {o.amount.toLocaleString()}
                  </p>
                  {o.details?.notes && <p className="text-xs italic mt-1 border-l-2 border-primary/40 pl-2">"{o.details.notes}"</p>}
                  {o.admin_notes && <p className="text-xs text-muted-foreground mt-1">Admin: {o.admin_notes}</p>}
                </div>
                <Badge variant="outline" className={statusColors[o.status]}>{o.status}</Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
