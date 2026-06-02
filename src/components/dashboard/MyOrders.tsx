import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Clock, ExternalLink, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CardGridSkeleton } from "@/components/ui/loading-skeletons";

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
  in_progress: { color: "bg-blue-100 text-blue-800", label: "In Progress" },
  completed: { color: "bg-green-100 text-green-800", label: "Completed" },
  cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
};

interface MyOrdersProps {
  onNewOrder: () => void;
}

const DecryptedCredentials = ({ orderId, hasUrl }: { orderId: string; hasUrl: boolean }) => {
  const [creds, setCreds] = useState<{ wordpress_url: string; wordpress_username: string; wordpress_password: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const fetchCreds = async () => {
    if (creds) { setVisible(!visible); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-credentials", {
        body: { action: "decrypt", order_id: orderId },
      });
      if (!error && data && !data.error) {
        setCreds(data);
        setVisible(true);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="pt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-foreground">🎉 Your website is ready!</p>
          <Button variant="ghost" size="sm" onClick={fetchCreds} disabled={loading}>
            {loading ? "Loading..." : visible ? <><EyeOff className="h-3 w-3 mr-1" /> Hide</> : <><Eye className="h-3 w-3 mr-1" /> Show Credentials</>}
          </Button>
        </div>
        {visible && creds && (
          <>
            {creds.wordpress_url && (
              <p><strong>URL:</strong>{" "}
                <a href={creds.wordpress_url} target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
                  {creds.wordpress_url} <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            )}
            {creds.wordpress_username && <p><strong>Username:</strong> {creds.wordpress_username}</p>}
            {creds.wordpress_password && <p><strong>Password:</strong> ••••••••</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
};

const MyOrders = ({ onNewOrder }: MyOrdersProps) => {
  const { user } = useAuth();

  const { data: orders, isLoading, isError, refetch } = useQuery({
    queryKey: ["website_orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Note: wordpress_url, wordpress_username, wordpress_password are intentionally excluded.
      // They are encrypted at rest and column-level access has been revoked. Use the
      // manage-credentials edge function (decrypt action) to retrieve them when needed.
      const { data, error } = await supabase
        .from("website_orders")
        .select(
          "id, user_id, template_id, plan_id, store_name, domain_preference, contact_phone, contact_email, address, business_description, logo_url, social_media_links, color_preferences, additional_notes, payment_method, amount, transaction_id, screenshot_url, status, admin_notes, created_at, updated_at, plans(name, type, price_pkr), templates(name, niche)"
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
        action={<Button onClick={onNewOrder}>Order a Website</Button>}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
        <Button onClick={onNewOrder}>Order New Website</Button>
      </div>

      {orders.map((order: any) => {
        const cfg = statusConfig[order.status] || statusConfig.pending;
        return (
          <Card key={order.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-display">{order.store_name}</CardTitle>
                <Badge className={cfg.color}>{cfg.label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 md:grid-cols-3 text-sm">
                <p><strong>Template:</strong> {order.templates?.name || "—"}</p>
                <p><strong>Plan:</strong> {order.plans?.name || "—"} ({order.plans?.type})</p>
                <p className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(order.created_at), "dd MMM yyyy")}
                </p>
              </div>

              {order.status === "completed" && order.wordpress_url && (
                <DecryptedCredentials orderId={order.id} hasUrl={!!order.wordpress_url} />
              )}

              {order.admin_notes && (
                <p className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3">{order.admin_notes}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MyOrders;
