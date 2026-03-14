import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAllStores, useUpdateStoreStatus } from "@/hooks/useAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Store, Package, FolderOpen } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  activated: "bg-emerald-100 text-emerald-800 border-emerald-300",
  suspended: "bg-orange-100 text-orange-800 border-orange-300",
  expired: "bg-gray-100 text-gray-800 border-gray-300",
};

const AdminStoreManagement = () => {
  const { data: stores, isLoading } = useAllStores();
  const updateStatus = useUpdateStoreStatus();

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success(`Store ${status}`);
    } catch {
      toast.error("Failed to update store");
    }
  };

  if (isLoading) return <div className="text-muted-foreground p-4">Loading stores...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Store className="h-8 w-8 text-primary" />
            <div>
              <div className="text-2xl font-bold font-display">{stores?.length ?? 0}</div>
              <div className="text-sm text-muted-foreground">Total Stores</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <div className="text-2xl font-bold font-display">{stores?.filter((s) => s.status === "activated").length ?? 0}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <FolderOpen className="h-8 w-8 text-accent" />
            <div>
              <div className="text-2xl font-bold font-display">{stores?.filter((s) => s.status === "suspended").length ?? 0}</div>
              <div className="text-sm text-muted-foreground">Suspended</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subdomain</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores?.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">{store.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{store.subdomain_slug}</TableCell>
                  <TableCell>{store.templates?.name ?? "—"}</TableCell>
                  <TableCell>{store.plans?.name ?? "—"}</TableCell>
                  <TableCell>{store.product_count}/{store.category_count} cat</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[store.status] ?? ""}>{store.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {store.expires_at ? format(new Date(store.expires_at), "dd MMM yyyy") : "Lifetime"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {store.status !== "activated" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(store.id, "activated")}>Activate</DropdownMenuItem>
                        )}
                        {store.status === "activated" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(store.id, "suspended")}>Suspend</DropdownMenuItem>
                        )}
                        {store.status === "suspended" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(store.id, "activated")}>Reactivate</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {(!stores || stores.length === 0) && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No stores yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStoreManagement;
