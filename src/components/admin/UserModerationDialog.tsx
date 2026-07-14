import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { logAudit } from "@/lib/audit";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, Ban } from "lucide-react";

type Status = "active" | "suspended" | "blacklisted";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  userName: string;
  currentStatus: Status;
  currentReason?: string | null;
}

const UserModerationDialog = ({ open, onOpenChange, userId, userName, currentStatus, currentReason }: Props) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [status, setStatus] = useState<Status>(currentStatus);
  const [reason, setReason] = useState(currentReason ?? "");

  useEffect(() => {
    if (open) {
      setStatus(currentStatus);
      setReason(currentReason ?? "");
    }
  }, [open, currentStatus, currentReason]);

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          status,
          moderation_reason: status === "active" ? null : reason.trim() || null,
          moderated_at: status === "active" ? null : new Date().toISOString(),
          moderated_by: status === "active" ? null : user?.id ?? null,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", userId);
      if (error) throw error;
      await logAudit({
        action: "role.changed",
        entityType: "profile",
        entityId: userId,
        metadata: { moderation_status: status, reason },
      });
    },
    onSuccess: () => {
      toast.success(`User ${status === "active" ? "reinstated" : status}`);
      qc.invalidateQueries({ queryKey: ["admin_profiles"] });
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to update user status"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Moderate {userName}</DialogTitle>
          <DialogDescription>
            Suspended and blacklisted users are signed out and cannot access the platform.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={status} onValueChange={(v) => setStatus(v as Status)} className="space-y-2">
          <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/40">
            <RadioGroupItem value="active" id="mod-active" className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-medium text-sm"><ShieldCheck className="h-4 w-4 text-primary" /> Active</div>
              <p className="text-xs text-muted-foreground">Normal access to the platform.</p>
            </div>
          </label>
          <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/40">
            <RadioGroupItem value="suspended" id="mod-suspended" className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-medium text-sm"><ShieldOff className="h-4 w-4 text-amber-600" /> Suspended</div>
              <p className="text-xs text-muted-foreground">Temporarily blocked. Can be reinstated later.</p>
            </div>
          </label>
          <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/40">
            <RadioGroupItem value="blacklisted" id="mod-blacklisted" className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-medium text-sm"><Ban className="h-4 w-4 text-destructive" /> Blacklisted</div>
              <p className="text-xs text-muted-foreground">Permanently banned from the platform.</p>
            </div>
          </label>
        </RadioGroup>

        {status !== "active" && (
          <div className="space-y-2">
            <Label htmlFor="mod-reason">Reason (visible to the user)</Label>
            <Textarea
              id="mod-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this account being restricted?"
              rows={3}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || (status !== "active" && !reason.trim())}
            variant={status === "blacklisted" ? "destructive" : "default"}
          >
            {mutation.isPending ? "Saving…" : "Apply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserModerationDialog;
