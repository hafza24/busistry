import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { Check, X, Star, StarOff, Search, MessageSquare } from "lucide-react";
import { logAudit, type AuditAction } from "@/lib/audit";

type FilterStatus = "all" | "pending" | "approved" | "rejected";

const PAGE_SIZE = 15;

const AdminFeedbackModeration = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FilterStatus>("pending");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-feedback", status, search, page],
    queryFn: async () => {
      let q = supabase
        .from("feedback_submissions")
        .select("id,subject,message,rating,category,email,status,approved,featured,allow_contact,created_at", { count: "exact" })
        .order("created_at", { ascending: false });

      if (status === "approved") q = q.eq("approved", true);
      else if (status === "rejected") q = q.eq("status", "rejected");
      else if (status === "pending") q = q.eq("approved", false).neq("status", "rejected");

      if (search.trim()) {
        const s = search.trim().replace(/[%,]/g, "");
        q = q.or(`subject.ilike.%${s}%,message.ilike.%${s}%,email.ilike.%${s}%`);
      }

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error, count } = await q.range(from, to);
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE)),
    [data?.count],
  );

  const mutate = async (
    id: string,
    patch: Partial<{ approved: boolean; status: string; approved_at: string; featured: boolean }>,
    action: AuditAction,
  ) => {
    setBusyId(id);
    try {
      const { error } = await supabase
        .from("feedback_submissions")
        .update(patch)
        .eq("id", id);
      if (error) throw error;
      logAudit({ action, entityType: "feedback", entityId: id, metadata: patch as Record<string, unknown> });
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin-feedback"] });
      qc.invalidateQueries({ queryKey: ["public-reviews"] });
      qc.invalidateQueries({ queryKey: ["feedback-stats"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update");
    } finally {
      setBusyId(null);
    }
  };

  const approve = (id: string) =>
    mutate(
      id,
      { approved: true, status: "approved", approved_at: new Date().toISOString() },
      "feedback.approved",
    );
  const reject = (id: string) =>
    mutate(id, { approved: false, status: "rejected" }, "feedback.rejected");
  const toggleFeature = (id: string, featured: boolean) =>
    mutate(id, { featured: !featured }, featured ? "feedback.unfeatured" : "feedback.featured");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <form onSubmit={onSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subject, message, or email"
              className="pl-9"
              aria-label="Search feedback"
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
        <Select value={status} onValueChange={(v) => { setStatus(v as FilterStatus); setPage(1); }}>
          <SelectTrigger className="w-full md:w-48" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !data?.rows.length ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
              <MessageSquare className="h-8 w-8 opacity-50" aria-hidden="true" />
              <p>No feedback found for this filter.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submission</TableHead>
                  <TableHead className="w-24">Rating</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-32">Date</TableHead>
                  <TableHead className="w-56 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-md">
                      <div className="font-medium line-clamp-1">{r.subject}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{r.message}</div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {r.category && <Badge variant="outline" className="text-[10px]">{r.category}</Badge>}
                        {r.email && <span className="text-[11px] text-muted-foreground">{r.email}</span>}
                        {r.featured && <Badge className="text-[10px] bg-yellow-500 hover:bg-yellow-500">Featured</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {r.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                          <span className="text-sm">{r.rating}</span>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      {r.status === "rejected" ? (
                        <Badge variant="destructive">Rejected</Badge>
                      ) : r.approved ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-600">Approved</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {!r.approved && r.status !== "rejected" && (
                          <Button size="sm" variant="default" disabled={busyId === r.id} onClick={() => approve(r.id)} aria-label="Approve">
                            <Check className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}
                        {r.status !== "rejected" && (
                          <Button size="sm" variant="outline" disabled={busyId === r.id} onClick={() => reject(r.id)} aria-label="Reject">
                            <X className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}
                        {r.approved && (
                          <Button size="sm" variant="ghost" disabled={busyId === r.id} onClick={() => toggleFeature(r.id, r.featured)} aria-label={r.featured ? "Unfeature" : "Feature"}>
                            {r.featured ? <StarOff className="h-4 w-4" aria-hidden="true" /> : <Star className="h-4 w-4" aria-hidden="true" />}
                          </Button>
                        )}
                        {r.status === "rejected" && (
                          <Button size="sm" variant="outline" disabled={busyId === r.id} onClick={() => approve(r.id)} aria-label="Approve">
                            <Check className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                aria-disabled={page === 1}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
              const p = i + 1;
              return (
                <PaginationItem key={p}>
                  <PaginationLink href="#" isActive={p === page} onClick={(e) => { e.preventDefault(); setPage(p); }}>
                    {p}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
                aria-disabled={page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default AdminFeedbackModeration;
