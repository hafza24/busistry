import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Check, X, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const TYPE_LABEL: Record<string, string> = {
  order: "Website build",
  template: "Template",
  plan: "Plan",
  website_product: "Add-on",
};

interface AdminReview {
  id: string;
  user_id: string;
  target_type: string;
  target_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  item_label?: string;
  user_label?: string;
}

export default function AdminReviewsModeration() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews" as any)
        .select("id, user_id, target_type, target_id, rating, title, comment, is_approved, created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      const list = (data ?? []) as any[];
      if (list.length === 0) return [] as AdminReview[];

      const byType: Record<string, string[]> = {};
      const userIds = Array.from(new Set(list.map((r) => r.user_id)));
      list.forEach((r) => { (byType[r.target_type] ??= []).push(r.target_id); });

      const [tpl, pln, ord, prd, profs] = await Promise.all([
        byType.template?.length ? supabase.from("templates").select("id, name").in("id", byType.template) : Promise.resolve({ data: [] } as any),
        byType.plan?.length ? supabase.from("plans").select("id, name").in("id", byType.plan) : Promise.resolve({ data: [] } as any),
        byType.order?.length ? supabase.from("website_orders").select("id, store_name").in("id", byType.order) : Promise.resolve({ data: [] } as any),
        byType.website_product?.length ? supabase.from("website_products").select("id, name").in("id", byType.website_product) : Promise.resolve({ data: [] } as any),
        userIds.length ? supabase.from("profiles").select("id, full_name").in("id", userIds) : Promise.resolve({ data: [] } as any),
      ]);

      const itemMap = new Map<string, string>();
      (tpl.data ?? []).forEach((r: any) => itemMap.set(`template:${r.id}`, r.name));
      (pln.data ?? []).forEach((r: any) => itemMap.set(`plan:${r.id}`, r.name));
      (ord.data ?? []).forEach((r: any) => itemMap.set(`order:${r.id}`, r.store_name || "Website build"));
      (prd.data ?? []).forEach((r: any) => itemMap.set(`website_product:${r.id}`, r.name));

      const userMap = new Map<string, string>();
      (profs.data ?? []).forEach((r: any) => userMap.set(r.id, r.full_name || ""));

      return list.map<AdminReview>((r) => ({
        ...r,
        item_label: itemMap.get(`${r.target_type}:${r.target_id}`) ?? "(unknown item)",
        user_label: userMap.get(r.user_id) || r.user_id.slice(0, 8),
      }));
    },
  });

  const setApproval = async (id: string, is_approved: boolean) => {
    const { error } = await supabase.from("reviews" as any).update({ is_approved }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: is_approved ? "Approved" : "Hidden" });
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    qc.invalidateQueries({ queryKey: ["item-review-stats"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    const { error } = await supabase.from("reviews" as any).delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted" });
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    qc.invalidateQueries({ queryKey: ["item-review-stats"] });
  };

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (statusFilter === "approved" && !r.is_approved) return false;
      if (statusFilter === "pending" && r.is_approved) return false;
      if (typeFilter !== "all" && r.target_type !== typeFilter) return false;
      if (q) {
        const s = q.toLowerCase();
        if (!(r.title ?? "").toLowerCase().includes(s)
          && !(r.comment ?? "").toLowerCase().includes(s)
          && !(r.item_label ?? "").toLowerCase().includes(s)
          && !(r.user_label ?? "").toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [reviews, q, statusFilter, typeFilter]);

  const pendingCount = reviews.filter((r) => !r.is_approved).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold font-display">Reviews Moderation</h2>
          <p className="text-sm text-muted-foreground">
            {reviews.length} total · {pendingCount} hidden. Approve, hide, or delete individual reviews.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-9 w-56" />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Hidden</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="template">Templates</SelectItem>
              <SelectItem value="plan">Plans</SelectItem>
              <SelectItem value="order">Website builds</SelectItem>
              <SelectItem value="website_product">Add-ons</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No reviews match your filters.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <Card key={r.id} className={!r.is_approved ? "border-orange-500/40" : ""}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{TYPE_LABEL[r.target_type] ?? r.target_type}</Badge>
                      <p className="text-sm font-semibold truncate">{r.item_label}</p>
                      {r.is_approved ? (
                        <Badge className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" variant="outline">Approved</Badge>
                      ) : (
                        <Badge className="text-[10px] bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30" variant="outline">Hidden</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex gap-0.5" aria-label={`Rated ${r.rating} of 5`}>
                        {[1,2,3,4,5].map((n) => (
                          <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                      <span className="text-xs font-semibold">{r.rating}/5</span>
                      <span className="text-[11px] text-muted-foreground">
                        · {r.user_label} · {new Date(r.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {r.is_approved ? (
                      <Button size="sm" variant="outline" onClick={() => setApproval(r.id, false)}>
                        <X className="h-3.5 w-3.5 mr-1" /> Hide
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => setApproval(r.id, true)}>
                        <Check className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => remove(r.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {(r.title || r.comment) && (
                  <div className="rounded-md border border-border/60 bg-muted/30 p-3">
                    {r.title && <p className="text-sm font-medium">{r.title}</p>}
                    {r.comment && <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">{r.comment}</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
