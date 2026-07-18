import SEO from "@/components/SEO";
import TrustBadges from "@/components/TrustBadges";
import ReviewsSection from "@/components/feedback/ReviewsSection";
import PricingSlider from "@/components/PricingSlider";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Linkedin, Twitter, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  ShoppingBag,
  Briefcase,
  Calendar,
  Globe,
  LayoutDashboard,
  MousePointerClick,
  ClipboardList,
  Wand2,
  LayoutTemplate,
  PencilRuler,
  Palette,
  Rocket,
  Smartphone,
  CreditCard,
  MessageCircle,
  Settings2,
  Check,
  X,
  Star,
  Zap,
  ExternalLink,
} from "lucide-react";

const trust = ["Strategy included", "In-house design", "End-to-end delivery"];

const fallbackTemplates = [
  { name: "Fashion Store", niche: "Fashion", icon: ShoppingBag },
  { name: "Electronics Store", niche: "Electronics", icon: ShoppingBag },
  { name: "Beauty Brand", niche: "Beauty", icon: Sparkles },
  { name: "Agency Website", niche: "Agency", icon: Briefcase },
  { name: "Booking System", niche: "Booking", icon: Calendar },
];

const steps = [
  { num: "01", icon: LayoutTemplate, title: "Plan Your Business", desc: "We map your offer, audience and goals — a clear plan before anything gets built.", gradient: "from-sky-500 to-blue-600" },
  { num: "02", icon: PencilRuler, title: "Build Your Presence", desc: "Website, store, packaging and product identity — a full digital presence, done for you.", gradient: "from-primary to-primary-glow" },
  { num: "03", icon: Palette, title: "Design That Sells", desc: "Brand, visuals and content crafted to convert — not just to look pretty.", gradient: "from-violet-500 to-fuchsia-500" },
  { num: "04", icon: Rocket, title: "Market & Grow", desc: "Launch campaigns, promos and always-on marketing to bring customers in.", gradient: "from-emerald-500 to-teal-600" },
];

const includes = [
  { icon: Globe, title: "Business plan & positioning" },
  { icon: Smartphone, title: "Website / online store built" },
  { icon: LayoutDashboard, title: "Brand identity & guidelines" },
  { icon: CreditCard, title: "Product & packaging design" },
  { icon: ShoppingBag, title: "Content & creatives ready" },
  { icon: MessageCircle, title: "Launch & promo campaigns" },
];

const tiers = [
  {
    name: "Starter",
    blurb: "Get online with the essentials",
    price: "PKR 9,999",
    delivery: "5–7 days",
    features: ["Up to 10 products / 5 pages", "Basic customization", "Mobile responsive", "Contact form"],
    highlighted: false,
  },
  {
    name: "Growth",
    blurb: "Most popular for scaling brands",
    price: "PKR 24,999",
    delivery: "3–5 days",
    features: ["Up to 50 products / 10 pages", "Advanced customization", "Payment gateway setup", "WhatsApp integration", "SEO basics"],
    highlighted: true,
  },
  {
    name: "Premium",
    blurb: "Full-stack build with priority delivery",
    price: "PKR 49,999",
    delivery: "24–48 hours",
    features: ["Unlimited products / pages", "Premium customization", "All integrations", "Priority delivery", "30 days support"],
    highlighted: false,
  },
];

const testimonials = [
  { name: "Ayesha K.", role: "Founder, Lume Atelier", quote: "They planned the brand, built the store, and ran our launch promos. One team for everything." },
  { name: "Hamza R.", role: "Owner, Northwind Co.", quote: "It felt less like hiring an agency and more like getting an in-house business team." },
  { name: "Sana M.", role: "Director, Helix Studio", quote: "From packaging to paid ads — every piece was on-brand and on time." },
];

const comparison = [
  { feature: "Planning & positioning included", busistry: true, shopify: false, dev: false },
  { feature: "Website / store fully built for you", busistry: true, shopify: false, dev: true },
  { feature: "Brand, product & packaging design", busistry: true, shopify: false, dev: false },
  { feature: "Marketing & launch campaigns", busistry: true, shopify: false, dev: false },
  { feature: "One partner, one clear plan", busistry: true, shopify: false, dev: false },
];

const faqs = [
  { q: "What exactly does Busistree do?", a: "We're a business hub. We handle four things end-to-end: planning your business, building your digital presence (website, store, packaging), designing your brand and products, and running marketing and promos." },
  { q: "Do I have to buy everything together?", a: "No. Start with a website, brand, or a marketing campaign — add the rest whenever you're ready. Everything is modular but built to work together." },
  { q: "Do I need any technical or design skills?", a: "None. You share your goals, we do the strategy, design, build and launch. You always keep full ownership and access." },
  { q: "How fast can we launch?", a: "Most websites and stores go live within 24–48 hours. Full brand + launch campaigns typically take 1–2 weeks depending on scope." },
];

const ROTATING_PHRASES = [
  "Plan your business",
  "Build your website",
  "Launch your store",
  "Design your brand",
  "Package your product",
  "Run your promos",
  "Grow your audience",
  "…all in one hub.",
];

const RotatingWords = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % ROTATING_PHRASES.length), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-block align-baseline min-w-[9ch]">
      <AnimatePresence mode="wait">
        <motion.span
          key={ROTATING_PHRASES[i]}
          initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="inline-block font-semibold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent"
        >
          {ROTATING_PHRASES[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

const LiveStats = () => {
  const { data } = useQuery({
    queryKey: ["home-live-stats"],
    queryFn: async () => {
      const [delivered, ratingRes, ordersRes, reviewsRes] = await Promise.all([
        supabase
          .from("website_orders")
          .select("id", { count: "exact", head: true })
          .in("status", ["completed", "delivered"]),
        supabase.rpc("get_feedback_rating_stats"),
        supabase.from("website_orders").select("id", { count: "exact", head: true }),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
      ]);
      const rating = (ratingRes.data as any)?.[0] ?? { avg_rating: 0, total_reviews: 0 };
      return {
        delivered: delivered.count ?? 0,
        totalOrders: ordersRes.count ?? 0,
        avgRating: Number(rating.avg_rating ?? 0),
        totalReviews: (Number(rating.total_reviews ?? 0) || 0) + (reviewsRes.count ?? 0),
      };
    },
    staleTime: 60_000,
  });

  const stats = [
    { v: data ? `${data.delivered}${data.delivered >= 10 ? "+" : ""}` : "—", l: "Sites delivered" },
    { v: data ? `${data.totalOrders}${data.totalOrders >= 10 ? "+" : ""}` : "—", l: "Orders placed" },
    { v: data && data.avgRating > 0 ? `${data.avgRating.toFixed(1)}/5` : "New", l: "Client rating" },
    { v: data ? `${data.totalReviews}` : "—", l: "Reviews shared" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
      {stats.map((s, i) => (
        <motion.div
          key={s.l}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
          className="group relative"
        >
          <div className="relative h-full rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-5 md:p-6 text-center overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="relative text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              {s.v}
            </div>
            <div className="relative text-[11px] md:text-xs text-muted-foreground mt-2 font-medium tracking-[0.15em] uppercase">
              {s.l}
            </div>
            <div className="relative mx-auto mt-3 h-0.5 w-8 rounded-full bg-gradient-to-r from-primary to-accent origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const useHeroStats = () => {
  return useQuery({
    queryKey: ["home-live-stats"],
    queryFn: async () => {
      const [delivered, ratingRes, ordersRes, reviewsRes] = await Promise.all([
        supabase
          .from("website_orders")
          .select("id", { count: "exact", head: true })
          .in("status", ["completed", "delivered"]),
        supabase.rpc("get_feedback_rating_stats"),
        supabase.from("website_orders").select("id", { count: "exact", head: true }),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
      ]);
      const rating = (ratingRes.data as any)?.[0] ?? { avg_rating: 0, total_reviews: 0 };
      return {
        delivered: delivered.count ?? 0,
        totalOrders: ordersRes.count ?? 0,
        avgRating: Number(rating.avg_rating ?? 0),
        totalReviews: (Number(rating.total_reviews ?? 0) || 0) + (reviewsRes.count ?? 0),
      };
    },
    staleTime: 60_000,
  });
};

const HeroStatsRow = () => {
  const { data } = useHeroStats();
  const items = [
    { v: data ? `${data.delivered}${data.delivered >= 10 ? "+" : ""}` : "—", l: "Sites delivered" },
    { v: data ? `${data.totalOrders}${data.totalOrders >= 10 ? "+" : ""}` : "—", l: "Orders placed" },
    { v: data && data.avgRating > 0 ? `${data.avgRating.toFixed(1)}/5` : "New", l: "Client rating" },
  ];
  return (
    <div className="mt-10 flex flex-wrap gap-8">
      {items.map((s) => (
        <div key={s.l}>
          <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{s.v}</div>
          <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
        </div>
      ))}
    </div>
  );
};

const HeroFloatingRating = () => {
  const { data } = useHeroStats();
  const label = data && data.avgRating > 0 ? `${data.avgRating.toFixed(1)} / 5 rating` : "New — be the first";
  return (
    <div className="absolute top-1/3 -left-4 md:-left-8 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border shadow-soft text-xs font-medium">
      <Star className="h-3 w-3 text-amber-500 fill-amber-500" /> {label}
    </div>
  );
};

const HeroFloatingReviewsCard = () => {
  const { data } = useHeroStats();
  const has = !!(data && data.avgRating > 0);
  return (
    <div className="absolute -bottom-4 right-2 md:right-6 bg-card border border-border rounded-2xl shadow-brand p-3 flex items-center gap-3">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
        ))}
      </div>
      <div className="text-xs">
        <div className="font-bold text-foreground">{has ? `${data!.avgRating.toFixed(1)} / 5` : "New"}</div>
        <div className="text-muted-foreground">
          {data ? `from ${data.totalReviews}${data.totalReviews >= 10 ? "+" : ""} review${data.totalReviews === 1 ? "" : "s"}` : "loading…"}
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  const { data: templates } = useQuery({
    queryKey: ["home_templates"],
    queryFn: async () => {
      const { data } = await supabase
        .from("templates")
        .select("id, name, niche, preview_image_url, demo_url")
        .eq("is_active", true)
        .limit(6);
      return data ?? [];
    },
  });

  const { data: dbPlans } = useQuery({
    queryKey: ["home_plans"],
    queryFn: async () => {
      const { data } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("price_pkr");
      return data ?? [];
    },
  });

  const displayTiers = (dbPlans && dbPlans.length > 0)
    ? dbPlans.map((p, i, arr) => ({
        id: p.id as string,
        name: p.name,
        blurb: p.type === "free" ? "Get started free" : p.type === "rent" ? "Flexible rental plan" : "One-time purchase",
        price: p.price_pkr === 0 ? "Free" : `PKR ${p.price_pkr.toLocaleString()}`,
        delivery: p.duration_days ? `${p.duration_days} days` : "24–48 hours",
        features: (Array.isArray(p.features) ? p.features as string[] : []).length > 0
          ? (p.features as string[])
          : [
              `Up to ${p.max_products} products`,
              `${p.max_categories} categories`,
              `${p.max_pages ?? 5} pages`,
              `${p.team_users ?? 1} team user${(p.team_users ?? 1) > 1 ? "s" : ""}`,
            ],
        highlighted: arr.length > 1 && i === Math.floor(arr.length / 2),
      }))
    : tiers.map((t) => ({ ...t, id: undefined as string | undefined }));

  const liveSites = [
    {
      id: "live-tutor",
      name: "Tutor Busistree",
      niche: "Online Learning",
      demo_url: "https://tutor.busistree.com",
      preview_image_url: "https://image.thum.io/get/width/1200/crop/900/https://tutor.busistree.com",
    },
    {
      id: "live-travellinks",
      name: "TravelLinks UK",
      niche: "Travel",
      demo_url: "https://travellinks.uk",
      preview_image_url: "https://image.thum.io/get/width/1200/crop/900/https://travellinks.uk",
    },
    {
      id: "live-booker",
      name: "Booker Busistree",
      niche: "Booking",
      demo_url: "https://booker.busistree.com",
      preview_image_url: "https://image.thum.io/get/width/1200/crop/900/https://booker.busistree.com",
    },
  ];

  const showcase = liveSites;


  return (
    <div>
      <SEO
        title="Busistree — The complete hub for growing businesses"
        description="Planning, digital presence and packaging, design, and marketing — one hub for everything your business needs, from strategy to launch to growth."
        path="/"
      />
      {/* Hero — busistree split layout */}
      <section className="relative border-b border-border/60">




        <div className="container py-8 md:py-12 lg:py-14">
          <div className="grid md:grid-cols-12 gap-10 items-center">
            {/* Left: copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="md:col-span-7 relative"
            >

              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border border-primary/25 text-[11px] font-medium tracking-[0.2em] uppercase text-foreground/80 shadow-soft mb-7">
                <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">One hub · Everything your business needs</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.02]">
                The complete hub for{" "}
                <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                  growing businesses
                </span>
                .
              </h1>

              <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
                <RotatingWords />{" "}
                Planning, digital presence and packaging, design, and marketing —
                one team, one plan, everything your business needs under one roof.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button variant="glass-brand" size="lg" className="h-12 px-7 text-base rounded-full group" asChild>
                  <Link to="/marketplace">
                    Explore the hub
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="default" size="lg" className="h-12 px-7 text-base rounded-full" asChild>
                  <Link to="/how-it-works">How it works</Link>
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 max-w-lg text-sm text-muted-foreground">
                {["Business planning included", "Websites & stores built for you", "Brand, product & packaging design", "Marketing, promos & content"].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" /> {t}
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <HeroStatsRow />
            </motion.div>

            {/* Right: mockup with floating cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="md:col-span-5 relative"
            >
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-card via-secondary to-card border border-border shadow-brand">
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1000&q=80"
                  alt="Modern ecommerce store preview"
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              </div>

              {/* Floating badges */}
              <div className="absolute -top-3 right-4 md:right-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border shadow-soft text-xs font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Stores going live now
              </div>

              <HeroFloatingRating />
              <HeroFloatingReviewsCard />

              <div className="absolute bottom-8 -left-3 md:-left-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200/60 shadow-soft text-xs font-medium">
                <ShoppingBag className="h-3 w-3" /> Store ready
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      <TrustBadges />

      {/* Template Showcase */}
      <section className="py-20 md:py-28 border-b border-border/60 bg-gradient-to-b from-background to-secondary/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border border-primary/25 text-[11px] font-medium tracking-[0.2em] uppercase shadow-soft mb-5">
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">Digital Presence</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05]">
              A website, store or landing page —{" "}
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                built to convert
              </span>
            </h2>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              Conversion-focused designs, ready for your brand and products — part of your complete business hub.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {showcase.slice(0, 4).map((t: any, i: number) => {
              const Icon = (t.icon as any) ?? ShoppingBag;
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group relative bg-card/70 backdrop-blur-sm border border-border/70 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1.5 hover:border-primary/50 transition-all duration-500"
                >
                  {/* Gradient sheen border on hover */}
                  <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />

                  <div className="aspect-[4/3] bg-gradient-to-br from-secondary via-background to-secondary/60 relative overflow-hidden">
                    {t.preview_image_url ? (
                      <img
                        src={t.preview_image_url}
                        alt={t.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full scale-150" />
                          <Icon className="relative h-16 w-16 text-primary/40" />
                        </div>
                      </div>
                    )}

                    {/* Image overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <Badge
                      variant="secondary"
                      className="absolute top-2 left-2 sm:top-4 sm:left-4 backdrop-blur-md bg-background/85 border border-border/60 shadow-sm text-[9px] sm:text-[11px] font-semibold tracking-wide px-1.5 sm:px-2.5 py-0.5 sm:py-1"
                    >
                      {t.niche}
                    </Badge>
                  </div>

                  <div className="p-3 sm:p-5 relative">
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                      <h3 className="text-sm sm:text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors truncate">
                        {t.name}
                      </h3>
                      <div className="hidden sm:flex h-6 w-6 rounded-full bg-primary/10 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 translate-x-2">
                        <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                      </div>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2">
                      {t.demo_url ? (
                        <Button variant="default" size="sm" className="flex-1 rounded-full h-7 sm:h-9 text-[11px] sm:text-sm px-2 sm:px-3" asChild>
                          <a href={t.demo_url} target="_blank" rel="noopener noreferrer">
                            Preview <ExternalLink className="h-3 w-3 ml-1 hidden sm:inline" />
                          </a>
                        </Button>
                      ) : (
                        <Button variant="default" size="sm" className="flex-1 rounded-full h-7 sm:h-9 text-[11px] sm:text-sm px-2 sm:px-3" asChild>
                          <Link to="/templates">Preview</Link>
                        </Button>
                      )}
                      <Button size="sm" className="flex-1 rounded-full h-7 sm:h-9 text-[11px] sm:text-sm px-2 sm:px-3 bg-gradient-to-r from-primary to-primary-glow shadow-brand hover:shadow-lg hover:shadow-primary/25 hover:opacity-95 transition-all" asChild>
                        <Link to="/templates">
                          Select <ArrowRight className="h-3 w-3 ml-1 hidden sm:inline transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>

              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button variant="ghost" className="rounded-full group" asChild>
              <Link to="/templates">
                View all templates
                <ArrowUpRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-secondary/40 border-b border-border/60 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-[0.25]" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, hsl(var(--primary)/0.15), transparent 40%), radial-gradient(circle at 80% 70%, hsl(var(--accent)/0.15), transparent 40%)",
        }} />
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border border-primary/25 text-[11px] font-medium tracking-[0.2em] uppercase shadow-soft mb-5">
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">The four pillars</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05]">
              From idea to launch to growth —
              <br />
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                one hub, four pillars
              </span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-[52px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative bg-card/90 backdrop-blur border border-border/70 rounded-2xl p-7 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1.5 hover:border-primary/40 transition-all duration-500 overflow-hidden"
              >
                {/* subtle gradient wash on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-accent/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* step number watermark */}
                <div className="absolute top-4 right-5 text-5xl font-extrabold font-display text-foreground/[0.04] group-hover:text-primary/10 transition-colors duration-500 tracking-tight leading-none select-none">
                  {s.num}
                </div>

                <div className="relative">
                  <div className={`relative h-12 w-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-6 shadow-lg shadow-primary/10 ring-4 ring-background group-hover:scale-110 group-hover:rotate-[-4deg] transition-transform duration-500`}>
                    {/* pulsing halo */}
                    <span className="absolute inset-0 rounded-xl bg-white/30 opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
                    {/* shimmer sweep */}
                    <span className="pointer-events-none absolute inset-0 rounded-xl overflow-hidden">
                      <span className="absolute -inset-y-2 -left-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:left-[150%] transition-all duration-[900ms] ease-out" />
                    </span>
                    <s.icon
                      className={`relative h-5 w-5 text-white drop-shadow transition-transform duration-500 ${
                        i === 0 ? "group-hover:-translate-y-0.5 group-hover:translate-x-0.5" :
                        i === 1 ? "group-hover:rotate-[8deg]" :
                        i === 2 ? "group-hover:rotate-[14deg] group-hover:scale-110" :
                        "group-hover:-translate-y-1 group-hover:rotate-[-6deg]"
                      }`}
                      strokeWidth={2.25}
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-mono font-semibold text-primary tracking-[0.2em]">STEP {s.num}</span>
                    <span className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
                  </div>
                  <h3 className="text-lg font-bold font-display text-foreground mb-2 tracking-tight">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>




      {/* Pricing */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-secondary/40 to-background border-b border-border/60 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-[0.2]" style={{
          backgroundImage: "radial-gradient(circle at 70% 20%, hsl(var(--primary)/0.2), transparent 45%), radial-gradient(circle at 20% 80%, hsl(var(--accent)/0.15), transparent 45%)",
        }} />
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border border-primary/25 text-[11px] font-medium tracking-[0.2em] uppercase shadow-soft mb-6">
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05]">
              Simple plans.{" "}
              <span className="relative inline-block bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                No surprises.
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-primary/0 via-primary/60 to-accent/0"
                />
              </span>
            </h2>
            <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Rent monthly or buy for life — transparent PKR pricing, cancel anytime.
            </p>
          </div>

          <PricingSlider tiers={displayTiers} />
        </div>
      </section>


      {/* Social Proof */}
      <section className="relative py-12 md:py-16 border-b border-border/60 overflow-hidden">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        <div className="container">
          <LiveStats />
        </div>
      </section>


      {/* Comparison */}
      <section className="py-20 md:py-28 bg-secondary/40 border-b border-border/60 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-[0.2]" style={{
          backgroundImage: "radial-gradient(circle at 80% 20%, hsl(var(--primary)/0.18), transparent 45%), radial-gradient(circle at 20% 80%, hsl(var(--accent)/0.15), transparent 45%)",
        }} />
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border border-primary/25 text-[11px] font-medium tracking-[0.2em] uppercase shadow-soft mb-5">
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">Why Busistree</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05]">
              Faster than DIY.{" "}
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Cheaper than hiring.
              </span>
            </h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl mx-auto relative group/table"
          >
            {/* Outer aurora glow */}
            <div className="pointer-events-none absolute -inset-px rounded-[1.5rem] bg-gradient-to-br from-primary/40 via-primary-glow/30 to-accent/40 opacity-60 blur-2xl group-hover/table:opacity-90 transition-opacity duration-700" />

            {/* Card */}
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/70 rounded-[1.5rem] overflow-hidden shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.25)]">
              {/* Gradient border sheen */}
              <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] p-px bg-gradient-to-br from-white/60 via-transparent to-white/10 [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [mask-composite:exclude]" />

              {/* Highlighted Busistree column */}
              <div className="pointer-events-none absolute top-0 bottom-0 left-1/4 w-1/4 bg-gradient-to-b from-primary/[0.10] via-primary/[0.05] to-transparent border-x border-primary/20" />

              {/* Animated shimmer sweep */}
              <motion.div
                aria-hidden
                initial={{ x: "-120%" }}
                whileInView={{ x: "220%" }}
                viewport={{ once: true }}
                transition={{ duration: 2.2, ease: "easeInOut", delay: 0.4 }}
                className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-2xl mix-blend-overlay"
              />

              {/* Header */}
              <div className="relative grid grid-cols-4 bg-gradient-to-b from-secondary/80 to-secondary/40 text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.18em] text-muted-foreground border-b border-border/70">
                <div className="p-2.5 sm:p-5">Feature</div>
                <div className="p-2.5 sm:p-5 text-center relative">
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 text-primary">
                    <motion.span
                      animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.15, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles className="h-3 w-3" />
                    </motion.span>
                    Busistree
                  </span>
                  <span className="absolute -bottom-px left-1/2 -translate-x-1/2 h-[2px] w-10 bg-gradient-to-r from-transparent via-primary to-transparent" />
                </div>
                <div className="p-2.5 sm:p-5 text-center">Shopify DIY</div>
                <div className="p-2.5 sm:p-5 text-center">Hire dev</div>
              </div>

              {/* Rows */}
              {comparison.map((row, i) => (
                <motion.div
                  key={row.feature}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: 0.15 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative grid grid-cols-4 items-center text-xs sm:text-sm group/row hover:bg-primary/[0.04] transition-colors duration-300 ${i !== comparison.length - 1 ? "border-b border-border/50" : ""}`}
                >
                  <div className="p-3 sm:p-5 font-semibold text-foreground tracking-tight">
                    <span className="relative inline-block">
                      {row.feature}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-primary to-accent group-hover/row:w-full transition-all duration-500" />
                    </span>
                  </div>

                  <div className="p-3 sm:p-5 flex justify-center">
                    {row.busistry ? (
                      <motion.div
                        whileHover={{ scale: 1.18, rotate: 6 }}
                        transition={{ type: "spring", stiffness: 400, damping: 12 }}
                        className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-primary via-primary-glow to-accent flex items-center justify-center shadow-lg shadow-primary/30"
                      >
                        <span className="absolute inset-0 rounded-full bg-primary/40 blur-md opacity-0 group-hover/row:opacity-100 transition-opacity duration-500" />
                        <Check className="relative h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" strokeWidth={3} />
                      </motion.div>
                    ) : (
                      <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/40" />
                    )}
                  </div>

                  <div className="p-3 sm:p-5 flex justify-center opacity-70 group-hover/row:opacity-100 transition-opacity">
                    {row.shopify ? <Check className="h-4 w-4 sm:h-5 sm:w-5 text-foreground/50" strokeWidth={2.5} /> : <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/30" />}
                  </div>
                  <div className="p-3 sm:p-5 flex justify-center opacity-70 group-hover/row:opacity-100 transition-opacity">
                    {row.dev ? <Check className="h-4 w-4 sm:h-5 sm:w-5 text-foreground/50" strokeWidth={2.5} /> : <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/30" />}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>


      {/* Team */}
      <section className="py-20 md:py-28 border-b border-border/60 bg-gradient-to-b from-background to-secondary/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border border-primary/25 text-[11px] font-medium tracking-[0.2em] uppercase shadow-soft mb-5">
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">Our Team</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.05]">
              The people behind{" "}
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Busistree
              </span>
            </h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground">
              A small team obsessed with launching beautiful, high-performing stores for ambitious founders.
            </p>
          </div>

          <TeamDeck />

        </div>
      </section>

      <ReviewsSection />

      {/* Biztyle — Sister brand highlight */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-[#0b0616] border-y border-violet-500/20">
        {/* Aurora glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.35),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(217,70,239,0.28),transparent_55%)]" />
        {/* Floating orbs */}
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-fuchsia-500/25 blur-3xl" />

        <div className="container relative">
          <div className="grid md:grid-cols-12 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="md:col-span-7"
            >
              <div className="inline-flex items-center gap-3 mb-6">
                <span aria-hidden className="h-px w-8 bg-violet-300/60" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-200">
                  From the Busistree family
                </span>
              </div>

              <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
                <span className="bg-gradient-to-r from-violet-200 via-fuchsia-300 to-violet-400 bg-clip-text text-transparent">
                  BizStyle
                </span>
                <span className="block text-white/90 mt-2 text-3xl md:text-5xl">
                  Printing ideas into powerful brands.
                </span>
              </h2>

              <p className="mt-6 text-lg text-violet-100/70 max-w-xl leading-relaxed">
                Premium printing, packaging, branding and creative studio work — from concept to
                delivery. Everything your brand touches, crafted with intent.
              </p>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl">
                {["Packaging", "Branding", "Print", "Creative"].map((t) => (
                  <div
                    key={t}
                    className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm px-3 py-2.5 text-center text-xs font-semibold text-violet-100 uppercase tracking-wider"
                  >
                    {t}
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href="https://style.busistree.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 h-12 px-6 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold shadow-lg shadow-violet-500/40 hover:shadow-fuchsia-500/50 transition-shadow"
                >
                  Visit BizStyle
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-white/15 bg-white/5 text-violet-100 font-semibold hover:bg-white/10 transition-colors"
                >
                  Explore family
                </Link>
              </div>
            </motion.div>

            {/* Right — Stylized brand card stack */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="md:col-span-5 relative"
            >
              <div className="relative aspect-[4/5] max-w-md mx-auto">
                {/* Back card */}
                <div className="absolute inset-x-4 top-8 bottom-0 rounded-3xl bg-gradient-to-br from-violet-500/40 to-fuchsia-500/30 border border-white/10 blur-[1px]" />
                {/* Middle card */}
                <div className="absolute inset-x-2 top-4 bottom-2 rounded-3xl bg-gradient-to-br from-fuchsia-600/50 to-violet-700/40 border border-white/15" />
                {/* Front card */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-600 to-violet-800 border border-white/20 shadow-2xl shadow-fuchsia-500/30">
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                  <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
                  <div className="relative h-full p-8 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                        Studio
                      </span>
                    </div>
                    <div>
                      <div className="text-white/70 text-xs uppercase tracking-widest mb-2">
                        Est. Busistree
                      </div>
                      <div className="font-display text-5xl md:text-6xl font-black text-white leading-none">
                        Biz<span className="italic font-light">Style</span>
                      </div>
                      <div className="mt-4 text-white/80 text-sm">
                        Premium printing & creative studio
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>





      {/* FAQ */}
      <section className="py-20 md:py-28 border-b border-border/60">
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
              FAQ
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Questions, answered.
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-36">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.05]">
              Start your store today.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
              The easiest, fastest way to launch a fully functional website — without doing anything yourself.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" variant="default" className="h-12 px-8 text-base group rounded-full" asChild>
                <Link to="/templates">
                  Browse Templates
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="default" className="h-12 px-8 text-base rounded-full" asChild>
                <Link to="/pricing">Get Started</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

type TeamMember = {
  name: string;
  role: string;
  initials: string;
  gradient: string;
  bio: string;
  socials: { linkedin?: string; twitter?: string; email?: string };
};

const TEAM: TeamMember[] = [
  {
    name: "Hafza Azam",
    role: "CEO",
    initials: "HA",
    gradient: "from-primary to-primary-glow",
    bio: "Hafza leads Busistree's vision and strategy. She's passionate about empowering Pakistani founders with tools that make launching a beautiful online store simple, fast and affordable.",
    socials: { linkedin: "#", twitter: "#", email: "hafza@busistree.com" },
  },
  {
    name: "Rohma Shahid",
    role: "CMO",
    initials: "RS",
    gradient: "from-violet-500 to-fuchsia-500",
    bio: "Rohma drives Busistree's marketing and brand. She crafts the stories, campaigns and creative that connect ambitious founders with the platform.",
    socials: { linkedin: "#", twitter: "#", email: "rohma@busistree.com" },
  },
  {
    name: "Asim Azeemi",
    role: "CCO",
    initials: "AA",
    gradient: "from-emerald-500 to-teal-600",
    bio: "Asim leads customer success and operations. He makes sure every store request is handled with care, speed and craft — from first form to final launch.",
    socials: { linkedin: "#", twitter: "#", email: "asim@busistree.com" },
  },
];

const WRAPPERS = [
  "z-10 -translate-x-6 translate-y-2 -rotate-6 group-hover/deck:translate-x-0 group-hover/deck:translate-y-0 group-hover/deck:rotate-0 sm:group-hover/deck:-translate-x-[70%] lg:group-hover/deck:-translate-x-[105%]",
  "z-30 translate-x-0 translate-y-0 rotate-0",
  "z-20 translate-x-6 translate-y-2 rotate-6 group-hover/deck:translate-x-0 group-hover/deck:translate-y-0 group-hover/deck:rotate-0 sm:group-hover/deck:translate-x-[70%] lg:group-hover/deck:translate-x-[105%]",
];

const TeamDeck = () => {
  const [open, setOpen] = useState<TeamMember | null>(null);
  const renderCard = (m: TeamMember, opts?: { hoverHint?: boolean }) => (
    <button
      type="button"
      onClick={() => setOpen(m)}
      aria-label={`View bio for ${m.name}`}
      className="group w-full h-full text-left relative bg-card/80 backdrop-blur-sm border border-border/70 rounded-3xl p-5 sm:p-8 text-center hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-500 overflow-hidden cursor-pointer"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className={`relative mx-auto h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white text-lg sm:text-2xl font-bold shadow-lg shadow-primary/20 mb-3 sm:mb-5 ${opts?.hoverHint ? "group-hover:scale-105" : ""} transition-transform duration-500`}>
        {m.initials}
      </div>
      <h3 className="relative text-sm sm:text-xl font-bold text-foreground tracking-tight text-center truncate">
        {m.name}
      </h3>
      <div className="relative mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-semibold tracking-wider uppercase">
        {m.role}
      </div>
      <div className={`relative mt-2 sm:mt-4 text-[10px] sm:text-xs text-muted-foreground ${opts?.hoverHint ? "opacity-0 group-hover:opacity-100" : "opacity-70"} transition-opacity duration-300`}>
        Tap to read bio
      </div>
    </button>
  );

  return (
    <>
      {/* Mobile: horizontal snap scroll */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="sm:hidden"
      >
        <p className="text-xs text-muted-foreground/70 tracking-widest uppercase text-center mb-4">
          Meet the team
        </p>
        <div className="flex flex-col items-center gap-3">
          <div className="w-[62%] max-w-[220px]">
            {renderCard(TEAM[0])}
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            {TEAM.slice(1).map((m) => (
              <div key={m.name}>
                {renderCard(m)}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tablet/Desktop: hover deck */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group/deck relative mx-auto hidden sm:flex items-center justify-center h-[380px] max-w-5xl"
      >
        <p className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/70 tracking-widest uppercase opacity-100 group-hover/deck:opacity-0 transition-opacity duration-300">
          Hover to meet the team
        </p>
        {TEAM.map((m, i) => (
          <div
            key={m.name}
            className={`absolute w-[260px] sm:w-[280px] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${WRAPPERS[i]}`}
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            {renderCard(m, { hoverHint: true })}
          </div>
        ))}
      </motion.div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="sm:max-w-md">
          {open && (
            <>
              <DialogHeader className="items-center text-center">
                <div className={`mx-auto h-20 w-20 rounded-full bg-gradient-to-br ${open.gradient} flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20 mb-3`}>
                  {open.initials}
                </div>
                <DialogTitle className="text-2xl">{open.name}</DialogTitle>
                <DialogDescription className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase">
                  {open.role}
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground leading-relaxed text-center">
                {open.bio}
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                {open.socials.linkedin && (
                  <a href={open.socials.linkedin} target="_blank" rel="noreferrer" aria-label={`${open.name} on LinkedIn`} className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors">
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                {open.socials.twitter && (
                  <a href={open.socials.twitter} target="_blank" rel="noreferrer" aria-label={`${open.name} on Twitter`} className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors">
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                {open.socials.email && (
                  <a href={`mailto:${open.socials.email}`} aria-label={`Email ${open.name}`} className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors">
                    <Mail className="h-4 w-4" />
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Index;
