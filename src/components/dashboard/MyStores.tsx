import { useStores } from "@/hooks/useStores";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store, Plus, Calendar, Package, ExternalLink, Settings } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  under_review: "bg-blue-100 text-blue-800 border-blue-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  activated: "bg-primary/10 text-primary border-primary/20",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
  expired: "bg-muted text-muted-foreground border-border",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

interface MyStoresProps {
  onLaunchStore: () => void;
}

const MyStores = ({ onLaunchStore }: MyStoresProps) => {
  const { data: stores, isLoading } = useStores();

  if (isLoading) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground">Loading stores...</div>;
  }

  if (!stores || stores.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-display text-foreground">My Stores</h2>
        <Card className="border-dashed border-2 border-border">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Store className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold font-display text-foreground mb-2">No stores yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Get started by launching your first online store. Choose a template, pick a plan, and you're ready to go!
            </p>
            <Button onClick={onLaunchStore} size="lg">
              <Plus className="h-4 w-4 mr-2" /> Launch Your First Store
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-display text-foreground">My Stores</h2>
        <Button onClick={onLaunchStore}>
          <Plus className="h-4 w-4 mr-2" /> Launch Store
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {stores.map((store) => (
          <Card key={store.id} className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="font-display text-lg">{store.name}</CardTitle>
                <Badge variant="outline" className={statusColors[store.status] || ""}>
                  {store.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {(store as any).templates?.name} • {(store as any).plans?.name}
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  {store.product_count} products
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {store.expires_at ? `Expires ${format(new Date(store.expires_at), "MMM d, yyyy")}` : "No expiry"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyStores;
