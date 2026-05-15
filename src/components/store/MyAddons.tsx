import { useStoreAddons } from "@/hooks/useMarketplace";
import { useWebsiteProducts, useIntegrations } from "@/hooks/useMarketplace";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-blue-100 text-blue-800 border-blue-200",
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function MyAddons({ storeId }: { storeId: string }) {
  const { data: addons = [], isLoading } = useStoreAddons(storeId);
  const { data: products = [] } = useWebsiteProducts();
  const { data: integrations = [] } = useIntegrations();

  const lookup = (a: any) => {
    const list = a.item_type === "product" ? products : integrations;
    return (list as any[]).find((x) => x.id === a.item_id);
  };

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-bold">My Add-ons</h2>
      {addons.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No add-ons installed yet. Browse the marketplace to add features.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {addons.map((a: any) => {
            const item = lookup(a);
            return (
              <Card key={a.id}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold truncate">{item?.name ?? "Item"}</p>
                      <Badge variant="outline" className="capitalize text-xs">{a.item_type}</Badge>
                      <Badge variant="outline" className={statusColors[a.status]}>{a.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ordered {format(new Date(a.created_at), "MMM d, yyyy")} • PKR {a.price_snapshot_pkr.toLocaleString()}
                    </p>
                    {a.admin_notes && <p className="text-xs mt-1 text-muted-foreground italic">"{a.admin_notes}"</p>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
