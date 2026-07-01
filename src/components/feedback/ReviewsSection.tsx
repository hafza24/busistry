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
    <section className="py-16 md:py-24 bg-muted/30" aria-labelledby="reviews-heading">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 id="reviews-heading" className="text-3xl md:text-4xl font-display font-bold mb-3">
            Loved by business owners
          </h2>
          {total > 0 && (
            <div className="flex items-center justify-center gap-3 mb-3">
              <Stars value={avg} size="h-5 w-5" />
              <span className="text-lg font-semibold">{avg.toFixed(1)}</span>
              <span className="text-muted-foreground">· {total} review{total !== 1 ? "s" : ""}</span>
            </div>
          )}
          <p className="text-muted-foreground max-w-xl mx-auto">
            Real feedback from real Busistree customers. Have something to share?
          </p>
          <div className="mt-5">
            <FeedbackDialog trigger={<Button size="lg">Leave a review</Button>} />
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : reviews && reviews.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((r) => (
              <Card key={r.id} className="h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <Quote className="h-6 w-6 text-primary/40 mb-3" aria-hidden="true" />
                  {r.rating && <Stars value={r.rating} />}
                  <h3 className="font-semibold mt-3 mb-1 line-clamp-1">{r.subject}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-5 flex-1">{r.message}</p>
                  <p className="text-xs text-muted-foreground mt-4">
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
