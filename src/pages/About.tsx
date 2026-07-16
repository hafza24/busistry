import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Target, Heart, Users, Rocket, ShieldCheck, Globe, ArrowRight, Star, MessageSquare, ShoppingBag, TrendingUp, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import heroFounder from "@/assets/about-hero-founder.jpg";
import badgeStore from "@/assets/about-badge-store.png";
import badgeAnalytics from "@/assets/about-badge-analytics.png";

const values = [
  { icon: Target, title: "Focused on outcomes", body: "We measure success by whether your business grows — not by lines of code shipped." },
  { icon: Heart, title: "Built for Pakistan", body: "PKR pricing, local payment wallets, and support tuned to how our customers actually work." },
  { icon: ShieldCheck, title: "Honest & transparent", body: "Clear pricing, no hidden fees, and plain-language contracts you can actually read." },
  { icon: Rocket, title: "Fast by default", body: "Websites live in 24–48 hours. Iteration in days, not months." },
];

const milestones = [
  { year: "2023", title: "The idea", body: "Founded to help Pakistani businesses launch beautiful websites without the enterprise price tag." },
  { year: "2024", title: "First 100 stores", body: "Launched our template library and manual JazzCash/Easypaisa checkout to serve local merchants." },
  { year: "2025", title: "Platform launch", body: "Self-serve dashboard, marketplace add-ons, and the growth services program went live." },
  { year: "2026", title: "Where we are", body: "Serving hundreds of businesses with templates, custom builds, admin panels, and ongoing support." },
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
        title="About Busistree — Launching Pakistani businesses online"
        description="Busistree is a Pakistani SaaS platform helping small businesses launch beautiful websites in 24–48 hours with PKR pricing and local support."
        path="/about"
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="absolute inset-0 pointer-events-none opacity-60 [background:radial-gradient(60%_50%_at_50%_0%,hsl(var(--primary)/0.18),transparent_70%)]" />
        <div className="container max-w-5xl relative py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold border border-primary/20 mb-5">
            <Sparkles className="h-3.5 w-3.5" /> About Busistree
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-display text-foreground leading-tight tracking-tight">
            Websites that grow<br />Pakistani businesses.
          </h1>
          <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
            We build, launch, and manage websites for local businesses — fully branded, fully managed,
            and priced in rupees. Everything you need to sell online, without the enterprise complexity.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Button size="lg" asChild>
              <Link to="/templates">Browse templates <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/how-it-works">How it works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="container max-w-4xl py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">Our story</h2>
          <p className="text-muted-foreground mt-3">Why we started, and where we're going.</p>
        </div>
        <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground space-y-4">
          <p>
            Busistree started with a simple frustration: talented business owners across Pakistan were
            being priced out of a decent online presence. Agencies quoted lakhs for basic websites,
            freelancers vanished mid-project, and DIY builders never really fit the local reality.
          </p>
          <p>
            We built Busistree as the middle path — a productized service where you pick a template,
            we handle the customization and launch, and you get a professional website in 24 to 48
            hours at a price that makes sense in rupees.
          </p>
          <p>
            Today we serve booking businesses, tutors, travel agencies, retail stores, and service
            providers across Karachi, Lahore, Islamabad and beyond. And we're just getting started.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="container max-w-5xl py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { k: "24–48h", v: "Average launch time" },
            { k: "PKR", v: "Localized pricing" },
            { k: "100%", v: "Branded to you" },
            { k: "24/7", v: "Support channels" },
          ].map((s) => (
            <div key={s.v}>
              <div className="text-3xl md:text-4xl font-bold font-display text-primary">{s.k}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="container max-w-6xl py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">What we believe</h2>
          <p className="text-muted-foreground mt-3">The principles behind every website we ship.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

      {/* Timeline */}
      <section className="container max-w-4xl py-8 pb-16">
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
      <section className="container max-w-6xl py-16">
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
      <section className="container max-w-5xl">
        <div className="text-center rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 to-accent/5 p-10 md:p-14">
          <h2 className="text-2xl md:text-4xl font-bold font-display text-foreground">
            Ready to launch your business online?
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Meet the team behind Busistree, or start building your website today.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Button size="lg" asChild>
              <Link to="/templates"><Rocket className="h-4 w-4 mr-1" /> Get started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/team"><Users className="h-4 w-4 mr-1" /> Meet the team</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link to="/contact"><Globe className="h-4 w-4 mr-1" /> Contact us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
