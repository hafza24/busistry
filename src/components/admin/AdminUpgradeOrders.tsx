import { useState } from "react";
import { useAllUpgradeOrders, useUpdateUpgradeOrderStatus, useAllUpgradeOptions, useUpsertUpgradeOption, useDeleteUpgradeOption } from "@/hooks/useMarketplace";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const TYPE_LABEL: Record<string, string> = {
  plan_change: "Plan Change",
  product_limit: "Product Limit",
  category_limit: "Category Limit",
  extend_duration: "Extend Duration",
};

const optEmpty = { upgrade_type: "product_limit", label: "", quantity: 0, price_pkr: 0, is_enabled: true, sort_order: 0 };

export default function AdminUpgradeOrders() {
  const { toast } = useToast();
  const { data: orders = [] } = useAllUpgradeOrders();
  const update = useUpdateUpgradeOrderStatus();
  const { data: options = [] } = useAllUpgradeOptions();
  const upsertOpt = useUpsertUpgradeOption();
  const delOpt = useDeleteUpgradeOption();
  const [editing, setEditing] = useState<any | null>(null);

  const handleStatus = async (id: string, status: string) => {
    try {
      await update.mutateAsync({ id, status });
      toast({ title: `Order ${status}` });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const saveOpt = async () => {
    try { await upsertOpt.mutateAsync(editing); toast({ title: "Saved" }); setEditing(null); }
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
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{TYPE_LABEL[o.upgrade_type]}</p>
                      <Badge variant="outline" className="text-xs">{o.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{o.stores?.name} • PKR {o.amount.toLocaleString()} • {format(new Date(o.created_at), "MMM d, yyyy")}</p>
                    <p className="text-xs text-muted-foreground mt-1">{o.details?.label || o.details?.target_plan_name}</p>
                    {o.transaction_id && <p className="text-xs">TXN: <code>{o.transaction_id}</code></p>}
                  </div>
                  {o.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleStatus(o.id, "approved")}><Check className="h-3.5 w-3.5 mr-1" /> Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => handleStatus(o.id, "rejected")}><X className="h-3.5 w-3.5 mr-1" /> Reject</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="options" className="space-y-3">
        <div className="flex justify-between">
          <div>
            <h2 className="text-2xl font-bold font-display">Pricing Options</h2>
            <p className="text-sm text-muted-foreground">Tiers users can buy (e.g. +50 products = PKR 1500).</p>
          </div>
          <Button onClick={() => setEditing({ ...optEmpty })}><Plus className="h-4 w-4 mr-2" /> New</Button>
        </div>
        <div className="grid gap-2">
          {options.map((o: any) => (
            <Card key={o.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{o.label} <Badge variant="outline" className="ml-2 text-xs">{TYPE_LABEL[o.upgrade_type]}</Badge></p>
                  <p className="text-xs text-muted-foreground">qty {o.quantity} • PKR {o.price_pkr.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(o)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => { if (confirm("Delete?")) delOpt.mutate(o.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} Pricing Option</DialogTitle></DialogHeader>
            {editing && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Type</Label>
                  <Select value={editing.upgrade_type} onValueChange={(v) => setEditing({ ...editing, upgrade_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product_limit">Product Limit</SelectItem>
                      <SelectItem value="category_limit">Category Limit</SelectItem>
                      <SelectItem value="extend_duration">Extend Duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Label</Label><Input value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} placeholder="+50 products" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Quantity</Label><Input type="number" value={editing.quantity} onChange={(e) => setEditing({ ...editing, quantity: +e.target.value })} /></div>
                  <div className="space-y-1"><Label>Price (PKR)</Label><Input type="number" value={editing.price_pkr} onChange={(e) => setEditing({ ...editing, price_pkr: +e.target.value })} /></div>
                </div>
                <label className="flex items-center gap-2"><Switch checked={editing.is_enabled} onCheckedChange={(v) => setEditing({ ...editing, is_enabled: v })} /> Enabled</label>
              </div>
            )}
            <DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={saveOpt}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </TabsContent>
    </Tabs>
  );
}
