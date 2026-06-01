import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Eye, Globe, Package } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statuses = ["pending", "in_progress", "completed", "cancelled"];

const AdminWebsiteOrders = () => {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [editFields, setEditFields] = useState({
    status: "",
    wordpress_url: "",
    wordpress_username: "",
    wordpress_password: "",
    admin_notes: "",
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin_website_orders"],
    queryFn: async () => {
      // Credentials columns (wordpress_url/username/password) are intentionally excluded.
      // They are encrypted and only accessible via the manage-credentials edge function.
      const { data, error } = await supabase
        .from("website_orders")
        .select(
          "id, user_id, template_id, plan_id, store_name, domain_preference, contact_phone, contact_email, address, business_description, logo_url, social_media_links, color_preferences, additional_notes, payment_method, amount, transaction_id, screenshot_url, status, admin_notes, created_at, updated_at, plans(name, type, price_pkr), templates(name, niche)"
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateOrder = useMutation({
    mutationFn: async (updates: { id: string } & Record<string, any>) => {
      const { id, wordpress_url, wordpress_username, wordpress_password, ...rest } = updates;

      // Encrypt credentials via Edge Function if any are provided
      if (wordpress_url || wordpress_username || wordpress_password) {
        const { data: encData, error: encError } = await supabase.functions.invoke("manage-credentials", {
          body: { action: "encrypt", order_id: id, wordpress_url, wordpress_username, wordpress_password },
        });
        if (encError) throw new Error(encError.message || "Failed to encrypt credentials");
        if (encData?.error) throw new Error(encData.error);
      }

      // Update non-credential fields
      if (Object.keys(rest).length > 0) {
        const { error } = await supabase
          .from("website_orders")
          .update({ ...rest, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_website_orders"] });
      toast.success("Order updated");
      setSelected(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const openDetail = async (order: any) => {
    setSelected(order);
    setEditFields({
      status: order.status,
      wordpress_url: "",
      wordpress_username: "",
      wordpress_password: "",
      admin_notes: order.admin_notes || "",
    });

    // Decrypt credentials if they exist
    if (order.wordpress_url || order.wordpress_username || order.wordpress_password) {
      try {
        const { data, error } = await supabase.functions.invoke("manage-credentials", {
          body: { action: "decrypt", order_id: order.id },
        });
        if (!error && data && !data.error) {
          setEditFields((prev) => ({
            ...prev,
            wordpress_url: data.wordpress_url || "",
            wordpress_username: data.wordpress_username || "",
            wordpress_password: data.wordpress_password || "",
          }));
        }
      } catch {
        // Fallback to raw values if decryption fails
        setEditFields((prev) => ({
          ...prev,
          wordpress_url: order.wordpress_url || "",
          wordpress_username: order.wordpress_username || "",
          wordpress_password: order.wordpress_password || "",
        }));
      }
    }
  };

  const handleSave = () => {
    if (!selected) return;
    updateOrder.mutate({ id: selected.id, ...editFields });
  };

  const filtered = orders?.filter((o: any) => filterStatus === "all" || o.status === filterStatus);

  const counts = {
    total: orders?.length || 0,
    pending: orders?.filter((o: any) => o.status === "pending").length || 0,
    in_progress: orders?.filter((o: any) => o.status === "in_progress").length || 0,
    completed: orders?.filter((o: any) => o.status === "completed").length || 0,
  };

  if (isLoading) return <div className="text-center text-muted-foreground py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{counts.total}</p><p className="text-sm text-muted-foreground">Total Orders</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-yellow-600">{counts.pending}</p><p className="text-sm text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-blue-600">{counts.in_progress}</p><p className="text-sm text-muted-foreground">In Progress</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-green-600">{counts.completed}</p><p className="text-sm text-muted-foreground">Completed</p></CardContent></Card>
      </div>

      <div className="flex items-center gap-3">
        <Label>Filter:</Label>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {statuses.map((s) => (<SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store Name</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered?.map((order: any) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.store_name}</TableCell>
                <TableCell>{order.templates?.name || "—"}</TableCell>
                <TableCell>{order.plans?.name || "—"}</TableCell>
                <TableCell>{order.contact_phone}</TableCell>
                <TableCell><Badge className={statusColors[order.status] || ""}>{order.status.replace("_", " ")}</Badge></TableCell>
                <TableCell>{format(new Date(order.created_at), "dd MMM yyyy")}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => openDetail(order)} aria-label="View order details">
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> {selected.store_name}</DialogTitle>
              </DialogHeader>

              <div className="grid gap-3 text-sm md:grid-cols-2">
                <p><strong>Template:</strong> {selected.templates?.name}</p>
                <p><strong>Plan:</strong> {selected.plans?.name} ({selected.plans?.type})</p>
                <p><strong>Phone:</strong> {selected.contact_phone}</p>
                <p><strong>Email:</strong> {selected.contact_email || "—"}</p>
                <p className="md:col-span-2"><strong>Address:</strong> {selected.address}</p>
                {selected.domain_preference && <p className="md:col-span-2"><strong>Domain Pref:</strong> {selected.domain_preference}</p>}
                {selected.business_description && <p className="md:col-span-2"><strong>Description:</strong> {selected.business_description}</p>}
                {selected.color_preferences && <p><strong>Colors:</strong> {selected.color_preferences}</p>}
                {selected.logo_url && (
                  <div><strong>Logo:</strong> <img src={selected.logo_url} alt="" className="h-12 w-12 object-contain rounded mt-1" /></div>
                )}
                {selected.social_media_links && Object.entries(selected.social_media_links as Record<string, string>).filter(([, v]) => v).length > 0 && (
                  <div className="md:col-span-2">
                    <strong>Social:</strong>{" "}
                    {Object.entries(selected.social_media_links as Record<string, string>).filter(([, v]) => v).map(([k, v]) => (
                      <span key={k} className="mr-3">{k}: {v}</span>
                    ))}
                  </div>
                )}
                {selected.additional_notes && <p className="md:col-span-2"><strong>Notes:</strong> {selected.additional_notes}</p>}
                {selected.payment_method && (
                  <>
                    <p><strong>Payment:</strong> {selected.payment_method}</p>
                    <p><strong>TxID:</strong> {selected.transaction_id || "—"}</p>
                    <p><strong>Amount:</strong> PKR {selected.amount?.toLocaleString()}</p>
                    {selected.screenshot_url && (
                      <p><strong>Screenshot:</strong>{" "}
                        <a href={selected.screenshot_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">View</a>
                      </p>
                    )}
                  </>
                )}
              </div>

              <hr className="border-border" />

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2"><Package className="h-4 w-4" /> Fulfillment</h4>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editFields.status} onValueChange={(v) => setEditFields({ ...editFields, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (<SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>WordPress URL</Label>
                  <Input placeholder="https://mystore.busistree.com" value={editFields.wordpress_url} onChange={(e) => setEditFields({ ...editFields, wordpress_url: e.target.value })} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>WP Username</Label>
                    <Input value={editFields.wordpress_username} onChange={(e) => setEditFields({ ...editFields, wordpress_username: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>WP Password</Label>
                    <Input value={editFields.wordpress_password} onChange={(e) => setEditFields({ ...editFields, wordpress_password: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Admin Notes</Label>
                  <Textarea value={editFields.admin_notes} onChange={(e) => setEditFields({ ...editFields, admin_notes: e.target.value })} />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
                <Button onClick={handleSave} disabled={updateOrder.isPending}>
                  {updateOrder.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWebsiteOrders;
