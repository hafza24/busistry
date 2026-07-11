import SEO from "@/components/SEO";
import TrustBadges from "@/components/TrustBadges";
import ReviewsSection from "@/components/feedback/ReviewsSection";
import PricingSlider from "@/components/PricingSlider";
import { Link } from "react-router-dom";
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
import { motion } from "framer-motion";
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

const trust = ["No coding", "Fast delivery", "Beginner-friendly"];

const fallbackTemplates = [
  { name: "Fashion Store", niche: "Fashion", icon: ShoppingBag },
  { name: "Electronics Store", niche: "Electronics", icon: ShoppingBag },
  { name: "Beauty Brand", niche: "Beauty", icon: Sparkles },
  { name: "Agency Website", niche: "Agency", icon: Briefcase },
  { name: "Booking System", niche: "Booking", icon: Calendar },
];

const steps = [
  { num: "01", icon: LayoutTemplate, title: "Choose Your Template", desc: "Browse our collection of professionally designed templates for any industry.", gradient: "from-sky-500 to-blue-600" },
  { num: "02", icon: PencilRuler, title: "Complete Smart Form", desc: "Answer a few simple questions about your brand, products, and preferences.", gradient: "from-primary to-primary-glow" },
  { num: "03", icon: Palette, title: "We Build & Customize", desc: "Our expert team transforms your template into a unique, fully-functional store.", gradient: "from-violet-500 to-fuchsia-500" },
  { num: "04", icon: Rocket, title: "Launch & Grow", desc: "Review your store, request changes, and launch with confidence.", gradient: "from-emerald-500 to-teal-600" },
];

const includes = [
  { icon: Globe, title: "Fully designed website / store" },
  { icon: Smartphone, title: "Mobile responsive" },
  { icon: LayoutDashboard, title: "Easy dashboard access" },
  { icon: CreditCard, title: "Payment & contact integration" },
  { icon: ShoppingBag, title: "Product or service setup" },
  { icon: MessageCircle, title: "WhatsApp integration" },
];

const tiers = [
  {
    name: "Starter",
    blurb: "Perfect to test the waters",
    price: "PKR 9,999",
    delivery: "5–7 days",
    features: ["Up to 10 products / 5 pages", "Basic customization", "Mobile responsive", "Contact form"],
    highlighted: false,
  },
  {
    name: "Growth",
    blurb: "Most popular for growing brands",
    price: "PKR 24,999",
    delivery: "3–5 days",
    features: ["Up to 50 products / 10 pages", "Advanced customization", "Payment gateway setup", "WhatsApp integration", "SEO basics"],
    highlighted: true,
  },
  {
    name: "Premium",
    blurb: "Full-feature, priority build",
    price: "PKR 49,999",
    delivery: "24–48 hours",
    features: ["Unlimited products / pages", "Premium customization", "All integrations", "Priority delivery", "30 days support"],
    highlighted: false,
  },
];

const testimonials = [
  { name: "Ayesha K.", role: "Founder, Lume Atelier", quote: "I had a fully working store in two days. I didn't touch a single line of code." },
  { name: "Hamza R.", role: "Owner, Northwind Co.", quote: "The form made it feel like onboarding to a real product, not commissioning a website." },
  { name: "Sana M.", role: "Director, Helix Studio", quote: "Clean, fast, and exactly what we asked for. Worth every rupee." },
];

const comparison = [
  { feature: "Done-for-you build", busistry: true, shopify: false, dev: true },
  { feature: "Launch in 24–48 hours", busistry: true, shopify: false, dev: false },
  { feature: "No technical skills needed", busistry: true, shopify: false, dev: true },
  { feature: "Fixed upfront price", busistry: true, shopify: true, dev: false },
  { feature: "Full ownership of your site", busistry: true, shopify: false, dev: true },
];

const faqs = [
  { q: "How fast will my store be delivered?", a: "Most stores are delivered within 24–48 hours. Larger custom builds take 3–7 days depending on the plan." },
  { q: "Can I edit the website myself later?", a: "Yes. You get full dashboard access — edit content, add products, change images, and manage orders any time." },
  { q: "Do I need any technical experience?", a: "Not at all. You pick a template, answer a short form, and we handle everything from design to launch." },
  { q: "Do you offer custom-coded sites too?", a: "Yes. We build both WordPress sites and fully custom-coded websites — pick whichever fits your needs and budget." },
];

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
        title="Busistree — Launch your online store in 48 hours"
        description="Done-for-you websites and ecommerce stores for Pakistani businesses — custom-coded or WordPress. Pick a template, fill a smart form, go live in 24–48 hours."
        path="/"
      />
      {/* Hero — busistree split layout */}
      <section className="relative border-b border-border/60">




        <div className="container py-8 md:py-12 lg:py-14">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left: copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 relative"
            >

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/15 to-accent/15 border border-primary/20 text-xs font-semibold tracking-wider uppercase text-primary mb-7">
                <Zap className="h-3 w-3" />
                Launch in 48 hours — Guaranteed
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.02]">
                Launch your online store in{" "}
                <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                  48 hours
                </span>{" "}
                — no skills needed.
              </h1>

              <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
                <span className="font-semibold text-foreground">We build your ecommerce store.</span>{" "}
                Choose a professionally designed template, submit your details, and our expert team
                builds your complete, ready-to-launch store — no design or coding skills required.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="h-12 px-7 text-base rounded-full bg-gradient-to-r from-primary to-primary-glow shadow-brand group" asChild>
                  <Link to="/templates">
                    Browse Templates
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-7 text-base rounded-full" asChild>
                  <Link to="/how-it-works">Watch Demo</Link>
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 max-w-lg text-sm text-muted-foreground">
                {["No design skills needed", "48-hour delivery", "100% satisfaction guarantee", "Secure & scalable"].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" /> {t}
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="mt-10 flex flex-wrap gap-8">
                {[
                  { v: "4,800+", l: "Stores launched" },
                  { v: "48hrs", l: "Average delivery" },
                  { v: "98%", l: "Client satisfaction" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{s.v}</div>
                    <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: mockup with floating cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="lg:col-span-5 relative"
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

              <div className="absolute top-1/3 -left-4 md:-left-8 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border shadow-soft text-xs font-medium">
                <Star className="h-3 w-3 text-amber-500 fill-amber-500" /> 4.9 / 5 rating
              </div>

              <div className="absolute -bottom-4 right-2 md:right-6 bg-card border border-border rounded-2xl shadow-brand p-3 flex items-center gap-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <div className="text-xs">
                  <div className="font-bold text-foreground">4.9 / 5</div>
                  <div className="text-muted-foreground">from 1,200+ reviews</div>
                </div>
              </div>

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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/15 to-accent/15 border border-primary/20 text-xs font-semibold tracking-widest uppercase text-primary mb-5">
              <LayoutDashboard className="h-3 w-3" /> Templates
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05]">
              Buy Your perfect{" "}
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Site
              </span>
            </h2>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              Hand-picked, conversion-focused designs — fully customizable with your brand.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {showcase.slice(0, 6).map((t: any, i: number) => {
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
                      className="absolute top-4 left-4 backdrop-blur-md bg-background/85 border border-border/60 shadow-sm text-[11px] font-semibold tracking-wide px-2.5 py-1"
                    >
                      {t.niche}
                    </Badge>
                  </div>

                  <div className="p-5 relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                        {t.name}
                      </h3>
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 translate-x-2">
                        <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {t.demo_url ? (
                        <Button variant="outline" size="sm" className="flex-1 rounded-full border-border/70 hover:border-primary/50 hover:bg-primary/5" asChild>
                          <a href={t.demo_url} target="_blank" rel="noopener noreferrer">
                            Preview <ExternalLink className="h-3 w-3 ml-1.5" />
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="flex-1 rounded-full border-border/70 hover:border-primary/50 hover:bg-primary/5" asChild>
                          <Link to="/templates">Preview</Link>
                        </Button>
                      )}
                      <Button size="sm" className="flex-1 rounded-full bg-gradient-to-r from-primary to-primary-glow shadow-brand hover:shadow-lg hover:shadow-primary/25 hover:opacity-95 transition-all" asChild>
                        <Link to="/templates">
                          Select <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-0.5" />
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/15 to-accent/15 border border-primary/20 text-xs font-semibold tracking-widest uppercase text-primary mb-5">
              <Zap className="h-3 w-3" /> Simple Process
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05]">
              From template to launch in
              <br />
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                4 simple steps
              </span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-[52px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
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


      {/* What You Get */}
      <section className="py-20 md:py-28 border-b border-border/60 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-[0.18]" style={{
          backgroundImage: "radial-gradient(circle at 15% 20%, hsl(var(--primary)/0.2), transparent 40%), radial-gradient(circle at 85% 80%, hsl(var(--accent)/0.15), transparent 45%)",
        }} />
        <div className="container">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-5"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/15 to-accent/15 border border-primary/20 text-xs font-semibold tracking-widest uppercase text-primary mb-5">
                <Check className="h-3 w-3" /> What you get
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.08]">
                A complete,{" "}
                <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                  ready-to-run
                </span>{" "}
                business website.
              </h2>
              <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">
                Every plan includes everything you need to operate. No surprise add-ons, no hidden fees.
              </p>
            </motion.div>
            <div className="lg:col-span-7">
              <div className="grid sm:grid-cols-2 gap-3">
                {includes.map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="group relative flex items-center gap-3 bg-card/90 backdrop-blur border border-border/70 rounded-xl p-4 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] to-accent/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-[-4deg] transition-transform duration-300">
                      <f.icon className="h-4 w-4 text-primary" strokeWidth={2.25} />
                    </div>
                    <span className="relative text-sm font-semibold text-foreground">{f.title}</span>
                    <Check className="relative ml-auto h-4 w-4 text-primary/0 group-hover:text-primary/80 transition-colors duration-300" strokeWidth={3} />
                  </motion.div>
                ))}
              </div>
            </div>
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
            <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/30 text-[11px] font-semibold tracking-[0.2em] uppercase text-primary mb-6 shadow-[0_0_0_1px_hsl(var(--primary)/0.05),0_8px_24px_-8px_hsl(var(--primary)/0.35)] backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-70 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              <CreditCard className="h-3 w-3" aria-hidden="true" />
              <span>Pricing</span>
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
              One-time payment in PKR — fully-owned site, no monthly lock-in.
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {[
              { v: "120+", l: "Stores delivered", icon: Rocket },
              { v: "48h", l: "Avg. launch time", icon: Zap },
              { v: "4.9/5", l: "Client rating", icon: Star },
              { v: "100%", l: "On-time delivery", icon: Check },
            ].map((s, i) => (
              <motion.div
                key={s.l}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                className="group relative"
              >
                <div className="relative h-full rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 md:p-5 text-center overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
                  {/* Gradient sheen on hover */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

                  <div className="relative flex justify-center mb-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <s.icon className="h-4 w-4 text-primary" strokeWidth={2.25} />
                    </div>
                  </div>

                  <div className="relative text-2xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                    {s.v}
                  </div>
                  <div className="relative text-xs text-muted-foreground mt-1 font-medium">
                    {s.l}
                  </div>

                  {/* Animated underline accent */}
                  <div className="relative mx-auto mt-2 h-0.5 w-8 rounded-full bg-gradient-to-r from-primary to-accent origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Comparison */}
      <section className="py-20 md:py-28 bg-secondary/40 border-b border-border/60 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-[0.2]" style={{
          backgroundImage: "radial-gradient(circle at 80% 20%, hsl(var(--primary)/0.18), transparent 45%), radial-gradient(circle at 20% 80%, hsl(var(--accent)/0.15), transparent 45%)",
        }} />
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/15 to-accent/15 border border-primary/20 text-xs font-semibold tracking-widest uppercase text-primary mb-5">
              <Zap className="h-3 w-3" /> Why Busistree
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05]">
              Faster than DIY.{" "}
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Cheaper than hiring.
              </span>
            </h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto bg-card/90 backdrop-blur border border-border/70 rounded-2xl overflow-hidden shadow-xl shadow-primary/5 relative"
          >
            {/* highlighted Busistree column */}
            <div className="pointer-events-none absolute top-0 bottom-0 left-1/4 w-1/4 bg-gradient-to-b from-primary/[0.08] via-primary/[0.04] to-transparent border-x border-primary/15" />

            <div className="relative grid grid-cols-4 bg-secondary/60 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground border-b border-border/70">
              <div className="p-5">Feature</div>
              <div className="p-5 text-center">
                <span className="inline-flex items-center gap-1.5 text-primary">
                  <Sparkles className="h-3 w-3" /> Busistree
                </span>
              </div>
              <div className="p-5 text-center">Shopify DIY</div>
              <div className="p-5 text-center">Hire dev</div>
            </div>
            {comparison.map((row, i) => (
              <motion.div
                key={row.feature}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`relative grid grid-cols-4 items-center text-sm group hover:bg-primary/[0.03] transition-colors ${i !== comparison.length - 1 ? "border-b border-border/60" : ""}`}
              >
                <div className="p-5 font-semibold text-foreground">{row.feature}</div>
                <div className="p-5 flex justify-center">
                  {row.busistry ? (
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-md shadow-primary/25 group-hover:scale-110 transition-transform">
                      <Check className="h-4 w-4 text-white" strokeWidth={3} />
                    </div>
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground/40" />
                  )}
                </div>
                <div className="p-5 flex justify-center">
                  {row.shopify ? <Check className="h-5 w-5 text-foreground/50" strokeWidth={2.5} /> : <X className="h-5 w-5 text-muted-foreground/30" />}
                </div>
                <div className="p-5 flex justify-center">
                  {row.dev ? <Check className="h-5 w-5 text-foreground/50" strokeWidth={2.5} /> : <X className="h-5 w-5 text-muted-foreground/30" />}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* Team */}
      <section className="py-20 md:py-28 border-b border-border/60 bg-gradient-to-b from-background to-secondary/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/15 to-accent/15 border border-primary/20 text-xs font-semibold tracking-widest uppercase text-primary mb-5">
              <Sparkles className="h-3 w-3" /> Our Team
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

          {(() => {
            const team = [
              { name: "Hafza Azam", role: "CEO", initials: "HA", gradient: "from-primary to-primary-glow" },
              { name: "Rohma Shahid", role: "CMO", initials: "RS", gradient: "from-violet-500 to-fuchsia-500" },
              { name: "Asim Azeemi", role: "CCO", initials: "AA", gradient: "from-emerald-500 to-teal-600" },
            ];
            // Stacked (default) transforms and scattered (hover) transforms per index
            const stacked = [
              "-translate-x-6 -rotate-6 translate-y-2 z-10",
              "translate-x-0 rotate-0 z-30",
              "translate-x-6 rotate-6 translate-y-2 z-20",
            ];
            const scattered = [
              "lg:-translate-x-[110%] -translate-x-2 rotate-0 translate-y-0",
              "translate-x-0 rotate-0 translate-y-0",
              "lg:translate-x-[110%] translate-x-2 rotate-0 translate-y-0",
            ];
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group/deck relative mx-auto flex items-center justify-center h-[420px] sm:h-[380px] max-w-5xl"
              >
                <p className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/70 tracking-widest uppercase opacity-100 group-hover/deck:opacity-0 transition-opacity duration-300">
                  Hover to meet the team
                </p>
                {team.map((m, i) => (
                  <div
                    key={m.name}
                    className={`absolute w-[280px] sm:w-[300px] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${stacked[i]} group-hover/deck:${scattered[i].split(" ").join(" group-hover/deck:")}`}
                    style={{ transitionDelay: `${i * 60}ms` }}
                  >
                    <div className="group relative bg-card/80 backdrop-blur-sm border border-border/70 rounded-3xl p-8 text-center hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50 transition-all duration-500 overflow-hidden">
                      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                      <div className={`relative mx-auto h-24 w-24 rounded-full bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/20 mb-5 group-hover:scale-105 transition-transform duration-500`}>
                        {m.initials}
                      </div>
                      <h3 className="relative text-xl font-bold text-foreground tracking-tight">
                        {m.name}
                      </h3>
                      <div className="relative mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase">
                        {m.role}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            );
          })()}
        </div>
      </section>

      <ReviewsSection />


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
              <Button size="lg" className="h-12 px-8 text-base group" asChild>
                <Link to="/templates">
                  Browse Templates
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                <Link to="/pricing">Get Started</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
