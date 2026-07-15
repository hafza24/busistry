import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Quote, Search, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import FeedbackDialog from "@/components/feedback/FeedbackDialog";

const Stars = ({ value, size = "h-4 w-4" }: { value: number; size?: string }) => (
  <div className="flex gap-0.5" aria-label={`Rated ${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={cn(
          size,
          n <= Math.round(value) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40",
        )}
        aria-hidden="true"
      />
    ))}
  </div>
);

type SortKey = "recent" | "top" | "lowest";
type FilterKey = "all" | "5" | "4" | "3" | "2" | "1";

const Reviews = () => {
  const [sort, setSort] = useState<SortKey>("recent");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const { data: stats } = useQuery({
    queryKey: ["feedback-rating-distribution"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_feedback_rating_distribution");
      if (error) throw error;
      return data?.[0] ?? {
        total_reviews: 0,
        avg_rating: 0,
        rating_5: 0,
        rating_4: 0,
        rating_3: 0,
        rating_2: 0,
        rating_1: 0,
      };
    },
  });

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["public-reviews-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_feedback_reviews" as any)
        .select("id, subject, message, rating, featured, created_at")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const avg = Number(stats?.avg_rating ?? 0);
  const total = Number(stats?.total_reviews ?? 0);

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = Number((stats as any)?.[`rating_${star}`] ?? 0);
    const pct = total > 0 ? (count / total) * 100 : 0;
    return { star, count, pct };
  });

  const filtered = useMemo(() => {
    let list = reviews ?? [];
    if (filter !== "all") {
      const n = Number(filter);
      list = list.filter((r) => Math.round(Number(r.rating)) === n);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (r) =>
          (r.subject ?? "").toLowerCase().includes(q) ||
          (r.message ?? "").toLowerCase().includes(q),
      );
    }
    if (sort === "top") list = [...list].sort((a, b) => Number(b.rating) - Number(a.rating));
    else if (sort === "lowest") list = [...list].sort((a, b) => Number(a.rating) - Number(b.rating));
    else
      list = [...list].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    return list;
  }, [reviews, filter, query, sort]);

  const featured = (reviews ?? []).filter((r) => r.featured).slice(0, 3);

  return (
    <>
      <Helmet>
        <title>Customer Reviews — Busistree</title>
        <meta
          name="description"
          content="Real reviews and ratings from Busistree customers. Read verified feedback and share your own experience."
        />
        <link rel="canonical" href="/reviews" />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/40">
        {/* Hero */}
        <section className="relative overflow-hidden py-16 md:py-24 border-b border-border/60">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
          />
          <div className="container relative max-w-6xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border border-primary/25 text-[11px] font-medium tracking-[0.2em] uppercase shadow-soft mb-5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Customer Reviews
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] max-w-3xl">
              What business owners{" "}
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                say about Busistree
              </span>
            </h1>
            <p className="text-muted-foreground max-w-xl mt-5 text-lg">
              Verified feedback from real customers who've launched their business with us.
            </p>

            {/* Stats row */}
            <div className="mt-10 grid md:grid-cols-3 gap-4">
              <Card className="rounded-3xl border-border bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-end gap-3">
                    <div className="text-5xl md:text-6xl font-extrabold leading-none bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                      {avg.toFixed(1)}
                    </div>
                    <div className="pb-1">
                      <Stars value={avg} size="h-5 w-5" />
                      <div className="text-xs text-muted-foreground mt-1">Average rating</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-3xl border-border bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold">{total}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest">
                      Total review{total !== 1 ? "s" : ""}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-3xl border-border bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
                    Distribution
                  </div>
                  <div className="space-y-1.5">
                    {distribution.map((d) => (
                      <div key={d.star} className="flex items-center gap-2 text-xs">
                        <span className="w-3 font-semibold">{d.star}</span>
                        <Star
                          className="h-3 w-3 fill-yellow-400 text-yellow-400"
                          aria-hidden="true"
                        />
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent"
                            style={{ width: `${d.pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right tabular-nums text-muted-foreground">
                          {d.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <FeedbackDialog
                trigger={
                  <Button
                    size="lg"
                    className="rounded-full h-12 px-7 bg-gradient-to-r from-primary to-primary-glow shadow-brand"
                  >
                    Write a review
                  </Button>
                }
              />
            </div>
          </div>
        </section>

        {/* Featured */}
        {featured.length > 0 && (
          <section className="py-14 border-b border-border/60">
            <div className="container max-w-6xl">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-xl font-bold">Featured reviews</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                {featured.map((r) => (
                  <Card
                    key={r.id}
                    className="rounded-2xl border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur"
                  >
                    <CardContent className="p-6">
                      <Quote className="h-7 w-7 text-primary/40 mb-3" aria-hidden="true" />
                      {r.rating && <Stars value={r.rating} />}
                      <h3 className="font-bold mt-3 mb-2 line-clamp-1">{r.subject}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-5 leading-relaxed">
                        {r.message}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-4 pt-4 border-t border-border/60 uppercase tracking-wider">
                        {new Date(r.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All reviews */}
        <section className="py-14">
          <div className="container max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <h2 className="text-2xl font-bold">All reviews</h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search reviews"
                    className="pl-9 h-10 rounded-full w-full md:w-64"
                    maxLength={100}
                  />
                </div>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="h-10 rounded-full border border-input bg-background px-4 text-sm font-medium"
                  aria-label="Sort reviews"
                >
                  <option value="recent">Most recent</option>
                  <option value="top">Highest rated</option>
                  <option value="lowest">Lowest rated</option>
                </select>
              </div>
            </div>

            {/* Rating filter chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(["all", "5", "4", "3", "2", "1"] as FilterKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={cn(
                    "inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium border transition-colors",
                    filter === k
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted border-border text-foreground",
                  )}
                >
                  {k === "all" ? (
                    "All"
                  ) : (
                    <>
                      {k}
                      <Star
                        className={cn(
                          "h-3.5 w-3.5",
                          filter === k
                            ? "fill-primary-foreground text-primary-foreground"
                            : "fill-yellow-400 text-yellow-400",
                        )}
                      />
                    </>
                  )}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-2xl" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-5">
                {filtered.map((r) => (
                  <Card
                    key={r.id}
                    className="rounded-2xl border-border bg-card/80 backdrop-blur hover:shadow-lg hover:border-primary/30 transition-all"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <Quote className="h-6 w-6 text-primary/40 shrink-0" aria-hidden="true" />
                        {r.rating && <Stars value={r.rating} />}
                      </div>
                      <h3 className="font-bold mb-2 text-foreground">{r.subject}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {r.message}
                      </p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                          {new Date(r.created_at).toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        {r.featured && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="rounded-2xl border-dashed">
                <CardContent className="p-10 text-center">
                  <p className="text-muted-foreground mb-4">
                    {query || filter !== "all"
                      ? "No reviews match your filters."
                      : "Be the first to leave a review."}
                  </p>
                  <FeedbackDialog
                    trigger={<Button className="rounded-full">Write a review</Button>}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default Reviews;
