import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import FeedbackDialog from "@/components/feedback/FeedbackDialog";
import heroImg1 from "@/assets/reviews-hero-1.jpg";
import heroImg2 from "@/assets/reviews-hero-2.jpg";
import interviewImg1 from "@/assets/reviews-interview-1.jpg";
import interviewImg2 from "@/assets/reviews-interview-2.jpg";
import interviewImg3 from "@/assets/reviews-interview-3.jpg";

const Stars = ({ value, size = "h-3.5 w-3.5" }: { value: number; size?: string }) => (
  <div className="flex gap-0.5" aria-label={`Rated ${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={cn(
          size,
          n <= Math.round(value) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30",
        )}
        aria-hidden="true"
      />
    ))}
  </div>
);

// Deterministic avatar color pool
const AVATAR_COLORS = [
  "bg-[#f4a261] text-white",
  "bg-[#2a9d8f] text-white",
  "bg-[#e76f51] text-white",
  "bg-[#264653] text-white",
  "bg-[#e9c46a] text-[#264653]",
  "bg-[#8ecae6] text-[#023047]",
  "bg-[#c77dff] text-white",
  "bg-[#457b9d] text-white",
];

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("") || "U";

const INTERVIEWS = [
  {
    img: interviewImg1,
    title: "Why Amna decided to rebrand & why it worked",
    tag: "Case study",
  },
  {
    img: interviewImg2,
    title: "Emma-tech team came up with a new payment processing technology",
    tag: "Interview",
  },
  {
    img: interviewImg3,
    title: "The story of a new version of the finest Barista experience",
    tag: "Story",
  },
];

const Reviews = () => {
  const [query, setQuery] = useState("");

  const { data: stats } = useQuery({
    queryKey: ["feedback-rating-distribution"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_feedback_rating_distribution");
      if (error) throw error;
      return (
        data?.[0] ?? {
          total_reviews: 0,
          avg_rating: 0,
          rating_5: 0,
          rating_4: 0,
          rating_3: 0,
          rating_2: 0,
          rating_1: 0,
        }
      );
    },
  });

  const PAGE_SIZE = 12;
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["public-reviews-infinite"],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const from = (pageParam as number) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("public_feedback_reviews" as any)
        .select("id, subject, message, rating, featured, created_at")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return { rows: (data ?? []) as any[], nextPage: (data ?? []).length === PAGE_SIZE ? (pageParam as number) + 1 : undefined };
    },
    getNextPageParam: (last) => last.nextPage,
  });

  const reviews = useMemo(() => (data?.pages ?? []).flatMap((p) => p.rows), [data]);
  const total = Number(stats?.total_reviews ?? 0);
  const avg = Number(stats?.avg_rating ?? 0);

  const filtered = useMemo(() => {
    let list = reviews;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (r) =>
          (r.subject ?? "").toLowerCase().includes(q) ||
          (r.message ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [reviews, query]);

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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

      <main className="min-h-screen bg-background">
        {/* Hero — periwinkle band with photo collage */}
        <section className="relative overflow-hidden bg-[#c9d0ff]">
          <div className="container max-w-6xl py-16 md:py-24">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#1a1a3a]/70 mb-5">
                  — Customer stories
                </p>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] text-[#1a1a3a]">
                  We build the best user experience with{" "}
                  <span className="italic font-serif">{total.toLocaleString()}+</span> users
                </h1>
                <div className="mt-8 flex items-center gap-5">
                  <div className="flex items-center gap-2">
                    <Stars value={avg} size="h-5 w-5" />
                    <span className="font-bold text-[#1a1a3a]">{avg.toFixed(1)}/5</span>
                  </div>
                  <span className="text-sm text-[#1a1a3a]/70">
                    from {total} verified review{total !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Photo collage */}
              <div className="relative h-[380px] md:h-[440px]">
                <div className="absolute right-0 top-4 w-[55%] h-[65%] rounded-md overflow-hidden shadow-xl">
                  <img
                    src={heroImg1}
                    alt="Happy customer"
                    className="w-full h-full object-cover"
                    width={1024}
                    height={1024}
                  />
                </div>
                <div className="absolute right-[52%] bottom-0 w-[40%] h-[45%] rounded-md overflow-hidden shadow-xl bg-[#8a6bff]">
                  <img
                    src={heroImg2}
                    alt="Happy customer"
                    className="w-full h-full object-cover mix-blend-luminosity opacity-90"
                    width={1024}
                    height={1024}
                    loading="lazy"
                  />
                </div>
                <div className="absolute right-[10%] bottom-2 w-[28%] h-[28%] rounded-md bg-[#3d3d8a] shadow-xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Interviews with key customers */}
        <section className="py-20 md:py-28">
          <div className="container max-w-6xl">
            <div className="text-center mb-14">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-3">
                — Stories
              </p>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                Interviews with key customers
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {INTERVIEWS.map((it, i) => (
                <article key={i} className="group cursor-pointer">
                  <div className="aspect-[4/3] rounded-md overflow-hidden mb-5">
                    <img
                      src={it.img}
                      alt={it.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      width={1024}
                      height={1024}
                    />
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {it.tag}
                  </p>
                  <h3 className="font-bold text-lg leading-snug text-foreground group-hover:text-primary transition-colors">
                    {it.title}
                  </h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Your feedback about us — masonry */}
        <section className="py-20 md:py-28 border-t border-border/60">
          <div className="container max-w-6xl">
            <div className="text-center mb-14">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-3">
                — Reviews
              </p>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                Your feedback about us
              </h2>
            </div>

            {isLoading ? (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-44 w-full rounded-lg mb-6 break-inside-avoid" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
                {filtered.map((r, i) => {
                  const name = "Happy Customer";
                  const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                  return (
                    <article
                      key={r.id}
                      className="break-inside-avoid mb-6 rounded-lg border border-border bg-card p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                        {new Date(r.created_at).toLocaleDateString(undefined, {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      {r.rating && <Stars value={r.rating} />}
                      {r.subject && (
                        <h3 className="font-bold mt-3 mb-2 text-foreground line-clamp-2">
                          {r.subject}
                        </h3>
                      )}
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {r.message}
                      </p>
                      <div className="flex items-center gap-3 mt-5 pt-5 border-t border-border/60">
                        <div
                          className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                            color,
                          )}
                        >
                          {initialsOf(name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{name}</p>
                          <p className="text-xs text-muted-foreground">Verified customer</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
                {isFetchingNextPage &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={`sk-${i}`}
                      className="break-inside-avoid mb-6 rounded-lg border border-border bg-card p-6"
                      aria-hidden="true"
                    >
                      <Skeleton className="h-3 w-24 mb-4" />
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Skeleton key={j} className="h-3.5 w-3.5 rounded-sm" />
                        ))}
                      </div>
                      <Skeleton className="h-4 w-3/4 mb-3" />
                      <Skeleton className="h-3 w-full mb-2" />
                      <Skeleton className="h-3 w-full mb-2" />
                      <Skeleton className={cn("h-3 mb-2", i % 2 === 0 ? "w-5/6" : "w-2/3")} />
                      {i % 3 !== 0 && <Skeleton className="h-3 w-1/2 mb-2" />}
                      <div className="flex items-center gap-3 mt-5 pt-5 border-t border-border/60">
                        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-3 w-28" />
                          <Skeleton className="h-2.5 w-20" />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Be the first to leave a review.</p>
            )}

            {/* Infinite scroll sentinel */}
            {!query.trim() && hasNextPage && (
              <div ref={sentinelRef} className="h-10" aria-hidden="true" />
            )}
            {!hasNextPage && filtered.length > 0 && !isLoading && (
              <p className="text-center text-xs text-muted-foreground mt-10 uppercase tracking-[0.2em]">
                — You've reached the end —
              </p>
            )}

            <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
              <FeedbackDialog
                trigger={
                  <Button size="lg" className="rounded-full h-12 px-8 bg-[#3d3d8a] hover:bg-[#2d2d6a] text-white">
                    Write a review
                  </Button>
                }
              />
              <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-6 border-2 gap-2">
                <a href="https://g.page/r/CRuiigaggTh7EBM/review" target="_blank" rel="noopener noreferrer" aria-label="Review us on Google">
                  <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Review us on Google
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="relative overflow-hidden bg-[#1e1e4a] text-white">
          <div
            aria-hidden="true"
            className="absolute -top-24 -left-24 h-72 w-72 rounded-full border-2 border-white/10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full border-2 border-white/10"
          />
          <div className="container max-w-4xl relative py-20 md:py-24 text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              Let's chat if you have any questions!
            </h2>
            <p className="text-white/70 mb-8 max-w-lg mx-auto">
              We're here to answer any questions and help you get started with Busistree.
            </p>
            <Button
              asChild
              size="lg"
              className="rounded-full h-12 px-8 bg-white text-[#1e1e4a] hover:bg-white/90"
            >
              <a href="/contact">
                Contact us <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
};

export default Reviews;
