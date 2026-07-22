import { TableSkeleton } from "@/components/ui/loading-skeletons";
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
import { Eye, Globe, Package, ScanLine, CheckCircle2, AlertTriangle, Hourglass, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-primary/10 text-primary",
  completed: "bg-primary/10 text-primary",
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
          "id, user_id, template_id, plan_id, store_name, domain_preference, contact_phone, contact_email, address, business_description, logo_url, social_media_links, color_preferences, additional_notes, payment_method, amount, transaction_id, screenshot_url, status, admin_notes, created_at, updated_at, onboarding_submission_id, ocr_status, ocr_amount, ocr_transaction_id, ocr_payment_method, ocr_recipient_name, ocr_sender_name, ocr_date, ocr_confidence, ocr_notes, ocr_raw, ocr_scanned_at, plans(name, type, price_pkr), templates(name, niche), onboarding_submissions:onboarding_submission_id(ocr_status, ocr_amount, ocr_transaction_id, ocr_payment_method, ocr_recipient_name, ocr_sender_name, ocr_date, ocr_confidence, ocr_notes, ocr_raw, ocr_scanned_at)"
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

  if (isLoading) return <TableSkeleton columns={7} rows={6} />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{counts.total}</p><p className="text-sm text-muted-foreground">Total Orders</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-yellow-600">{counts.pending}</p><p className="text-sm text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-primary">{counts.in_progress}</p><p className="text-sm text-muted-foreground">In Progress</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-primary">{counts.completed}</p><p className="text-sm text-muted-foreground">Completed</p></CardContent></Card>
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
                {selected.payment_method && (() => {
                  const sub = selected.onboarding_submissions ?? {};
                  const ocr = {
                    status: selected.ocr_status ?? sub.ocr_status ?? null,
                    amount: selected.ocr_amount ?? sub.ocr_amount ?? null,
                    transaction_id: selected.ocr_transaction_id ?? sub.ocr_transaction_id ?? null,
                    payment_method: selected.ocr_payment_method ?? sub.ocr_payment_method ?? null,
                    recipient_name: selected.ocr_recipient_name ?? sub.ocr_recipient_name ?? null,
                    sender_name: selected.ocr_sender_name ?? sub.ocr_sender_name ?? null,
                    date: selected.ocr_date ?? sub.ocr_date ?? null,
                    confidence: selected.ocr_confidence ?? sub.ocr_confidence ?? null,
                    notes: selected.ocr_notes ?? sub.ocr_notes ?? null,
                    raw: selected.ocr_raw ?? sub.ocr_raw ?? null,
                    scanned_at: selected.ocr_scanned_at ?? sub.ocr_scanned_at ?? null,
                  };
                  const amountDelta =
                    typeof ocr.amount === "number" && typeof selected.amount === "number"
                      ? ocr.amount - selected.amount
                      : null;
                  const tidMatch =
                    ocr.transaction_id && selected.transaction_id
                      ? ocr.transaction_id.trim().toLowerCase() === selected.transaction_id.trim().toLowerCase()
                      : null;
                  const verdictBadge =
                    ocr.status === "match"
                      ? { icon: CheckCircle2, cls: "bg-primary/10 text-primary border-primary/30", label: "OCR: Match" }
                      : ocr.status === "mismatch"
                      ? { icon: AlertTriangle, cls: "bg-destructive/10 text-destructive border-destructive/30", label: "OCR: Mismatch" }
                      : ocr.status === "unreadable"
                      ? { icon: AlertTriangle, cls: "bg-destructive/10 text-destructive border-destructive/30", label: "OCR: Unreadable" }
                      : { icon: Hourglass, cls: "bg-muted text-muted-foreground border-border", label: "OCR: Pending" };
                  const V = verdictBadge.icon;

                  return (
                    <div className="md:col-span-2 space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 font-semibold text-sm">
                          <ScanLine className="h-4 w-4 text-muted-foreground" />
                          Payment verification
                        </div>
                        <Badge variant="outline" className={`gap-1 ${verdictBadge.cls}`}>
                          <V className="h-3.5 w-3.5" />
                          {verdictBadge.label}
                        </Badge>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3 text-xs">
                        <div className="rounded border border-border/60 bg-background/70 p-3">
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">User-entered</div>
                          <dl className="mt-1 space-y-1">
                            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Method</dt><dd className="font-medium">{selected.payment_method || "—"}</dd></div>
                            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Amount</dt><dd className="font-mono">PKR {selected.amount?.toLocaleString() ?? "—"}</dd></div>
                            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">TxID</dt><dd className="font-mono truncate max-w-[120px]" title={selected.transaction_id || ""}>{selected.transaction_id || "—"}</dd></div>
                          </dl>
                        </div>

                        <div className="rounded border border-border/60 bg-background/70 p-3">
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">OCR-detected</div>
                          <dl className="mt-1 space-y-1">
                            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Method</dt><dd className="font-medium">{ocr.payment_method || "—"}</dd></div>
                            <div className="flex justify-between gap-2">
                              <dt className="text-muted-foreground">Amount</dt>
                              <dd className="font-mono">
                                {ocr.amount != null ? `PKR ${Number(ocr.amount).toLocaleString()}` : "—"}
                                {amountDelta != null && amountDelta !== 0 && (
                                  <span className="ml-1 text-destructive">({amountDelta > 0 ? "+" : ""}{amountDelta.toLocaleString()})</span>
                                )}
                              </dd>
                            </div>
                            <div className="flex justify-between gap-2">
                              <dt className="text-muted-foreground">TxID</dt>
                              <dd className={`font-mono truncate max-w-[120px] ${tidMatch === false ? "text-destructive" : ""}`} title={ocr.transaction_id || ""}>
                                {ocr.transaction_id || "—"}
                              </dd>
                            </div>
                          </dl>
                        </div>

                        <div className="rounded border border-border/60 bg-background/70 p-3">
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Receipt context</div>
                          <dl className="mt-1 space-y-1">
                            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Recipient</dt><dd className="font-medium truncate max-w-[140px]" title={ocr.recipient_name || ""}>{ocr.recipient_name || "—"}</dd></div>
                            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Sender</dt><dd className="font-medium truncate max-w-[140px]" title={ocr.sender_name || ""}>{ocr.sender_name || "—"}</dd></div>
                            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Date</dt><dd className="font-mono">{ocr.date || "—"}</dd></div>
                            <div className="flex justify-between gap-2">
                              <dt className="text-muted-foreground">Confidence</dt>
                              <dd className="font-mono">{ocr.confidence != null ? `${Math.round(Number(ocr.confidence) * 100)}%` : "—"}</dd>
                            </div>
                          </dl>
                        </div>
                      </div>

                      {ocr.notes && (
                        <div className="rounded border border-amber-500/30 bg-amber-500/5 p-2 text-xs text-foreground">
                          <span className="font-semibold">Notes: </span>{ocr.notes}
                        </div>
                      )}

                      <div className="flex items-center justify-between flex-wrap gap-2">
                        {selected.screenshot_url ? (
                          <a
                            href={selected.screenshot_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Open uploaded receipt
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">No receipt uploaded</span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {ocr.scanned_at ? `Scanned ${format(new Date(ocr.scanned_at), "PP p")}` : "Not scanned yet"}
                        </span>
                      </div>

                      {ocr.raw && (
                        <details className="rounded border border-border/60 bg-background/60 p-2 text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            Raw extracted data
                          </summary>
                          <pre className="mt-2 overflow-auto text-[11px] leading-relaxed">
{JSON.stringify(ocr.raw, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  );
                })()}
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
