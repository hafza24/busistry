import { useState } from "react";
import { useAllUpgradeOrders, useUpdateUpgradeOrderStatus, useAllUpgradeOptions, useUpsertUpgradeOption, useDeleteUpgradeOption, useUpdateUpgradeOrder, useDeleteUpgradeOrder, useApplyUpgradeOrder } from "@/hooks/useMarketplace";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Check, X, ExternalLink, Zap } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const TYPE_LABEL: Record<string, string> = {
  plan_change: "Plan Change",
  product_limit: "Product Limit",
  category_limit: "Category Limit",
  extend_duration: "Extend Duration",
  content_tweak: "Design / Content Tweak",
};

const STATUSES = ["pending", "approved", "in_progress", "completed", "rejected"];

const optEmpty = { upgrade_type: "product_limit", label: "", quantity: 0, price_pkr: 0, is_enabled: true, sort_order: 0 };

export default function AdminUpgradeOrders() {
  const { toast } = useToast();
  const { data: orders = [] } = useAllUpgradeOrders();
  const updateStatus = useUpdateUpgradeOrderStatus();
  const updateOrder = useUpdateUpgradeOrder();
  const deleteOrder = useDeleteUpgradeOrder();
  const applyOrder = useApplyUpgradeOrder();
  const { data: options = [] } = useAllUpgradeOptions();
  const upsertOpt = useUpsertUpgradeOption();
  const delOpt = useDeleteUpgradeOption();
  const [editingOpt, setEditingOpt] = useState<any | null>(null);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);

  const handleApprove = async (o: any) => {
    try {
      await applyOrder.mutateAsync(o.id);
      const applied = o.upgrade_type === "product_limit" ? `+${o.details?.quantity ?? 0} products`
        : o.upgrade_type === "category_limit" ? `+${o.details?.quantity ?? 0} categories`
        : o.upgrade_type === "extend_duration" ? `+${o.details?.quantity ?? 0} days`
        : o.upgrade_type === "plan_change" ? `plan → ${o.details?.target_plan_name ?? "new plan"}`
        : "manual fulfillment required";
      toast({ title: "Order approved & applied", description: applied });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast({ title: `Order ${status}` });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const saveOpt = async () => {
    try { await upsertOpt.mutateAsync(editingOpt); toast({ title: "Saved" }); setEditingOpt(null); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const saveOrder = async () => {
    if (!editingOrder) return;
    try {
      const { id, status, admin_notes, amount, transaction_id, payment_method } = editingOrder;
      await updateOrder.mutateAsync({ id, status, admin_notes, amount: Number(amount), transaction_id, payment_method });
      toast({ title: "Order updated" });
      setEditingOrder(null);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const removeOrder = async (id: string) => {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    try { await deleteOrder.mutateAsync(id); toast({ title: "Order deleted" }); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  return (
    <Tabs defaultValue="orders" className="space-y-4">
      <TabsList>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="options">Pricing Options</TabsTrigger>
      </TabsList>

      <TabsContent value="orders" className="space-y-3">
        <h2 className="text-2xl font-bold font-display">Upgrade Orders</h2>
        {orders.length === 0 && <p className="text-muted-foreground">No upgrade orders yet.</p>}
        <div className="grid gap-3">
          {orders.map((o: any) => (
            <Card key={o.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{TYPE_LABEL[o.upgrade_type] ?? o.upgrade_type}</p>
                      <Badge variant="outline" className="text-xs">{o.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{o.stores?.name} • PKR {o.amount.toLocaleString()} • {format(new Date(o.created_at), "MMM d, yyyy")}</p>
                    <p className="text-xs text-muted-foreground mt-1">{o.details?.label || o.details?.target_plan_name}</p>
                    {o.details?.notes && <p className="text-xs italic mt-1 border-l-2 border-primary/40 pl-2">"{o.details.notes}"</p>}
                    {o.transaction_id && <p className="text-xs mt-1">TXN: <code>{o.transaction_id}</code></p>}
                    {o.screenshot_url && (
                      <a href={o.screenshot_url} target="_blank" rel="noreferrer" className="text-xs text-primary inline-flex items-center gap-1 mt-1">
                        <ExternalLink className="h-3 w-3" /> View payment screenshot
                      </a>
                    )}
                    {o.admin_notes && <p className="text-xs mt-1 text-muted-foreground">Admin notes: {o.admin_notes}</p>}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {o.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleStatus(o.id, "approved")}><Check className="h-3.5 w-3.5 mr-1" /> Approve</Button>
                        <Button size="sm" variant="outline" onClick={() => handleStatus(o.id, "rejected")}><X className="h-3.5 w-3.5 mr-1" /> Reject</Button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingOrder({ ...o })}><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => removeOrder(o.id)}><Trash2 className="h-3.5 w-3.5 mr-1 text-destructive" /> Delete</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={!!editingOrder} onOpenChange={(v) => !v && setEditingOrder(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Edit Upgrade Order</DialogTitle></DialogHeader>
            {editingOrder && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Status</Label>
                  <Select value={editingOrder.status} onValueChange={(v) => setEditingOrder({ ...editingOrder, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Amount (PKR)</Label><Input type="number" value={editingOrder.amount} onChange={(e) => setEditingOrder({ ...editingOrder, amount: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Payment Method</Label><Input value={editingOrder.payment_method ?? ""} onChange={(e) => setEditingOrder({ ...editingOrder, payment_method: e.target.value })} /></div>
                </div>
                <div className="space-y-1"><Label>Transaction ID</Label><Input value={editingOrder.transaction_id ?? ""} onChange={(e) => setEditingOrder({ ...editingOrder, transaction_id: e.target.value })} /></div>
                <div className="space-y-1"><Label>Admin Notes (visible to user)</Label><Textarea rows={3} value={editingOrder.admin_notes ?? ""} onChange={(e) => setEditingOrder({ ...editingOrder, admin_notes: e.target.value })} /></div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingOrder(null)}>Cancel</Button>
              <Button onClick={saveOrder}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TabsContent>

      <TabsContent value="options" className="space-y-3">
        <div className="flex justify-between">
          <div>
            <h2 className="text-2xl font-bold font-display">Pricing Options</h2>
            <p className="text-sm text-muted-foreground">Tiers users can buy (e.g. +50 products = PKR 1500).</p>
          </div>
          <Button onClick={() => setEditingOpt({ ...optEmpty })}><Plus className="h-4 w-4 mr-2" /> New</Button>
        </div>
        <div className="grid gap-2">
          {options.map((o: any) => (
            <Card key={o.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{o.label} <Badge variant="outline" className="ml-2 text-xs">{TYPE_LABEL[o.upgrade_type] ?? o.upgrade_type}</Badge></p>
                  <p className="text-xs text-muted-foreground">qty {o.quantity} • PKR {o.price_pkr.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingOpt(o)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => { if (confirm("Delete?")) delOpt.mutate(o.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={!!editingOpt} onOpenChange={(v) => !v && setEditingOpt(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editingOpt?.id ? "Edit" : "New"} Pricing Option</DialogTitle></DialogHeader>
            {editingOpt && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Type</Label>
                  <Select value={editingOpt.upgrade_type} onValueChange={(v) => setEditingOpt({ ...editingOpt, upgrade_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product_limit">Product Limit</SelectItem>
                      <SelectItem value="category_limit">Category Limit</SelectItem>
                      <SelectItem value="extend_duration">Extend Duration</SelectItem>
                      <SelectItem value="content_tweak">Design / Content Tweak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Label</Label><Input value={editingOpt.label} onChange={(e) => setEditingOpt({ ...editingOpt, label: e.target.value })} placeholder="+50 products" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Quantity</Label><Input type="number" value={editingOpt.quantity} onChange={(e) => setEditingOpt({ ...editingOpt, quantity: +e.target.value })} /></div>
                  <div className="space-y-1"><Label>Price (PKR)</Label><Input type="number" value={editingOpt.price_pkr} onChange={(e) => setEditingOpt({ ...editingOpt, price_pkr: +e.target.value })} /></div>
                </div>
                <label className="flex items-center gap-2"><Switch checked={editingOpt.is_enabled} onCheckedChange={(v) => setEditingOpt({ ...editingOpt, is_enabled: v })} /> Enabled</label>
              </div>
            )}
            <DialogFooter><Button variant="outline" onClick={() => setEditingOpt(null)}>Cancel</Button><Button onClick={saveOpt}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </TabsContent>
    </Tabs>
  );
}
