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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0);
      setVisible(scrollTop > window.innerHeight * 0.4);

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

  const activeIndex = Math.max(0, milestones.findIndex((m) => m.id === activeId));

  return (
    <nav
      aria-label="Page sections"
      className={cn(
        "fixed right-5 xl:right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:block transition-all duration-500",
        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none",
        className
      )}
    >
      {/* Progress readout */}
      <div className="mb-4 flex flex-col items-end gap-1 pr-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
          {String(activeIndex + 1).padStart(2, "0")} / {String(milestones.length).padStart(2, "0")}
        </span>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
          {Math.round(progress * 100)}%
        </span>
      </div>

      <ul className="relative flex flex-col gap-4 pr-1">
        {/* Track */}
        <span
          aria-hidden
          className="absolute right-[5px] top-1 bottom-1 w-px bg-border/60 rounded-full"
        />
        {/* Fill */}
        <span
          aria-hidden
          className="absolute right-[5px] top-1 w-px rounded-full bg-gradient-to-b from-primary to-primary/40 transition-[height] duration-200 ease-out"
          style={{ height: `calc((100% - 0.5rem) * ${progress})` }}
        />

        {milestones.map((m, i) => {
          const active = m.id === activeId;
          const passed = i < activeIndex;
          return (
            <li key={m.id} className="group relative flex items-center justify-end">
              {/* Label */}
              <span
                className={cn(
                  "pointer-events-none absolute right-6 whitespace-nowrap font-mono text-[11px] tracking-wide transition-all duration-300",
                  active
                    ? "opacity-100 translate-x-0 text-foreground"
                    : "opacity-0 -translate-x-2 text-muted-foreground group-hover:opacity-100 group-hover:translate-x-0"
                )}
              >
                <span className="text-muted-foreground/60 mr-2">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {m.label}
              </span>

              {/* Dot */}
              <button
                type="button"
                onClick={() => jumpTo(m.id)}
                aria-label={`Jump to ${m.label}`}
                aria-current={active ? "true" : undefined}
                className="relative flex h-4 w-4 items-center justify-center"
              >
                <span
                  className={cn(
                    "block rounded-full transition-all duration-300",
                    active
                      ? "h-2.5 w-2.5 bg-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.15)]"
                      : passed
                      ? "h-1.5 w-1.5 bg-primary/60"
                      : "h-1.5 w-1.5 bg-border group-hover:bg-primary/70 group-hover:scale-125"
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default ScrollProgressRail;
