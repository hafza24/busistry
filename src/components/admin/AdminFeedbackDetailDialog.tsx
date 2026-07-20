import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, Star, StarOff, Mail, Phone, User, Calendar, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { logAudit, type AuditAction } from "@/lib/audit";
import { useState } from "react";
import ConfirmDialog from "@/components/ui/confirm-dialog";

type PendingAction = {
  patch: Partial<{ approved: boolean; status: string; approved_at: string; featured: boolean }>;
  action: AuditAction;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  successMsg: string;
} | null;

interface Props {
  submissionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StatusBadge = ({ status, approved }: { status: string; approved: boolean }) => {
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  if (approved) return <Badge className="bg-primary hover:bg-primary">Approved</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
};

const Stars = ({ n }: { n: number }) => (
  <div className="flex gap-0.5" aria-label={`Rated ${n} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className={`h-4 w-4 ${i <= n ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} aria-hidden="true" />
    ))}
  </div>
);

const actionLabel = (a: string) =>
  a.replace(/^feedback\./, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const AdminFeedbackDetailDialog = ({ submissionId, open, onOpenChange }: Props) => {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<PendingAction>(null);

  const { data: submission, isLoading } = useQuery({
    queryKey: ["admin-feedback-detail", submissionId],
    queryFn: async () => {
      if (!submissionId) return null;
      const { data, error } = await supabase
        .from("feedback_submissions")
        .select("*")
        .eq("id", submissionId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!submissionId && open,
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["admin-feedback-history", submissionId],
    queryFn: async () => {
      if (!submissionId) return [];
      const { data, error } = await supabase
        .from("audit_logs")
        .select("id, action, actor_email, metadata, created_at")
        .eq("entity_type", "feedback")
        .eq("entity_id", submissionId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!submissionId && open,
  });

  const act = async (
    patch: Partial<{ approved: boolean; status: string; approved_at: string; featured: boolean }>,
    action: AuditAction,
    successMsg: string,
  ) => {
    if (!submission) return;
    setBusy(true);
    try {
      const { error } = await supabase
        .from("feedback_submissions")
        .update(patch)
        .eq("id", submission.id);
      if (error) throw error;

      const audit = await logAudit({
        action, entityType: "feedback", entityId: submission.id,
        metadata: patch as Record<string, unknown>,
      });
      if (!audit.ok) {
        toast.warning(`${successMsg} — audit log failed`, {
          description: audit.error ?? "The action succeeded but was not recorded in the audit trail.",
        });
      } else {
        toast.success(successMsg);
      }

      qc.invalidateQueries({ queryKey: ["admin-feedback"] });
      qc.invalidateQueries({ queryKey: ["admin-feedback-detail", submission.id] });
      qc.invalidateQueries({ queryKey: ["admin-feedback-history", submission.id] });
      qc.invalidateQueries({ queryKey: ["public-reviews"] });
      qc.invalidateQueries({ queryKey: ["feedback-stats"] });
    } catch (e: any) {
      toast.error("Action failed", { description: e?.message ?? "Please try again." });
    } finally {
      setBusy(false);
    }
  };

  const askReject = () => setPending({
    patch: { approved: false, status: "rejected" },
    action: "feedback.rejected",
    title: "Reject feedback?",
    description: "This submission will be hidden from public reviews. You can approve it again later.",
    confirmLabel: "Reject",
    destructive: true,
    successMsg: "Feedback rejected",
  });
  const askApprove = () => setPending({
    patch: { approved: true, status: "approved", approved_at: new Date().toISOString() },
    action: "feedback.approved",
    title: "Approve feedback?",
    description: "This submission will become publicly visible in reviews.",
    confirmLabel: "Approve",
    successMsg: "Feedback approved and published",
  });
  const askToggleFeature = () => {
    if (!submission) return;
    const featured = !!submission.featured;
    setPending({
      patch: { featured: !featured },
      action: featured ? "feedback.unfeatured" : "feedback.featured",
      title: featured ? "Remove from featured?" : "Feature this review?",
      description: featured
        ? "This review will no longer be highlighted on the homepage."
        : "This review will be pinned as a featured review on the homepage.",
      confirmLabel: featured ? "Unfeature" : "Feature",
      successMsg: featured ? "Removed from featured" : "Marked as featured",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Feedback submission</DialogTitle>
          <DialogDescription>Review the full submission and its moderation history.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 -mr-4">
          {isLoading || !submission ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-lg break-words">{submission.subject}</h3>
                  <div className="flex items-center gap-2 flex-wrap mt-1.5">
                    <StatusBadge status={submission.status} approved={submission.approved} />
                    {submission.featured && <Badge className="bg-yellow-500 hover:bg-yellow-500">Featured</Badge>}
                    {submission.category && <Badge variant="outline">{submission.category}</Badge>}
                    {submission.rating && <Stars n={submission.rating} />}
                  </div>
                </div>
              </div>

              <div className="rounded-md border bg-muted/30 p-4">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{submission.message}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" aria-hidden="true" />
                  <span className="truncate font-mono text-xs">{submission.user_id?.slice(0, 8)}…</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  {new Date(submission.created_at).toLocaleString()}
                </div>
                {submission.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    <span className="truncate">{submission.email}</span>
                  </div>
                )}
                {submission.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {submission.phone}
                  </div>
                )}
              </div>

              {submission.allow_contact && (
                <p className="text-xs text-primary dark:text-primary">
                  ✓ User allows follow-up contact
                </p>
              )}

              <Separator />

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ScrollText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <h4 className="font-semibold text-sm">Audit history</h4>
                </div>
                {historyLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : !history?.length ? (
                  <p className="text-sm text-muted-foreground">No moderation actions yet.</p>
                ) : (
                  <ol className="space-y-2">
                    {history.map((h) => (
                      <li key={h.id} className="flex gap-3 text-sm border-l-2 border-primary/30 pl-3 py-1">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{actionLabel(h.action)}</div>
                          <div className="text-xs text-muted-foreground">
                            {h.actor_email ?? "system"} · {new Date(h.created_at).toLocaleString()}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex-wrap gap-2 sm:justify-between border-t pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>Close</Button>
          <div className="flex gap-2 flex-wrap">
            {submission && submission.status !== "rejected" && (
              <Button variant="outline" disabled={busy} onClick={askReject}>
                <X className="h-4 w-4 mr-1.5" aria-hidden="true" /> Reject
              </Button>
            )}
            {submission && !submission.approved && (
              <Button disabled={busy} onClick={askApprove}>
                <Check className="h-4 w-4 mr-1.5" aria-hidden="true" /> Approve
              </Button>
            )}
            {submission?.approved && (
              <Button variant="secondary" disabled={busy} onClick={askToggleFeature}>
                {submission.featured
                  ? <><StarOff className="h-4 w-4 mr-1.5" aria-hidden="true" /> Unfeature</>
                  : <><Star className="h-4 w-4 mr-1.5" aria-hidden="true" /> Feature</>}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => { if (!o) setPending(null); }}
        title={pending?.title ?? ""}
        description={pending?.description ?? ""}
        confirmLabel={pending?.confirmLabel ?? "Confirm"}
        destructive={pending?.destructive}
        onConfirm={async () => {
          if (!pending) return;
          await act(pending.patch, pending.action, pending.successMsg);
          setPending(null);
        }}
      />
    </Dialog>
  );
};

export default AdminFeedbackDetailDialog;
