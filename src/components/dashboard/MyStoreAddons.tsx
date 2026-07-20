import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useStores } from "@/hooks/useStores";
import { useWebsiteProducts, useIntegrations } from "@/hooks/useMarketplace";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Globe, ArrowRight, Clock, Wrench, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CardGridSkeleton } from "@/components/ui/loading-skeletons";
import { cn } from "@/lib/utils";

type TrackerStatus = "pending" | "activating" | "activated" | "failed";

const statusMeta: Record<TrackerStatus, { label: string; badge: string; icon: any }> = {
  pending: {
    label: "Pending verification",
    badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  activating: {
    label: "Installing",
    badge: "bg-primary/10 text-primary border-primary/30",
    icon: Wrench,
  },
  activated: {
    label: "Activated",
    badge: "bg-primary/10 text-primary border-primary/30",
    icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    badge: "bg-destructive/10 text-destructive border-destructive/20",
    icon: XCircle,
  },
};

function mapStatus(raw: string | null | undefined): TrackerStatus {
  switch (raw) {
    case "active":
    case "installed":
    case "activated":
    case "completed":
      return "activated";
    case "approved":
    case "in_progress":
    case "installing":
      return "activating";
    case "rejected":
    case "failed":
    case "cancelled":
    case "canceled":
      return "failed";
    default:
      return "pending";
  }
}

const trackerSteps: { key: Exclude<TrackerStatus, "failed">; label: string; icon: any }[] = [
  { key: "pending", label: "Pending verification", icon: Clock },
  { key: "activating", label: "Installing", icon: Wrench },
  { key: "activated", label: "Activated", icon: CheckCircle2 },
];

function StatusTracker({ status }: { status: TrackerStatus }) {
  if (status === "failed") {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
        <XCircle className="h-4 w-4 shrink-0" />
        <span className="font-medium">Order failed.</span>
        <span className="text-destructive/80">Check the note below or contact support.</span>
      </div>
    );
  }
  const activeIdx = trackerSteps.findIndex((s) => s.key === status);
  return (
    <div className="mt-3 flex items-center gap-1.5" role="list" aria-label="Add-on order status">
      {trackerSteps.map((step, i) => {
        const reached = i <= activeIdx;
        const current = i === activeIdx;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center gap-1.5 flex-1 min-w-0" role="listitem">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium transition-colors min-w-0",
                reached
                  ? current
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-primary/5 border-primary/30 text-primary"
                  : "bg-muted/40 border-border text-muted-foreground"
              )}
              aria-current={current ? "step" : undefined}
            >
              <Icon className={cn("h-3 w-3 shrink-0", current && "animate-pulse")} />
              <span className="truncate">{step.label}</span>
            </div>
            {i < trackerSteps.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1 min-w-[8px]",
                  i < activeIdx ? "bg-primary/30" : "bg-border"
                )}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function useAllUserAddons(storeIds: string[]) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user_store_addons", user?.id, storeIds.join(",")],
    enabled: !!user && storeIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_addons")
        .select("*")
        .in("store_id", storeIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export default function MyStoreAddons() {
  const { data: stores = [], isLoading: storesLoading, isError: storesError, refetch: refetchStores } = useStores();
  const storeIds = useMemo(() => stores.map((s: any) => s.id), [stores]);
  const { data: addons = [], isLoading: addonsLoading, isError: addonsError, refetch: refetchAddons } = useAllUserAddons(storeIds);
  const { data: products = [] } = useWebsiteProducts();
  const { data: integrations = [] } = useIntegrations();

  const grouped = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const a of addons as any[]) {
      const arr = map.get(a.store_id) ?? [];
      arr.push(a);
      map.set(a.store_id, arr);
    }
    return map;
  }, [addons]);

  const lookup = (a: any) => {
    const list = a.item_type === "product" ? products : integrations;
    return (list as any[]).find((x) => x.id === a.item_id);
  };

  const loading = storesLoading || addonsLoading;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold">My Add-ons</h2>
          <p className="text-sm text-muted-foreground mt-1">Add-ons purchased for each of your websites.</p>
        </div>
        <CardGridSkeleton count={3} columns={1} />
      </div>
    );
  }

  if (storesError) {
    return <ErrorState message="We couldn't load your stores." onRetry={() => refetchStores()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold">My Add-ons</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add-ons purchased for each of your websites.
          </p>
        </div>
        <Button asChild variant="default" size="sm" className="rounded-full">
          <Link to="/marketplace">
            Browse Marketplace <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {addonsError && (
        <ErrorState message="We couldn't load your add-ons." onRetry={() => refetchAddons()} />
      )}

      {stores.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="No websites yet"
          description="Once you order a website, any add-ons you purchase will appear here grouped by site."
        />
      ) : addons.length === 0 && !addonsError ? (
        <EmptyState
          icon={Sparkles}
          title="No add-ons installed yet"
          description="Visit the marketplace to add products, integrations, and extra features to your websites."
        />
      ) : (
        <div className="space-y-6">
          {stores.map((store: any) => {
            const storeAddons = grouped.get(store.id) ?? [];
            return (
              <section
                key={store.id}
                className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden"
              >
                <header className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-border/60 bg-muted/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{store.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {store.plans?.name ?? "Plan"} · {storeAddons.length} add-on{storeAddons.length === 1 ? "" : "s"}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize shrink-0">{store.status ?? "active"}</Badge>
                </header>

                <div className="p-4 sm:p-5">
                  {storeAddons.length === 0 ? (
                    <div className="text-sm text-muted-foreground italic">
                      No add-ons on this website yet.
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {storeAddons.map((a: any) => {
                        const item = lookup(a);
                        const tracker = mapStatus(a.status);
                        const meta = statusMeta[tracker];
                        const StatusIcon = meta.icon;
                        return (
                          <Card key={a.id} className="border-border/60">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-semibold truncate">{item?.name ?? "Add-on"}</p>
                                    <Badge variant="outline" className="capitalize text-xs">{a.item_type}</Badge>
                                    <Badge variant="outline" className={cn("text-xs gap-1", meta.badge)}>
                                      <StatusIcon className="h-3 w-3" />
                                      {meta.label}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Ordered {format(new Date(a.created_at), "MMM d, yyyy")}
                                    {a.price_snapshot_pkr != null && (
                                      <> · PKR {Number(a.price_snapshot_pkr).toLocaleString()}</>
                                    )}
                                  </p>
                                  {a.admin_notes && (
                                    <p className="text-xs mt-1 text-muted-foreground italic">"{a.admin_notes}"</p>
                                  )}
                                </div>
                              </div>
                              <StatusTracker status={tracker} />
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
