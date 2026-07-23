import SEO from "@/components/SEO";
import teamHafzaAsset from "@/assets/team-hafza.png.asset.json";
const teamHafza = teamHafzaAsset.url;
import teamRohmaAsset from "@/assets/team-rohma.png.asset.json";
const teamRohma = teamRohmaAsset.url;
import teamAsimAsset from "@/assets/team-asim.png.asset.json";
const teamAsim = teamAsimAsset.url;
import step01Asset from "@/assets/step-01.jpg.asset.json";
import step02Asset from "@/assets/step-02.jpg.asset.json";
import step03Asset from "@/assets/step-03.jpg.asset.json";
import step04Asset from "@/assets/step-04.jpg.asset.json";
const stepImages = [step01Asset.url, step02Asset.url, step03Asset.url, step04Asset.url];
import TrustBadges from "@/components/TrustBadges";
import SectionHeading from "@/components/SectionHeading";
import ReviewsSection from "@/components/feedback/ReviewsSection";
import PricingSlider from "@/components/PricingSlider";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Linkedin, Twitter, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

const trust = ["Live in 48 hours", "Written, designed, shipped", "Yours to keep, forever"];

const fallbackTemplates = [
  { name: "Fashion Store", niche: "Fashion", icon: ShoppingBag },
  { name: "Electronics Store", niche: "Electronics", icon: ShoppingBag },
  { name: "Beauty Brand", niche: "Beauty", icon: Sparkles },
  { name: "Agency Website", niche: "Agency", icon: Briefcase },
  { name: "Booking System", niche: "Booking", icon: Calendar },
];

const steps = [
  { num: "01", icon: LayoutTemplate, title: "Pick a template.", desc: "Browse 100+ launch-ready templates — stores, portfolios, landing pages. Choose the one that fits your business.", gradient: "from-primary to-primary" },
  { num: "02", icon: PencilRuler, title: "Share your content.", desc: "Send us your logo, copy, images and products — or let us write and source them. A short form is all it takes.", gradient: "from-primary to-primary-glow" },
  { num: "03", icon: Palette, title: "We build in 48 hours.", desc: "Our team designs, writes and ships your site to production — mobile-ready, SEO-clean and fast, free of cost.", gradient: "from-primary to-primary" },
  { num: "04", icon: Rocket, title: "Launch & grow.", desc: "Go live on your domain, add a store, connect payments, and scale with add-ons whenever your business is ready.", gradient: "from-primary to-primary" },
];


const includes = [
  { icon: Globe, title: "Positioning & business plan" },
  { icon: Smartphone, title: "Free 48-hour website" },
  { icon: LayoutDashboard, title: "Brand identity & guidelines" },
  { icon: CreditCard, title: "Product & packaging design" },
  { icon: ShoppingBag, title: "Editorial content & creatives" },
  { icon: MessageCircle, title: "Launch & always-on promos" },
];

const tiers = [
  {
    name: "The Free Site",
    blurb: "A launch-ready website, on the house.",
    price: "PKR 0",
    delivery: "48 hours",
    features: ["Designed & written for you", "Up to 10 pages / 10 products", "Mobile, fast, SEO-clean", "Yours to keep, forever"],
    highlighted: false,
  },
  {
    name: "The Studio",
    blurb: "The website, dressed properly.",
    price: "PKR 24,999",
    delivery: "3–5 days",
    features: ["Everything in Free Site", "Brand identity + guidelines", "Product / packaging design", "Payment & WhatsApp set up"],
    highlighted: true,
  },
  {
    name: "The Whole Business",
    blurb: "Plan, ship, brand, market — one studio.",
    price: "PKR 49,999",
    delivery: "24–48 hours priority",
    features: ["Everything in Studio", "Written business plan", "Launch campaign + creatives", "30-day marketing support"],
    highlighted: false,
  },
];

const testimonials = [
  { name: "Ayesha K.", role: "Founder, Lume Atelier", quote: "The site was live in a weekend. The brand followed the week after. It never felt rushed." },
  { name: "Hamza R.", role: "Owner, Northwind Co.", quote: "I've hired three agencies. This is the first one that actually shipped — and it was the free part." },
  { name: "Sana M.", role: "Director, Helix Studio", quote: "Packaging, paid ads, product pages. Same voice, same taste, same team. Rare." },
];

const comparison = [
  { feature: "Launch-ready website in 48 hours", busistry: true, shopify: false, dev: false },
  { feature: "Included at no cost", busistry: true, shopify: false, dev: false },
  { feature: "Brand, product & packaging in-house", busistry: true, shopify: false, dev: false },
  { feature: "Marketing that keeps running after launch", busistry: true, shopify: false, dev: false },
  { feature: "One studio, one point of contact", busistry: true, shopify: false, dev: false },
];

const faqs = [
  { q: "The website is really free?", a: "Yes. A launch-ready site — designed, written and deployed — at no cost, delivered inside 48 hours. It's yours to keep whether or not you ever hire us for anything else." },
  { q: "Where's the catch?", a: "There isn't one. We over-invest in the first 48 hours so the work speaks for itself. If it does, most founders continue with us for branding, packaging or marketing. If it doesn't, you walk away with a real website — free." },
  { q: "Do I need any technical or design skills?", a: "None. Share the brief; we handle strategy, writing, design, build and launch. You keep every login, every asset and full ownership." },
  { q: "How fast is 48 hours, really?", a: "Two working days from a completed brief. Most sites go live between Monday morning and Wednesday morning. Brand and marketing engagements take one to two weeks depending on scope." },
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

const AnimatedStat = ({ value }: { value: string }) => {
  const match = /^(\d+(?:\.\d+)?)(.*)$/.exec(value);
  const [display, setDisplay] = useState(match ? "0" : value);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!match) { setDisplay(value); return; }
    const target = parseFloat(match[1]);
    const suffix = match[2];
    const decimals = (match[1].split(".")[1] || "").length;
    const el = ref.current;
    if (!el) return;
    const run = () => {
      if (started.current) return;
      started.current = true;
      const duration = 1400;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const current = (target * eased).toFixed(decimals);
        setDisplay(current + suffix);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) run(); });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return <span ref={ref}>{display}</span>;
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
              <AnimatedStat value={s.v} />
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
        features: Array.from(new Set([
          `Up to ${p.max_products} products`,
          `${p.max_categories} categories`,
          `${p.max_pages ?? 5} pages`,
          `${p.team_users ?? 1} team user${(p.team_users ?? 1) > 1 ? "s" : ""}`,
          `${p.email_accounts ?? 0} email account${(p.email_accounts ?? 0) === 1 ? "" : "s"}`,
          p.domain_type === "own" ? "Own custom domain" : "Free subdomain",
          `${(p.platform_type ?? "wordpress").replace(/^\w/, (c: string) => c.toUpperCase())} platform`,
          ...(p.duration_days ? [`${p.duration_days} days hosting`] : ["Lifetime access"]),
          ...(Array.isArray(p.features) ? p.features as string[] : []),
        ])),
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
        title="Busistree — A website, free. In 48 hours."
        description="A launch-ready website designed, written and shipped in 48 hours — at no cost. Plus branding, packaging and marketing when you're ready to grow."
        path="/"
      />
      {/* Hero — left-aligned copy + product mock */}
      <section id="top" className="relative border-b border-border/60 scroll-mt-24">
        <div className="container pt-6 md:pt-10 lg:pt-12 pb-16 md:pb-24">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: copy (left-aligned, no centering) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 text-left"
            >
              <div className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase text-primary">
                <span className="h-px w-6 bg-primary" />
                A website, free. In 48 hours.
              </div>

              <h1 className="mt-6 font-display text-[2.5rem] md:text-6xl lg:text-[4.25rem] leading-[1.02] tracking-tight text-foreground max-w-[16ch]">
                Your business, live by the weekend.
              </h1>

              <p className="mt-6 md:mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Busistree designs, writes and ships your website in forty-eight
                hours — at no cost. Then quietly stays on for the rest: the
                brand, the packaging, the campaigns that keep customers arriving.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="h-12 px-6 text-base rounded-lg group shadow-elev" asChild>
                  <Link to="/onboarding">
                    Claim my free website
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 text-base rounded-lg"
                  onClick={() => {
                    document.getElementById("included-services")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  See what's included
                </Button>
              </div>

              <p className="mt-5 text-sm text-muted-foreground">
                No card required · Live in 48 hours · Yours to keep
              </p>
            </motion.div>

            {/* Right: product mock (dashboard screenshot-style) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-5"
            >
              <div className="relative rounded-lg border border-border bg-card shadow-elev overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/60">
                  <span className="h-2.5 w-2.5 rounded-full bg-[hsl(8_65%_60%)]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[hsl(40_90%_60%)]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[hsl(140_50%_50%)]" />
                  <div className="ml-3 flex-1 h-6 rounded bg-background border border-border flex items-center px-2.5">
                    <span className="text-[11px] text-muted-foreground font-mono">app.busistree.com/plan</span>
                  </div>
                </div>

                {/* Dashboard body */}
                <div className="p-5 md:p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Your plan</div>
                      <div className="font-display text-lg text-foreground mt-0.5">Northwind Coffee Co.</div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" /> In progress
                    </div>
                  </div>

                  {/* Progress stages */}
                  <div className="space-y-2.5">
                    {[
                      { label: "Business plan", status: "Done", pct: 100 },
                      { label: "Brand identity", status: "Done", pct: 100 },
                      { label: "Storefront build", status: "72%", pct: 72 },
                      { label: "Launch campaign", status: "Queued", pct: 18 },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-3">
                        <div className="w-28 text-xs text-foreground/80">{s.label}</div>
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${s.pct}%` }}
                          />
                        </div>
                        <div className="w-14 text-right text-[11px] text-muted-foreground tabular-nums">{s.status}</div>
                      </div>
                    ))}
                  </div>

                  {/* Stat tiles */}
                  <div className="grid grid-cols-3 gap-2.5 pt-1">
                    <div className="rounded-md border border-border p-3">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Audience</div>
                      <div className="mt-1 font-display text-xl text-foreground">1,284</div>
                      <div className="text-[10px] text-primary mt-0.5">+312 this week</div>
                    </div>
                    <div className="rounded-md border border-border p-3">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Assets</div>
                      <div className="mt-1 font-display text-xl text-foreground">27</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Delivered</div>
                    </div>
                    <div className="rounded-md border border-border p-3">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Launch</div>
                      <div className="mt-1 font-display text-xl text-foreground">6d</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Estimated</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>



      <TrustBadges />

      {/* Template Showcase */}
      <section className="py-12 md:py-16 border-b border-border/60 bg-gradient-to-b from-background to-secondary/30">
        <div className="container">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <SectionHeading
              align="left"
              eyebrow="The free website"
              title={<>A site worth <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">paying for</span> — on the house.</>}
              subtitle="Editorial layouts, considered typography, real copy. Choose a starting point; we finish it in forty-eight hours."
            />
            <Button className="h-12 px-6 text-base rounded-lg shadow-elev group shrink-0" asChild>
              <Link to="/templates">
                View all templates
                <ArrowUpRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Button>
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
                  className="group relative bg-card/70 backdrop-blur-sm border border-border/70 rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1.5 hover:border-primary/50 transition-all duration-500"
                >
                  {/* Gradient sheen border on hover */}
                  <div className="pointer-events-none absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />

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
                        <Button variant="outline" size="lg" className="flex-1 h-10 sm:h-12 px-3 sm:px-6 text-[11px] sm:text-base rounded-lg" asChild>
                          <a href={t.demo_url} target="_blank" rel="noopener noreferrer">
                            Preview <ExternalLink className="h-3 w-3 ml-1 hidden sm:inline" />
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" size="lg" className="flex-1 h-10 sm:h-12 px-3 sm:px-6 text-[11px] sm:text-base rounded-lg" asChild>
                          <Link to="/templates">Preview</Link>
                        </Button>
                      )}
                      <Button size="lg" className="flex-1 h-10 sm:h-12 px-3 sm:px-6 text-[11px] sm:text-base rounded-lg group shadow-elev" asChild>
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




        </div>
      </section>

      {/* How It Works */}
      <section id="included-services" className="py-12 md:py-16 bg-secondary/40 border-b border-border/60 relative overflow-hidden scroll-mt-24">

        <div className="absolute inset-0 -z-10 opacity-[0.25]" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, hsl(var(--primary)/0.15), transparent 40%), radial-gradient(circle at 80% 70%, hsl(var(--accent)/0.15), transparent 40%)",
        }} />
        <div className="container">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-center">
              <SectionHeading
                align="left"
                eyebrow="What we do, exactly"
                title={<>Websites that do the <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent italic">heavy lifting</span>.</>}
                subtitle="Every free site ships in 48 hours with the essentials built-in — a fast, mobile-first design, a clear homepage, service or product pages, a working contact flow, WhatsApp and payment links, and on-page SEO so Google can actually find you."
              />
              <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
                Need more? Add a full storefront, bookings, a blog, multi-language, custom domain and email, analytics, or a CMS you can edit yourself — all on the same site, without starting over.
              </p>
              <div className="mt-6">
                <Button asChild variant="outline" className="rounded-md">
                  <Link to="/how-it-works">See how it works →</Link>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-7 mt-2 lg:mt-0 grid grid-cols-6 gap-3 sm:gap-4 lg:gap-5 auto-rows-[130px] sm:auto-rows-[150px] lg:auto-rows-[170px] w-full">
              {steps.map((s, i) => {
                // Explicit bento placement: tall | short-top / short-bottom | wide banner
                const spans = [
                  "col-start-1 col-span-3 row-start-1 row-span-2",
                  "col-start-4 col-span-3 row-start-1 row-span-1",
                  "col-start-4 col-span-3 row-start-2 row-span-1",
                  "col-start-1 col-span-6 row-start-3 row-span-1",
                ];
                return (
                  <motion.div
                    key={s.num}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className={cn("group relative", spans[i])}
                  >
                    <Link
                      to={`/how-it-works#step-${i + 1}`}
                      aria-label={`${s.title} — see how it works`}
                      className="block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-lg"
                    >
                    <div className="relative overflow-hidden rounded-lg border border-border/70 bg-card shadow-soft h-full w-full transition-shadow duration-500 group-hover:shadow-brand">
                      <img
                        src={stepImages[i]}
                        alt={s.title}
                        loading="lazy"
                        width={1024}
                        height={1280}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/0" />
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Step number — oversized display numeral */}
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 font-display text-3xl sm:text-4xl lg:text-5xl leading-none text-white/25 group-hover:text-white/60 transition-colors duration-500 tabular-nums">
                        {s.num}
                      </div>

                      {/* Eyebrow chip */}
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono font-semibold text-primary-foreground/95 tracking-[0.2em]">
                        <span className="h-px w-4 sm:w-5 bg-primary" />
                        STEP
                      </div>

                      {/* Content */}
                      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 lg:p-5 text-white">
                        <h3 className="text-sm sm:text-base lg:text-lg font-bold font-display mb-1 tracking-tight leading-tight">
                          {s.title}
                        </h3>
                        <p className="text-[11px] sm:text-xs lg:text-sm text-white/80 leading-snug line-clamp-2 lg:line-clamp-3">
                          {s.desc}
                        </p>
                      </div>

                      {/* Corner accent */}
                      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-500 group-hover:w-full" />
                    </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>




      {/* Pricing */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-secondary/40 to-background border-b border-border/60 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-[0.2]" style={{
          backgroundImage: "radial-gradient(circle at 70% 20%, hsl(var(--primary)/0.2), transparent 45%), radial-gradient(circle at 20% 80%, hsl(var(--accent)/0.15), transparent 45%)",
        }} />
        <div className="container">
          <SectionHeading
            className="mb-12 md:mb-16"
            align="left"
            eyebrow="Pricing"
            title={<>Free to launch. <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent italic">Fair to grow.</span></>}
            subtitle="Start with the free 48-hour website. Add branding, packaging or marketing whenever the business is ready — never before."
          />


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
          <SectionHeading
            className="mb-10 md:mb-14"
            align="left"
            eyebrow="Trusted by founders"
            title={<>Numbers that <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">speak for themselves</span>.</>}
            subtitle="Real sites shipped, real orders placed, real reviews from the businesses we've launched."
          />
          <LiveStats />
        </div>
      </section>


      {/* Comparison */}
      <section className="py-12 md:py-16 bg-secondary/40 border-b border-border/60 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-[0.2]" style={{
          backgroundImage: "radial-gradient(circle at 80% 20%, hsl(var(--primary)/0.18), transparent 45%), radial-gradient(circle at 20% 80%, hsl(var(--accent)/0.15), transparent 45%)",
        }} />
        <div className="container">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <SectionHeading
            className="lg:col-span-5 lg:sticky lg:top-28"
            align="left"
            eyebrow="The comparison"
            title={<>Freelancers ghost. Agencies stall. <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">We ship your site in two days.</span></>}
            subtitle="How Busistree stacks up against DIY builders and hiring a dev — for launching a real business website."
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 relative group/table"
          >
            {/* Outer aurora glow */}
            <div className="pointer-events-none absolute -inset-px rounded-lg bg-gradient-to-br from-primary/40 via-primary-glow/30 to-accent/40 opacity-60 blur-2xl group-hover/table:opacity-90 transition-opacity duration-700" />

            {/* Card */}
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/70 rounded-lg overflow-hidden shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.25)]">
              {/* Gradient border sheen */}
              <div className="pointer-events-none absolute inset-0 rounded-lg p-px bg-gradient-to-br from-white/60 via-transparent to-white/10 [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [mask-composite:exclude]" />

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
                  <span className="inline-flex items-center text-primary font-display text-sm sm:text-lg font-bold normal-case tracking-tight">
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
        </div>
      </section>




      <ReviewsSection />






      {/* FAQ */}
      <section className="py-12 md:py-16 border-b border-border/60">
        <div className="container grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              align="left"
              eyebrow="Fine print, plainly"
              title="The questions everyone asks."
            />
          </div>
          <div className="lg:col-span-7">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={f.q} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
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
  cardGradient: string;
  image: string;
  bio: string;
  socials: { linkedin?: string; twitter?: string; email?: string };
};

const TEAM: TeamMember[] = [
  {
    name: "Hafza Azam",
    role: "CEO",
    initials: "HA",
    gradient: "from-primary to-primary-glow",
    cardGradient: "from-[#8b7ecf] to-[#b8a5d9]",
    image: teamHafza,
    bio: "Hafza leads Busistree's vision and strategy. She's passionate about empowering Pakistani founders with tools that make launching a beautiful online store simple, fast and affordable.",
    socials: { linkedin: "#", twitter: "#", email: "hafza@busistree.com" },
  },
  {
    name: "Rohma Shahid",
    role: "CMO",
    initials: "RS",
    gradient: "from-primary to-primary",
    cardGradient: "from-[#389c84] to-[#6ec4a8]",
    image: teamRohma,
    bio: "Rohma drives Busistree's marketing and brand. She crafts the stories, campaigns and creative that connect ambitious founders with the platform.",
    socials: { linkedin: "#", twitter: "#", email: "rohma@busistree.com" },
  },
  {
    name: "Asim Azeemi",
    role: "CCO",
    initials: "AA",
    gradient: "from-primary to-primary",
    cardGradient: "from-[#7a8fbf] to-[#a8b8d9]",
    image: teamAsim,
    bio: "Asim leads customer success and operations. He makes sure every store request is handled with care, speed and craft — from first form to final launch.",
    socials: { linkedin: "#", twitter: "#", email: "asim@busistree.com" },
  },
];

const WRAPPERS = [
  "z-10 -translate-x-4 translate-y-3 -rotate-3 group-hover/deck:translate-x-0 group-hover/deck:translate-y-0 group-hover/deck:rotate-0 sm:group-hover/deck:-translate-x-[105%] lg:group-hover/deck:-translate-x-[115%]",
  "z-30 translate-x-0 translate-y-0 rotate-0",
  "z-20 translate-x-4 translate-y-3 rotate-3 group-hover/deck:translate-x-0 group-hover/deck:translate-y-0 group-hover/deck:rotate-0 sm:group-hover/deck:translate-x-[105%] lg:group-hover/deck:translate-x-[115%]",
];

const TeamDeck = () => {
  const [open, setOpen] = useState<TeamMember | null>(null);
  const renderCard = (m: TeamMember, opts?: { hoverHint?: boolean }) => (
    <button
      type="button"
      onClick={() => setOpen(m)}
      aria-label={`View bio for ${m.name}`}
      className="group relative w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-[2rem] cursor-pointer"
    >
      {/* Gradient card */}
      <div className={`relative aspect-[3/4] rounded-[2rem] bg-gradient-to-b ${m.cardGradient} shadow-xl overflow-hidden transition-transform duration-500 group-hover:-translate-y-1 group-hover:shadow-2xl`}>
        {/* Vertical name */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
          <span
            className="font-display font-black text-white/85 tracking-tight leading-none whitespace-nowrap drop-shadow-sm"
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontSize: "clamp(1.75rem, 4.5vw, 3.25rem)",
            }}
          >
            {m.name.split(" ")[0]}
          </span>
        </div>
        {/* Character portrait */}
        <img
          src={m.image}
          alt={m.name}
          loading="lazy"
          width={768}
          height={1024}
          className="absolute inset-x-0 bottom-0 mx-auto h-[108%] w-auto object-contain object-bottom -translate-x-2 sm:-translate-x-3 transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      {/* Role pill */}
      <div className={`relative z-10 -mt-4 mx-auto w-[75%] rounded-full bg-gradient-to-r ${m.cardGradient} shadow-lg px-3 py-2 text-center`}>
        <div className="text-white font-bold text-xs sm:text-sm tracking-wide">
          {m.role}
        </div>
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
        className="group/deck relative mx-auto hidden sm:flex items-center justify-center h-[520px] max-w-5xl"
      >
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
