import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "accent" | "glow" | "brand";

const toneClass: Record<Tone, string> = {
  primary: "glass-fill-primary",
  accent: "glass-fill-accent",
  glow: "glass-fill-glow",
  brand: "glass-fill-brand",
};

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  framed?: boolean;
  as?: "div" | "button" | "a";
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ tone = "primary", framed = true, className, children, ...props }, ref) => {
    const inner = (
      <div
        className={cn(
          "glass-surface",
          toneClass[tone],
          "flex items-center justify-center text-center p-6 min-h-[8rem]",
          className,
        )}
      >
        <div className="relative z-10 text-primary-foreground [text-shadow:0_1px_0_hsl(220_40%_15%/0.35)]">
          {children}
        </div>
      </div>
    );
    return (
      <div ref={ref} className={cn(framed && "glass-frame")} {...props}>
        {inner}
      </div>
    );
  },
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
