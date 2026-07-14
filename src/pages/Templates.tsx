import SEO from "@/components/SEO";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Rocket, Loader2, Eye, Info, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useItemReviewStats, ItemReviewStats } from "@/hooks/useReviews";
import { ItemBadges, RatingStars } from "@/components/reviews/ItemBadges";
import TemplateCustomizationNotice from "@/components/templates/TemplateCustomizationNotice";

const Templates = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);

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
        title="Website & Store Templates — Busistree"
        description="Browse ecommerce, portfolio, blog, organization and event templates. Each one is fully customized with your brand and launched in 24–48 hours."
        path="/templates"
      />
      <div className="container">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground mb-4">Choose your template</h1>
          <p className="text-lg text-muted-foreground">
            Pick a starting point. We'll customize it with your brand and launch it in 24–48 hours.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {categories.map((n) => (
            <Button
              key={n}
              variant={activeCategory === n ? "default" : "outline"}
              size="sm"
              onClick={() => { setActiveCategory(n); setActiveSub(null); }}
            >
              {n}
            </Button>
          ))}
        </div>

        {/* Subcategory filter */}
        {subcategories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <Button
              variant={activeSub === null ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveSub(null)}
            >
              All {activeCategory !== "All" ? activeCategory : ""}
            </Button>
            {subcategories.map((s) => (
              <Button
                key={s}
                variant={activeSub === s ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveSub(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No templates available yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                      <img src={t.preview_image_url} alt={t.name} className="h-44 w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="h-44 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        <span className="text-4xl opacity-60">🖼️</span>
                      </div>
                    )}
                    {stat && (
                      <div className="absolute top-2 left-2">
                        <ItemBadges stat={stat} />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5 flex-1">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {t.category && <Badge variant="default" className="text-[10px]">{t.category}</Badge>}
                      {t.subcategory && <Badge variant="secondary" className="text-[10px]">{t.subcategory}</Badge>}
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold font-display text-lg text-foreground">{t.name}</h3>
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
                  <CardFooter className="p-5 pt-0 grid grid-cols-3 gap-2">
                    {t.demo_url ? (
                      <Button size="sm" variant="outline" asChild title="Preview demo" onClick={stop}>
                        <a href={t.demo_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-3.5 w-3.5 mr-1" /> Preview
                        </a>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled title="No demo available" onClick={stop}>
                        <Eye className="h-3.5 w-3.5 mr-1" /> Preview
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" asChild onClick={stop}>
                      <Link to={detailsPath}>
                        <Info className="h-3.5 w-3.5 mr-1" /> Details
                      </Link>
                    </Button>
                    <Button size="sm" asChild onClick={stop}>
                      <Link to={`/onboarding?template=${t.id}`}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Select
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;
