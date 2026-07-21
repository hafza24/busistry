import SEO from "@/components/SEO";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Rocket, Loader2, Eye, Info, CheckCircle2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recommended" | "newest" | "price_asc" | "price_desc" | "rating">("recommended");
  const [priceBand, setPriceBand] = useState<"any" | "free" | "0_5k" | "5k_15k" | "15k_plus">("any");
  const [minRating, setMinRating] = useState<0 | 3 | 4 | 45>(0);
  const [hasDemoOnly, setHasDemoOnly] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

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
  const bySub = activeSub ? inCategory.filter((t) => t.subcategory === activeSub) : inCategory;
  const q = search.trim().toLowerCase();
  const searched = q
    ? bySub.filter((t) =>
        [t.name, t.description, t.category, t.subcategory]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      )
    : bySub;

  // Aggregate features across the current category slice for the feature filter chips
  const availableFeatures = Array.from(
    new Set(
      inCategory.flatMap((t) => (Array.isArray(t.features) ? (t.features as string[]) : []))
    )
  ).slice(0, 12);

  const advFiltered = searched.filter((t) => {
    const price = t.price_pkr ?? 0;
    if (priceBand === "free" && price !== 0) return false;
    if (priceBand === "0_5k" && !(price > 0 && price <= 5000)) return false;
    if (priceBand === "5k_15k" && !(price > 5000 && price <= 15000)) return false;
    if (priceBand === "15k_plus" && !(price > 15000)) return false;

    if (minRating > 0) {
      const threshold = minRating === 45 ? 4.5 : minRating;
      const avg = statMap.get(t.id)?.avg_rating ?? 0;
      if (avg < threshold) return false;
    }

    if (hasDemoOnly && !t.demo_url) return false;

    if (selectedFeatures.length > 0) {
      const feats = Array.isArray(t.features) ? (t.features as string[]) : [];
      if (!selectedFeatures.every((f) => feats.includes(f))) return false;
    }
    return true;
  });

  const filtered = [...advFiltered].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "price_asc":
        return (a.price_pkr ?? 0) - (b.price_pkr ?? 0);
      case "price_desc":
        return (b.price_pkr ?? 0) - (a.price_pkr ?? 0);
      case "rating": {
        const ra = statMap.get(a.id)?.avg_rating ?? 0;
        const rb = statMap.get(b.id)?.avg_rating ?? 0;
        return rb - ra;
      }
      case "recommended":
      default:
        return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    }
  });



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
                Pick a starting point. <span className="text-primary bg-primary/10 px-2 rounded-lg">We finish it in two days.</span>
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

        {/* Category section heading */}
        <div id="templates-grid" className="text-center mb-8 scroll-mt-24">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">Category</h2>
          <div className="mx-auto mt-2 h-px w-24 bg-border" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          {/* Sidebar filters */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border/60 bg-card/70 backdrop-blur-sm shadow-sm p-3">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search templates…"
                  aria-label="Search templates"
                  className="pl-9 pr-9 h-10"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="px-2 pb-3">
                <label htmlFor="tpl-sort" className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Sort by</label>
                <select
                  id="tpl-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="recommended">Recommended</option>
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Top rated</option>
                </select>
              </div>
              <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categories</p>
              <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible scrollbar-none">
                {categories.map((n) => {
                  const active = activeCategory === n;
                  return (
                    <button
                      key={n}
                      aria-pressed={active}
                      onClick={() => updateCategory(n)}
                      className={`whitespace-nowrap lg:whitespace-normal text-left px-3 py-2 text-sm font-medium rounded-lg transition-all ${
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

              {subcategories.length > 0 && (
                <>
                  <div className="my-3 h-px bg-border/60" />
                  <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subcategories</p>
                  <div className="flex lg:flex-col flex-wrap gap-1">
                    <button
                      onClick={() => updateSub(null)}
                      aria-pressed={activeSub === null}
                      className={`text-left px-3 py-1.5 text-sm rounded-lg transition-all ${
                        activeSub === null
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground/70 hover:bg-primary/5"
                      }`}
                    >
                      All {activeCategory !== "All" ? activeCategory : ""}
                    </button>
                    {subcategories.map((s) => {
                      const active = activeSub === s;
                      return (
                        <button
                          key={s}
                          onClick={() => updateSub(s)}
                          aria-pressed={active}
                          className={`text-left px-3 py-1.5 text-sm rounded-lg transition-all ${
                            active
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-foreground/70 hover:bg-primary/5"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </aside>

          {/* Grid */}
          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 xl:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="border-border/50 flex flex-col overflow-hidden">
                    <Skeleton className="h-44 w-full rounded-none" />
                    <CardContent className="p-5 flex-1 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 px-6 border border-dashed border-border/60 rounded-lg bg-muted/20">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-2xl mb-2">No templates match your search</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  {search
                    ? <>We couldn't find anything for <span className="font-medium text-foreground">"{search}"</span>{activeCategory !== "All" || activeSub ? " with your current filters" : ""}. Try a different keyword or clear your filters.</>
                    : "No templates match the selected filters. Try broadening your selection."}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => { setSearch(""); setActiveCategory("All"); setActiveSub(null); }}
                  >
                    Clear all filters
                  </Button>
                  <Button onClick={() => navigate("/contact")}>Request a custom template</Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 xl:gap-6">
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
        </div>
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
