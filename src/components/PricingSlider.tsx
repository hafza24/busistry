import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface PricingTier {
  id?: string;
  name: string;
  blurb: string;
  price: string | number;
  delivery: string;
  features: string[];
  highlighted?: boolean;
}

interface PricingSliderProps {
  tiers: PricingTier[];
  /** pixels per second */
  speed?: number;
}

const Card = ({ tier, tiersLength, idx }: { tier: PricingTier; tiersLength: number; idx: number }) => {
  const priceStr = String(tier.price);
  const isFree = /free/i.test(priceStr);
  const numericMatch = priceStr.match(/[\d,]+/);
  const numericPart = numericMatch ? numericMatch[0] : priceStr;

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${tier.name}, ${idx + 1} of ${tiersLength}`}
      className={`group relative shrink-0 w-[280px] sm:w-[300px] rounded-lg p-6 border transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 flex flex-col ${
        tier.highlighted
          ? "bg-card border-primary/40 shadow-elev hover:shadow-brand dark:bg-card/95 dark:border-primary/50 dark:shadow-[0_0_0_1px_hsl(var(--primary)/0.25),0_20px_50px_-20px_hsl(var(--primary)/0.35)]"
          : "bg-card/70 backdrop-blur-sm border-border/70 shadow-soft hover:border-primary/30 hover:shadow-elev dark:bg-card/80 dark:border-border dark:hover:border-primary/40"
      }`}
    >
      {tier.highlighted && (
        <>
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-lg bg-gradient-to-br from-primary/[0.06] via-transparent to-accent/[0.06] dark:from-primary/[0.14] dark:to-accent/[0.10]" />
          <div className="absolute -top-4 left-6 inline-flex items-center gap-1.5 rounded-md border border-border bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-elev">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Popular
          </div>
        </>
      )}

      {/* Eyebrow */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <span className="h-px w-4 bg-primary" aria-hidden="true" />
        {isFree ? "Free plan" : /rent/i.test(tier.name) ? "Rent" : /buy/i.test(tier.name) ? "Buy" : "Plan"}
      </div>

      <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-foreground">
        {tier.name}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
        {tier.blurb}
      </p>

      <div className="pb-4 border-b border-border/60">
        {isFree ? (
          <div className="font-display text-4xl font-semibold tracking-tight bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
            Free
          </div>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11px] font-mono font-semibold text-muted-foreground tracking-wider">PKR</span>
            <span className="font-display text-4xl font-semibold text-foreground tracking-tight tabular-nums">
              {numericPart}
            </span>
          </div>
        )}
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-muted/60 dark:bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground dark:text-foreground/80 ring-1 ring-border/40 dark:ring-border/60">
          <span className="h-1 w-1 rounded-full bg-primary" aria-hidden="true" />
          Delivered in {tier.delivery}
        </div>
      </div>

      <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
        <div className="overflow-hidden">
          <ul className="mt-4 space-y-2">
            {tier.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-xs text-foreground/90">
                <div
                  className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    tier.highlighted
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary dark:bg-primary/20"
                  }`}
                  aria-hidden="true"
                >
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </div>
                <span className="leading-snug">{f}</span>
              </li>
            ))}
          </ul>

          <Button
            className="w-full mt-5 h-10 text-xs font-semibold"
            variant={tier.highlighted ? "default" : "outline"}
            asChild
          >
            <Link
              to={tier.id ? `/onboarding?plan=${tier.id}` : "/pricing"}
              className="group/btn"
              aria-label={`Start with ${tier.name} plan`}
            >
              Start with {tier.name}
              <ArrowRight
                className="h-3.5 w-3.5 ml-1.5 transition-transform group-hover/btn:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

const PricingSlider = ({ tiers, speed = 40 }: PricingSliderProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const offsetRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduced || tiers.length <= 1) return;
    const track = trackRef.current;
    if (!track) return;

    const step = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      if (!paused) {
        // One copy width = half of total scrollWidth (we render 2x)
        const half = track.scrollWidth / 2;
        offsetRef.current += speed * dt;
        if (offsetRef.current >= half) offsetRef.current -= half;
        track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [paused, reduced, speed, tiers.length]);

  return (
    <div
      className="relative max-w-6xl mx-auto overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
      role="region"
      aria-roledescription="carousel"
      aria-label="Pricing plans"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
      }}
    >
      <div
        ref={trackRef}
        className="flex gap-6 py-6 will-change-transform"
        style={{ width: "max-content" }}
      >
        {[...tiers, ...tiers].map((tier, i) => (
          <Card key={`${tier.name}-${i}`} tier={tier} tiersLength={tiers.length} idx={i % tiers.length} />
        ))}
      </div>
    </div>
  );
};

export default PricingSlider;
