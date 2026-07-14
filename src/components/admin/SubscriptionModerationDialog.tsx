import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export type SubModAction = "pause" | "cancel" | "reactivate";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  subscription: { id: string; user_id: string; label: string; status: string } | null;
  action: SubModAction;
}

const actionMeta: Record<SubModAction, { title: string; newStatus: string; verb: string; needsReason: boolean }> = {
  pause: { title: "Pause subscription", newStatus: "paused", verb: "paused", needsReason: true },
  cancel: { title: "Cancel subscription", newStatus: "canceled", verb: "canceled", needsReason: true },
  reactivate: { title: "Reactivate subscription", newStatus: "active", verb: "reactivated", needsReason: false },
};

export default function SubscriptionModerationDialog({ open, onOpenChange, subscription, action }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [reason, setReason] = useState("");
  const meta = actionMeta[action];

  const mutation = useMutation({
    mutationFn: async () => {
      if (!subscription) throw new Error("No subscription");
      if (meta.needsReason && !reason.trim()) throw new Error("Reason is required");

      const patch: Record<string, unknown> = {
        status: meta.newStatus,
        moderated_by: user?.id ?? null,
        moderated_at: new Date().toISOString(),
        moderation_reason: meta.needsReason ? reason.trim() : null,
      };
      if (action === "pause" || action === "cancel") patch.auto_renew = false;

      const { error } = await supabase.from("subscriptions" as any).update(patch).eq("id", subscription.id);
      if (error) throw error;

      // In-app notification for the user
      await supabase.from("notifications").insert({
        user_id: subscription.user_id,
        audience: "user",
        type: "moderation",
        title: `Your subscription was ${meta.verb}`,
        body: `${subscription.label}${meta.needsReason && reason.trim() ? ` — Reason: ${reason.trim()}` : ""}`,
        metadata: {
          subscription_id: subscription.id,
          action,
          reason: meta.needsReason ? reason.trim() : null,
        } as any,
      } as any);
    },
    onSuccess: () => {
      toast.success(`Subscription ${meta.verb}`);
      qc.invalidateQueries({ queryKey: ["subscriptions"] });
      setReason("");
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{meta.title}</DialogTitle>
          <DialogDescription>
            {subscription?.label ?? ""} — the user will be notified in-app.
          </DialogDescription>
        </DialogHeader>
        {meta.needsReason && (
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (shared with the user)</Label>
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={4} placeholder="Explain why this subscription is being paused/canceled…" />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            variant={action === "cancel" ? "destructive" : "default"}
            disabled={mutation.isPending || (meta.needsReason && !reason.trim())}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Working…" : meta.title}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
