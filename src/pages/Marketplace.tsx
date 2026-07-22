import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  CreditCard,
  LayoutTemplate,
  Sparkles,
  Check,
  Loader2,
  ExternalLink,
  ClipboardList,
  Megaphone,
  Search,
  X,
  SlidersHorizontal,
} from "lucide-react";
import CatalogGrid from "@/components/catalog/CatalogGrid";
import marketplaceHero from "@/assets/marketplace-hero.jpg";

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

const useAllTemplates = () =>
  useQuery({
    queryKey: ["marketplace_templates_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

/* ============================================================
   Shared editorial grammar
   ============================================================ */

const cardShell =
  "group relative overflow-hidden rounded-lg border border-border/60 bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-elev";

const SectionHeader = ({
  index,
  eyebrow,
  title,
  description,
  to,
  ctaLabel,
}: {
  icon?: any;
  index?: string;
  eyebrow: string;
  title: string;
  description: string;
  to: string;
  ctaLabel: string;
}) => (
  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
    <div className="max-w-2xl">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-4">
        {index ? <span className="text-primary">{index}</span> : null}
        {index ? <span className="mx-2 text-border">/</span> : null}
        {eyebrow}
      </div>
      <h2 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight leading-[1.05] mb-3">
        {title}
      </h2>
      <p className="text-muted-foreground max-w-xl">{description}</p>
    </div>
    <Button
      asChild
      size="lg"
      className="h-12 px-6 text-base rounded-lg group shadow-elev shrink-0"
    >
      <Link to={to}>
        {ctaLabel}
        <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
      </Link>
    </Button>
  </div>
);

const JumpStrip = () => {
  const items = [
    { label: "Plans", href: "#plans" },
    { label: "Templates", href: "#templates" },
    { label: "Catalog", href: "#catalog" },
    { label: "Sister services", href: "#sister" },
  ];
  return (
    <div className="sticky top-20 z-40 flex justify-center -mt-4 mb-4">
      <nav
        aria-label="Marketplace sections"
        className="inline-flex items-center gap-1 p-1.5 rounded-full border border-border/60 bg-background/80 backdrop-blur-xl shadow-elev"
      >
        {items.map((i) => (
          <a
            key={i.href}
            href={i.href}
            className="px-4 py-2 text-xs font-semibold tracking-wide rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
          >
            {i.label}
          </a>
        ))}
      </nav>
    </div>
  );
};


export default function Marketplace() {
  const { data: plans = [], isLoading: plansLoading } = useTopPlans();
  const { data: templates = [], isLoading: templatesLoading } = useAllTemplates();

  // Templates filter/sort state
  const [tplSearch, setTplSearch] = useState("");
  const [tplCategory, setTplCategory] = useState<string>("all");
  const [tplPriceBand, setTplPriceBand] = useState<"any" | "free" | "paid">("any");
  const [tplMaxPrice, setTplMaxPrice] = useState<number>(50000);
  const [tplSort, setTplSort] = useState<
    "recommended" | "price_asc" | "price_desc" | "newest" | "name"
  >("recommended");

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          (templates as any[]).map((t) => t.category).filter(Boolean) as string[],
        ),
      ),
    [templates],
  );

  const maxPriceInData = useMemo(() => {
    const m = Math.max(
      0,
      ...(templates as any[]).map((t) => Number(t.price_pkr) || 0),
    );
    return m > 0 ? m : 50000;
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    const q = tplSearch.trim().toLowerCase();
    let list = (templates as any[]).filter((t) => {
      if (tplCategory !== "all" && t.category !== tplCategory) return false;
      const price = Number(t.price_pkr) || 0;
      if (tplPriceBand === "free" && price !== 0) return false;
      if (tplPriceBand === "paid" && price === 0) return false;
      if (price > tplMaxPrice) return false;
      if (q) {
        const hay = [t.name, t.description, t.category, t.subcategory]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (tplSort) {
        case "price_asc":
          return (a.price_pkr ?? 0) - (b.price_pkr ?? 0);
        case "price_desc":
          return (b.price_pkr ?? 0) - (a.price_pkr ?? 0);
        case "newest":
          return (
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
          );
        case "name":
          return String(a.name).localeCompare(String(b.name));
        default:
          return (a.sort_order ?? 0) - (b.sort_order ?? 0);
      }
    });
    return list;
  }, [templates, tplSearch, tplCategory, tplPriceBand, tplMaxPrice, tplSort]);

  const activeFilterCount =
    (tplCategory !== "all" ? 1 : 0) +
    (tplPriceBand !== "any" ? 1 : 0) +
    (tplMaxPrice < maxPriceInData ? 1 : 0) +
    (tplSearch.trim() ? 1 : 0);

  const resetTplFilters = () => {
    setTplSearch("");
    setTplCategory("all");
    setTplPriceBand("any");
    setTplMaxPrice(maxPriceInData);
    setTplSort("recommended");
  };


  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl space-y-12 md:space-y-16">
      <SEO
        title="Marketplace — Plans, Templates & Add-ons | Busistree"
        description="After the free 48-hour website: plans, editorial templates and add-ons that keep the business growing — hand-picked, PKR-priced, live-ready."
        path="/marketplace"
      />

      {/* Hero — single editorial banner */}
      <section className="relative overflow-hidden rounded-lg bg-primary shadow-elev">
        <img
          src={marketplaceHero}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay"
          width={1600}
          height={900}
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/90 to-primary/60" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.12] pointer-events-none">
          <svg
            className="h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0 100 C 20 0 50 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-primary-foreground"
            />
            <path
              d="M0 80 C 30 20 60 20 100 80"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-primary-foreground"
            />
          </svg>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 sm:p-10 md:p-16">
          <div className="md:col-span-8 space-y-5">
            <span className="inline-block px-3 py-1 bg-primary-foreground/15 border border-primary-foreground/25 text-primary-foreground/90 text-xs font-semibold uppercase tracking-[0.18em] rounded-full backdrop-blur-sm">
              After the free 48 hours
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-primary-foreground font-bold leading-[1.05] tracking-tight">
              The website is live.
              <br />
              Now what to do with it.
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-xl">
              Plans, templates and add-ons that quietly compound after launch —
              chosen for taste, not filler.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 px-6 rounded-lg bg-background text-primary hover:bg-background/90 font-bold shadow-elev"
              >
                <Link to="/onboarding">Claim my free website</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-6 rounded-lg bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link to="/how-it-works">How the 48 hours work</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Jump-to strip */}
      <JumpStrip />

      {/* Plans */}
      <section id="plans" className="scroll-mt-24">
        <SectionHeader
          icon={CreditCard}
          eyebrow="Plans"
          title="A plan for whichever chapter you're in"
          description="Transparent PKR pricing. Hosting, limits and support included — no surprise line items."
          to="/pricing"
          ctaLabel="View all plans"
        />
        {plansLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {plans.map((p: any) => {
              const isFree = p.type === "free" || p.price_pkr === 0;
              const features: string[] = Array.isArray(p.features) ? p.features : [];
              return (
                <Card key={p.id} className={cardShell}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-base">{p.name}</p>
                      {isFree && <Badge variant="secondary">Starter</Badge>}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <p className="text-3xl font-bold font-display text-primary">
                        {isFree ? "Free" : `PKR ${p.price_pkr.toLocaleString()}`}
                      </p>
                      {!isFree && p.duration_days && (
                        <span className="text-xs text-muted-foreground">
                          / {p.duration_days}d
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground border-t border-border/40 pt-3">
                      {p.max_products} products · {p.max_categories} categories ·{" "}
                      {p.max_pages ?? 5} pages · {p.team_users ?? 1} seat
                      {(p.team_users ?? 1) > 1 ? "s" : ""}
                    </p>
                    {features.length > 0 && (
                      <ul className="space-y-1.5">
                        {features.slice(0, 3).map((f) => (
                          <li
                            key={f}
                            className="text-xs flex items-start gap-1.5 text-foreground/80"
                          >
                            <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" />{" "}
                            {f}
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

      {/* Templates — grid + right sidebar filters */}
      <section id="templates" className="scroll-mt-24">
        <SectionHeader
          icon={LayoutTemplate}
          eyebrow="Templates"
          title="Launch-ready website templates"
          description="Beautiful, conversion-focused designs. Free and premium options — installed within 24–48h."
          to="/templates"
          ctaLabel="Browse all templates"
        />

        {templatesLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : templates.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">
            Templates coming soon.
          </p>
        ) : (
          <div>
            {/* Result meta bar */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {filteredTemplates.length}
                </span>{" "}
                of {templates.length} templates
              </p>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetTplFilters}
                  className="h-8 text-xs"
                >
                  <X className="h-3 w-3 mr-1" /> Clear filters
                </Button>
              )}
            </div>

            {filteredTemplates.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 py-16 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  No templates match these filters.
                </p>
                <Button variant="outline" size="sm" onClick={resetTplFilters}>
                  Reset filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTemplates.map((t: any) => {
                  const isFree = !t.price_pkr || t.price_pkr === 0;
                  return (
                    <Link
                      key={t.id}
                      to={`/templates/${t.id}`}
                      className={cardShell}
                    >
                      {t.preview_image_url ? (
                        <img
                          src={t.preview_image_url}
                          alt={t.name}
                          loading="lazy"
                          decoding="async"
                          className="h-44 w-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-44 w-full bg-gradient-to-br from-primary/10 to-accent/10" />
                      )}
                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm truncate">
                            {t.name}
                          </p>
                          <Badge
                            variant={isFree ? "secondary" : "default"}
                            className="shrink-0 text-[10px]"
                          >
                            {isFree
                              ? "Free"
                              : `PKR ${Number(t.price_pkr).toLocaleString()}`}
                          </Badge>
                        </div>
                        {t.category && (
                          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            {t.category}
                            {t.subcategory ? ` · ${t.subcategory}` : ""}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        )}
      </section>

      {/* Unified catalog */}
      <section id="catalog" className="scroll-mt-24">
        <CatalogGrid
          previewLimit={4}
          header={{
            icon: Sparkles,
            eyebrow: "Catalog",
            title: "Everything you can add to your site",
            description:
              "Add-ons, integrations, pages, popups, plan upgrades and content updates — all in one place.",
          }}
        />
      </section>

      {/* Sister Business Services — 3-up strip, shared shell */}
      <section id="sister" className="scroll-mt-24">
        <SectionHeader
          icon={ExternalLink}
          eyebrow="Sister services"
          title="More from the Busistree family"
          description="Specialized platforms that complement your store — hosted separately, built to work together."
          to="/contact"
          ctaLabel="Talk to us"
        />
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            {
              name: "Bizplan",
              tagline: "Business Planning",
              description:
                "Investor-ready business plans, financial projections and go-to-market roadmaps.",
              icon: ClipboardList,
              href: "https://plan.busistree.com",
            },
            {
              name: "Biztyle",
              tagline: "Printing & Creative Studio",
              description:
                "Packaging, branding, graphic design and marketing visuals — concept to delivery.",
              icon: Sparkles,
              href: "https://style.busistree.com",
            },
            {
              name: "Bizmarket",
              tagline: "Ads & Marketing",
              description:
                "Campaigns, promotions and performance ads for growth-stage brands.",
              icon: Megaphone,
              href: "https://market.busistree.com",
            },
          ].map((svc) => (
            <a
              key={svc.name}
              href={svc.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cardShell}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                    <svc.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <ExternalLink className="h-3 w-3" /> External
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-1">
                    {svc.tagline}
                  </p>
                  <h3 className="font-display text-2xl font-bold tracking-tight">
                    {svc.name}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">{svc.description}</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary pt-1">
                  Visit site
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
