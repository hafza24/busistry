import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CreditCard, LayoutTemplate, Sparkles, Check, Loader2, ExternalLink, ClipboardList, Palette, Megaphone } from "lucide-react";
import CatalogGrid from "@/components/catalog/CatalogGrid";
import marketplaceHero from "@/assets/marketplace-hero.jpg";
import marketplaceTemplates from "@/assets/marketplace-templates.jpg";
import marketplaceAddons from "@/assets/marketplace-addons.jpg";

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

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl space-y-20">
      <SEO
        title="Marketplace — Plans, Templates & Addons | Busistree"
        description="Everything you need to launch and grow your Busistree store — pricing plans, ready-made templates, and installable add-ons in one place."
        path="/marketplace"
      />

      {/* Hero — Dynamic Bento */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Feature Banner */}
        <div className="lg:col-span-7 relative overflow-hidden rounded-3xl bg-primary flex flex-col justify-end p-6 sm:p-10 md:p-12 aspect-[4/5] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[600px] shadow-2xl">
          <img
            src={marketplaceHero}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay"
            width={1280}
            height={1024}
            sizes="(min-width: 1024px) 58vw, 100vw"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/40" />
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary-foreground" />
              <path d="M0 80 C 30 20 60 20 100 80" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary-foreground" />
            </svg>
          </div>
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-primary-foreground/10 blur-3xl" />

          <div className="relative z-10 space-y-4">
            <span className="inline-block px-3 py-1 bg-primary-foreground/15 border border-primary-foreground/25 text-primary-foreground/90 text-xs font-semibold uppercase tracking-widest rounded-full backdrop-blur-sm">
              Featured Marketplace
            </span>
            <h1 className="font-display text-4xl sm:text-6xl text-primary-foreground font-bold leading-tight">
              Scale your business<br />with Busistree.
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-md">
              Discover premium templates, powerful add-ons, and scaling plans tailored for modern digital businesses.
            </p>
            <div className="pt-4 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl bg-background text-primary hover:bg-background/90 font-bold shadow-lg">
                <Link to="/onboarding">Shop All Collections</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/how-it-works">How it works</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Category Grid Side */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 auto-rows-min">
          {/* Plans — wide */}
          <Link
            to="/pricing"
            className="sm:col-span-2 group relative overflow-hidden rounded-3xl bg-card border border-border flex items-center p-6 sm:p-8 min-h-[140px] transition-all hover:shadow-xl hover:border-primary/40"
          >
            <div className="relative z-10 w-2/3">
              <h3 className="font-display text-2xl font-bold text-foreground">Plans</h3>
              <p className="text-muted-foreground text-sm mb-4">Ready-to-deploy hosting & limits for every stage.</p>
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">Explore pricing</span>
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
            <div className="absolute right-[-10%] bottom-[-10%] w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:scale-125 transition-transform" />
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 group-hover:opacity-20 transition-opacity text-primary">
              <CreditCard className="w-24 h-24" strokeWidth={1.5} />
            </div>
          </Link>

          {/* Templates */}
          <Link
            to="/templates"
            className="group relative overflow-hidden rounded-3xl bg-foreground flex flex-col justify-end p-6 aspect-square"
          >
            <img
              src={marketplaceTemplates}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
              width={800}
              height={800}
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 24vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
            <div className="absolute top-6 left-6 z-20">
              <div className="w-10 h-10 bg-background/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-background/20">
                <LayoutTemplate className="w-5 h-5 text-background" />
              </div>
            </div>
            <div className="relative z-20">
              <h3 className="font-display text-background font-bold text-xl">Templates</h3>
              <p className="text-background/60 text-xs mt-1 uppercase tracking-tight">Launch-ready designs</p>
            </div>
          </Link>

          {/* Catalog */}
          <Link
            to="/marketplace#catalog"
            className="group relative overflow-hidden rounded-3xl bg-primary flex flex-col justify-end p-6 aspect-square"
          >
            <img
              src={marketplaceAddons}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-500"
              width={800}
              height={800}
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 24vw, 100vw"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary-glow)/0.5),transparent_70%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
            <div className="absolute top-6 left-6 z-20">
              <div className="w-10 h-10 bg-black/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-black/10">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
            <div className="relative z-20">
              <h3 className="font-display text-primary-foreground font-bold text-xl">Catalog</h3>
              <p className="text-primary-foreground/70 text-xs mt-1 uppercase tracking-tight">Add-ons · Integrations · Updates</p>
            </div>
          </Link>
        </div>
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

      {/* Unified catalog */}
      <section id="catalog" className="scroll-mt-24">
        <div className="mb-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-2">
            <Sparkles className="h-4 w-4" /> Catalog
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">Everything you can add to your site</h2>
          <p className="text-muted-foreground">Add-ons, integrations, pages, popups, plan upgrades and content updates — all in one place.</p>
        </div>
        <CatalogGrid />
      </section>

      {/* Sister Business Services (external) */}
      <section>
        <SectionHeader
          icon={ExternalLink}
          eyebrow="Sister services"
          title="More from the Busistree family"
          description="Specialized platforms that complement your store — hosted separately, built to work together."
          to="/contact"
          ctaLabel="Talk to us"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: "Bizplan",
              tagline: "Business Planning",
              description: "Craft investor-ready business plans, financial projections, and go-to-market roadmaps with expert guidance.",
              icon: ClipboardList,
              href: "https://plan.busistree.com",
              gradient: "from-primary/15 to-primary-glow/10",
            },
            {
              name: "Biztyle",
              tagline: "Premium Printing & Creative Studio",
              description: "Printing ideas into powerful brands — packaging, branding, graphic design, and marketing visuals from concept to delivery.",
              icon: Sparkles,
              href: "https://style.busistree.com",
              gradient: "from-violet-500/20 to-fuchsia-500/10",
              theme: "biztyle",
            },
            {
              name: "Bizmarket",
              tagline: "Ads & Marketing",
              description: "Launch campaigns, promotions, and performance ads — end-to-end marketing strategy for growth-stage brands.",
              icon: Megaphone,
              href: "https://market.busistree.com",
              gradient: "from-primary-glow/20 to-accent/10",
            },
          ].map((svc: any) => {
            const isBiztyle = svc.theme === "biztyle";
            return (
            <a
              key={svc.name}
              href={svc.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative overflow-hidden rounded-3xl border transition-all hover:shadow-xl ${
                isBiztyle
                  ? "border-violet-500/30 bg-[#0b0616] hover:border-violet-400/60 hover:shadow-violet-500/20"
                  : "border-border/60 bg-card hover:border-primary/40"
              }`}
            >
              {isBiztyle ? (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.35),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(217,70,239,0.25),transparent_55%)]" />
                  <div
                    className="absolute inset-0 opacity-[0.15] mix-blend-screen"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.4) 1px,transparent 1px)",
                      backgroundSize: "28px 28px",
                    }}
                  />
                </>
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${svc.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
              )}
              <div className="relative p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg ${
                      isBiztyle
                        ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white border border-white/10 shadow-violet-500/40"
                        : "bg-background/80 backdrop-blur-sm border border-border/60 text-primary"
                    }`}
                  >
                    <svc.icon className="h-6 w-6" />
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] gap-1 ${
                      isBiztyle ? "bg-white/10 text-violet-100 border border-white/10 hover:bg-white/15" : ""
                    }`}
                  >
                    <ExternalLink className="h-3 w-3" /> External
                  </Badge>
                </div>
                <div>
                  <p
                    className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                      isBiztyle ? "text-violet-300" : "text-primary"
                    }`}
                  >
                    {svc.tagline}
                  </p>
                  <h3
                    className={`font-display text-2xl font-bold ${
                      isBiztyle
                        ? "bg-gradient-to-r from-violet-200 via-fuchsia-300 to-violet-400 bg-clip-text text-transparent"
                        : ""
                    }`}
                  >
                    {svc.name}
                  </h3>
                </div>
                <p className={`text-sm ${isBiztyle ? "text-violet-100/70" : "text-muted-foreground"}`}>
                  {svc.description}
                </p>
                <div
                  className={`flex items-center gap-2 text-sm font-semibold pt-2 ${
                    isBiztyle ? "text-violet-300" : "text-primary"
                  }`}
                >
                  Visit site
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </a>
            );
          })}
        </div>
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
