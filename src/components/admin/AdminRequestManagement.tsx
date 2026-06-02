import { useState } from "react";
import { format } from "date-fns";
import { useAllStoreRequests, useUpdateRequestStatus, useActivateStore } from "@/hooks/useAdmin";
import { usePlans } from "@/hooks/useStores";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Eye, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/ui/loading-skeletons";
import { ErrorState } from "@/components/ui/error-state";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  under_review: "bg-blue-100 text-blue-800 border-blue-300",
  approved: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  activated: "bg-emerald-100 text-emerald-800 border-emerald-300",
  suspended: "bg-orange-100 text-orange-800 border-orange-300",
  expired: "bg-gray-100 text-gray-800 border-gray-300",
};

const AdminRequestManagement = () => {
  const { data: requests, isLoading, isError, refetch } = useAllStoreRequests();
  const { data: plans } = usePlans();
  const updateStatus = useUpdateRequestStatus();
  const activateStore = useActivateStore();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = requests?.filter(
    (r) => filterStatus === "all" || r.status === filterStatus
  );

  const handleApprove = async (req: any) => {
    try {
      await updateStatus.mutateAsync({ id: req.id, status: "approved", admin_notes: adminNotes || undefined });
      toast.success("Request approved");
      setSelectedRequest(null);
      setAdminNotes("");
    } catch { toast.error("Failed to approve"); }
  };

  const handleReject = async (req: any) => {
    if (!adminNotes.trim()) { toast.error("Please add notes for rejection"); return; }
    try {
      await updateStatus.mutateAsync({ id: req.id, status: "rejected", admin_notes: adminNotes });
      toast.success("Request rejected");
      setSelectedRequest(null);
      setAdminNotes("");
    } catch { toast.error("Failed to reject"); }
  };

  const handleActivate = async (req: any) => {
    const plan = plans?.find((p) => p.id === req.plan_id);
    try {
      await activateStore.mutateAsync({
        requestId: req.id,
        storeName: req.store_name,
        userId: req.user_id,
        planId: req.plan_id,
        templateId: req.template_id,
        durationDays: plan?.duration_days ?? null,
      });
      toast.success("Store activated!");
      setSelectedRequest(null);
    } catch { toast.error("Failed to activate store"); }
  };

  if (isLoading) return <TableSkeleton columns={8} rows={6} />;
  if (isError) return <ErrorState message="We couldn't load requests." onRetry={() => refetch()} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="activated">Activated</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered?.length ?? 0} requests</span>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.store_name}</TableCell>
                  <TableCell>{req.templates?.name ?? "—"}</TableCell>
                  <TableCell>{req.plans?.name ?? "—"}</TableCell>
                  <TableCell>{req.amount ? `₨${req.amount.toLocaleString()}` : "Free"}</TableCell>
                  <TableCell>
                    <div className="text-xs">
                      {req.payment_method ? req.payment_method.replace("_", " ") : "—"}
                      {req.transaction_id && <div className="text-muted-foreground">TxID: {req.transaction_id}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[req.status] ?? ""}>
                      {req.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(req.created_at), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => { setSelectedRequest(req); setAdminNotes(req.admin_notes ?? ""); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!filtered || filtered.length === 0) && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No requests found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest} onOpenChange={(o) => !o && setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request: {selectedRequest?.store_name}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Template:</span> {selectedRequest.templates?.name}</div>
                <div><span className="text-muted-foreground">Plan:</span> {selectedRequest.plans?.name}</div>
                <div><span className="text-muted-foreground">Amount:</span> {selectedRequest.amount ? `₨${selectedRequest.amount.toLocaleString()}` : "Free"}</div>
                <div><span className="text-muted-foreground">Payment:</span> {selectedRequest.payment_method?.replace("_", " ") ?? "N/A"}</div>
                <div><span className="text-muted-foreground">TxID:</span> {selectedRequest.transaction_id ?? "N/A"}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={statusColors[selectedRequest.status]}>{selectedRequest.status}</Badge></div>
              </div>

              {selectedRequest.screenshot_url && (
                <div>
                  <span className="text-sm text-muted-foreground">Payment Screenshot:</span>
                  <img src={selectedRequest.screenshot_url} alt="Payment proof" className="mt-1 rounded-lg border border-border max-h-48 object-contain" />
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Add notes about this request..." />
              </div>

              <DialogFooter className="gap-2">
                {selectedRequest.status === "pending" && (
                  <>
                    <Button variant="outline" onClick={() => updateStatus.mutateAsync({ id: selectedRequest.id, status: "under_review", admin_notes: adminNotes || undefined }).then(() => { toast.success("Marked under review"); setSelectedRequest(null); })}>
                      <Clock className="h-4 w-4 mr-1" /> Review
                    </Button>
                    <Button variant="destructive" onClick={() => handleReject(selectedRequest)} disabled={updateStatus.isPending}>
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                    <Button onClick={() => handleApprove(selectedRequest)} disabled={updateStatus.isPending}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </Button>
                  </>
                )}
                {selectedRequest.status === "under_review" && (
                  <>
                    <Button variant="destructive" onClick={() => handleReject(selectedRequest)} disabled={updateStatus.isPending}>
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                    <Button onClick={() => handleApprove(selectedRequest)} disabled={updateStatus.isPending}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </Button>
                  </>
                )}
                {selectedRequest.status === "approved" && (
                  <Button onClick={() => handleActivate(selectedRequest)} disabled={activateStore.isPending}>
                    {activateStore.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                    Activate Store
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRequestManagement;
