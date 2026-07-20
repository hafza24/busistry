import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, X, RotateCcw, MessageSquarePlus, Trash2 } from "lucide-react";
import { useSetPromptState, useSubmitReview, ReviewTargetType } from "@/hooks/useReviews";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import ReviewDialog from "@/components/reviews/ReviewDialog";
import { Skeleton } from "@/components/ui/skeleton";

const TYPE_LABEL: Record<string, string> = {
  order: "Website build",
  template: "Template",
  plan: "Plan",
  website_product: "Add-on",
};

const STATE_STYLE: Record<string, string> = {
  never: "bg-destructive/15 text-destructive border-destructive/30",
  later: "bg-orange-500/15 text-orange-700 border-orange-500/30 dark:text-orange-400",
  reviewed: "bg-primary/15 text-primary border-primary/30 dark:text-primary",
  pending: "bg-muted text-muted-foreground",
};

interface Row {
  id: string;
  target_type: ReviewTargetType;
  target_id: string;
  state: string;
  last_prompted_at: string | null;
  updated_at: string;
  label: string;
  review_id: string | null;
  review_rating: number | null;
  review_title: string | null;
  review_comment: string | null;
  review_created_at: string | null;
}

export default function MyReviewPreferences() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const setState = useSetPromptState();
  const { toast } = useToast();
  const [active, setActive] = useState<{ target_type: ReviewTargetType; target_id: string; label: string } | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["my-review-preferences", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: prefs, error } = await supabase
        .from("review_prompt_state" as any)
        .select("id, target_type, target_id, state, last_prompted_at, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;

      const list = (prefs ?? []) as any[];
      if (list.length === 0) return [] as Row[];

      // Group by target_type to resolve labels + existing reviews
      const byType: Record<string, string[]> = {};
      list.forEach((r) => { (byType[r.target_type] ??= []).push(r.target_id); });

      const labelMap = new Map<string, string>();
      const templateIds = byType.template ?? [];
      const planIds = byType.plan ?? [];
      const orderIds = byType.order ?? [];
      const productIds = byType.website_product ?? [];

      const [tpl, pln, ord, prd, myReviews] = await Promise.all([
        templateIds.length ? supabase.from("templates").select("id, name").in("id", templateIds) : Promise.resolve({ data: [] as any[] } as any),
        planIds.length ? supabase.from("plans").select("id, name").in("id", planIds) : Promise.resolve({ data: [] as any[] } as any),
        orderIds.length ? supabase.from("website_orders").select("id, store_name").in("id", orderIds) : Promise.resolve({ data: [] as any[] } as any),
        productIds.length ? supabase.from("website_products").select("id, name").in("id", productIds) : Promise.resolve({ data: [] as any[] } as any),
        supabase.from("reviews" as any).select("id, target_type, target_id, rating, title, comment, created_at").eq("user_id", user!.id),
      ]);

      (tpl.data ?? []).forEach((r: any) => labelMap.set(`template:${r.id}`, r.name));
      (pln.data ?? []).forEach((r: any) => labelMap.set(`plan:${r.id}`, r.name));
      (ord.data ?? []).forEach((r: any) => labelMap.set(`order:${r.id}`, r.store_name || "Website build"));
      (prd.data ?? []).forEach((r: any) => labelMap.set(`website_product:${r.id}`, r.name));

      const reviewMap = new Map<string, any>();
      ((myReviews.data ?? []) as any[]).forEach((r) => reviewMap.set(`${r.target_type}:${r.target_id}`, r));

      return list.map<Row>((r) => {
        const rev = reviewMap.get(`${r.target_type}:${r.target_id}`);
        return {
          id: r.id,
          target_type: r.target_type,
          target_id: r.target_id,
          state: r.state,
          last_prompted_at: r.last_prompted_at,
          updated_at: r.updated_at,
          label: labelMap.get(`${r.target_type}:${r.target_id}`) ?? "(unknown item)",
          review_id: rev?.id ?? null,
          review_rating: rev?.rating ?? null,
          review_title: rev?.title ?? null,
          review_comment: rev?.comment ?? null,
          review_created_at: rev?.created_at ?? null,
        };
      });
    },
  });

  const change = async (row: Row, next: "later" | "never" | "pending") => {
    try {
      if (next === "pending") {
        // Clear the row so it appears in prompts again
        const { error } = await supabase.from("review_prompt_state" as any).delete().eq("id", row.id);
        if (error) throw error;
      } else {
        await setState.mutateAsync({ target_type: row.target_type, target_id: row.target_id, state: next });
      }
      toast({ title: "Preference updated" });
      qc.invalidateQueries({ queryKey: ["my-review-preferences"] });
      qc.invalidateQueries({ queryKey: ["pending-review-prompts"] });
    } catch (e: any) {
      toast({ title: "Could not update", description: e.message, variant: "destructive" });
    }
  };

  const deleteReview = async (row: Row) => {
    if (!row.review_id) return;
    if (!confirm("Delete your review? You'll be asked to review this again.")) return;
    try {
      const { error: e1 } = await supabase.from("reviews" as any).delete().eq("id", row.review_id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("review_prompt_state" as any).delete().eq("id", row.id);
      if (e2) throw e2;
      toast({ title: "Review removed" });
      qc.invalidateQueries({ queryKey: ["my-review-preferences"] });
      qc.invalidateQueries({ queryKey: ["pending-review-prompts"] });
      qc.invalidateQueries({ queryKey: ["item-review-stats"] });
    } catch (e: any) {
      toast({ title: "Could not remove", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" /> Review preferences
          </CardTitle>
          <CardDescription>
            Manage which purchased items are hidden from the review prompt, and change your choices anytime.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No preferences saved yet. When the review popup appears on your dashboard, your choices will show up here.
            </p>
          ) : (
            rows.map((row) => (
              <div key={row.id} className="p-3 rounded-lg border border-border/60 bg-card/60 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{TYPE_LABEL[row.target_type] ?? row.target_type}</Badge>
                      <p className="text-sm font-medium truncate">{row.label}</p>
                      <Badge variant="outline" className={`text-[10px] capitalize ${STATE_STYLE[row.state] ?? ""}`}>{row.state}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Updated {new Date(row.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {row.state === "reviewed" ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setActive({ target_type: row.target_type, target_id: row.target_id, label: row.label })}>
                          <MessageSquarePlus className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteReview(row)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" onClick={() => setActive({ target_type: row.target_type, target_id: row.target_id, label: row.label })}>
                          <MessageSquarePlus className="h-3.5 w-3.5 mr-1" /> Review
                        </Button>
                        {row.state !== "later" && (
                          <Button size="sm" variant="ghost" onClick={() => change(row, "later")}>
                            <Clock className="h-3.5 w-3.5 mr-1" /> Later
                          </Button>
                        )}
                        {row.state !== "never" && (
                          <Button size="sm" variant="ghost" onClick={() => change(row, "never")}>
                            <X className="h-3.5 w-3.5 mr-1" /> Never
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => change(row, "pending")} title="Show in prompt again">
                          <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {row.state === "reviewed" && row.review_rating !== null && (
                  <div className="rounded-md border border-border/60 bg-muted/30 p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex gap-0.5" aria-label={`Rated ${row.review_rating} of 5`}>
                        {[1,2,3,4,5].map((n) => (
                          <Star key={n} className={`h-4 w-4 ${n <= (row.review_rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                      <span className="text-xs font-semibold">{row.review_rating}/5</span>
                      {row.review_created_at && (
                        <span className="text-[11px] text-muted-foreground">
                          · {new Date(row.review_created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                    </div>
                    {row.review_title && <p className="text-sm font-medium">{row.review_title}</p>}
                    {row.review_comment && <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">{row.review_comment}</p>}
                    {!row.review_title && !row.review_comment && (
                      <p className="text-xs text-muted-foreground italic">Rating only — no written feedback.</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {active && (
        <ReviewDialog
          open={!!active}
          onOpenChange={(v) => !v && setActive(null)}
          targetType={active.target_type}
          targetId={active.target_id}
          label={active.label}
          onSubmitted={() => qc.invalidateQueries({ queryKey: ["my-review-preferences"] })}
        />
      )}
    </div>
  );
}
