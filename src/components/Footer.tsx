import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ShieldCheck,
  RefreshCw,
  Lock,
  Headphones,
  ArrowRight,
  ArrowUp,
  Mail,
  MapPin,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Sparkles,
  CheckCircle2,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";

const trustRow = [
  {
    icon: ShieldCheck,
    label: "Secure Payments",
    sub: "SSL & PCI aligned",
    tint: "from-primary/15 to-primary/5",
  },
  {
    icon: RefreshCw,
    label: "7-Day Refund",
    sub: "No questions asked",
    tint: "from-primary/15 to-primary/5",
  },
  {
    icon: Lock,
    label: "Data Protected",
    sub: "End-to-end encrypted",
    tint: "from-primary/15 to-primary/5",
  },
  {
    icon: Headphones,
    label: "Human Support",
    sub: "Mon–Sat, PKT hours",
    tint: "from-amber-500/15 to-amber-500/5",
  },
];

const platformLinks = [
  { to: "/templates", label: "Templates" },
  { to: "/pricing", label: "Pricing" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/marketplace", label: "Addons" },
];

const supportLinks = [
  { to: "/contact", label: "Contact Us", external: false },
  { to: "/sitemap.xml", label: "Sitemap", external: true },
  { to: "/robots.txt", label: "Robots", external: true },
];

const legalLinks = [
  { to: "/legal/privacy", label: "Privacy Policy" },
  { to: "/legal/terms", label: "Terms of Service" },
  { to: "/legal/refund", label: "Refund Policy" },
  { to: "/legal/data-protection", label: "Data Protection" },
];

const socialLinks = [
  { href: "https://twitter.com", label: "Twitter", icon: Twitter },
  { href: "https://instagram.com", label: "Instagram", icon: Instagram },
  { href: "https://linkedin.com", label: "LinkedIn", icon: Linkedin },
  { href: "https://facebook.com", label: "Facebook", icon: Facebook },
];

const paymentMethods = [
  { name: "Easypaisa", dot: "bg-primary" },
  { name: "JazzCash", dot: "bg-rose-500" },
  { name: "NayaPay", dot: "bg-primary" },
  { name: "Raast", dot: "bg-primary" },
  { name: "Bank", dot: "bg-amber-500" },
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [ratingStats, setRatingStats] = useState<{ avg: number; total: number } | null>(null);

  useEffect(() => {
    (async () => {
      const { count } = await supabase
        .from("newsletter_subscribers")
        .select("id", { count: "exact", head: true })
        .eq("status", "subscribed");
      if (typeof count === "number") setSubscriberCount(count);

      const { data } = await supabase.rpc("get_feedback_rating_stats");
      const row = Array.isArray(data) ? data[0] : data;
      if (row) setRatingStats({ avg: Number(row.avg_rating) || 0, total: Number(row.total_reviews) || 0 });
    })();
  }, []);

  const formatCount = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k+`;
    if (n >= 100) return `${Math.floor(n / 10) * 10}+`;
    return `${n}`;
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error("Enter a valid email address");
      return;
    }
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: value, source: "footer", status: "subscribed" });
    if (error && !/duplicate|unique/i.test(error.message)) {
      toast.error(error.message);
      return;
    }
    setSubscribed(true);
    toast.success(
      error ? "You're already on the list — thanks!" : "You're subscribed — welcome aboard!",
    );
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  const scrollTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-gradient-to-b from-background via-secondary/20 to-secondary/50">
      {/* Top hairline accent */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
      />

      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
        <div className="absolute -top-40 -left-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-20 right-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
      </div>

      <div className="container relative py-16 md:py-20">
        {/* Newsletter — editorial, hero-style */}
        <div className="relative mb-16 rounded-[2rem] border border-border/60 bg-card/40 backdrop-blur p-8 md:p-14">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7 text-left">
              <div className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase text-primary">
                <span className="h-px w-6 bg-primary" />
                Weekly insights · Every Friday
              </div>

              <h3 className="mt-6 font-display text-[2rem] md:text-5xl lg:text-[3.5rem] leading-[1.02] tracking-tight text-foreground max-w-[16ch]">
                Grow your business, one email at a time.
              </h3>

              <p className="mt-6 md:mt-8 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
                Playbooks for planning, digital presence, brand & packaging design,
                and marketing — straight from the Busistree hub. No fluff,
                unsubscribe anytime.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-muted-foreground text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {["A", "R", "S", "M"].map((c, i) => (
                      <div
                        key={i}
                        className="h-7 w-7 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold text-foreground"
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Users className="h-3.5 w-3.5" />
                    {subscriberCount !== null
                      ? `${formatCount(subscriberCount)} founders subscribed`
                      : "Join founders subscribing"}
                  </span>
                </div>
                {ratingStats && ratingStats.total > 0 && (
                  <div className="inline-flex items-center gap-1 font-medium">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < Math.round(ratingStats.avg)
                            ? "fill-amber-500 text-amber-500"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    ))}
                    <span className="ml-1">
                      {ratingStats.avg.toFixed(1)} / 5 from {ratingStats.total} review
                      {ratingStats.total === 1 ? "" : "s"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubscribe} className="w-full lg:col-span-5">
              <div className="flex flex-col sm:flex-row gap-2 p-2 rounded-2xl bg-background border border-border/60 shadow-elev">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@business.pk"
                    aria-label="Email address"
                    className="h-12 pl-11 rounded-xl bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/40"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-12 px-6 rounded-xl font-semibold gap-2"
                >
                  {subscribed ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Subscribed
                    </>
                  ) : (
                    <>
                      Subscribe <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 px-1 leading-relaxed">
                By subscribing you agree to our{" "}
                <Link to="/legal/privacy" className="underline underline-offset-2 hover:text-foreground">
                  Privacy Policy
                </Link>
                . We never share your email.
              </p>
            </form>
          </div>
        </div>

        {/* Trust row */}
        <ul
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 pb-12 mb-12 border-b border-border/60"
          aria-label="Trust signals"
        >
          {trustRow.map(({ icon: Icon, label, sub, tint }) => (
            <li
              key={label}
              className={`group relative flex items-center gap-3 rounded-2xl border border-border/60 bg-gradient-to-br ${tint} bg-card/60 backdrop-blur p-3.5 md:p-4 hover:border-primary/40 hover:shadow-[0_12px_30px_-15px_hsl(var(--primary)/0.35)] hover:-translate-y-0.5 transition-all duration-300`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background/80 text-primary ring-1 ring-border/60 group-hover:bg-neutral group-hover:text-neutral-foreground group-hover:ring-neutral transition-colors">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{label}</p>
                <p className="text-xs text-muted-foreground truncate">{sub}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-12 gap-8 md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-6 lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
              <img
                src={logo}
                alt="Busistree"
                className="h-12 md:h-14 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-5">
              A digital studio building brands, websites, and growth systems for
              ambitious businesses across Pakistan and beyond.
            </p>

            {/* Meta chips */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                <MapPin className="h-3 w-3 text-primary" />
                Islamabad, Pakistan
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                4.9 · 320+ reviews
              </span>
            </div>

            <div className="flex items-center gap-2">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card/60 text-muted-foreground hover:text-neutral-foreground hover:bg-neutral hover:border-neutral hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-10px_hsl(var(--neutral)/0.4)] transition-all"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <h4 className="font-display font-bold mb-4 text-foreground text-xs uppercase tracking-[0.15em] flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-primary" />
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              {platformLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="group inline-flex items-center gap-1.5 text-muted-foreground hover:text-neutral transition-colors"
                  >
                    <span>{label}</span>
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <h4 className="font-display font-bold mb-4 text-foreground text-xs uppercase tracking-[0.15em] flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-primary" />
              Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              {supportLinks.map(({ to, label, external }) => (
                <li key={to}>
                  {external ? (
                    <a
                      href={to}
                      className="group inline-flex items-center gap-1.5 text-muted-foreground hover:text-neutral transition-colors"
                    >
                      <span>{label}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  ) : (
                    <Link
                      to={to}
                      className="group inline-flex items-center gap-1.5 text-muted-foreground hover:text-neutral transition-colors"
                    >
                      <span>{label}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <h4 className="font-display font-bold mb-4 text-foreground text-xs uppercase tracking-[0.15em] flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-primary" />
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              {legalLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="group inline-flex items-center gap-1.5 text-muted-foreground hover:text-neutral transition-colors"
                  >
                    <span>{label}</span>
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-foreground">Busistree</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={scrollTop}
              aria-label="Back to top"
              className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-card/70 text-foreground hover:bg-neutral hover:text-neutral-foreground hover:border-neutral transition-all"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
