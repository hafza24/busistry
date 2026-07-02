import SEO from "@/components/SEO";
import TrustBadges from "@/components/TrustBadges";
import ReviewsSection from "@/components/feedback/ReviewsSection";
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
  { num: "01", icon: MousePointerClick, title: "Choose Template", desc: "Pick a design that fits your brand." },
  { num: "02", icon: ClipboardList, title: "Fill Smart Form", desc: "Answer a few quick questions." },
  { num: "03", icon: Wand2, title: "We Customize", desc: "Our team builds it for you in 24–48 hours." },
  { num: "04", icon: Rocket, title: "Review & Launch", desc: "Approve, go live, start selling." },
];

const includes = [
  { icon: Globe, title: "Fully designed website / store" },
  { icon: Smartphone, title: "Mobile responsive" },
  { icon: LayoutDashboard, title: "WordPress dashboard access" },
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
  { feature: "Full WordPress ownership", busistry: true, shopify: false, dev: true },
];

const faqs = [
  { q: "How fast will my store be delivered?", a: "Most stores are delivered within 24–48 hours. Larger custom builds take 3–7 days depending on the plan." },
  { q: "Can I edit the website myself later?", a: "Yes. You get full WordPress dashboard access — edit content, add products, change images, and manage orders any time." },
  { q: "Do I need any technical experience?", a: "Not at all. You pick a template, answer a short form, and we handle everything from design to launch." },
  { q: "Is it built on WordPress?", a: "Yes. Every store is built on WordPress so you fully own it — no platform lock-in, no monthly subscription traps." },
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
    : tiers;

  const showcase = (templates && templates.length > 0)
    ? templates
    : fallbackTemplates.map((t, i) => ({ id: `static-${i}`, ...t, preview_image_url: null, demo_url: null }));


  return (
    <div>
      <SEO
        title="Busistree — Launch your online store in 48 hours"
        description="Done-for-you WordPress websites and ecommerce stores for Pakistani businesses. Pick a template, fill a smart form, go live in 24–48 hours."
        path="/"
      />
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[1200px] bg-primary/10 blur-3xl rounded-full" />
        </div>
        <div className="container py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground mb-8">
              <Zap className="h-3 w-3 text-primary" />
              Stores delivered in 24–48 hours
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
              Launch your online store in{" "}
              <span className="text-primary">48 hours</span> — no skills needed.
            </h1>
            <p className="mt-7 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Choose a template, submit your details, and we'll build your complete store for you.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="h-12 px-7 text-base group" asChild>
                <Link to="/templates">
                  Browse Templates
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-7 text-base" asChild>
                <Link to="/how-it-works">How It Works</Link>
              </Button>
            </div>
            <div className="mt-10 flex items-center justify-center gap-3 md:gap-6 flex-wrap text-sm text-muted-foreground">
              {trust.map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> {t}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <TrustBadges />

      {/* Template Showcase */}
      <section className="py-20 md:py-28 border-b border-border/60">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
              Templates
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Pick a starting point. <span className="text-muted-foreground">We'll make it yours.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">Fully customizable with your brand.</p>
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
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 via-secondary to-accent/10 relative overflow-hidden">
                    {t.preview_image_url ? (
                      <img src={t.preview_image_url} alt={t.name} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="h-14 w-14 text-foreground/15" />
                      </div>
                    )}
                    <Badge variant="secondary" className="absolute top-4 left-4 backdrop-blur">
                      {t.niche}
                    </Badge>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-foreground mb-4">{t.name}</h3>
                    <div className="flex gap-2">
                      {t.demo_url ? (
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <a href={t.demo_url} target="_blank" rel="noopener noreferrer">
                            Preview Demo <ExternalLink className="h-3 w-3 ml-1.5" />
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link to="/templates">Preview Demo</Link>
                        </Button>
                      )}
                      <Button size="sm" className="flex-1" asChild>
                        <Link to="/templates">Select Template</Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button variant="ghost" asChild>
              <Link to="/templates">
                View all templates <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-secondary/40 border-b border-border/60">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
              How it works
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              From template to launch in 4 simple steps.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-xs font-mono text-muted-foreground mb-2">{s.num}</div>
                <h3 className="text-lg font-semibold text-foreground mb-1.5">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 md:py-28 border-b border-border/60">
        <div className="container">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
                What you get
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                A complete, ready-to-run business website.
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                Every plan includes everything you need to operate. No surprise add-ons, no hidden fees.
              </p>
            </div>
            <div className="lg:col-span-7">
              <div className="grid sm:grid-cols-2 gap-3">
                {includes.map((f) => (
                  <div key={f.title} className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <f.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{f.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 md:py-28 bg-secondary/40 border-b border-border/60">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
              Pricing
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Simple plans. No surprises.
            </h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {displayTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative bg-card rounded-2xl p-7 border transition-all hover:shadow-xl ${
                  tier.highlighted ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]" : "border-border"
                }`}
              >
                {tier.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>
                )}
                <h3 className="text-xl font-semibold text-foreground">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{tier.blurb}</p>
                <div className="mt-5 pb-5 border-b border-border">
                  <div className="text-3xl font-bold text-foreground">{tier.price}</div>
                  <div className="text-xs text-muted-foreground mt-1">Delivered in {tier.delivery}</div>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-7" variant={tier.highlighted ? "default" : "outline"} asChild>
                  <Link to="/pricing">Start with {tier.name}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 md:py-28 border-b border-border/60">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-4xl mx-auto">
            {[
              { v: "120+", l: "Stores delivered" },
              { v: "48h", l: "Avg. launch time" },
              { v: "4.9/5", l: "Client rating" },
              { v: "100%", l: "On-time delivery" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">{s.v}</div>
                <div className="text-xs text-muted-foreground mt-1.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 md:py-28 bg-secondary/40 border-b border-border/60">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
              Why Busistree
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Faster than DIY. Cheaper than hiring.
            </h2>
          </div>
          <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 bg-secondary/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="p-4">Feature</div>
              <div className="p-4 text-center text-primary">Busistree</div>
              <div className="p-4 text-center">Shopify DIY</div>
              <div className="p-4 text-center">Hire dev</div>
            </div>
            {comparison.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-4 items-center text-sm ${i !== comparison.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="p-4 font-medium text-foreground">{row.feature}</div>
                <div className="p-4 flex justify-center">
                  {row.busistry ? <Check className="h-5 w-5 text-primary" /> : <X className="h-5 w-5 text-muted-foreground/40" />}
                </div>
                <div className="p-4 flex justify-center">
                  {row.shopify ? <Check className="h-5 w-5 text-foreground/60" /> : <X className="h-5 w-5 text-muted-foreground/40" />}
                </div>
                <div className="p-4 flex justify-center">
                  {row.dev ? <Check className="h-5 w-5 text-foreground/60" /> : <X className="h-5 w-5 text-muted-foreground/40" />}
                </div>
              </div>
            ))}
          </div>
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
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-7" />
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
