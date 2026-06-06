import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/loading-skeletons";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { ScrollText } from "lucide-react";

interface AuditLogRow {
  id: string;
  user_id: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  user_agent: string | null;
  created_at: string;
}

const actionVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
  if (action.includes("failed") || action.includes("deleted") || action.includes("rejected")) return "destructive";
  if (action.includes("role") || action.includes("verified") || action.includes("activated")) return "default";
  return "secondary";
};

const AdminAuditLogs = () => {
  const [q, setQ] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin_audit_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as AuditLogRow[];
    },
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = q.trim().toLowerCase();
    if (!term) return data;
    return data.filter(
      (r) =>
        r.action.toLowerCase().includes(term) ||
        (r.actor_email ?? "").toLowerCase().includes(term) ||
        (r.entity_type ?? "").toLowerCase().includes(term),
    );
  }, [data, q]);

  if (isLoading) return <TableSkeleton columns={4} rows={8} />;
  if (isError) return <ErrorState message="Couldn't load audit logs." onRetry={() => refetch()} />;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <ScrollText className="h-8 w-8 text-primary" aria-hidden="true" />
          <div className="flex-1">
            <div className="text-2xl font-bold font-display">{data?.length ?? 0}</div>
            <div className="text-sm text-muted-foreground">Recent activity events (latest 500)</div>
          </div>
          <Input
            placeholder="Filter by action, email, entity…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-xs"
            aria-label="Filter audit logs"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Entity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(row.created_at), "dd MMM yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={actionVariant(row.action)} className="font-mono text-[11px]">
                      {row.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{row.actor_email ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.entity_type ? `${row.entity_type}${row.entity_id ? `:${row.entity_id.slice(0, 8)}` : ""}` : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No matching activity.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuditLogs;
