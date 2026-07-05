import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  Zap,
  Pause,
  Play,
} from "lucide-react";
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
  autoPlayInterval?: number;
}

const PricingSlider = ({ tiers, autoPlayInterval = 5000 }: PricingSliderProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.children[index] as HTMLElement | undefined;
    if (!card) return;
    const left = card.offsetLeft - (scroller.clientWidth - card.clientWidth) / 2;
    scroller.scrollTo({ left, behavior });
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const next = (index + tiers.length) % tiers.length;
      const wrapped =
        (index >= tiers.length && activeIndex === tiers.length - 1) ||
        (index < 0 && activeIndex === 0);
      setActiveIndex(next);
      scrollToIndex(next, wrapped ? "auto" : "smooth");
    },
    [tiers.length, activeIndex, scrollToIndex]
  );

  // Track active card via scroll position
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const center = scroller.scrollLeft + scroller.clientWidth / 2;
        let closest = 0;
        let minDist = Infinity;
        Array.from(scroller.children).forEach((el, i) => {
          const child = el as HTMLElement;
          const childCenter = child.offsetLeft + child.clientWidth / 2;
          const dist = Math.abs(center - childCenter);
          if (dist < minDist) {
            minDist = dist;
            closest = i;
          }
        });
        setActiveIndex(closest);
      });
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Autoplay (loops seamlessly)
  useEffect(() => {
    if (isPaused || prefersReducedMotion || tiers.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => {
        const isWrap = prev === tiers.length - 1;
        const next = isWrap ? 0 : prev + 1;
        scrollToIndex(next, isWrap ? "auto" : "smooth");

        return next;
      });
    }, autoPlayInterval);
    return () => window.clearInterval(id);
  }, [isPaused, prefersReducedMotion, tiers.length, autoPlayInterval, scrollToIndex]);

  // Keyboard nav
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(activeIndex + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(activeIndex - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(tiers.length - 1);
    }
  };

  return (
    <div
      className="relative max-w-6xl mx-auto"
      role="region"
      aria-roledescription="carousel"
      aria-label="Pricing plans"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsPaused(false);
      }}
    >
      {/* Screen-reader live status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Slide {activeIndex + 1} of {tiers.length}: {tiers[activeIndex]?.name}
      </div>

      {/* Edge fades */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-4 w-8 md:w-12 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-8 md:w-12 z-10 bg-gradient-to-l from-background to-transparent" />

      {/* Prev / Next buttons */}
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Previous plan"
        onClick={() => goTo(activeIndex - 1)}
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 rounded-full h-11 w-11 bg-background/90 backdrop-blur shadow-md border-border hover:bg-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Next plan"
        onClick={() => goTo(activeIndex + 1)}
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 rounded-full h-11 w-11 bg-background/90 backdrop-blur shadow-md border-border hover:bg-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      <div
        ref={scrollerRef}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel track"
        aria-label="Use left and right arrow keys to navigate plans"
        onKeyDown={onKeyDown}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 px-4 md:px-6 -mx-4 md:-mx-6 items-stretch focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:rounded-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {tiers.map((tier, idx) => {
          const priceStr = String(tier.price);
          const isFree = /free/i.test(priceStr);
          const numericMatch = priceStr.match(/[\d,]+/);
          const numericPart = numericMatch ? numericMatch[0] : priceStr;
          const isActive = idx === activeIndex;
          return (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              role="group"
              aria-roledescription="slide"
              aria-label={`${tier.name}, ${idx + 1} of ${tiers.length}`}
              aria-current={isActive ? "true" : undefined}
              aria-hidden={!isActive ? "false" : undefined}
              className={`group relative snap-center shrink-0 w-[85%] sm:w-[380px] rounded-3xl p-8 border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col ${
                tier.highlighted
                  ? "bg-gradient-to-br from-card via-card to-primary/5 border-primary shadow-xl shadow-primary/10"
                  : "bg-card/80 backdrop-blur border-border hover:border-primary/40"
              }`}
            >
              {tier.highlighted && (
                <>
                  <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-brand border-0">
                    <Sparkles className="h-3 w-3 mr-1" aria-hidden="true" /> Most popular
                  </Badge>
                </>
              )}

              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{tier.blurb}</p>

              <div className="pb-6 border-b border-border/60">
                {isFree ? (
                  <div className="text-5xl font-extrabold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                    Free
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-semibold text-muted-foreground">PKR</span>
                    <span className="text-5xl font-extrabold text-foreground tracking-tight">
                      {numericPart}
                    </span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-primary" aria-hidden="true" />
                  Delivered in {tier.delivery}
                </div>
              </div>

              <ul className="mt-6 space-y-3 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        tier.highlighted
                          ? "bg-gradient-to-br from-primary to-primary-glow"
                          : "bg-primary/10"
                      }`}
                      aria-hidden="true"
                    >
                      <Check
                        className={`h-3 w-3 ${
                          tier.highlighted ? "text-primary-foreground" : "text-primary"
                        }`}
                        strokeWidth={3}
                      />
                    </div>
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full mt-8 rounded-full h-12 text-base font-semibold ${
                  tier.highlighted
                    ? "bg-gradient-to-r from-primary to-primary-glow shadow-brand hover:opacity-95"
                    : ""
                }`}
                variant={tier.highlighted ? "default" : "outline"}
                asChild
                tabIndex={isActive ? 0 : -1}
              >
                <Link
                  to={tier.id ? `/onboarding?plan=${tier.id}` : "/pricing"}
                  className="group/btn"
                  aria-label={`Start with ${tier.name} plan`}
                >
                  Start with {tier.name}
                  <ArrowRight
                    className="h-4 w-4 ml-1 transition-transform group-hover/btn:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Dots + play/pause controls */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <div
          role="tablist"
          aria-label="Select pricing plan"
          className="flex items-center gap-2"
        >
          {tiers.map((tier, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={tier.name}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to ${tier.name} plan`}
                aria-controls={`pricing-slide-${idx}`}
                onClick={() => goTo(idx)}
                className={`h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  isActive
                    ? "w-8 bg-primary"
                    : "w-2.5 bg-primary/25 hover:bg-primary/50"
                }`}
              />
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setIsPaused((p) => !p)}
          aria-label={isPaused ? "Play pricing slider autoplay" : "Pause pricing slider autoplay"}
          aria-pressed={isPaused}
          className="ml-2 h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
};

export default PricingSlider;
