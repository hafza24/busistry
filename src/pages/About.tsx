import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Target, Heart, Rocket, ShieldCheck, Globe, ArrowRight, Star, MessageSquare, ShoppingBag, TrendingUp, CheckCircle2, Linkedin, Mail, Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import heroFounder from "@/assets/about-hero-founder.jpg";
import badgeStore from "@/assets/about-badge-store.png";
import badgeAnalytics from "@/assets/about-badge-analytics.png";
import storyIllustration from "@/assets/about-story-illustration.png";
import founderHafza from "@/assets/founder-hafza.png";
import teamRohmaAsset from "@/assets/team-rohma.png.asset.json";
import teamAsimAsset from "@/assets/team-asim.png.asset.json";
import teamKiranAsset from "@/assets/team-kiran.png.asset.json";
import teamRohaAsset from "@/assets/team-roha.png.asset.json";

const team = [
  {
    name: "Hafza Azam",
    role: "CEO",
    image: founderHafza,
    cardGradient: "from-[#6b5cb8] via-[#8b7ecf] to-[#b8a5d9]",
    bio: "Hafza leads Busistree's vision and strategy. She's passionate about empowering Pakistani founders with tools that make launching a beautiful online store simple, fast and affordable.",
    socials: { linkedin: "#", instagram: "#", email: "hafza@busistree.com" },
  },
  {
    name: "Rohma Shahid",
    role: "CMO",
    image: teamRohmaAsset.url,
    cardGradient: "from-[#389c84] to-[#6ec4a8]",
    bio: "Rohma drives Busistree's marketing and brand. She crafts the stories, campaigns and creative that connect ambitious founders with the platform.",
    socials: { linkedin: "#", instagram: "#", email: "rohma@busistree.com" },
  },
  {
    name: "Asim Azeemi",
    role: "CCO",
    image: teamAsimAsset.url,
    cardGradient: "from-[#7a8fbf] to-[#a8b8d9]",
    bio: "Asim leads customer success and operations. He makes sure every store request is handled with care, speed and craft — from first form to final launch.",
    socials: { linkedin: "#", instagram: "#", email: "asim@busistree.com" },
  },
  {
    name: "Kiran Masood",
    role: "HR Manager",
    image: teamKiranAsset.url,
    cardGradient: "from-[#7c5fb8] to-[#b89ad9]",
    bio: "Kiran leads people and culture at Busistree. She builds the team, nurtures talent, and makes sure everyone has what they need to do their best work.",
    socials: { linkedin: "#", instagram: "#", email: "kiran@busistree.com" },
  },
  {
    name: "Roha Shahid",
    role: "Senior Fullstack Developer",
    image: teamRohaAsset.url,
    cardGradient: "from-[#4a7c6f] to-[#8ab8a8]",
    bio: "Roha architects and builds Busistree end-to-end. From database schemas to pixel-perfect interfaces, she ships the platform that Pakistani founders rely on every day.",
    socials: { linkedin: "#", instagram: "#", email: "roha@busistree.com" },
  },
];



const values = [
  { icon: Target, title: "Free means free", body: "The 48-hour website costs nothing. No card, no trial, no fine print. If we don't earn the next brief, we've still done the work." },
  { icon: Heart, title: "Editorial over templated", body: "Every site gets real copy, real images and a real point of view. If it looks like it came out of a wizard, we haven't done our job." },
  { icon: ShieldCheck, title: "One studio, one voice", body: "Strategy, writing, design, engineering and marketing sit in one room. You never hand the same story to a new stranger." },
  { icon: Rocket, title: "Ship, then refine", body: "Live in forty-eight hours beats perfect in six weeks. Momentum, then polish — never the other way around." },
];

const milestones = [
  { year: "2023", title: "The 48-hour promise", body: "Started as a small studio with one rule: any business we take on goes live inside two working days." },
  { year: "2024", title: "The studio grew a spine", body: "Added BizStyle in-house — identity, product and packaging design under the same roof as the site." },
  { year: "2025", title: "Free became the default", body: "Made the launch website free. The work speaks; the rest of the business is optional, not obligatory." },
  { year: "2026", title: "Here, now", body: "A small senior team, shipping websites in forty-eight hours and quietly building the brands behind them." },
];

const About = () => {
  const { data: stats } = useQuery({
    queryKey: ["about-feedback-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_feedback_rating_distribution");
      if (error) throw error;
      return data?.[0] ?? { total_reviews: 0, avg_rating: 0 };
    },
  });

  const { data: previewReviews = [] } = useQuery({
    queryKey: ["about-preview-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_feedback_reviews" as any)
        .select("id, subject, message, rating, created_at")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const total = Number(stats?.total_reviews ?? 0);
  const avg = Number(stats?.avg_rating ?? 0);


  return (
    <div className="pb-16">
      <SEO
        title="About Busistree — The studio behind the 48-hour website"
        description="A small senior studio shipping launch-ready websites in forty-eight hours — free — and quietly building the brand, packaging and marketing behind them."
        path="/about"
      />

      {/* Hero — Datify-style split layout */}
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/5 via-background to-accent/10">
        <div className="absolute inset-0 pointer-events-none opacity-60 [background:radial-gradient(60%_50%_at_80%_20%,hsl(var(--primary)/0.14),transparent_70%),radial-gradient(50%_50%_at_15%_90%,hsl(var(--accent)/0.14),transparent_70%)]" />
        <div className="container max-w-6xl relative py-16 md:py-24">
          <div className="grid md:grid-cols-[1.05fr_1fr] gap-12 md:gap-16 items-center">
            {/* Left copy */}
            <div className="relative text-center lg:text-left order-2 lg:order-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-4">
                — The studio behind the 48-hour website
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-foreground leading-[1.05] tracking-tight">
                A small studio,{" "}
                <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                  a two-day promise,
                </span>{" "}
                and the quiet work that follows.
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mt-6 max-w-lg mx-auto lg:mx-0">
                Busistree ships your website — free — in forty-eight hours.
                Then, if the work is good enough, we stay on for the brand, the
                packaging and the marketing. That's it. That's the whole studio.
              </p>

              {/* Action row */}
              <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3 max-w-md mx-auto lg:mx-0">
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="flex items-center gap-2 p-1.5 pl-4 rounded-full bg-card border border-border/70 shadow-soft flex-1 focus-within:border-primary/50 focus-within:shadow-brand transition-all"
                >
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                    aria-label="Email address"
                  />
                  <Button asChild size="sm" className="rounded-full h-10 px-5 shrink-0">
                    <Link to="/templates">Get started</Link>
                  </Button>
                </form>
              </div>

              <div className="mt-5 flex justify-center lg:justify-start">
                <Link
                  to="/how-it-works"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors group"
                >
                  See how it works
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            {/* Right visual */}
            <div className="relative order-1 lg:order-2 mx-auto w-full max-w-md lg:max-w-none aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5]">
              {/* Soft blob backdrop */}
              <div className="absolute inset-4 sm:inset-6 rounded-[3rem] bg-gradient-to-br from-primary/15 via-primary-glow/10 to-accent/20 blur-2xl" />
              <div className="absolute inset-6 sm:inset-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-accent/10" />

              {/* Portrait */}
              <div className="absolute inset-y-4 left-1/2 -translate-x-1/2 w-[78%] sm:w-[70%] lg:w-[72%] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden ring-1 ring-border/60 shadow-[0_30px_80px_-20px_hsl(var(--primary)/0.35)] z-10">
                <img
                  src={heroFounder}
                  alt="Pakistani business owner smiling with a laptop showing their new website"
                  className="w-full h-full object-cover"
                  width={1024}
                  height={1280}
                />
              </div>

              {/* Floating card — Analytics badge (top right) */}
              <div className="absolute top-6 right-0 sm:right-2 z-20 flex items-center gap-2.5 rounded-2xl bg-card/95 backdrop-blur border border-border/70 shadow-lg p-2.5 pr-3.5 animate-float-slow">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center shrink-0">
                  <img src={badgeAnalytics} alt="" className="h-7 w-7 object-contain" loading="lazy" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Growth</div>
                  <div className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" /> +38% MoM
                  </div>
                </div>
              </div>

              {/* Floating card — Store badge (mid left) */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 sm:-left-2 z-20 flex items-center gap-2.5 rounded-2xl bg-card/95 backdrop-blur border border-border/70 shadow-lg p-2.5 pr-3.5 animate-float-slow" style={{ animationDelay: "1.2s" }}>
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent/20 to-primary-glow/20 flex items-center justify-center shrink-0">
                  <img src={badgeStore} alt="" className="h-7 w-7 object-contain" loading="lazy" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Live store</div>
                  <div className="text-xs sm:text-sm font-bold text-foreground">Launched in 36h</div>
                </div>
              </div>

              {/* Floating card — Reviewer profile (bottom left) */}
              <div className="absolute bottom-4 left-0 sm:left-2 z-20 flex items-center gap-2.5 rounded-2xl bg-card/95 backdrop-blur border border-border/70 shadow-lg p-2.5 pr-4 animate-float-slow" style={{ animationDelay: "2.4s" }}>
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                  AR
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-foreground leading-tight">Ayesha Raza</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="h-3 w-3 text-primary" /> Verified customer
                  </div>
                </div>
              </div>

              {/* Floating card — Rating (bottom right) */}
              <div className="absolute bottom-8 right-0 sm:-right-1 z-20 flex flex-col rounded-2xl bg-card/95 backdrop-blur border border-border/70 shadow-lg px-3.5 py-2.5 animate-float-slow" style={{ animationDelay: "1.8s" }}>
                <div className="flex gap-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-xs sm:text-sm font-bold text-foreground">4.9 / 5</div>
                <div className="text-[10px] text-muted-foreground">1,200+ reviews</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="container max-w-6xl py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-primary-glow/5 to-accent/10 blur-3xl rounded-full" />
            <img
              src={storyIllustration}
              alt="Founder illustration representing the Busistree story"
              className="w-full max-w-md mx-auto h-auto object-contain drop-shadow-[0_20px_40px_hsl(var(--primary)/0.15)]"
              loading="lazy"
            />
          </div>
          <div className="order-1 lg:order-2">
            <div className="text-center lg:text-left mb-6">
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">The story, briefly</h2>
              <p className="text-muted-foreground mt-3">Why we made the website free.</p>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground space-y-4">
              <p>
                We started as most studios do — quoting, negotiating, chasing.
                And we kept losing weeks to conversations that should have taken
                hours. Founders wanted to see the work; we wanted to prove it.
              </p>
              <p>
                So we changed the deal. We build your website — designed,
                written, deployed — inside forty-eight hours, at no cost.
                No trial, no watermark, no card on file. You get a real site,
                yours to keep, whether you ever hire us for anything else.
              </p>
              <p>
                Most of the time, founders continue with us — for the brand,
                the packaging, the campaigns. Sometimes they don't. Either way,
                the free work stands on its own. That's the point.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="container max-w-5xl py-14 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { k: "Plan", v: "Strategy & positioning" },
            { k: "Presence", v: "Websites, stores, packaging" },
            { k: "Design", v: "Brand & product design" },
            { k: "Promote", v: "Marketing & launch promos" },
          ].map((s) => (
            <div key={s.v}>
              <div className="text-2xl md:text-3xl font-bold font-display text-primary">{s.k}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.v}</div>
            </div>
          ))}
        </div>
      </section>


      {/* Values */}
      <section className="container max-w-6xl py-20 md:py-28">

        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">What we believe</h2>
          <p className="text-muted-foreground mt-3">The principles behind every website we ship.</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {values.map((v) => (
            <Card key={v.title} className="border-border/60 hover:border-primary/40 hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold font-display text-foreground mb-1">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="container max-w-6xl py-20 md:py-28">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">— Meet the founder</div>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">The person behind Busistree</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            A product-minded builder shipping launch-ready websites in forty-eight hours.
          </p>
        </div>

        {/* Founder feature */}
        {(() => {
          const m = team[0];
          return (
            <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center mb-16">
              <div className="order-2 md:order-1">
                <div className="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-primary mb-4">
                  <span className="h-px w-10 bg-primary/60" />
                  Founder
                </div>
                <h3 className="text-2xl md:text-3xl font-bold font-display tracking-tight leading-tight text-foreground">
                  “We're giving away a <span className="italic font-light text-primary">100k-worth website for free</span> — because launching online shouldn't wait six weeks or cost a retainer.”
                </h3>
                <p className="mt-4 text-muted-foreground leading-relaxed max-w-xl">
                  Hafza Azam is the founder & CEO of Busistree. A product-minded builder from Pakistan, she leads strategy, design and engineering — shipping conversion-ready websites in 48 hours that would normally cost lacs, so people can have portfolios, stores, management systems and invites.
                </p>
                <div className="flex items-center gap-2 mt-6">
                  {m.socials.linkedin && (
                    <a href={m.socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`}
                       className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-all shadow-sm">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {m.socials.instagram && (
                    <a href={m.socials.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on Instagram`}
                       className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-all shadow-sm">
                      <Instagram className="h-4 w-4" />
                    </a>
                  )}
                  {m.socials.email && (
                    <a href={`mailto:${m.socials.email}`} aria-label={`Email ${m.name}`}
                       className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-all shadow-sm">
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
              <div className="order-1 md:order-2 flex items-center justify-center">
                <img src={m.image} alt={m.name} className="w-full h-auto object-contain drop-shadow-2xl" />
              </div>
            </div>
          );
        })()}

      </section>

      {/* Timeline */}
      <section className="container max-w-4xl py-20 md:py-28">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">Our journey</h2>
        </div>
        <ol className="relative border-l border-border/60 ml-3 space-y-8">
          {milestones.map((m) => (
            <li key={m.year} className="pl-6">
              <span className="absolute -left-2 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
              <div className="text-xs font-semibold text-primary">{m.year}</div>
              <h3 className="font-semibold font-display text-foreground mt-1">{m.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{m.body}</p>
            </li>
          ))}
        </ol>
      </section>


      {/* Reviews */}
      <section className="container max-w-6xl py-20 md:py-28">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold border border-primary/20 mb-4">
            <MessageSquare className="h-3.5 w-3.5" /> What customers say
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">
            Loved by <span className="text-primary">{total.toLocaleString()}+</span> businesses
          </h2>
          {total > 0 && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={cn(
                      "h-4 w-4",
                      n <= Math.round(avg) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30",
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                <strong className="text-foreground">{avg.toFixed(1)}</strong>/5 average rating
              </span>
            </div>
          )}
        </div>

        {previewReviews.length > 0 && (
          <div className="grid md:grid-cols-3 gap-5">
            {previewReviews.map((r) => (
              <Card key={r.id} className="border-border/60 hover:border-primary/40 hover:shadow-md transition-all">
                <CardContent className="p-6">
                  {r.rating && (
                    <div className="flex gap-0.5 mb-3">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={cn(
                            "h-3.5 w-3.5",
                            n <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30",
                          )}
                        />
                      ))}
                    </div>
                  )}
                  {r.subject && (
                    <h3 className="font-semibold font-display text-foreground line-clamp-2 mb-2">
                      {r.subject}
                    </h3>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-line">
                    {r.message}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Button size="lg" variant="outline" asChild>
            <Link to="/reviews">
              Read all reviews <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="container max-w-5xl pb-4">
        <div className="text-center rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 to-accent/5 p-10 md:p-16">
          <h2 className="text-2xl md:text-4xl font-bold font-display text-foreground">
            Ready to launch your business online?
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Start your free 48-hour website today — no card, no catch.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Button size="lg" asChild>
              <Link to="/templates"><Rocket className="h-4 w-4 mr-1" /> Get started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact"><Globe className="h-4 w-4 mr-1" /> Contact us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
