import { useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, ExternalLink, Wand2 } from "lucide-react";
import {
  useAllCatalogOrders,
  useUpdateCatalogOrder,
  useApplyCatalogOrder,
  useDeleteCatalogOrder,
  CATALOG_TYPE_META,
  STATUS_COLORS,
  type CatalogItemType,
  type CatalogOrderStatus,
} from "@/hooks/useCatalog";

export default function AdminCatalogOrders() {
  const { data: orders = [], isLoading } = useAllCatalogOrders();
  const update = useUpdateCatalogOrder();
  const apply = useApplyCatalogOrder();
  const del = useDeleteCatalogOrder();

  const [typeFilter, setTypeFilter] = useState<"all" | CatalogItemType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | CatalogOrderStatus>("all");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<{ id: string; admin_notes: string; status: CatalogOrderStatus } | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (typeFilter !== "all" && o.item_type_snapshot !== typeFilter) return false;
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!term) return true;
      return (
        o.name_snapshot.toLowerCase().includes(term) ||
        (o.transaction_id ?? "").toLowerCase().includes(term)
      );
    });
  }, [orders, typeFilter, statusFilter, q]);

  const handleStatus = async (id: string, status: CatalogOrderStatus) => {
    try {
      await update.mutateAsync({ id, status });
      toast.success(`Marked ${status}`);
    } catch (e: any) {
      toast.error(e.message ?? "Update failed");
    }
  };

  const handleApply = async (id: string) => {
    try {
      await apply.mutateAsync(id);
      toast.success("Order fulfilled");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to apply");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    try {
      await del.mutateAsync(id);
      toast.success("Deleted");
    } catch (e: any) {
      toast.error(e.message ?? "Delete failed");
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await update.mutateAsync({ id: editing.id, admin_notes: editing.admin_notes, status: editing.status });
      toast.success("Saved");
      setEditing(null);
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Catalog Orders</h2>
        <p className="text-sm text-muted-foreground">Every add-on, integration, website update and plan upgrade request.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {Object.entries(CATALOG_TYPE_META).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.plural}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
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
        <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="w-56" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Orders ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => {
                  const store = (o as any).stores;
                  return (
                    <TableRow key={o.id}>
                      <TableCell>
                        <div className="font-medium">{o.name_snapshot}</div>
                        {o.transaction_id && <div className="text-xs text-muted-foreground">TX: {o.transaction_id}</div>}
                        {o.config?.notes && <div className="text-xs italic mt-1">"{o.config.notes}"</div>}
                      </TableCell>
                      <TableCell><Badge variant="outline">{CATALOG_TYPE_META[o.item_type_snapshot].label}</Badge></TableCell>
                      <TableCell className="text-xs">{store?.name ?? "—"}</TableCell>
                      <TableCell>PKR {Number(o.price_snapshot_pkr).toLocaleString()}</TableCell>
                      <TableCell><Badge variant="outline" className={STATUS_COLORS[o.status]}>{o.status.replace("_", " ")}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{format(new Date(o.created_at), "MMM d")}</TableCell>
                      <TableCell className="text-right space-x-1">
                        {o.screenshot_url && (
                          <Button asChild variant="ghost" size="icon" title="View screenshot">
                            <a href={o.screenshot_url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                          </Button>
                        )}
                        {o.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleStatus(o.id, "approved")}>Approve</Button>
                            <Button size="sm" variant="ghost" onClick={() => handleStatus(o.id, "rejected")}>Reject</Button>
                          </>
                        )}
                        {(o.status === "approved" || o.status === "in_progress") && (
                          <Button size="sm" variant="outline" onClick={() => handleApply(o.id)} className="gap-1">
                            <Wand2 className="h-3.5 w-3.5" /> Apply
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => setEditing({ id: o.id, admin_notes: o.admin_notes ?? "", status: o.status })}>Edit</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(o.id)} className="text-destructive">Delete</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">No orders.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit order</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Status</label>
                <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v as CatalogOrderStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Admin notes</label>
                <Textarea rows={4} value={editing.admin_notes} onChange={(e) => setEditing({ ...editing, admin_notes: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={update.isPending}>
              {update.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
