import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CreditCard, LayoutTemplate, Sparkles, Check, Loader2 } from "lucide-react";
import { useAddons } from "@/hooks/useAddons";

const useTopPlans = () =>
  useQuery({
    queryKey: ["marketplace_plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("price_pkr")
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
  });

const useTopTemplates = () =>
  useQuery({
    queryKey: ["marketplace_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("is_active", true)
        .order("price_pkr")
        .limit(4);
      if (error) throw error;
      return data ?? [];
    },
  });

const SectionHeader = ({
  icon: Icon,
  eyebrow,
  title,
  description,
  to,
  ctaLabel,
}: {
  icon: any;
  eyebrow: string;
  title: string;
  description: string;
  to: string;
  ctaLabel: string;
}) => (
  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
    <div className="max-w-2xl">
      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-2">
        <Icon className="h-4 w-4" /> {eyebrow}
      </div>
      <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
    </div>
    <Button asChild variant="outline" className="rounded-full gap-2 shrink-0">
      <Link to={to}>
        {ctaLabel} <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  </div>
);

export default function Marketplace() {
  const { data: plans = [], isLoading: plansLoading } = useTopPlans();
  const { data: templates = [], isLoading: templatesLoading } = useTopTemplates();
  const { data: addons = [], isLoading: addonsLoading } = useAddons();

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl space-y-20">
      <SEO
        title="Marketplace — Plans, Templates & Addons | Busistree"
        description="Everything you need to launch and grow your Busistree store — pricing plans, ready-made templates, and installable add-ons in one place."
        path="/marketplace"
      />

      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto">
        <Badge variant="secondary" className="mb-4">One place for everything</Badge>
        <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
          The Busistree Marketplace
        </h1>
        <p className="text-lg text-muted-foreground">
          Browse plans, pick a template, and extend your store with add-ons — all in one place.
        </p>
      </section>

      {/* Plans */}
      <section>
        <SectionHeader
          icon={CreditCard}
          eyebrow="Plans"
          title="Choose a plan that scales with you"
          description="Transparent PKR pricing with hosting, limits, and support included."
          to="/pricing"
          ctaLabel="View all plans"
        />
        {plansLoading ? (
          <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((p: any) => {
              const isFree = p.type === "free" || p.price_pkr === 0;
              const features: string[] = Array.isArray(p.features) ? p.features : [];
              return (
                <Card key={p.id} className="border-border/60 hover:border-primary/40 transition-colors">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-lg">{p.name}</p>
                      {isFree && <Badge variant="secondary">Starter</Badge>}
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      {isFree ? "Free" : `PKR ${p.price_pkr.toLocaleString()}`}
                      {!isFree && p.duration_days && (
                        <span className="text-xs text-muted-foreground font-normal ml-1">/ {p.duration_days}d</span>
                      )}
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
                      <span>{p.max_products} products</span>
                      <span>{p.max_categories} categories</span>
                      <span>{p.max_pages ?? 5} pages</span>
                      <span>{p.team_users ?? 1} team users</span>
                    </div>
                    {features.length > 0 && (
                      <ul className="space-y-1 pt-2 border-t border-border/40">
                        {features.slice(0, 3).map((f) => (
                          <li key={f} className="text-xs flex items-start gap-1.5">
                            <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Templates */}
      <section>
        <SectionHeader
          icon={LayoutTemplate}
          eyebrow="Templates"
          title="Launch-ready website templates"
          description="Beautiful, conversion-focused designs. Free and premium options — installed within 24–48h."
          to="/templates"
          ctaLabel="Browse templates"
        />
        {templatesLoading ? (
          <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((t: any) => {
              const isFree = !t.price_pkr || t.price_pkr === 0;
              return (
                <Link key={t.id} to={`/templates/${t.id}`} className="group">
                  <Card className="overflow-hidden border-border/60 group-hover:border-primary/40 transition-colors h-full">
                    <div className="relative">
                      {t.preview_image_url ? (
                        <img src={t.preview_image_url} alt={t.name} className="h-40 w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/10" />
                      )}
                      <Badge className={`absolute top-2 right-2 ${isFree ? "bg-emerald-600 hover:bg-emerald-600" : "bg-primary"}`}>
                        {isFree ? "Free" : `PKR ${t.price_pkr.toLocaleString()}`}
                      </Badge>
                    </div>
                    <CardContent className="p-3">
                      <p className="font-semibold text-sm truncate">{t.name}</p>
                      {t.category && <p className="text-xs text-muted-foreground">{t.category}</p>}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Addons */}
      <section>
        <SectionHeader
          icon={Sparkles}
          eyebrow="Addons"
          title="Extend your store with add-ons"
          description="Pages, sections, popups, and integrations installed by our team."
          to="/addons"
          ctaLabel="Browse addons"
        />
        {addonsLoading ? (
          <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {addons.slice(0, 6).map((a) => (
              <Card key={a.id} className="border-border/60 hover:border-primary/40 transition-colors">
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="flex gap-1">
                      {a.is_popular && <Badge variant="secondary" className="text-[10px]">Popular</Badge>}
                      {a.is_recommended && <Badge className="text-[10px]">Recommended</Badge>}
                    </div>
                  </div>
                  <p className="font-semibold">{a.name}</p>
                  {a.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{a.description}</p>
                  )}
                  <p className="text-sm font-bold text-primary pt-1">
                    PKR {a.price_pkr.toLocaleString()}
                    <span className="text-xs text-muted-foreground font-normal ml-1">
                      {a.pricing_type === "monthly" ? "/ month" : "one-time"}
                    </span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="rounded-3xl border border-border/60 bg-gradient-to-br from-primary/5 to-accent/5 p-8 md:p-12 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Ready to launch?</h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-6">
          Pick a plan, choose a template, and add extras — we'll get your store live in 24–48h.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild size="lg" className="rounded-full gap-2">
            <Link to="/onboarding">Get started <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link to="/how-it-works">How it works</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
