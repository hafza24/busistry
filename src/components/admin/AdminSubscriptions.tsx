import { useState } from "react";
import { useSubscriptions } from "@/hooks/useNotifications";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format, differenceInDays } from "date-fns";
import { Repeat, MoreHorizontal, PauseCircle, XCircle, PlayCircle } from "lucide-react";
import SubscriptionModerationDialog, { SubModAction } from "./SubscriptionModerationDialog";

export default function AdminSubscriptions() {
  const { data: subs = [], isLoading } = useSubscriptions("all");
  const [target, setTarget] = useState<{ id: string; user_id: string; label: string; status: string } | null>(null);
  const [action, setAction] = useState<SubModAction>("pause");
  const [open, setOpen] = useState(false);

  const now = new Date();
  const stats = {
    total: subs.length,
    active: subs.filter((s) => s.status === "active").length,
    paused: subs.filter((s) => s.status === "paused").length,
    canceled: subs.filter((s) => s.status === "canceled").length,
    dueSoon: subs.filter((s) => differenceInDays(new Date(s.current_period_end), now) <= 7 && s.status === "active").length,
    pastDue: subs.filter((s) => s.status === "past_due" || (s.status === "active" && differenceInDays(new Date(s.current_period_end), now) < 0)).length,
  };

  const openAction = (sub: typeof subs[number], a: SubModAction) => {
    setTarget({ id: sub.id, user_id: sub.user_id, label: sub.label, status: sub.status });
    setAction(a);
    setOpen(true);
  };

  if (isLoading) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{stats.total}</div><div className="text-xs text-muted-foreground">Total</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-emerald-600">{stats.active}</div><div className="text-xs text-muted-foreground">Active</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-amber-600">{stats.dueSoon}</div><div className="text-xs text-muted-foreground">Due in 7 days</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-destructive">{stats.pastDue}</div><div className="text-xs text-muted-foreground">Past due</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-slate-600">{stats.paused}</div><div className="text-xs text-muted-foreground">Paused</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-slate-500">{stats.canceled}</div><div className="text-xs text-muted-foreground">Canceled</div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount (PKR)</TableHead>
                <TableHead>Renews</TableHead>
                <TableHead>Days left</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Auto</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subs.map((s) => {
                const d = differenceInDays(new Date(s.current_period_end), now);
                const overdue = d < 0 || s.status === "past_due";
                const isPaused = s.status === "paused";
                const isCanceled = s.status === "canceled";
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.label}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.source_type}</TableCell>
                    <TableCell>{Number(s.amount_pkr).toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{format(new Date(s.current_period_end), "dd MMM yyyy")}</TableCell>
                    <TableCell className={overdue ? "text-destructive font-medium" : d <= 7 ? "text-amber-600 font-medium" : ""}>{d}d</TableCell>
                    <TableCell>
                      <Badge variant={isCanceled ? "outline" : isPaused ? "secondary" : overdue ? "destructive" : "secondary"}>{s.status}</Badge>
                    </TableCell>
                    <TableCell><Badge variant="outline">{s.auto_renew ? "on" : "off"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!isPaused && !isCanceled && (
                            <DropdownMenuItem onClick={() => openAction(s, "pause")}>
                              <PauseCircle className="h-4 w-4 mr-2" /> Pause
                            </DropdownMenuItem>
                          )}
                          {!isCanceled && (
                            <DropdownMenuItem onClick={() => openAction(s, "cancel")} className="text-destructive focus:text-destructive">
                              <XCircle className="h-4 w-4 mr-2" /> Cancel
                            </DropdownMenuItem>
                          )}
                          {(isPaused || isCanceled) && (
                            <DropdownMenuItem onClick={() => openAction(s, "reactivate")}>
                              <PlayCircle className="h-4 w-4 mr-2" /> Reactivate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!subs.length && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8"><Repeat className="h-6 w-6 mx-auto mb-2" />No subscriptions yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SubscriptionModerationDialog open={open} onOpenChange={setOpen} subscription={target} action={action} />
    </div>
  );
}
