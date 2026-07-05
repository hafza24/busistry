import { Link } from "react-router-dom";
import { useState } from "react";
import {
  ShieldCheck,
  RefreshCw,
  Lock,
  Headphones,
  ArrowRight,
  Mail,
  MapPin,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";

const trustRow = [
  { icon: ShieldCheck, label: "Secure Payments", sub: "SSL & PCI aligned" },
  { icon: RefreshCw, label: "7-Day Refund", sub: "No questions asked" },
  { icon: Lock, label: "Data Protected", sub: "End-to-end encrypted" },
  { icon: Headphones, label: "Human Support", sub: "Mon–Sat, PKT hours" },
];

const platformLinks = [
  { to: "/templates", label: "Templates" },
  { to: "/pricing", label: "Pricing" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/marketplace", label: "Marketplace" },
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

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

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

  return (
    <footer className="relative overflow-hidden border-t border-border bg-gradient-to-b from-background via-secondary/20 to-secondary/40">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
        <div className="absolute -top-40 -left-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-20 right-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="container relative py-16 md:py-20">
        {/* Newsletter card */}
        <div className="relative mb-16 overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/95 via-primary to-primary/90 p-8 md:p-12 shadow-[0_30px_80px_-30px_hsl(var(--primary)/0.5)]">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl" />
          </div>

          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 backdrop-blur px-3 py-1 text-xs font-semibold text-primary-foreground mb-4 border border-primary-foreground/20">
                <Sparkles className="h-3.5 w-3.5" />
                Weekly Insights
              </div>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground leading-tight mb-3">
                Level up your business, one email at a time.
              </h3>
              <p className="text-primary-foreground/80 text-sm md:text-base max-w-md">
                Growth playbooks, template drops, and Pakistan-first commerce tips —
                delivered every Friday. No fluff, unsubscribe anytime.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="w-full">
              <div className="flex flex-col sm:flex-row gap-2 p-2 rounded-2xl bg-primary-foreground/10 backdrop-blur border border-primary-foreground/20">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/60" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@business.pk"
                    aria-label="Email address"
                    className="h-12 pl-11 rounded-xl bg-primary-foreground/5 border-0 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-2 focus-visible:ring-primary-foreground/40"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-12 px-6 rounded-xl bg-background text-foreground hover:bg-background/90 font-bold gap-2 shadow-sm"
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
              <p className="text-[11px] text-primary-foreground/60 mt-3 px-1">
                By subscribing you agree to our{" "}
                <Link to="/legal/privacy" className="underline hover:text-primary-foreground">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </div>
        </div>

        {/* Trust row */}
        <ul
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-12 mb-12 border-b border-border/60"
          aria-label="Trust signals"
        >
          {trustRow.map(({ icon: Icon, label, sub }) => (
            <li
              key={label}
              className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card/50 backdrop-blur p-3 md:p-4 hover:bg-card hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>Islamabad, Pakistan</span>
            </div>
            <div className="flex items-center gap-2">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card/50 text-muted-foreground hover:text-primary-foreground hover:bg-primary hover:border-primary hover:-translate-y-0.5 transition-all"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <h4 className="font-display font-bold mb-4 text-foreground text-sm uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-3 text-sm">
              {platformLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="group inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
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
            <h4 className="font-display font-bold mb-4 text-foreground text-sm uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-3 text-sm">
              {supportLinks.map(({ to, label, external }) => (
                <li key={to}>
                  {external ? (
                    <a
                      href={to}
                      className="group inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <span>{label}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  ) : (
                    <Link
                      to={to}
                      className="group inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
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
            <h4 className="font-display font-bold mb-4 text-foreground text-sm uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-3 text-sm">
              {legalLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="group inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span>{label}</span>
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Payments */}
          <div className="col-span-2 md:col-span-6 lg:col-span-2">
            <h4 className="font-display font-bold mb-4 text-foreground text-sm uppercase tracking-wider">
              We Accept
            </h4>
            <div className="flex flex-wrap gap-2">
              {["Easypaisa", "JazzCash", "NayaPay", "Raast", "Bank"].map((method) => (
                <span
                  key={method}
                  className="inline-flex items-center rounded-lg border border-border/60 bg-card/60 px-2.5 py-1.5 text-xs font-semibold text-foreground shadow-sm"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-foreground">Busistree</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </span>
            <span className="hidden sm:inline">Made with care in 🇵🇰</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
