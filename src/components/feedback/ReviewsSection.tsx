import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeedbackDialog from "./FeedbackDialog";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const Stars = ({ value, size = "h-4 w-4" }: { value: number; size?: string }) => (
  <div className="flex gap-0.5" aria-label={`Rated ${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={cn(size, n <= Math.round(value) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40")} aria-hidden="true" />
    ))}
  </div>
);

const ReviewsSection = () => {
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
    queryKey: ["public-reviews-top"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_feedback_reviews" as any)
        .select("id, subject, message, rating, featured, created_at")
        .order("featured", { ascending: false })
        .order("rating", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const avg = Number(stats?.avg_rating ?? 0);
  const total = Number(stats?.total_reviews ?? 0);

  // Accurate rating distribution from RPC (all approved reviews)
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = Number((stats as any)?.[`rating_${star}`] ?? 0);
    const pct = total > 0 ? (count / total) * 100 : 0;
    return { star, count, pct };
  });


  const topReviews = (reviews ?? []).slice(0, 4);

  // Floating card positions (rotation + offset) — reference-style stack
  const floatStyles = [
    "md:translate-x-0 md:translate-y-0 md:-rotate-3",
    "md:translate-x-16 md:translate-y-10 md:rotate-2",
    "md:translate-x-4 md:translate-y-28 md:-rotate-1",
    "md:translate-x-20 md:translate-y-48 md:rotate-3",
  ];

  return (
    <section className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-b from-background to-secondary/40 border-b border-border/60" aria-labelledby="reviews-heading">
      {/* Ambient glow */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <div className="container max-w-6xl relative">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-10 items-center">
          {/* LEFT — Stats */}
          <div>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border border-primary/25 text-[11px] font-medium tracking-[0.2em] uppercase shadow-soft mb-5">
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">Reviews</span>
            </div>
            <h2 id="reviews-heading" className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Loved by{" "}
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                business owners
              </span>
            </h2>
            <p className="text-muted-foreground max-w-md mt-5 text-lg">
              Real feedback from real Busistree customers.
            </p>

            {/* Big rating block */}
            <div className="mt-8 rounded-3xl border border-border bg-card/80 backdrop-blur-sm p-6 md:p-8 shadow-soft">
              <div className="flex items-end gap-4">
                <div className="text-6xl md:text-7xl font-extrabold leading-none bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                  {avg.toFixed(1)}
                </div>
                <div className="pb-1">
                  <Stars value={avg} size="h-5 w-5" />
                  <div className="text-sm text-muted-foreground mt-1">
                    Based on {total} review{total !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* Distribution */}
              <div className="mt-6 space-y-2">
                {distribution.map((d) => (
                  <div key={d.star} className="flex items-center gap-3 text-sm">
                    <span className="w-4 font-semibold text-foreground/80">{d.star}</span>
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right tabular-nums text-muted-foreground">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <FeedbackDialog trigger={
                <Button size="lg" variant="outline" className="rounded-full h-12 px-7">
                  Leave a review
                </Button>
              } />
            </div>
          </div>

          {/* RIGHT — Floating review cards */}
          <div className="relative min-h-[520px] flex flex-col">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                ))}
              </div>
            ) : topReviews.length > 0 ? (
              <div className="relative flex-1">
                {topReviews.map((r, i) => (
                  <Card
                    key={r.id}
                    style={{ zIndex: topReviews.length - i }}
                    className={cn(
                      "md:absolute md:top-0 md:left-0 md:w-[85%] mb-4 md:mb-0",
                      "bg-card/95 backdrop-blur-md border-border rounded-2xl shadow-xl",
                      "transition-all duration-500 hover:scale-[1.03] hover:-rotate-0 hover:z-50 hover:shadow-2xl hover:border-primary/40",
                      floatStyles[i],
                    )}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <Quote className="h-6 w-6 text-primary/40 shrink-0" aria-hidden="true" />
                        {r.rating && <Stars value={r.rating} />}
                      </div>
                      <h3 className="font-bold mb-1.5 line-clamp-1 text-foreground">{r.subject}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{r.message}</p>
                      <p className="text-[11px] text-muted-foreground mt-3 pt-3 border-t border-border/60 uppercase tracking-wider">
                        {new Date(r.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground flex-1">Be the first to leave a review.</p>
            )}

            {/* CTA — See more reviews */}
            <div className="mt-8 md:mt-auto md:pt-8 flex md:justify-end">
              <Button
                asChild
                size="lg"
                className="rounded-full h-12 px-7 bg-gradient-to-r from-primary to-primary-glow shadow-brand group"
              >
                <Link to="/reviews">
                  See all reviews
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


export default ReviewsSection;
