import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Loader2, PackagePlus } from "lucide-react";
import {
  useMyCatalogOrders,
  CATALOG_TYPE_META,
  STATUS_COLORS,
  type CatalogOrderStatus,
  type CatalogItemType,
} from "@/hooks/useCatalog";

export default function MyRequests() {
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useMyCatalogOrders(user?.id);
  const [typeFilter, setTypeFilter] = useState<"all" | CatalogItemType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | CatalogOrderStatus>("all");

  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          (typeFilter === "all" || o.item_type_snapshot === typeFilter) &&
          (statusFilter === "all" || o.status === statusFilter),
      ),
    [orders, typeFilter, statusFilter],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <PackagePlus className="h-6 w-6" /> My Requests
          </h2>
          <p className="text-muted-foreground">Every add-on, integration, and website update you've requested.</p>
        </div>
        <Button asChild variant="outline" className="rounded-full gap-2">
          <Link to="/marketplace">Browse marketplace <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {Object.entries(CATALOG_TYPE_META).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.plural}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">History</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading && (
            <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          )}
          {!isLoading && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground py-6 text-center">No requests yet.</p>
          )}
          {filtered.map((o) => {
            const meta = CATALOG_TYPE_META[o.item_type_snapshot];
            const store = (o as any).stores;
            return (
              <div key={o.id} className="flex items-start justify-between gap-3 border-b border-border last:border-0 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">
                    <span className="text-muted-foreground">{meta.label}:</span> {o.name_snapshot}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {store?.name ? `${store.name} · ` : ""}
                    {format(new Date(o.created_at), "MMM d, yyyy")} · PKR {Number(o.price_snapshot_pkr).toLocaleString()}
                  </p>
                  {o.config?.notes && (
                    <p className="text-xs italic mt-1 border-l-2 border-primary/40 pl-2">"{o.config.notes}"</p>
                  )}
                  {o.admin_notes && (
                    <p className="text-xs text-muted-foreground mt-1">Admin: {o.admin_notes}</p>
                  )}
                </div>
                <Badge variant="outline" className={STATUS_COLORS[o.status]}>{o.status.replace("_", " ")}</Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
