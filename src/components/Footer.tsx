import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Mail,
  MapPin,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  CheckCircle2,
  Star,
  Users,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";

const platformLinks = [
  { to: "/templates", label: "Templates" },
  { to: "/pricing", label: "Pricing" },
  { to: "/marketplace", label: "Addons" },
  { to: "/how-it-works", label: "How It Works" },
];

const companyLinks = [
  { to: "/about", label: "About" },
  { to: "/reviews", label: "Reviews" },
  { to: "/case-studies", label: "Case Studies" },
  { to: "/contact", label: "Contact" },
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

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [ratingStats, setRatingStats] = useState<{ avg: number; total: number } | null>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const linkColumns = [
    { title: "Platform", links: platformLinks },
    { title: "Company", links: companyLinks },
    { title: "Legal", links: legalLinks },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-border bg-background text-foreground">
      {/* Top hairline accent */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />

      {/* Subtle grid + spotlight (Vercel-style) */}
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at top, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at top, black 30%, transparent 75%)",
          }}
        />
        <div className="absolute -top-40 left-1/2 h-96 w-[52rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container relative py-16 md:py-24">
        {/* Newsletter — Next.js style compact card */}
        <div className="relative mb-16 rounded-2xl border border-border bg-card/40 backdrop-blur-md overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center p-8 md:p-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                Weekly · Every Friday
              </div>

              <h3 className="mt-6 font-display text-[2rem] md:text-[3rem] lg:text-[3.5rem] leading-[1.02] tracking-tight text-foreground max-w-[18ch]">
                Grow your business,<br />
                <span className="text-muted-foreground">one email at a time.</span>
              </h3>

              <p className="mt-6 text-base text-muted-foreground max-w-xl leading-relaxed">
                Playbooks for planning, digital presence, brand & packaging design,
                and marketing — straight from the Busistree hub. No fluff, unsubscribe anytime.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
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
                  <div className="inline-flex items-center gap-1 font-medium text-muted-foreground">
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
                      {ratingStats.avg.toFixed(1)} / 5 · {ratingStats.total} review
                      {ratingStats.total === 1 ? "" : "s"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubscribe} className="w-full lg:col-span-5">
              <div className="flex flex-col sm:flex-row gap-2 p-1.5 rounded-xl bg-background border border-border shadow-sm">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@business.pk"
                    aria-label="Email address"
                    className="h-11 pl-11 rounded-lg bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/40"
                  />
                </div>
                <Button type="submit" className="h-11 px-5 rounded-lg font-semibold gap-2">
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
              <p className="text-[11px] text-muted-foreground mt-3 px-1 leading-relaxed font-mono">
                By subscribing you agree to our{" "}
                <Link to="/legal/privacy" className="underline underline-offset-2 hover:text-foreground">
                  Privacy Policy
                </Link>
                . We never share your email.
              </p>
            </form>
          </div>
        </div>

        {/* Main grid — Next.js/Vercel style */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-12">
          {/* Brand block */}
          <div className="col-span-2 md:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
              <img
                src={logo}
                alt="Busistree"
                className="h-10 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
              A digital studio building brands, websites, and growth systems for
              ambitious businesses across Pakistan and beyond.
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <MapPin className="h-3 w-3 text-primary" />
                Lahore, PK
              </span>
              {ratingStats && ratingStats.total > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  {ratingStats.avg.toFixed(1)} · {ratingStats.total}+
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <CircleDot className="h-3 w-3 text-primary" />
                All systems normal
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card/40 text-muted-foreground hover:text-foreground hover:border-foreground/40 hover:bg-card transition-all"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
              <div className="ml-2 pl-2 border-l border-border">
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Link columns */}
          {linkColumns.map(({ title, links }) => (
            <div key={title} className="col-span-1 md:col-span-2 md:col-start-auto">
              <h4 className="mb-5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {title}
              </h4>
              <ul className="space-y-3 text-sm">
                {links.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="group inline-flex items-center gap-1 text-foreground/80 hover:text-foreground transition-colors"
                    >
                      <span>{label}</span>
                      <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Status/Region */}
          <div className="col-span-2 md:col-span-2">
            <h4 className="mb-5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Region
            </h4>
            <div className="rounded-lg border border-border bg-card/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🇵🇰</span>
                <span className="text-sm font-medium text-foreground">Pakistan</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-mono">
                PKR · Karachi (PKT)
              </p>
              <div className="mt-3 pt-3 border-t border-border">
                <a
                  href="mailto:hello@busistree.com"
                  className="group inline-flex items-center gap-1 text-xs text-foreground/80 hover:text-foreground"
                >
                  hello@busistree.com
                  <ArrowUpRight className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-foreground">Busistree</span> — Built with care in Pakistan.
          </p>
          <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <Link to="/legal/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <span className="opacity-30">/</span>
            <Link to="/legal/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <span className="opacity-30">/</span>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </div>

      {/* Floating back-to-top */}
      <button
        type="button"
        onClick={scrollTop}
        aria-label="Back to top"
        className={`fixed bottom-6 right-6 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-elev hover:bg-neutral hover:text-neutral-foreground hover:border-neutral transition-all duration-300 ${
          showTop ? "opacity-100 translate-y-0 pointer-events-auto animate-fade-in" : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </footer>
  );
};

export default Footer;
