import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Star,
  Linkedin,
  Mail,
  Instagram,
  Target,
  Eye,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Award,
  TrendingUp,
  HeartHandshake,
  Search,
  ClipboardList,
  Hammer,
  Rocket,
  LineChart,
  ChevronLeft,
  ChevronRight,
  Quote,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import founderHafza from "@/assets/founder-hafza.png";
import teamRohmaAsset from "@/assets/team-rohma.png.asset.json";
import teamAsimAsset from "@/assets/team-asim.png.asset.json";
import teamKiranAsset from "@/assets/team-kiran.png.asset.json";
import teamRohaAsset from "@/assets/team-roha.png.asset.json";

/* ---------------- data ---------------- */

const values = [
  { icon: Lightbulb, title: "Innovation", body: "New ideas, tested weekly. We adopt the tools and patterns that make founders' lives shorter and their brands stronger." },
  { icon: ShieldCheck, title: "Trust", body: "Transparent pricing, honest timelines, and work you own outright. No lock-in, no fine print, no surprise invoices." },
  { icon: Sparkles, title: "Simplicity", body: "One studio, one contact, one clear plan. We remove decisions so founders can focus on running the business." },
  { icon: Award, title: "Quality", body: "Editorial-grade design and engineering — the same standard whether the project is free or a long retainer." },
  { icon: TrendingUp, title: "Growth", body: "Every site ships with the analytics, SEO and content foundations to compound results over the first year." },
  { icon: HeartHandshake, title: "Customer Success", body: "Your launch is the beginning. We stay close — updates, coaching and campaigns — for as long as you're growing." },
];

const whyChoose = [
  {
    title: "A complete business ecosystem",
    body: "Strategy, brand, website, packaging, marketing and support — under one roof, with one accountable team. You never re-brief a new stranger.",
    image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1600&q=80",
    alt: "Team collaborating on a project in a bright modern office",
  },
  {
    title: "Affordable, honest pricing",
    body: "A production-quality launch website, free. Retainers and add-ons are priced flat and public — no procurement games, no surprise line items.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80",
    alt: "Person reviewing a clear pricing document at a desk",
  },
  {
    title: "48-hour delivery",
    body: "From brief to live in two working days. A dedicated pod ships in parallel — copy, design, engineering and deployment — so you don't wait weeks.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80",
    alt: "Designers and engineers reviewing work on a large screen",
  },
  {
    title: "Professional, editorial quality",
    body: "Real photography, real copy, real point of view. Nothing feels like it came out of a wizard, because none of it did.",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&q=80",
    alt: "Designer sketching a brand identity system on paper",
  },
  {
    title: "Long-term support",
    body: "Monthly updates, performance reviews and marketing sprints. A senior team stays on the account — the person who ships is the person you reach.",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
    alt: "Two colleagues reviewing analytics on a laptop",
  },
];

const FOUNDING_YEAR = 2023;

const team = [
  {
    name: "Hafza Azam",
    role: "Founder & CEO",
    image: founderHafza,
    bio: "Leads strategy, design and engineering — turning briefs into launch-ready websites in 48 hours.",
    socials: { linkedin: "#", instagram: "#", email: "hafza@busistree.com" },
  },
  {
    name: "Rohma Shahid",
    role: "Chief Marketing Officer",
    image: teamRohmaAsset.url,
    bio: "Builds the stories, campaigns and creative that connect ambitious founders with the platform.",
    socials: { linkedin: "#", instagram: "#", email: "rohma@busistree.com" },
  },
  {
    name: "Asim Azeemi",
    role: "Chief Customer Officer",
    image: teamAsimAsset.url,
    bio: "Runs customer success and operations — every request handled with care, speed and craft.",
    socials: { linkedin: "#", instagram: "#", email: "asim@busistree.com" },
  },
  {
    name: "Kiran Masood",
    role: "Head of People",
    image: teamKiranAsset.url,
    bio: "Builds the team and culture that lets senior people do their best, most careful work.",
    socials: { linkedin: "#", instagram: "#", email: "kiran@busistree.com" },
  },
  {
    name: "Roha Shahid",
    role: "Senior Fullstack Engineer",
    image: teamRohaAsset.url,
    bio: "Architects and builds the Busistree platform end-to-end — from database to pixel.",
    socials: { linkedin: "#", instagram: "#", email: "roha@busistree.com" },
  },
];

const process = [
  { icon: Search, title: "Discover", body: "A short brief and a working session. We learn the business, the audience and what success looks like in ninety days." },
  { icon: ClipboardList, title: "Plan", body: "A clear scope, sitemap and content plan — signed off before a pixel is designed. No moving targets." },
  { icon: Hammer, title: "Build", body: "Design, copy and engineering run in parallel. You see progress daily, not at the end." },
  { icon: Rocket, title: "Launch", body: "Live in forty-eight hours on your own domain, with analytics, SEO and search console configured." },
  { icon: LineChart, title: "Grow", body: "Monthly reviews, content sprints and iteration. The site gets sharper as the business does." },
];

const testimonials = [
  {
    quote: "The most professional launch we've had. From brief to live site in two days — and the writing was ours, only sharper.",
    name: "Ayesha Raza",
    role: "Founder, Noor & Co.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote: "It feels like hiring a senior in-house team without the overhead. They think like operators, not vendors.",
    name: "Bilal Ahmed",
    role: "CEO, Fern Studio",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote: "We stopped shopping for a website the day theirs went live. Traffic doubled inside a month with no paid spend.",
    name: "Mariam Iqbal",
    role: "Director, Studio Kaghaz",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote: "Straightforward pricing, senior people, and work that actually converts. Everything a small business hopes for.",
    name: "Hamza Khan",
    role: "Owner, Halcyon Coffee",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
  },
];

/* ---------------- helpers ---------------- */

function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const Reveal = ({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-700 ease-out will-change-transform",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className,
      )}
    >
      {children}
    </div>
  );
};

const Counter = ({ to, suffix = "" }: { to: number; suffix?: string }) => {
  const { ref, inView } = useInView<HTMLSpanElement>(0.4);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const duration = 1600;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <span ref={ref} className="tabular-nums">
      {n.toLocaleString()}
      {suffix}
    </span>
  );
};

/* ---------------- mission & vision toggle ---------------- */

const missionVisionSlides = [
  {
    key: "mission",
    eyebrow: "Our mission",
    title: "Launch quality, without the launch tax.",
    body: "Give every entrepreneur the same launch quality, speed and confidence that only funded teams have historically enjoyed — with none of the friction.",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80",
    icon: Target,
  },
  {
    key: "vision",
    eyebrow: "Our vision",
    title: "Days to live. Years to grow.",
    body: "A world where starting a business online takes days, not months — and where small teams look, feel and perform like established brands from day one.",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80",
    icon: Eye,
  },
];

const MissionVisionToggle = () => {
  const [active, setActive] = useState(0);
  const slide = missionVisionSlides[active];
  const other = missionVisionSlides[1 - active];
  const OtherIcon = other.icon;
  return (
    <section className="border-t border-border/60 bg-secondary/40">
      <div className="container max-w-6xl py-20 md:py-28">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary mb-3">
              Mission & vision
            </p>
            <h2
              className="font-display font-semibold text-foreground tracking-tight"
              style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)" }}
            >
              Why Busistree exists, and where it's going.
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid md:grid-cols-2 gap-8 items-stretch">
          {/* Image side — slides based on active */}
          <div
            className={cn(
              "relative order-1 transition-transform duration-700 ease-out",
              active === 1 && "md:translate-x-[calc(100%+2rem)]",
            )}
          >
            <div className="relative overflow-hidden rounded-2xl border border-border/60 shadow-brand aspect-[4/5] md:aspect-auto md:h-full min-h-[380px]">
              {missionVisionSlides.map((s, i) => (
                <img
                  key={s.key}
                  src={s.image}
                  alt={s.eyebrow}
                  loading="lazy"
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
                    active === i ? "opacity-100" : "opacity-0",
                  )}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-tr from-foreground/40 via-transparent to-transparent" />
              <button
                type="button"
                onClick={() => setActive((a) => 1 - a)}
                className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-md border border-white/30 bg-background/90 backdrop-blur px-4 h-11 text-sm font-medium text-foreground shadow-brand hover:bg-background transition-colors"
              >
                <OtherIcon className="h-4 w-4 text-primary" strokeWidth={1.8} />
                {other.eyebrow}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Text side */}
          <div
            className={cn(
              "order-2 transition-transform duration-700 ease-out flex",
              active === 1 && "md:-translate-x-[calc(100%+2rem)]",
            )}
          >
            <Card className="h-full w-full border-border/60 bg-card rounded-2xl">
              <CardContent className="p-8 md:p-10 h-full flex flex-col justify-center">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <slide.icon className="h-6 w-6" strokeWidth={1.6} />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary mb-2">
                  {slide.eyebrow}
                </p>
                <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
                  {slide.title}
                </h3>
                <p className="mt-4 text-muted-foreground leading-relaxed text-lg">
                  {slide.body}
                </p>
                <div className="mt-8 flex items-center gap-2">
                  {missionVisionSlides.map((s, i) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={`Show ${s.eyebrow}`}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        active === i ? "w-8 bg-primary" : "w-4 bg-border hover:bg-muted-foreground/40",
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- page ---------------- */


const About = () => {
  const [tIndex, setTIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTIndex((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(id);
  }, []);

  const { data: rating } = useQuery({
    queryKey: ["about-feedback-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_feedback_rating_distribution");
      if (error) throw error;
      return data?.[0] ?? { total_reviews: 0, avg_rating: 0 };
    },
  });

  const { data: liveStats } = useQuery({
    queryKey: ["about-live-stats"],
    queryFn: async () => {
      const [ordersRes, usersRes, storesRes] = await Promise.all([
        supabase
          .from("website_orders")
          .select("id", { count: "exact", head: true })
          .in("status", ["delivered", "completed", "paid"]),
        supabase
          .from("website_orders")
          .select("user_id", { count: "exact", head: false })
          .not("user_id", "is", null),
        supabase.from("stores").select("id", { count: "exact", head: true }),
      ]);
      const uniqueUsers = new Set(
        (usersRes.data ?? []).map((r: { user_id: string | null }) => r.user_id),
      ).size;
      return {
        projects: ordersRes.count ?? 0,
        businesses: uniqueUsers,
        stores: storesRes.count ?? 0,
      };
    },
  });
  const avg = Number(rating?.avg_rating ?? 4.9);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Busistree",
    url: "https://busistry.lovable.app",
    description:
      "Busistree helps entrepreneurs start, build, manage and grow their businesses through one connected ecosystem — strategy, brand, website, marketing and support.",
    foundingDate: "2023",
    founder: { "@type": "Person", name: "Hafza Azam" },
  };

  return (
    <div className="bg-background">
      <SEO
        title="About Busistree — One connected ecosystem for modern businesses"
        description="Busistree is the studio and platform helping entrepreneurs start, build, manage and grow their businesses — strategy, brand, website, marketing and support in one place."
        path="/about"
        jsonLd={jsonLd}
      />

      {/* 1 — HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2400&q=80"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_10%,hsl(var(--primary)/0.18),transparent_70%)]" />
        </div>

        <div className="container max-w-6xl py-24 md:py-32 lg:py-40">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary mb-5">
              About Busistree
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1
              className="font-display font-semibold text-foreground tracking-tight leading-[1.05] max-w-4xl"
              style={{ fontSize: "clamp(2.25rem, 5.5vw, 4.5rem)" }}
            >
              One connected ecosystem to start, build and grow a modern business.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p
              className="mt-6 text-muted-foreground max-w-2xl leading-relaxed"
              style={{ fontSize: "clamp(1rem, 1.2vw, 1.15rem)" }}
            >
              Busistree brings strategy, brand, website, marketing and support into one calm,
              accountable studio — so entrepreneurs can focus on the work only they can do.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="min-h-11">
                <Link to="/templates">Start your journey <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-h-11">
                <Link to="/contact">Contact us</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2 — OUR STORY */}
      <section className="border-t border-border/60">
        <div className="container max-w-6xl py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <Reveal>
              <div className="relative overflow-hidden rounded-2xl border border-border/60 shadow-soft group">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80"
                  alt="Entrepreneurs in a strategy meeting around a table"
                  className="w-full h-full object-cover aspect-[4/3] transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary mb-3">Our story</p>
              <h2
                className="font-display font-semibold text-foreground tracking-tight"
                style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)" }}
              >
                Built because launching a business was harder than it needed to be.
              </h2>
              <div className="mt-5 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Busistree began as a small studio quoting websites and losing weeks to conversations
                  that should have taken hours. Founders wanted proof; we wanted to make it easier.
                </p>
                <p>
                  So we redesigned the deal. A production-quality website — designed, written and
                  deployed — inside forty-eight hours, at no cost. Yours to keep, whether you hire us
                  again or not.
                </p>
                <p>
                  Today Busistree is a connected ecosystem: brand, product, marketing and long-term
                  support, delivered by a small senior team that stays close to every account.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3 — MISSION & VISION */}
      <MissionVisionToggle />

      {/* 4 — CORE VALUES */}
      <section className="border-t border-border/60">
        <div className="container max-w-6xl py-20 md:py-28">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary mb-3">Core values</p>
              <h2
                className="font-display font-semibold text-foreground tracking-tight"
                style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)" }}
              >
                The principles behind every decision.
              </h2>
            </div>
          </Reveal>
          {/* Mobile: horizontal scroll rail. sm+: wrapping row. */}
          <div className="mt-12 -mx-4 sm:mx-0 overflow-x-auto sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex sm:flex-wrap items-stretch gap-3 px-4 sm:px-0 w-max sm:w-auto snap-x snap-mandatory sm:snap-none">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={(i % 6) * 60}>
                <div className="group relative snap-start">
                  <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card px-5 h-12 sm:h-11 cursor-default transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-brand group-hover:-translate-y-0.5">
                    <v.icon className="h-4 w-4 text-primary shrink-0" strokeWidth={1.8} />
                    <h3 className="font-display text-sm font-semibold text-foreground whitespace-nowrap">
                      {v.title}
                    </h3>
                  </div>
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-20 w-72 max-w-[80vw] -translate-x-1/2 opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100"
                  >
                    <div className="rounded-xl border border-border/60 bg-popover text-popover-foreground shadow-brand p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary mb-1">
                        {v.title}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
            </div>
          </div>
        </div>
      </section>


      {/* 6 — STATS */}
      <section className="border-t border-border/60">
        <div className="container max-w-6xl py-20 md:py-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {(() => {
              const yearsExp = Math.max(1, new Date().getFullYear() - FOUNDING_YEAR);
              const avgRating = Number(rating?.avg_rating ?? 0);
              const satisfaction = avgRating > 0 ? Math.round((avgRating / 5) * 100) : 98;
              const dynamicStats = [
                { value: liveStats?.projects ?? 0, suffix: "+", label: "Projects delivered" },
                { value: liveStats?.businesses ?? 0, suffix: "+", label: "Businesses supported" },
                { value: yearsExp, suffix: "", label: "Years of experience" },
                { value: satisfaction, suffix: "%", label: "Customer satisfaction" },
              ];
              return dynamicStats.map((s, i) => (
                <Reveal key={s.label} delay={i * 80}>
                  <div className="text-center md:text-left">
                    <div
                      className="font-display font-semibold text-foreground tracking-tight"
                      style={{ fontSize: "clamp(2rem, 4.5vw, 3.25rem)" }}
                    >
                      <Counter to={s.value} suffix={s.suffix} />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
                  </div>
                </Reveal>
              ));
            })()}
          </div>
        </div>
      </section>

      {/* 7 — FOUNDER */}
      <section className="border-t border-border/60 bg-secondary/40">
        <div className="container max-w-6xl py-20 md:py-28">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-center">
            <Reveal>
              <div className="relative mx-auto max-w-sm">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-primary-glow/10 to-transparent blur-2xl rounded-3xl" />
                <div className="relative overflow-hidden rounded-2xl border border-border/60 shadow-brand bg-card">
                  <img
                    src={team[0].image}
                    alt={team[0].name}
                    className="w-full aspect-[4/5] object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary mb-4">
                Meet the founder
              </p>
              <Quote className="h-10 w-10 text-primary/40 mb-4" strokeWidth={1.4} />
              <blockquote
                className="font-display font-medium text-foreground tracking-tight leading-[1.2]"
                style={{ fontSize: "clamp(1.35rem, 2.6vw, 2rem)" }}
              >
                "Launching a business online shouldn't take six weeks or a retainer. We built
                Busistree so founders can start on day one — with the same craft big brands take
                months to buy."
              </blockquote>
              <div className="mt-8 flex items-center gap-4">
                <div>
                  <div className="font-semibold text-foreground">{team[0].name}</div>
                  <div className="text-sm text-muted-foreground">{team[0].role}</div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <a href={team[0].socials.linkedin} aria-label="LinkedIn" className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary/60 transition-colors">
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a href={team[0].socials.instagram} aria-label="Instagram" className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary/60 transition-colors">
                    <Instagram className="h-4 w-4" />
                  </a>
                  <a href={`mailto:${team[0].socials.email}`} aria-label="Email" className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary/60 transition-colors">
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 8 — TEAM */}
      <section className="border-t border-border/60">
        <div className="container max-w-6xl py-20 md:py-28">
          <Reveal>
            <div className="max-w-2xl mb-14">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary mb-3">The team</p>
              <h2
                className="font-display font-semibold text-foreground tracking-tight"
                style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)" }}
              >
                Senior people, working on your account.
              </h2>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.slice(1).map((m, i) => (
              <Reveal key={m.name} delay={i * 80}>
                <div className="group text-center">
                  <div className="relative mx-auto w-40 h-40 md:w-44 md:h-44 rounded-full overflow-hidden border border-border/60 shadow-soft transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-brand bg-secondary">
                    <img
                      src={m.image}
                      alt={m.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{m.name}</h3>
                  <div className="text-sm text-primary mt-0.5">{m.role}</div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{m.bio}</p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <a href={m.socials.linkedin} aria-label={`${m.name} on LinkedIn`} className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary/60 transition-colors">
                      <Linkedin className="h-3.5 w-3.5" />
                    </a>
                    <a href={`mailto:${m.socials.email}`} aria-label={`Email ${m.name}`} className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary/60 transition-colors">
                      <Mail className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 9 — PROCESS */}
      <section className="border-t border-border/60 bg-secondary/40">
        <div className="container max-w-6xl py-20 md:py-28">
          <Reveal>
            <div className="max-w-2xl mb-14">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary mb-3">How we work</p>
              <h2
                className="font-display font-semibold text-foreground tracking-tight"
                style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)" }}
              >
                A calm process, from first call to compounding growth.
              </h2>
            </div>
          </Reveal>

          {/* Desktop horizontal */}
          <div className="hidden md:block relative">
            <div className="absolute left-0 right-0 top-6 h-px bg-border" aria-hidden />
            <ol className="grid grid-cols-5 gap-6 relative">
              {process.map((p, i) => (
                <Reveal key={p.title} delay={i * 100}>
                  <li className="text-left">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-background border border-border flex items-center justify-center text-primary shadow-soft">
                        <p.icon className="h-5 w-5" strokeWidth={1.6} />
                      </div>
                    </div>
                    <div className="mt-5 font-mono text-[11px] tracking-widest text-muted-foreground">
                      STEP 0{i + 1}
                    </div>
                    <h3 className="mt-1 font-display text-lg font-semibold text-foreground">{p.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>

          {/* Mobile vertical */}
          <ol className="md:hidden relative border-l border-border/70 ml-5 space-y-8">
            {process.map((p, i) => (
              <Reveal key={p.title} delay={i * 80}>
                <li className="pl-6 relative">
                  <span className="absolute -left-[13px] top-0 h-6 w-6 rounded-full bg-background border border-border flex items-center justify-center text-primary">
                    <p.icon className="h-3 w-3" />
                  </span>
                  <div className="font-mono text-[11px] tracking-widest text-muted-foreground">
                    STEP 0{i + 1}
                  </div>
                  <h3 className="mt-1 font-display text-base font-semibold text-foreground">{p.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 10 — TESTIMONIALS */}
      <section className="border-t border-border/60">
        <div className="container max-w-5xl py-20 md:py-28">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary mb-3">Testimonials</p>
              <h2
                className="font-display font-semibold text-foreground tracking-tight"
                style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)" }}
              >
                Trusted by teams that shipped with us.
              </h2>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={cn("h-4 w-4", n <= Math.round(avg) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30")} />
                  ))}
                </div>
                <span><strong className="text-foreground">{avg.toFixed(1)}</strong>/5 average rating</span>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="relative rounded-2xl border border-border/60 bg-card shadow-soft p-8 md:p-12">
              <Quote className="absolute top-6 left-6 h-8 w-8 text-primary/25" strokeWidth={1.4} />
              <div className="min-h-[180px] flex flex-col justify-center">
                <blockquote
                  key={tIndex}
                  className="font-display text-foreground text-center max-w-3xl mx-auto leading-relaxed animate-fade-in"
                  style={{ fontSize: "clamp(1.1rem, 2vw, 1.4rem)" }}
                >
                  "{testimonials[tIndex].quote}"
                </blockquote>
                <div className="mt-8 flex items-center justify-center gap-4">
                  <img
                    src={testimonials[tIndex].avatar}
                    alt={testimonials[tIndex].name}
                    className="h-12 w-12 rounded-full object-cover border border-border"
                    loading="lazy"
                  />
                  <div className="text-left">
                    <div className="font-semibold text-foreground">{testimonials[tIndex].name}</div>
                    <div className="text-sm text-muted-foreground">{testimonials[tIndex].role}</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={() => setTIndex((i) => (i - 1 + testimonials.length) % testimonials.length)}
                  aria-label="Previous testimonial"
                  className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary/60 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTIndex(i)}
                      aria-label={`Testimonial ${i + 1}`}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        i === tIndex ? "w-8 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground/40",
                      )}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setTIndex((i) => (i + 1) % testimonials.length)}
                  aria-label="Next testimonial"
                  className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary/60 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 11 — CTA */}
      <section className="border-t border-border/60">
        <div className="container max-w-6xl py-16 md:py-24">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-10 md:p-16 lg:p-20 text-center shadow-soft">
            <div
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
              aria-hidden="true"
            />
            <div className="relative">
              <h2
                className="font-display font-semibold text-foreground tracking-tight max-w-3xl mx-auto"
                style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
              >
                Ready to build a business that looks, feels and performs like a brand?
              </h2>
              <p className="mt-5 text-muted-foreground max-w-xl mx-auto">
                Start with a free 48-hour website. No card, no trial, no fine print — just the work.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <Button asChild size="lg" className="min-h-11">
                  <Link to="/templates">Start your journey <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="min-h-11">
                  <Link to="/contact">Talk to the team</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
