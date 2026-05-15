import { useState } from "react";
import { useAllStoreAddons, useUpdateStoreAddonStatus } from "@/hooks/useMarketplace";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function AdminStoreAddons() {
  const { data = [] } = useAllStoreAddons();
  const update = useUpdateStoreAddonStatus();
  const { toast } = useToast();

  const set = async (id: string, status: string) => {
    try { await update.mutateAsync({ id, status }); toast({ title: `Marked ${status}` }); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold font-display flex items-center gap-2"><Sparkles className="h-6 w-6" /> Store Add-on Orders</h2>
      <p className="text-sm text-muted-foreground">Approve and mark add-on installations as active once deployed to the user's site.</p>
      {data.length === 0 && <p className="text-muted-foreground">No add-on orders yet.</p>}
      <div className="grid gap-3">
        {data.map((a: any) => (
          <Card key={a.id}>
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold">{a.stores?.name ?? "Store"}</p>
                  <Badge variant="outline" className="capitalize text-xs">{a.item_type}</Badge>
                  <Badge variant="outline" className="text-xs">{a.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  PKR {a.price_snapshot_pkr.toLocaleString()} • {format(new Date(a.created_at), "MMM d, yyyy")}
                </p>
                {a.transaction_id && <p className="text-xs">TXN: <code>{a.transaction_id}</code></p>}
                {a.config && Object.keys(a.config).length > 0 && (
                  <pre className="text-xs mt-2 p-2 bg-muted rounded max-w-full overflow-auto">{JSON.stringify(a.config, null, 2)}</pre>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {a.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => set(a.id, "approved")}><Check className="h-3.5 w-3.5 mr-1" /> Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => set(a.id, "rejected")}><X className="h-3.5 w-3.5 mr-1" /> Reject</Button>
                  </>
                )}
                {a.status === "approved" && <Button size="sm" onClick={() => set(a.id, "active")}>Mark Installed</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
