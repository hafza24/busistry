import SEO from "@/components/SEO";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Rocket, Loader2, Eye, Info, CheckCircle2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useItemReviewStats, ItemReviewStats } from "@/hooks/useReviews";
import { ItemBadges, RatingStars } from "@/components/reviews/ItemBadges";
import TemplateCustomizationNotice from "@/components/templates/TemplateCustomizationNotice";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Templates = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All");
  const [activeSub, setActiveSub] = useState<string | null>(searchParams.get("subcategory"));
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [selectTarget, setSelectTarget] = useState<{ id: string; name: string } | null>(null);

  // Sync URL -> state when the user navigates from the mega menu or browser back/forward
  useEffect(() => {
    const cat = searchParams.get("category") || "All";
    const sub = searchParams.get("subcategory");
    setActiveCategory(cat);
    setActiveSub(sub);
    if (cat !== "All" || sub) {
      // Scroll to filter area so users see the applied filter
      setTimeout(() => {
        document.getElementById("templates-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [searchParams]);

  // Sync state -> URL when user clicks filter chips on the page
  const updateCategory = (cat: string) => {
    setActiveCategory(cat);
    setActiveSub(null);
    const next = new URLSearchParams(searchParams);
    if (cat === "All") next.delete("category");
    else next.set("category", cat);
    next.delete("subcategory");
    setSearchParams(next, { replace: true });
  };

  const updateSub = (sub: string | null) => {
    setActiveSub(sub);
    const next = new URLSearchParams(searchParams);
    if (!sub) next.delete("subcategory");
    else next.set("subcategory", sub);
    setSearchParams(next, { replace: true });
  };

  const openPreview = (id: string, url: string) => {
    setPreviewingId(id);
    // Open in new tab immediately (must be in the click handler to avoid popup blockers)
    window.open(url, "_blank", "noopener,noreferrer");
    // Show skeleton state briefly to signal the demo is loading
    setTimeout(() => setPreviewingId((cur) => (cur === id ? null : cur)), 1200);
  };


  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["public_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: stats = [] } = useItemReviewStats("template");
  const statMap = new Map<string, ItemReviewStats>(stats.map((s) => [s.target_id, s]));

  const categories = ["All", ...Array.from(new Set(templates.map((t) => t.category).filter(Boolean) as string[]))];
  const inCategory = activeCategory === "All" ? templates : templates.filter((t) => t.category === activeCategory);
  const subcategories = Array.from(new Set(inCategory.map((t) => t.subcategory).filter(Boolean) as string[]));
  const filtered = activeSub ? inCategory.filter((t) => t.subcategory === activeSub) : inCategory;



  return (
    <div className="py-16">
      <TemplateCustomizationNotice />
      <SEO
        title="Templates — Starting points for your free 48-hour website | Busistree"
        description="Editorial, launch-ready starting points. Pick one; we tailor it to your brand, write the copy, and ship it live in forty-eight hours — free."
        path="/templates"
      />
      <div className="container">
        {/* Hero — inspired by editorial storefront layout */}
        <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-secondary/60 via-background to-primary/5 mb-6">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" aria-hidden />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl" aria-hidden />
          <div className="relative grid md:grid-cols-2 gap-8 items-center px-6 md:px-12 py-14 md:py-20">
            <div className="text-center md:text-left">
              <Badge variant="secondary" className="mb-4">— The 48-hour library</Badge>
              <h1 className="text-4xl md:text-6xl font-bold font-display text-foreground leading-tight">
                Pick a starting point. <span className="text-primary">We finish it in two days.</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mt-5 max-w-lg mx-auto md:mx-0">
                Every template is a real, editorial layout — not a wizard-generated shell. Choose one and we tailor the copy, imagery and product logic to your brand, then ship it live. Free.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                <Button size="lg" asChild><a href="#templates-grid">Browse the library</a></Button>
                <Button size="lg" variant="outline" asChild><Link to="/how-it-works">How the 48 hours work</Link></Button>
              </div>
            </div>
            <div className="relative hidden md:flex justify-center items-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.15),transparent_65%)]" aria-hidden />
              <div className="relative grid grid-cols-2 gap-4 rotate-[-4deg]">
                {[0, 1, 2, 3].map((i) => {
                  const t = templates[i];
                  const offset = ["", "translate-y-6", "-translate-y-2", "translate-y-4"][i];
                  return (
                    <div
                      key={t?.id ?? i}
                      className={`group relative h-40 w-40 rounded-2xl overflow-hidden shadow-xl border border-border/60 bg-card ${offset} transition-transform hover:scale-105`}
                    >
                      {/* Fake browser chrome */}
                      <div className="absolute top-0 inset-x-0 h-4 bg-muted/80 border-b border-border/60 flex items-center gap-1 px-1.5 z-10">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400/70" />
                        <span className="h-1.5 w-1.5 rounded-full bg-yellow-400/70" />
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                      </div>
                      {t?.preview_image_url ? (
                        <img
                          src={t.preview_image_url}
                          alt={t.name}
                          className="absolute inset-0 h-full w-full object-cover object-top pt-4"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Category nav bar — horizontal editorial style */}
        <nav id="templates-grid" className="mb-4 rounded-xl border border-border/60 bg-card/70 backdrop-blur-sm shadow-sm scroll-mt-24">
          <div className="flex items-center gap-1 overflow-x-auto px-2 py-2 scrollbar-none">
            {categories.map((n) => {
              const active = activeCategory === n;
              return (
                <button
                  key={n}
                  aria-pressed={active}
                  onClick={() => updateCategory(n)}
                  className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Subcategory filter */}
        {subcategories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <Button
              variant={activeSub === null ? "secondary" : "ghost"}
              size="sm"
              aria-pressed={activeSub === null}
              onClick={() => updateSub(null)}
              className={activeSub === null ? "ring-1 ring-primary/40 font-semibold" : ""}
            >
              All {activeCategory !== "All" ? activeCategory : ""}
            </Button>
            {subcategories.map((s) => {
              const active = activeSub === s;
              return (
                <Button
                  key={s}
                  variant={active ? "secondary" : "ghost"}
                  size="sm"
                  aria-pressed={active}
                  onClick={() => updateSub(s)}
                  className={active ? "ring-1 ring-primary/40 font-semibold" : ""}
                >
                  {s}
                </Button>
              );
            })}
          </div>
        )}

        {/* Category section heading */}
        <div className="text-center mb-8" id="templates-grid">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">Category</h2>
          <div className="mx-auto mt-2 h-px w-24 bg-border" />
        </div>


        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-5 xl:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="border-border/50 flex flex-col overflow-hidden">
                <Skeleton className="h-44 w-full rounded-none" />
                <CardContent className="p-5 flex-1 space-y-3">
                  <div className="flex gap-1">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <div className="flex gap-1 pt-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-14" />
                  </div>
                </CardContent>
                <CardFooter className="p-5 pt-0 grid grid-cols-3 gap-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No templates available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-5 xl:gap-6">
            {filtered.map((t) => {
              const features = Array.isArray(t.features) ? (t.features as string[]) : [];
              const stat = statMap.get(t.id);
              const detailsPath = t.name?.toLowerCase().includes("booker") ? "/templates/booker" : `/templates/${t.id}`;
              const stop = (e: React.MouseEvent) => e.stopPropagation();
              return (
                <Card
                  key={t.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(detailsPath)}
                  onKeyDown={(e) => { if (e.key === "Enter") navigate(detailsPath); }}
                  className="group border-border/50 hover:shadow-lg hover:border-primary/30 transition-all flex flex-col overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <div className="relative">
                    {t.preview_image_url ? (
                      <img src={t.preview_image_url} alt={t.name} className="h-40 md:h-36 lg:h-44 w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="h-40 md:h-36 lg:h-44 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        <span className="text-4xl opacity-60">🖼️</span>
                      </div>
                    )}
                    {stat && (
                      <div className="absolute top-2 left-2">
                        <ItemBadges stat={stat} />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 md:p-4 lg:p-5 flex-1">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {t.category && <Badge variant="default" className="text-[10px]">{t.category}</Badge>}
                      {t.subcategory && <Badge variant="secondary" className="text-[10px]">{t.subcategory}</Badge>}
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold font-display text-base md:text-base lg:text-lg text-foreground line-clamp-1">{t.name}</h3>
                    </div>
                    {stat && stat.review_count > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <RatingStars value={stat.avg_rating} />
                        <span className="text-xs text-muted-foreground">({stat.review_count})</span>
                      </div>
                    )}
                    {t.description && <p className="text-sm text-muted-foreground mt-2 mb-3 line-clamp-2">{t.description}</p>}
                    <div className="flex flex-wrap gap-1">
                      {features.slice(0, 4).map((f) => (
                        <span key={f} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{f}</span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 md:p-4 lg:p-5 pt-0 flex flex-col gap-2">
                    <Button
                      size="lg"
                      className="w-full bg-primary/90 hover:bg-primary shadow-md"
                      onClick={(e) => { stop(e); setSelectTarget({ id: t.id, name: t.name }); }}
                    >
                      Select this template
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      {t.demo_url ? (
                        <Button
                          size="sm"
                          variant="outline"
                          title="Preview demo in a new tab"
                          disabled={previewingId === t.id}
                          onClick={(e) => { stop(e); openPreview(t.id, t.demo_url!); }}
                        >
                          {previewingId === t.id ? (
                            <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Loading</>
                          ) : (
                            <><Eye className="h-3.5 w-3.5 mr-1" /> Preview</>
                          )}
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled title="No demo available" onClick={stop}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> Preview
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" asChild onClick={stop}>
                        <Link to={detailsPath}>
                          <Info className="h-3.5 w-3.5 mr-1" /> Details
                        </Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={!!selectTarget} onOpenChange={(o) => !o && setSelectTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Use "{selectTarget?.name}" as your template?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>You're about to start onboarding with this template. Here's what happens next:</p>
                <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
                  <li>We'll open the setup wizard pre-filled with this template.</li>
                  <li>You add your brand, content, and contact details.</li>
                  <li>Our team customizes and launches your site in 24–48 hours.</li>
                </ol>
                <p className="text-muted-foreground">You can change your template later before checkout.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectTarget) navigate(`/onboarding?template=${selectTarget.id}`);
                setSelectTarget(null);
              }}
            >
              Continue to onboarding
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Templates;
