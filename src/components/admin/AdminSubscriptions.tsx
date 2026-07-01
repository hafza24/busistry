import { useSubscriptions } from "@/hooks/useNotifications";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, differenceInDays } from "date-fns";
import { Repeat } from "lucide-react";

export default function AdminSubscriptions() {
  const { data: subs = [], isLoading } = useSubscriptions("all");

  const now = new Date();
  const stats = {
    total: subs.length,
    active: subs.filter((s) => s.status === "active").length,
    dueSoon: subs.filter((s) => differenceInDays(new Date(s.current_period_end), now) <= 7 && s.status === "active").length,
    pastDue: subs.filter((s) => s.status === "past_due" || differenceInDays(new Date(s.current_period_end), now) < 0).length,
  };

  if (isLoading) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{stats.total}</div><div className="text-xs text-muted-foreground">Total subscriptions</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-emerald-600">{stats.active}</div><div className="text-xs text-muted-foreground">Active</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-amber-600">{stats.dueSoon}</div><div className="text-xs text-muted-foreground">Due within 7 days</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-destructive">{stats.pastDue}</div><div className="text-xs text-muted-foreground">Past due</div></CardContent></Card>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {subs.map((s) => {
                const d = differenceInDays(new Date(s.current_period_end), now);
                const overdue = d < 0 || s.status === "past_due";
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.label}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.source_type}</TableCell>
                    <TableCell>{Number(s.amount_pkr).toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{format(new Date(s.current_period_end), "dd MMM yyyy")}</TableCell>
                    <TableCell className={overdue ? "text-destructive font-medium" : d <= 7 ? "text-amber-600 font-medium" : ""}>{d}d</TableCell>
                    <TableCell><Badge variant={overdue ? "destructive" : "secondary"}>{s.status}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{s.auto_renew ? "on" : "off"}</Badge></TableCell>
                  </TableRow>
                );
              })}
              {!subs.length && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8"><Repeat className="h-6 w-6 mx-auto mb-2" />No subscriptions yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
