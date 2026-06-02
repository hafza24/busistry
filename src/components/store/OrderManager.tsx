import { useState } from "react";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useStoreManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { ErrorState } from "@/components/ui/error-state";
import { TableSkeleton, StatCardsSkeleton } from "@/components/ui/loading-skeletons";

interface Props { storeId: string; }

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-indigo-100 text-indigo-800 border-indigo-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const OrderManager = ({ storeId }: Props) => {
  const { data: orders, isLoading, isError, refetch } = useOrders(storeId);
  const updateStatus = useUpdateOrderStatus();
  const [selected, setSelected] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");

  const openDetail = (order: any) => {
    setSelected(order);
    setNewStatus(order.status);
    setNotes(order.notes || "");
  };

  const handleStatusUpdate = async () => {
    if (!selected) return;
    try {
      await updateStatus.mutateAsync({ id: selected.id, store_id: storeId, status: newStatus, notes });
      toast.success("Order updated");
      setSelected(null);
    } catch (e: any) { toast.error(e.message); }
  };

  if (isLoading) return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-display text-foreground">Orders</h2>
      <StatCardsSkeleton count={3} />
      <TableSkeleton columns={6} rows={6} />
    </div>
  );

  if (isError) return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-display text-foreground">Orders</h2>
      <ErrorState message="We couldn't load your orders." onRetry={() => refetch()} />
    </div>
  );

  const summary = {
    total: orders?.length || 0,
    pending: orders?.filter((o) => o.status === "pending").length || 0,
    revenue: orders?.filter((o) => o.status === "delivered").reduce((s, o) => s + Number(o.total), 0) || 0,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-display text-foreground">Orders</h2>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{summary.total}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-yellow-600">{summary.pending}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Revenue (Delivered)</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-primary">PKR {summary.revenue.toLocaleString()}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!orders || orders.length === 0) ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No orders yet</TableCell></TableRow>
              ) : orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                  <TableCell>
                    <div>{order.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{order.customer_phone}</div>
                  </TableCell>
                  <TableCell>PKR {Number(order.total).toLocaleString()}</TableCell>
                  <TableCell><Badge variant="outline" className={statusColors[order.status] || ""}>{order.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{format(new Date(order.created_at), "dd MMM yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openDetail(order)} aria-label="View order details"><Eye className="h-4 w-4" aria-hidden="true" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Order #{selected?.order_number}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Customer:</span> {selected.customer_name}</div>
                <div><span className="text-muted-foreground">Phone:</span> {selected.customer_phone}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Address:</span> {selected.customer_address}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Items</Label>
                <div className="mt-1 space-y-1">
                  {selected.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm border-b border-border py-1">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span>PKR {Number(item.total).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-1">
                    <span>Total</span>
                    <span>PKR {Number(selected.total).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            <Button onClick={handleStatusUpdate} disabled={updateStatus.isPending}>Update Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManager;
