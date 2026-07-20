import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Clock, MinusCircle } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const StatusPill = ({ status, error }: { status: string; error?: string | null }) => {
  const map: Record<string, { icon: any; cls: string; label: string }> = {
    sent: { icon: CheckCircle2, cls: "bg-primary/15 text-primary", label: "Sent" },
    failed: { icon: XCircle, cls: "bg-destructive/15 text-destructive", label: "Failed" },
    queued: { icon: Clock, cls: "bg-amber-500/15 text-amber-700", label: "Queued" },
    skipped: { icon: MinusCircle, cls: "bg-muted text-muted-foreground", label: "Skipped" },
  };
  const cfg = map[status] ?? map.queued;
  const Icon = cfg.icon;
  return (
    <div className="space-y-0.5">
      <Badge className={`${cfg.cls} hover:${cfg.cls}`}><Icon className="h-3 w-3 mr-1" />{cfg.label}</Badge>
      {error && <div className="text-[10px] text-muted-foreground break-all max-w-[280px]">{error}</div>}
    </div>
  );
};

const ModerationLogsDialog = ({ open, onOpenChange }: Props) => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["moderation_logs"],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moderation_notification_logs" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as any[];
    },
  });

  const userIds = Array.from(new Set((logs ?? []).map((l) => l.user_id)));
  const { data: profiles } = useQuery({
    queryKey: ["moderation_logs_profiles", userIds.join(",")],
    enabled: open && userIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
      if (error) throw error;
      const map: Record<string, string> = {};
      (data ?? []).forEach((p: any) => { map[p.id] = p.full_name || "Unnamed"; });
      return map;
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Moderation notification log</DialogTitle>
          <DialogDescription>
            Delivery status for the last 100 moderation notices sent to users.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>In-app</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">Loading…</TableCell></TableRow>}
              {!isLoading && (logs ?? []).length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No moderation notifications yet</TableCell></TableRow>
              )}
              {(logs ?? []).map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(l.created_at), "dd MMM HH:mm")}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{profiles?.[l.user_id] ?? l.user_id.slice(0, 8)}</div>
                    {l.email_to && <div className="text-xs text-muted-foreground">{l.email_to}</div>}
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{l.moderation_status}</Badge></TableCell>
                  <TableCell><StatusPill status={l.in_app_status} error={l.in_app_error} /></TableCell>
                  <TableCell><StatusPill status={l.email_status} error={l.email_error} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={l.reason ?? ""}>{l.reason || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ModerationLogsDialog;
