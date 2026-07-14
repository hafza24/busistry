import { Link, useParams, Navigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Rocket, ExternalLink, ArrowLeft, Check, ShieldCheck, Sparkles, Crown, Eye } from "lucide-react";
import { setPendingTemplate } from "@/hooks/useOnboarding";
import { useItemReviewStats } from "@/hooks/useReviews";
import { RatingStars, ItemBadges } from "@/components/reviews/ItemBadges";
import { cn } from "@/lib/utils";
import TemplateCustomizationNotice from "@/components/templates/TemplateCustomizationNotice";

const fmtPKR = (n: number) => `PKR ${new Intl.NumberFormat("en-PK").format(Math.round(n))}`;

type Variant = "with" | "without";

const TemplateDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: template, isLoading, error } = useQuery({
    queryKey: ["template-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("id", id!)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: stats = [] } = useItemReviewStats("template");
  const stat = stats.find((s) => s.target_id === id);

  const { data: recommended = [] } = useQuery({
    queryKey: ["template-recommended", id, template?.category],
    queryFn: async () => {
      let query = supabase
        .from("templates")
        .select("id, name, description, preview_image_url, category, subcategory, price_pkr, price_without_admin_pkr, demo_url")
        .eq("is_active", true)
        .neq("id", id!)
        .limit(4);
      if (template?.category) query = query.eq("category", template.category);
      const { data, error } = await query;
      if (error) throw error;
      if (!data || data.length === 0) {
        // fallback: any other templates
        const { data: fallback } = await supabase
          .from("templates")
          .select("id, name, description, preview_image_url, category, subcategory, price_pkr, price_without_admin_pkr, demo_url")
          .eq("is_active", true)
          .neq("id", id!)
          .limit(4);
        return fallback ?? [];
      }
      return data;
    },
    enabled: !!id && !!template,
  });

  const priceWith = Number(template?.price_with_admin_pkr ?? 0) || 0;
  const priceWithout = Number(template?.price_without_admin_pkr ?? 0) || 0;
  const basePrice = Number(template?.price_pkr ?? 0) || 0;

  const hasVariants = priceWith > 0 || priceWithout > 0;
  const effectiveWithout = priceWithout > 0 ? priceWithout : basePrice;
  const effectiveWith = priceWith > 0 ? priceWith : (basePrice > 0 ? Math.round(basePrice * 1.4) : 0);
  const priceDiff = Math.max(0, effectiveWith - effectiveWithout);

  const [variant, setVariant] = useState<Variant>("without");
  const selectedPrice = variant === "with" ? effectiveWith : effectiveWithout;

  const features = useMemo(
    () => (Array.isArray(template?.features) ? (template!.features as string[]) : []),
    [template]
  );
  const adminFeatures = useMemo(
    () => (Array.isArray(template?.admin_features) ? (template!.admin_features as string[]) : []),
    [template]
  );
  const pages = useMemo(
    () => (Array.isArray(template?.preset_pages) ? (template!.preset_pages as string[]) : []),
    [template]
  );
  const modules = useMemo(
    () => (Array.isArray(template?.preset_modules) ? (template!.preset_modules as string[]) : []),
    [template]
  );

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !template) return <Navigate to="/templates" replace />;

  // Keep Booker's dedicated page as the authoritative one
  if (template.name?.toLowerCase().includes("booker")) {
    return <Navigate to="/templates/booker" replace />;
  }

  const onboardHref = `/onboarding?template=${template.id}&admin=${variant === "with" ? "1" : "0"}`;

  const seoTitle =
    (template as any).meta_title?.trim() ||
    `${template.name} — Busistree Template`;
  const seoDescription =
    (template as any).meta_description?.trim() ||
    template.description ||
    `Launch ${template.name} in 24–48 hours, fully branded to your business.`;
  const seoKeywords: string[] =
    Array.isArray((template as any).meta_keywords) && (template as any).meta_keywords.length > 0
      ? (template as any).meta_keywords
      : [
          template.name,
          template.category,
          template.subcategory,
          template.niche,
          "website template",
          "Busistree",
        ].filter(Boolean);
  const seoImage = (template as any).og_image_url || template.preview_image_url || null;
  const seoImageAlt = (template as any).image_alt || `${template.name} website template preview`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: template.name,
    description: seoDescription,
    image: seoImage ? [seoImage] : undefined,
    category: template.category || template.niche,
    brand: { "@type": "Brand", name: "Busistree" },
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: selectedPrice || basePrice || effectiveWithout,
      availability: "https://schema.org/InStock",
      url: `https://busistry.lovable.app/templates/${template.id}`,
    },
    ...(stat && stat.review_count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: stat.avg_rating,
            reviewCount: stat.review_count,
          },
        }
      : {}),
  };

  return (
    <div className="pb-10 md:pb-14">
      <TemplateCustomizationNotice />
      <SEO
        title={seoTitle}
        description={seoDescription}
        path={`/templates/${template.id}`}
        image={seoImage}
        imageAlt={seoImageAlt}
        keywords={seoKeywords}
        type="product"
        jsonLd={productJsonLd}
      />

      {/* Premium hero backdrop */}
      <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="absolute inset-0 pointer-events-none opacity-60 [background:radial-gradient(60%_50%_at_50%_0%,hsl(var(--primary)/0.18),transparent_70%)]" />
        <div className="container max-w-6xl relative py-10 md:py-14">
          <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
            <Link to="/templates">
              <ArrowLeft className="h-4 w-4 mr-1" /> All templates
            </Link>
          </Button>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/40 opacity-40 blur-lg group-hover:opacity-60 transition-opacity" aria-hidden="true" />
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-border/60 bg-muted shadow-xl">
                {template.preview_image_url ? (
                  <img
                    src={template.preview_image_url}
                    alt={seoImageAlt}
                    className="w-full h-full object-cover object-top"
                    loading="eager"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl opacity-60">🖼️</div>
                )}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-xs font-semibold text-primary shadow-md border border-primary/20">
                  <Crown className="h-3.5 w-3.5" /> Premium template
                </div>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {template.category && <Badge>{template.category}</Badge>}
                {template.subcategory && <Badge variant="secondary">{template.subcategory}</Badge>}
                {stat && <ItemBadges stat={stat} />}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold font-display text-foreground leading-tight tracking-tight">
                {template.name}
              </h1>
            {stat && stat.review_count > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <RatingStars value={stat.avg_rating} />
                <span className="text-sm text-muted-foreground">
                  {stat.avg_rating.toFixed(1)} · {stat.review_count} review{stat.review_count === 1 ? "" : "s"}
                </span>
              </div>
            )}
            {template.description && (
              <p className="text-lg text-muted-foreground mt-4">{template.description}</p>
            )}

            {/* Variant selector */}
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVariant("without")}
                className={cn(
                  "text-left rounded-xl border p-4 transition-all",
                  variant === "without"
                    ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                    : "border-border/60 hover:border-primary/40"
                )}
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Website only
                </div>
                <div className="text-xs text-muted-foreground mt-1">Public site, no dashboard.</div>
                <div className="text-xl font-bold font-display text-foreground mt-3">
                  {effectiveWithout > 0 ? fmtPKR(effectiveWithout) : "Free"}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVariant("with")}
                className={cn(
                  "text-left rounded-xl border p-4 transition-all relative",
                  variant === "with"
                    ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                    : "border-border/60 hover:border-primary/40"
                )}
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Website + Admin panel
                </div>
                <div className="text-xs text-muted-foreground mt-1">Manage content, orders & users.</div>
                <div className="text-xl font-bold font-display text-foreground mt-3">
                  {effectiveWith > 0 ? fmtPKR(effectiveWith) : "—"}
                </div>
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mt-7">
              <Button size="lg" asChild onClick={() => setPendingTemplate(template.id)}>
                <Link to={onboardHref}>
                  <Rocket className="h-4 w-4 mr-1" />
                  Request this template · {selectedPrice > 0 ? fmtPKR(selectedPrice) : "Free"}
                </Link>
              </Button>
              {template.demo_url && (
                <Button size="lg" variant="outline" asChild className="bg-accent text-accent-foreground">

                  <a href={template.demo_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" /> Live demo
                  </a>
                </Button>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-border/60 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold font-display text-foreground">24–48h</div>
                <div className="text-xs text-muted-foreground mt-1">Setup time</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-display text-foreground">100%</div>
                <div className="text-xs text-muted-foreground mt-1">Branded to you</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-display text-foreground">PKR</div>
                <div className="text-xs text-muted-foreground mt-1">Localized pricing</div>
              </div>
            </div>
          </div>
        </div>

        {/* Long description */}
        {template.long_description && (
          <section className="mb-12 max-w-3xl">
            <h2 className="text-2xl font-bold font-display text-foreground mb-3">About this template</h2>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
              {template.long_description}
            </p>
          </section>
        )}

        {/* Features */}
        {features.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold font-display text-foreground mb-5">Included features</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {features.map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pricing breakdown */}
        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground mb-2">
            Pricing breakdown
          </h2>
          <p className="text-muted-foreground mb-6">
            Two ways to launch this template — pick the one that fits how hands-on you want to be.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Without admin */}
            <Card
              className={cn(
                "border-border/60 cursor-pointer transition-all",
                variant === "without" && "border-primary ring-2 ring-primary/20"
              )}
              onClick={() => setVariant("without")}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" /> Website only
                </div>
                <div className="text-3xl font-bold font-display text-foreground mt-3">
                  {effectiveWithout > 0 ? fmtPKR(effectiveWithout) : "Free"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">One-time · fully branded to you</div>

                <div className="mt-5 space-y-2 text-sm">
                  {[
                    "Fully designed public website",
                    "Custom branding (logo, colors, fonts)",
                    "Your content, images & copy",
                    "Mobile-responsive on all devices",
                    "Basic on-page SEO setup",
                    "Domain & hosting guidance",
                    "48-hour launch",
                  ].map((f) => (
                    <div key={f} className="flex items-start gap-2 text-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                  <div className="flex items-start gap-2 text-muted-foreground pt-2 border-t border-border/50 mt-3">
                    <span className="h-4 w-4 mt-0.5 shrink-0 text-center">—</span>
                    <span>No dashboard — content changes are handled by our team.</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-6"
                  variant={variant === "without" ? "default" : "outline"}
                  asChild
                  onClick={(e) => {
                    e.stopPropagation();
                    setVariant("without");
                    setPendingTemplate(template.id);
                  }}
                >
                  <Link to={`/onboarding?template=${template.id}&admin=0`}>
                    <Rocket className="h-4 w-4 mr-1" />
                    Choose Website only{effectiveWithout > 0 ? ` · ${fmtPKR(effectiveWithout)}` : ""}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* With admin */}
            <Card
              className={cn(
                "border-border/60 cursor-pointer transition-all relative",
                variant === "with" && "border-primary ring-2 ring-primary/20"
              )}
              onClick={() => setVariant("with")}
            >
              {priceDiff > 0 && (
                <Badge className="absolute -top-2 right-4">Most popular</Badge>
              )}
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Website + Admin panel
                </div>
                <div className="flex items-baseline gap-2 mt-3">
                  <div className="text-3xl font-bold font-display text-foreground">
                    {effectiveWith > 0 ? fmtPKR(effectiveWith) : "—"}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Everything in Website only, plus:</div>

                <div className="mt-5 space-y-2 text-sm">
                  {(adminFeatures.length > 0
                    ? adminFeatures
                    : [
                        "Secure admin login for you & your team",
                        "Edit pages, text & images yourself",
                        "Manage orders, bookings or submissions",
                        "Role-based staff access",
                        "Analytics & CSV exports",
                        "Media & file library",
                      ]
                  ).map((f) => (
                    <div key={f} className="flex items-start gap-2 text-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full mt-6"
                  variant={variant === "with" ? "default" : "outline"}
                  asChild
                  onClick={(e) => {
                    e.stopPropagation();
                    setVariant("with");
                    setPendingTemplate(template.id);
                  }}
                >
                  <Link to={`/onboarding?template=${template.id}&admin=1`}>
                    <Rocket className="h-4 w-4 mr-1" />
                    Choose Website + Admin{effectiveWith > 0 ? ` · ${fmtPKR(effectiveWith)}` : ""}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Delta explainer */}
          {priceDiff > 0 && (
            <div className="mt-6 rounded-xl border border-border/60 bg-muted/30 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-foreground">
                  <span className="font-semibold">Price difference: {fmtPKR(priceDiff)}</span>
                  <span className="text-muted-foreground">
                    {" "}covers the admin dashboard build, secure auth, role management, and ongoing self-service editing.
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {effectiveWithout > 0
                    ? `${fmtPKR(effectiveWithout)} + ${fmtPKR(priceDiff)} = ${fmtPKR(effectiveWith)}`
                    : ""}
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            All prices are one-time in PKR. Hosting, domain and payment gateway fees (if any) are billed separately by their providers.
          </p>
        </section>


        {/* Admin panel section */}
        <section className="mb-14">
          <Card className={cn(
            "border-border/60 transition-colors",
            variant === "with" && "border-primary/40 bg-primary/5"
          )}>
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <h2 className="text-xl md:text-2xl font-bold font-display text-foreground">
                      Admin panel add-on
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                    Get a secure dashboard to run the business behind your site — manage content,
                    users, orders, and analytics without touching code.
                  </p>
                </div>
                {priceDiff > 0 && (
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Add for</div>
                    <div className="text-2xl font-bold font-display text-foreground">+{fmtPKR(priceDiff)}</div>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-2 mt-6">
                {(adminFeatures.length > 0
                  ? adminFeatures
                  : [
                      "Secure login for you and your team",
                      "Manage content & pages",
                      "Orders & customer records",
                      "Role-based staff access",
                      "Analytics & exports",
                      "Media & file library",
                    ]
                ).map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {hasVariants && variant === "without" && (
                <Button className="mt-6" variant="outline" onClick={() => setVariant("with")}>
                  <ShieldCheck className="h-4 w-4 mr-1" /> Add admin panel
                </Button>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Pages & modules */}
        {(pages.length > 0 || modules.length > 0) && (
          <section className="mb-14 grid md:grid-cols-2 gap-6">
            {pages.length > 0 && (
              <Card className="border-border/60">
                <CardContent className="p-6">
                  <h3 className="font-semibold font-display text-foreground mb-3">Pages you get</h3>
                  <div className="flex flex-wrap gap-2">
                    {pages.map((p) => <Badge key={p} variant="secondary">{p}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            )}
            {modules.length > 0 && (
              <Card className="border-border/60">
                <CardContent className="p-6">
                  <h3 className="font-semibold font-display text-foreground mb-3">Modules included</h3>
                  <div className="flex flex-wrap gap-2">
                    {modules.map((m) => <Badge key={m} variant="outline">{m}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {/* CTA */}
        <section className="text-center rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 to-accent/5 p-10 md:p-14">
          <h2 className="text-2xl md:text-4xl font-bold font-display text-foreground">
            Ready to launch {template.name}?
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            We'll customize it with your brand and content — live in 24 to 48 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Button size="lg" asChild onClick={() => setPendingTemplate(template.id)}>
              <Link to={onboardHref}>
                <Rocket className="h-4 w-4 mr-1" />
                Request this template · {selectedPrice > 0 ? fmtPKR(selectedPrice) : "Free"}
              </Link>
            </Button>
            {template.demo_url && (
              <Button size="lg" variant="outline" asChild>
                <a href={template.demo_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" /> Explore live demo
                </a>
              </Button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TemplateDetail;
