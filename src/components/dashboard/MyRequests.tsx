import { useStoreRequests } from "@/hooks/useStores";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle, Zap } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CardGridSkeleton } from "@/components/ui/loading-skeletons";

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock, label: "Pending" },
  under_review: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: AlertCircle, label: "Under Review" },
  approved: { color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle2, label: "Approved" },
  rejected: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle, label: "Rejected" },
  activated: { color: "bg-primary/10 text-primary border-primary/20", icon: Zap, label: "Activated" },
  suspended: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle, label: "Suspended" },
  expired: { color: "bg-muted text-muted-foreground border-border", icon: Clock, label: "Expired" },
};

const pipelineSteps = ["pending", "under_review", "approved", "activated"];

const StatusPipeline = ({ currentStatus }: { currentStatus: string }) => {
  const currentIndex = pipelineSteps.indexOf(currentStatus);
  const isRejected = currentStatus === "rejected";

  return (
    <div className="flex items-center gap-1 w-full mt-3">
      {pipelineSteps.map((step, i) => {
        const isComplete = currentIndex >= i;
        const isCurrent = currentStatus === step;
        return (
          <div key={step} className="flex-1 flex flex-col items-center">
            <div
              className={`h-2 w-full rounded-full transition-colors ${
                isRejected
                  ? "bg-destructive/20"
                  : isComplete
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            />
            <span className={`text-[10px] mt-1 ${isCurrent ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {step.replace("_", " ")}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const MyRequests = () => {
  const { data: requests, isLoading, isError, refetch } = useStoreRequests();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-display text-foreground">My Requests</h2>
        <CardGridSkeleton count={3} columns={1} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-display text-foreground">My Requests</h2>

      {isError ? (
        <ErrorState message="We couldn't load your requests." onRetry={() => refetch()} />
      ) : !requests || requests.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No requests yet"
          description="Your store requests will appear here once you launch a store."
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const config = statusConfig[req.status] || statusConfig.pending;
            const Icon = config.icon;
            return (
              <Card key={req.id} className="border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-display text-lg flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {req.store_name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {(req as any).templates?.name} • {(req as any).plans?.name}
                        {req.amount ? ` • PKR ${req.amount.toLocaleString()}` : ""}
                      </p>
                    </div>
                    <Badge variant="outline" className={config.color}>
                      {config.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground mb-1">
                    Submitted {format(new Date(req.created_at), "MMM d, yyyy 'at' h:mm a")}
                    {req.payment_method && ` • ${req.payment_method.replace("_", " ")}`}
                    {req.transaction_id && ` • TxID: ${req.transaction_id}`}
                  </div>
                  {req.admin_notes && (
                    <div className="mt-2 p-2 bg-muted rounded-md text-sm text-muted-foreground">
                      <strong>Admin Note:</strong> {req.admin_notes}
                    </div>
                  )}
                  <StatusPipeline currentStatus={req.status} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyRequests;
