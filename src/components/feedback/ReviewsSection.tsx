import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
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
    queryKey: ["feedback-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_feedback_rating_stats");
      if (error) throw error;
      return data?.[0] ?? { avg_rating: 0, total_reviews: 0 };
    },
  });

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["public-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_feedback_reviews" as any)
        .select("id, subject, message, rating, featured, created_at")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const avg = Number(stats?.avg_rating ?? 0);
  const total = Number(stats?.total_reviews ?? 0);

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background to-secondary/40 border-b border-border/60" aria-labelledby="reviews-heading">
      <div className="container max-w-6xl">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/15 to-accent/15 border border-primary/20 text-xs font-semibold tracking-widest uppercase text-primary mb-5">
            <Star className="h-3 w-3 fill-primary" /> Reviews
          </div>
          <h2 id="reviews-heading" className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
            Loved by{" "}
            <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              business owners
            </span>
          </h2>
          {total > 0 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <Stars value={avg} size="h-5 w-5" />
              <span className="text-lg font-bold">{avg.toFixed(1)}</span>
              <span className="text-muted-foreground">· {total} review{total !== 1 ? "s" : ""}</span>
            </div>
          )}
          <p className="text-muted-foreground max-w-xl mx-auto mt-4">
            Real feedback from real Busistree customers.
          </p>
          <div className="mt-7">
            <FeedbackDialog trigger={
              <Button size="lg" className="rounded-full h-12 px-7 bg-gradient-to-r from-primary to-primary-glow shadow-brand">
                Leave a review
              </Button>
            } />
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full rounded-2xl" />
            ))}
          </div>
        ) : reviews && reviews.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((r) => (
              <Card
                key={r.id}
                className="group h-full bg-card/80 backdrop-blur border-border rounded-2xl hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-300"
              >
                <CardContent className="p-6 flex flex-col h-full">
                  <Quote className="h-8 w-8 text-primary/30 mb-3" aria-hidden="true" />
                  {r.rating && <Stars value={r.rating} />}
                  <h3 className="font-bold mt-3 mb-2 line-clamp-1 text-foreground">{r.subject}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-5 flex-1 leading-relaxed">{r.message}</p>
                  <p className="text-xs text-muted-foreground mt-5 pt-4 border-t border-border/60">
                    {new Date(r.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Be the first to leave a review.</p>
        )}
      </div>
    </section>
  );
};

export default ReviewsSection;
