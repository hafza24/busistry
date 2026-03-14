import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FolderTree, ShoppingCart, DollarSign } from "lucide-react";
import { useProducts, useCategories, useOrders } from "@/hooks/useStoreManagement";

interface Props {
  storeId: string;
}

const StoreOverview = ({ storeId }: Props) => {
  const { data: products } = useProducts(storeId);
  const { data: categories } = useCategories(storeId);
  const { data: orders } = useOrders(storeId);

  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
  const pendingOrders = orders?.filter((o) => o.status === "pending").length || 0;

  const stats = [
    { label: "Products", value: products?.length || 0, icon: Package, color: "text-primary" },
    { label: "Categories", value: categories?.length || 0, icon: FolderTree, color: "text-accent-foreground" },
    { label: "Orders", value: orders?.length || 0, icon: ShoppingCart, color: "text-secondary-foreground" },
    { label: "Revenue", value: `PKR ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-display text-foreground">Store Overview</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-display">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {pendingOrders > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <p className="text-sm font-medium">
              You have <span className="font-bold text-primary">{pendingOrders}</span> pending order{pendingOrders > 1 ? "s" : ""} to process.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StoreOverview;
