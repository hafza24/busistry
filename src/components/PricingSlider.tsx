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
      className={`group relative shrink-0 w-[280px] sm:w-[300px] rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col ${
        tier.highlighted
          ? "bg-gradient-to-br from-card via-card to-primary/5 border-primary shadow-xl shadow-primary/10"
          : "bg-card/80 backdrop-blur border-border hover:border-primary/40"
      }`}
    >
      {tier.highlighted && (
        <>
          <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] rounded-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-brand border-0">
            <Sparkles className="h-3 w-3 mr-1" aria-hidden="true" /> Popular
          </Badge>
        </>
      )}

      <h3 className="text-base font-bold text-foreground">{tier.name}</h3>
      <p className="text-xs text-muted-foreground mb-3">{tier.blurb}</p>

      <div className="pb-3 border-b border-border/60">
        {isFree ? (
          <div className="text-3xl font-extrabold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
            Free
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-semibold text-muted-foreground">PKR</span>
            <span className="text-3xl font-extrabold text-foreground tracking-tight">
              {numericPart}
            </span>
          </div>
        )}
        <div className="text-[11px] text-muted-foreground mt-1">
          Delivered in {tier.delivery}
        </div>
      </div>

      <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out">
        <div className="overflow-hidden">
          <ul className="mt-3 space-y-1.5">
            {tier.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-xs text-foreground">
                <div
                  className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    tier.highlighted
                      ? "bg-gradient-to-br from-primary to-primary-glow"
                      : "bg-primary/10"
                  }`}
                  aria-hidden="true"
                >
                  <Check
                    className={`h-2.5 w-2.5 ${
                      tier.highlighted ? "text-primary-foreground" : "text-primary"
                    }`}
                    strokeWidth={3}
                  />
                </div>
                <span className="leading-snug">{f}</span>
              </li>
            ))}
          </ul>

          <Button
            className={`w-full mt-4 rounded-full h-9 text-xs font-semibold ${
              tier.highlighted
                ? "bg-gradient-to-r from-primary to-primary-glow shadow-brand hover:opacity-95"
                : ""
            }`}
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
                className="h-3.5 w-3.5 ml-1 transition-transform group-hover/btn:translate-x-1"
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
