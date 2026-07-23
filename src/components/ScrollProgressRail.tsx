import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type ScrollMilestone = { id: string; label: string };

interface ScrollProgressRailProps {
  milestones: ScrollMilestone[];
  className?: string;
}

const ScrollProgressRail = ({ milestones, className }: ScrollProgressRailProps) => {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(milestones[0]?.id ?? null);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0);

      // Determine active milestone
      const viewportMid = scrollTop + window.innerHeight * 0.35;
      let current = milestones[0]?.id ?? null;
      for (const m of milestones) {
        const el = document.getElementById(m.id);
        if (el && el.offsetTop <= viewportMid) current = m.id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [milestones]);

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className={cn(
        "fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3",
        className
      )}
      aria-label="Page progress"
    >
      {/* Track with fill */}
      <div className="relative h-72 w-[3px] rounded-full bg-border/70 overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 bg-primary rounded-full transition-[height] duration-150"
          style={{ height: `${progress * 100}%` }}
        />
      </div>

      {/* Milestones */}
      <ul className="absolute inset-y-0 flex flex-col justify-between py-1">
        {milestones.map((m) => {
          const active = m.id === activeId;
          return (
            <li key={m.id} className="group relative flex items-center">
              <button
                type="button"
                onClick={() => jumpTo(m.id)}
                aria-label={`Jump to ${m.label}`}
                className={cn(
                  "h-3 w-3 rounded-full border transition-all duration-200",
                  active
                    ? "bg-primary border-primary scale-125 shadow-[0_0_0_4px_hsl(var(--primary)/0.15)]"
                    : "bg-background border-border hover:border-primary hover:scale-110"
                )}
              />
              <span
                className={cn(
                  "pointer-events-none absolute right-6 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium text-foreground shadow-elev opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0",
                  active && "opacity-100 translate-x-0"
                )}
              >
                {m.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ScrollProgressRail;
