import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  Layers,
  Package,
  Plus,
  CheckCircle2,
  Loader2,
  CircleDashed,
  XCircle,
  Copy,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CardGridSkeleton } from "@/components/ui/loading-skeletons";
import { OrderStatusTimeline } from "@/components/orders/OrderStatusTimeline";
import { OrderDetailsSheet } from "@/components/orders/OrderDetailsSheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type StatusKey = "pending" | "in_progress" | "completed" | "cancelled";

const statusConfig: Record<
  StatusKey,
  {
    label: string;
    badge: string;
    dot: string;
    accent: string;
    icon: typeof Clock;
  }
> = {
  pending: {
    label: "Pending",
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    dot: "bg-amber-500",
    accent: "from-amber-500/60 to-amber-500/0",
    icon: CircleDashed,
  },
  in_progress: {
    label: "In Progress",
    badge: "bg-primary/10 text-primary border-primary/20",
    dot: "bg-primary",
    accent: "from-primary/60 to-primary/0",
    icon: Loader2,
  },
  completed: {
    label: "Completed",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-500",
    accent: "from-emerald-500/60 to-emerald-500/0",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-destructive/10 text-destructive border-destructive/20",
    dot: "bg-destructive",
    accent: "from-destructive/60 to-destructive/0",
    icon: XCircle,
  },
};

interface MyOrdersProps {
  onNewOrder: () => void;
}

const DecryptedCredentials = ({ orderId }: { orderId: string; hasUrl: boolean }) => {
  const [creds, setCreds] = useState<{
    wordpress_url: string;
    wordpress_username: string;
    wordpress_password: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchCreds = async () => {
    if (creds) {
      setVisible(!visible);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-credentials", {
        body: { action: "decrypt", order_id: orderId },
      });
      if (!error && data && !data.error) {
        setCreds(data);
        setVisible(true);
      } else {
        toast.error("Couldn't load credentials", { description: (error as Error)?.message || data?.error });
      }
    } catch (e) {
      toast.error("Couldn't load credentials", { description: (e as Error).message });
    }
    setLoading(false);
  };

  const copy = (value: string, label: string) => {
    navigator.clipboard.writeText(value).then(
      () => toast.success(`${label} copied`),
      () => toast.error(`Couldn't copy ${label.toLowerCase()}`),
    );
  };

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary/15 text-primary grid place-items-center">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">Your website is ready</p>
            <p className="text-xs text-muted-foreground">Sign in to your admin panel below.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCreds} disabled={loading}>
          {loading ? (
            <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Loading</>
          ) : visible ? (
            <><EyeOff className="h-3.5 w-3.5 mr-1.5" /> Hide credentials</>
          ) : (
            <><Eye className="h-3.5 w-3.5 mr-1.5" /> Show credentials</>
          )}
        </Button>
      </div>

      {visible && creds && (
        <div className="grid gap-2 text-sm">
          {creds.wordpress_url && (
            <CredentialRow label="URL" onCopy={() => copy(creds.wordpress_url, "URL")}>
              <a
                href={creds.wordpress_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1 truncate"
              >
                {creds.wordpress_url}
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
            </CredentialRow>
          )}
          {creds.wordpress_username && (
            <CredentialRow label="Username" onCopy={() => copy(creds.wordpress_username, "Username")}>
              <span className="font-mono text-xs">{creds.wordpress_username}</span>
            </CredentialRow>
          )}
          {creds.wordpress_password && (
            <CredentialRow
              label="Password"
              onCopy={() => copy(creds.wordpress_password, "Password")}
              extra={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              }
            >
              <span className="font-mono text-xs">
                {showPassword ? creds.wordpress_password : "••••••••••••"}
              </span>
            </CredentialRow>
          )}
        </div>
      )}
    </div>
  );
};

const CredentialRow = ({
  label,
  children,
  onCopy,
  extra,
}: {
  label: string;
  children: React.ReactNode;
  onCopy: () => void;
  extra?: React.ReactNode;
}) => (
  <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-3 py-2">
    <span className="text-xs uppercase tracking-wide text-muted-foreground w-20 flex-shrink-0">{label}</span>
    <div className="flex-1 min-w-0 truncate">{children}</div>
    {extra}
    <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onCopy}>
      <Copy className="h-3.5 w-3.5" />
    </Button>
  </div>
);

const MyOrders = ({ onNewOrder }: MyOrdersProps) => {
  const { user } = useAuth();
  const [detailOrder, setDetailOrder] = useState<any | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);


  const { data: orders, isLoading, isError, refetch } = useQuery({
    queryKey: ["website_orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("website_orders")
        .select(
          "id, user_id, template_id, plan_id, store_name, domain_preference, contact_phone, contact_email, address, business_description, logo_url, social_media_links, color_preferences, additional_notes, payment_method, amount, transaction_id, screenshot_url, status, admin_notes, created_at, updated_at, onboarding_submission_id, plans(name, type, price_pkr), templates(name, niche)",
        )
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <CardGridSkeleton count={3} columns={1} />;
  if (isError) return <ErrorState message="We couldn't load your website orders." onRetry={() => refetch()} />;

  if (!orders?.length) {
    return (
      <EmptyState
        icon={Globe}
        title="No orders yet"
        description="Order your first website and we'll build it for you!"
        action={<Button onClick={onNewOrder}><Plus className="h-4 w-4 mr-1.5" /> Order a Website</Button>}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header strip */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Your Website Orders</h2>
          <p className="text-sm text-muted-foreground">
            {orders.length} order{orders.length !== 1 ? "s" : ""} in progress or delivered.
          </p>
        </div>
        <Button onClick={onNewOrder} size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> New Order
        </Button>
      </div>

      {/* Orders */}
      <div className="space-y-3">
        {orders.map((order: any) => {
          const cfg = statusConfig[order.status as StatusKey] || statusConfig.pending;
          const StatusIcon = cfg.icon;
          const spinning = order.status === "in_progress";
          const expanded = expandedId === order.id;

          return (
            <Card
              key={order.id}
              className="group relative overflow-hidden transition-all hover:shadow-md"
            >
              <div
                className={cn(
                  "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
                  cfg.accent,
                )}
              />

              <CardContent className="p-4 space-y-3">
                {/* Compact header row (always visible) */}
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                  className="w-full flex items-center justify-between gap-3 text-left"
                  aria-expanded={expanded}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center flex-shrink-0">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-semibold text-base text-foreground truncate">
                        {order.store_name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        #{order.id.slice(0, 8)} · {format(new Date(order.created_at), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant="outline"
                      className={cn("gap-1.5 py-1 px-2.5 font-medium border", cfg.badge)}
                    >
                      <StatusIcon className={cn("h-3.5 w-3.5", spinning && "animate-spin")} />
                      {cfg.label}
                    </Badge>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        expanded && "rotate-180",
                      )}
                    />
                  </div>
                </button>

                {/* Expanded details */}
                {expanded && (
                  <div className="space-y-4 pt-2 border-t border-border/60 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex flex-wrap gap-2 text-xs pt-3">
                      <MetaChip icon={Layers} label="Template" value={order.templates?.name || "—"} />
                      <MetaChip
                        icon={Package}
                        label="Plan"
                        value={order.plans?.name ? `${order.plans.name} · ${order.plans.type}` : "—"}
                      />
                      <MetaChip
                        icon={Clock}
                        label="Ordered"
                        value={format(new Date(order.created_at), "dd MMM yyyy")}
                      />
                    </div>

                    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                      <OrderStatusTimeline
                        status={order.status}
                        updatedAt={order.updated_at ?? order.created_at}
                        note={order.admin_notes}
                      />
                    </div>

                    {order.status === "completed" && (
                      <DecryptedCredentials orderId={order.id} hasUrl={true} />
                    )}

                    <div className="flex justify-end pt-1">
                      <Button variant="outline" size="sm" onClick={() => setDetailOrder(order)}>
                        View details
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>


      <OrderDetailsSheet
        order={detailOrder}
        open={!!detailOrder}
        onOpenChange={(o) => { if (!o) setDetailOrder(null); }}
      />
    </div>
  );
};

const MetaChip = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) => (
  <div className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-2.5 py-1.5">
    <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
    <span className="text-muted-foreground">{label}:</span>
    <span className="font-medium text-foreground truncate max-w-[180px]">{value}</span>
  </div>
);

export default MyOrders;
