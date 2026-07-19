import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import SEO from "@/components/SEO";

const LAUNCH_DATE = new Date();
LAUNCH_DATE.setDate(LAUNCH_DATE.getDate() + 30);

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const minutes = Math.floor((diff / 60000) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

const TimeCell = ({ value, label }: { value: number; label: string }) => (
  <div className="glass-frame flex flex-col items-center justify-center min-w-[84px] md:min-w-[110px] py-4 md:py-6 px-2">
    <span className="font-display text-4xl md:text-6xl font-bold text-gradient-brand tabular-nums leading-none">
      {String(value).padStart(2, "0")}
    </span>
    <span className="mt-2 text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground">
      {label}
    </span>
  </div>
);

const ComingSoon = () => {
  const { days, hours, minutes, seconds } = useCountdown(LAUNCH_DATE);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setEmail("");
    toast.success("You're on the list! We'll let you know when it launches.");
  };

  return (
    <>
      <SEO
        title="Coming Soon — Busistree"
        description="Something new is on the way. Join the waitlist to be the first to know when we launch."
        path="/coming-soon"
      />
      <section className="dark bg-background text-foreground relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 md:py-24 overflow-hidden">
        {/* Dark base + subtle grid */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_60%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Ambient accents */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-primary/30 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-[420px] w-[420px] rounded-full bg-accent/30 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-[280px] w-[280px] rounded-full bg-primary-glow/25 blur-[120px]" />


        <div className="relative w-full max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/50 backdrop-blur px-4 py-1.5 text-xs md:text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>— Something new is brewing at Busistree</span>
          </div>

          <h1 className="mt-6 font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight">
            <span className="text-gradient-brand">Coming</span>{" "}
            <span className="text-foreground">Soon</span>
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-base md:text-lg text-muted-foreground">
            We're crafting something special to help you plan, launch, and grow your
            business — all from one hub. Drop your email and we'll ping you the
            moment it goes live.
          </p>

          {/* Countdown */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <TimeCell value={days} label="Days" />
            <TimeCell value={hours} label="Hours" />
            <TimeCell value={minutes} label="Minutes" />
            <TimeCell value={seconds} label="Seconds" />
          </div>

          {/* Waitlist */}
          <form
            onSubmit={onSubmit}
            className="mt-10 mx-auto flex w-full max-w-md flex-col sm:flex-row items-center gap-2 glass-frame !p-2"
          >
            <div className="relative flex-1 w-full">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@business.com"
                className="pl-9 h-11 bg-background/60 border-transparent focus-visible:ring-primary"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full sm:w-auto bg-gradient-brand text-primary-foreground shadow-brand hover:opacity-95"
            >
              {submitting ? "Adding..." : "Notify me"}
            </Button>
          </form>

          <div className="mt-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground story-link"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default ComingSoon;
