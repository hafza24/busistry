import SEO from "@/components/SEO";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Loader2, Eye } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { setPendingTemplate } from "@/hooks/useOnboarding";
import { useItemReviewStats, ItemReviewStats } from "@/hooks/useReviews";
import { ItemBadges, RatingStars } from "@/components/reviews/ItemBadges";

const Templates = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get("plan");


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

  const handleSelect = (id: string) => {
    setPendingTemplate(id);
  };

  return (
    <div className="py-16">
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
              return (
                <Card key={t.id} className="group border-border/50 hover:shadow-lg hover:border-primary/30 transition-all flex flex-col overflow-hidden">
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
                  <CardFooter className="p-5 pt-0 gap-2">
                    {t.name?.toLowerCase().includes("booker") ? (
                      <Button size="sm" className="flex-1" asChild>
                        <Link to="/templates/booker">
                          <Eye className="h-3.5 w-3.5 mr-1" /> View details
                        </Link>
                      </Button>
                    ) : (
                      <Button size="sm" className="flex-1" asChild onClick={() => handleSelect(t.id)}>
                        <Link to={`/onboarding?template=${t.id}${planParam ? `&plan=${planParam}` : ""}`}>
                          <Rocket className="h-3.5 w-3.5 mr-1" /> Select Template
                        </Link>
                      </Button>
                    )}
                    {t.demo_url ? (
                      <Button size="sm" variant="outline" asChild title="Preview demo">
                        <a href={t.demo_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled title="No demo available">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    )}
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
