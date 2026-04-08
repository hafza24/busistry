import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Clock, ExternalLink, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
  in_progress: { color: "bg-blue-100 text-blue-800", label: "In Progress" },
  completed: { color: "bg-green-100 text-green-800", label: "Completed" },
  cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
};

interface MyOrdersProps {
  onNewOrder: () => void;
}

const MyOrders = ({ onNewOrder }: MyOrdersProps) => {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["website_orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("website_orders")
        .select("*, plans(name, type, price_pkr), templates(name, niche)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="text-center text-muted-foreground py-8">Loading orders...</div>;

  if (!orders?.length) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold font-display mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-4">Order your first website and we'll build it for you!</p>
          <Button onClick={onNewOrder}>Order a Website</Button>
        </CardContent>
      </Card>
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
