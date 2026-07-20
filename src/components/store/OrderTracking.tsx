import { useMemo } from "react";
import { useStoreAddons, useWebsiteProducts, useIntegrations } from "@/hooks/useMarketplace";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Clock, Wrench, CheckCircle2, XCircle, PackageCheck, Sparkles } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CardGridSkeleton } from "@/components/ui/loading-skeletons";
import { cn } from "@/lib/utils";

type Bucket = "pending" | "approved" | "active" | "failed";

const bucketMeta: Record<Bucket, { label: string; badge: string; icon: any; description: string }> = {
  pending: {
    label: "Pending",
    badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
    description: "Awaiting review by our team.",
  },
  approved: {
    label: "Approved · Installing",
    badge: "bg-primary/10 text-primary border-primary/30",
    icon: Wrench,
    description: "Our team is installing this on your website.",
  },
  active: {
    label: "Active",
    badge: "bg-primary/10 text-primary border-primary/30",
    icon: CheckCircle2,
    description: "Installed and live on your website.",
  },
  failed: {
    label: "Failed",
    badge: "bg-destructive/10 text-destructive border-destructive/20",
    icon: XCircle,
    description: "Something went wrong — see the note.",
  },
};

function toBucket(status: string | null | undefined): Bucket {
  switch (status) {
    case "active":
    case "installed":
    case "completed":
    case "delivered":
      return "active";
    case "approved":
    case "in_progress":
    case "installing":
      return "approved";
    case "rejected":
    case "failed":
    case "cancelled":
    case "canceled":
      return "failed";
    default:
      return "pending";
  }
}

const timelineSteps: { key: Exclude<Bucket, "failed">; label: string; icon: any; hint: string }[] = [
  { key: "pending", label: "Order placed", icon: Clock, hint: "We're reviewing your order." },
  { key: "approved", label: "Approved · Installing", icon: Wrench, hint: "Install typically takes 24–48h." },
  { key: "active", label: "Active on your site", icon: CheckCircle2, hint: "You'll be notified once it goes live." },
];

function InstallTimeline({ bucket, createdAt, updatedAt }: { bucket: Bucket; createdAt: string; updatedAt: string }) {
  if (bucket === "failed") {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
        <XCircle className="h-4 w-4 shrink-0" />
        <span className="font-medium">Order failed.</span>
        <span className="text-destructive/80">Please review the note below or contact support.</span>
      </div>
    );
  }
  const activeIdx = timelineSteps.findIndex((s) => s.key === bucket);
  return (
    <ol className="mt-4 space-y-3" aria-label="Install timeline">
      {timelineSteps.map((step, i) => {
        const reached = i <= activeIdx;
        const current = i === activeIdx;
        const Icon = step.icon;
        const ts = i === 0 ? createdAt : current ? updatedAt : null;
        return (
          <li key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border transition-colors",
                  reached
                    ? current
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-primary text-white border-primary"
                    : "bg-muted text-muted-foreground border-border"
                )}
                aria-current={current ? "step" : undefined}
              >
                <Icon className={cn("h-3.5 w-3.5", current && "animate-pulse")} />
              </div>
              {i < timelineSteps.length - 1 && (
                <div className={cn("w-px flex-1 mt-1 min-h-6", i < activeIdx ? "bg-primary" : "bg-border")} aria-hidden />
              )}
            </div>
            <div className="pb-4 min-w-0">
              <p className={cn("text-sm font-medium", reached ? "text-foreground" : "text-muted-foreground")}>
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {ts ? `${format(new Date(ts), "MMM d, yyyy · h:mm a")} · ${formatDistanceToNow(new Date(ts), { addSuffix: true })}` : step.hint}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function OrderTracking({ storeId }: { storeId: string }) {
  const { data: addons = [], isLoading, isError, refetch } = useStoreAddons(storeId);
  const { data: products = [] } = useWebsiteProducts();
  const { data: integrations = [] } = useIntegrations();

  const lookup = (a: any) => {
    const list = a.item_type === "product" ? products : integrations;
    return (list as any[]).find((x) => x.id === a.item_id);
  };

  const buckets = useMemo(() => {
    const groups: Record<Bucket, any[]> = { pending: [], approved: [], active: [], failed: [] };
    for (const a of addons as any[]) groups[toBucket(a.status)].push(a);
    return groups;
  }, [addons]);

  const counts = {
    all: addons.length,
    pending: buckets.pending.length,
    approved: buckets.approved.length,
    active: buckets.active.length,
    failed: buckets.failed.length,
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Order tracking</h2>
          <p className="text-sm text-muted-foreground">Track your add-on orders from placement to install.</p>
        </div>
        <CardGridSkeleton count={3} columns={1} />
      </div>
    );
  }

  const renderList = (list: any[]) => {
    if (list.length === 0) {
      return (
        <EmptyState
          icon={Sparkles}
          title="Nothing here yet"
          description="Orders in this stage will show up here."
        />
      );
    }
    return (
      <div className="grid gap-3">
        {list.map((a: any) => {
          const item = lookup(a);
          const bucket = toBucket(a.status);
          const meta = bucketMeta[bucket];
          const Icon = meta.icon;
          return (
            <Card key={a.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold truncate">{item?.name ?? "Add-on"}</p>
                      <Badge variant="outline" className="capitalize text-xs">{a.item_type}</Badge>
                      <Badge variant="outline" className={cn("gap-1", meta.badge)}>
                        <Icon className="h-3 w-3" />
                        {meta.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ordered {format(new Date(a.created_at), "MMM d, yyyy")} · PKR {Number(a.price_snapshot_pkr ?? 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 italic">{meta.description}</p>
                    {a.admin_notes && (
                      <p className="text-xs mt-2 rounded-md bg-muted px-2 py-1 text-foreground/80">
                        <span className="font-medium">Note:</span> {a.admin_notes}
                      </p>
                    )}
                  </div>
                </div>
                <InstallTimeline bucket={bucket} createdAt={a.created_at} updatedAt={a.updated_at ?? a.created_at} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Order tracking</h2>
        <p className="text-sm text-muted-foreground">Follow every add-on order through the install pipeline.</p>
      </div>

      {isError ? (
        <ErrorState message="We couldn't load your orders." onRetry={() => refetch()} />
      ) : counts.all === 0 ? (
        <EmptyState
          icon={PackageCheck}
          title="No orders yet"
          description="Browse the marketplace and place your first add-on order to see tracking here."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["pending", "approved", "active", "failed"] as Bucket[]).map((b) => {
              const meta = bucketMeta[b];
              const Icon = meta.icon;
              return (
                <Card key={b}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Icon className="h-3.5 w-3.5" />
                      {meta.label}
                    </div>
                    <p className="mt-1 text-2xl font-bold font-display">{counts[b]}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
              <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
              {counts.failed > 0 && <TabsTrigger value="failed">Failed ({counts.failed})</TabsTrigger>}
            </TabsList>
            <TabsContent value="all">{renderList(addons as any[])}</TabsContent>
            <TabsContent value="pending">{renderList(buckets.pending)}</TabsContent>
            <TabsContent value="approved">{renderList(buckets.approved)}</TabsContent>
            <TabsContent value="active">{renderList(buckets.active)}</TabsContent>
            <TabsContent value="failed">{renderList(buckets.failed)}</TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
