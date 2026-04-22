import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Globe,
  ShoppingBag,
  TrendingUp,
  Layers,
  Check,
} from "lucide-react";

const problems = [
  "Weak branding that fails to build trust",
  "Outdated websites that lose customers",
  "Low conversions despite heavy traffic",
  "Marketing spend with no measurable return",
];

const services = [
  {
    icon: Globe,
    title: "Website Design",
    outcome: "High-conversion websites built to scale",
    desc: "Strategic interfaces engineered to turn visitors into customers.",
  },
  {
    icon: Layers,
    title: "Branding",
    outcome: "Identity systems that build trust instantly",
    desc: "Distinct, cohesive brands that command attention and respect.",
  },
  {
    icon: ShoppingBag,
    title: "E-commerce",
    outcome: "Stores optimized for sales, not just appearance",
    desc: "Conversion-first storefronts with seamless checkout flows.",
  },
  {
    icon: TrendingUp,
    title: "Marketing",
    outcome: "Performance-driven growth systems",
    desc: "Data-backed campaigns that compound revenue over time.",
  },
];

const stats = [
  { value: "+120%", label: "Avg. conversion uplift" },
  { value: "60+", label: "Brands launched" },
  { value: "4.9/5", label: "Client satisfaction" },
  { value: "14d", label: "Avg. time to launch" },
];

const process = [
  { num: "01", title: "Discover", desc: "Audit your goals, market, and audience." },
  { num: "02", title: "Design", desc: "Craft systems that align with your vision." },
  { num: "03", title: "Build", desc: "Engineer for performance and scale." },
  { num: "04", title: "Launch", desc: "Ship, measure, and iterate for growth." },
];

const work = [
  {
    tag: "E-commerce",
    title: "Aurelia Atelier",
    problem: "Low repeat purchases",
    result: "+184% retention",
  },
  {
    tag: "Branding",
    title: "Northwind Studio",
    problem: "Undifferentiated identity",
    result: "3× inbound leads",
  },
  {
    tag: "Web Design",
    title: "Helix Health",
    problem: "Confusing user journey",
    result: "+67% sign-ups",
  },
];

const Index = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[1200px] bg-primary/5 blur-3xl rounded-full" />
        </div>
        <div className="container py-24 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Now accepting Q2 projects
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-[1.05]">
              Digital systems that{" "}
              <span className="text-primary">grow businesses.</span>
            </h1>
            <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              We design and build brands, websites, and e-commerce experiences
              that turn attention into measurable revenue — for startups, brands,
              and growing businesses.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="h-12 px-7 text-base group" asChild>
                <Link to="/contact">
                  Start a Project
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="h-12 px-7 text-base" asChild>
                <Link to="/contact">Book a Strategy Call</Link>
              </Button>
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              Trusted by startups, brands & growing businesses worldwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 md:py-32 border-b border-border/60">
        <div className="container">
          <div className="grid md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-5">
              <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-4">
                The Problem
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                Most businesses don't have a traffic problem.
                <span className="text-muted-foreground"> They have a system problem.</span>
              </h2>
            </div>
            <div className="md:col-span-7 md:pt-2">
              <ul className="space-y-5">
                {problems.map((p, i) => (
                  <motion.li
                    key={p}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex gap-4 pb-5 border-b border-border/60 last:border-0"
                  >
                    <span className="text-sm font-mono text-muted-foreground pt-1">
                      0{i + 1}
                    </span>
                    <span className="text-lg text-foreground">{p}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-24 md:py-32 bg-secondary/40 border-b border-border/60">
        <div className="container">
          <div className="max-w-4xl">
            <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              The Approach
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              We don't ship deliverables.{" "}
              <span className="text-primary">We build growth systems.</span>
            </h2>
            <p className="mt-8 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
              Busistry is a digital studio built around outcomes. We turn ideas
              into scalable digital products and design brands that convert
              attention into revenue — combining strategy, design, and engineering
              under one roof.
            </p>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {["Strategy-led", "Outcome-focused", "Performance-engineered"].map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Check className="h-4 w-4 text-primary" /> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 md:py-32 border-b border-border/60">
        <div className="container">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-16">
            <div>
              <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-4">
                Services
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight max-w-2xl">
                What we do, engineered for outcomes.
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-border rounded-xl overflow-hidden border border-border">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group bg-card p-8 md:p-10 hover:bg-secondary/40 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-12">
                  <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="text-xs font-mono text-muted-foreground mb-2">
                  / {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">
                  {s.title}
                </h3>
                <p className="text-base text-foreground font-medium mb-2">
                  {s.outcome}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof */}
      <section className="py-24 md:py-32 bg-foreground text-background border-b border-border/60">
        <div className="container">
          <div className="max-w-3xl mb-16">
            <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              The Proof
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              Measurable results, not vanity metrics.
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-background/10">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-foreground p-8 md:p-10"
              >
                <div className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                  {s.value}
                </div>
                <div className="text-sm text-background/60">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 md:py-32 border-b border-border/60">
        <div className="container">
          <div className="max-w-2xl mb-16">
            <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              The Process
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Four steps from idea to launch.
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8 md:gap-4">
            {process.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="md:pr-6 md:border-r md:border-border last:border-r-0"
              >
                <div className="text-sm font-mono text-primary mb-4">{s.num}</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Work */}
      <section className="py-24 md:py-32 bg-secondary/40 border-b border-border/60">
        <div className="container">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-16">
            <div>
              <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-4">
                Selected Work
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight max-w-2xl">
                Recent transformations.
              </h2>
            </div>
            <Link
              to="/templates"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
            >
              View all work
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {work.map((w, i) => (
              <motion.div
                key={w.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 via-secondary to-accent/10 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl font-bold text-foreground/5 tracking-tighter">
                      {w.title.split(" ")[0]}
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-card/90 backdrop-blur text-xs font-medium text-foreground">
                    {w.tag}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {w.title}
                  </h3>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Problem</span>
                      <span className="text-foreground font-medium">{w.problem}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Result</span>
                      <span className="text-primary font-semibold">{w.result}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-40">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-8" />
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
              Let's build something that actually{" "}
              <span className="text-primary">grows your business.</span>
            </h2>
            <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="h-12 px-8 text-base group" asChild>
                <Link to="/contact">
                  Start a Project
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                <Link to="/contact">Book a Call</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
