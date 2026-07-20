import SEO from "@/components/SEO";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, Rocket, Tag, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { setPendingTemplate } from "@/hooks/useOnboarding";

const TemplatesOnSale = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ["templates_on_sale"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("is_active", true)
        .not("original_price_pkr", "is", null)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const categories = ["All", ...Array.from(new Set(sites.map((s) => s.category).filter(Boolean) as string[]))];
  const filtered = activeCategory === "All" ? sites : sites.filter((s) => s.category === activeCategory);

  return (
    <div className="py-16">
      <SEO
        title="Templates on Sale — Ready-made websites | Busistree"
        description="Buy fully-built, ready-to-launch Templates in Pakistan. Coded and WordPress Templates, one-time purchase, delivered fast."
        path="/templates-on-sale"
      />
      <div className="container">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <Badge className="mb-3 bg-gradient-to-r from-primary/15 to-accent/15 border border-primary/20 text-primary">
            <Tag className="h-3 w-3 mr-1" /> Ready-made Templates
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground mb-4">Templates on Sale</h1>
          <p className="text-lg text-muted-foreground">
            Fully-built Templates at a discount. Pick one and we'll rebrand and hand it over.
          </p>
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((c) => (
              <Button
                key={c}
                variant={activeCategory === c ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(c)}
              >
                {c}
              </Button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No Templates on sale right now. Check back soon.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s) => {
              const features = Array.isArray(s.features) ? (s.features as string[]) : [];
              const techStack = Array.isArray(s.tech_stack) ? (s.tech_stack as string[]) : [];
              const hasDiscount = s.original_price_pkr && Number(s.original_price_pkr) > Number(s.price_pkr);
              return (
                <Card key={s.id} className="group border-border/50 hover:shadow-xl hover:border-primary/30 transition-all flex flex-col overflow-hidden">
                  <div className="relative">
                    {s.preview_image_url ? (
                      <img src={s.preview_image_url} alt={s.name} className="h-48 w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        <span className="text-4xl opacity-60">🌐</span>
                      </div>
                    )}
                    {hasDiscount && (
                      <Badge className="absolute top-3 right-3 bg-primary text-white">
                        Sale
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-5 flex-1">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {s.category && <Badge variant="default" className="text-[10px]">{s.category}</Badge>}
                      {techStack.slice(0, 3).map((t: string) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                      ))}
                    </div>
                    <h3 className="font-semibold font-display text-lg text-foreground">{s.name}</h3>
                    {s.description && <p className="text-sm text-muted-foreground mt-1 mb-3 line-clamp-2">{s.description}</p>}
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        PKR {Number(s.price_pkr).toLocaleString()}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-muted-foreground line-through">
                          PKR {Number(s.original_price_pkr).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {features.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {features.slice(0, 3).map((f) => (
                          <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /> {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                  <CardFooter className="p-5 pt-0 gap-2">
                    <Button size="sm" className="flex-1" asChild onClick={() => setPendingTemplate(s.id)}>
                      <Link to={`/onboarding?template=${s.id}`}>
                        <Rocket className="h-3.5 w-3.5 mr-1" /> Select Site
                      </Link>
                    </Button>
                    {s.demo_url && (
                      <Button size="sm" variant="outline" asChild title="Preview demo">
                        <a href={s.demo_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-3.5 w-3.5" />
                        </a>
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

export default TemplatesOnSale;
