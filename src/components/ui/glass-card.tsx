import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "accent" | "glow" | "brand" | "success" | "warning" | "info" | "danger";

const toneClass: Record<Tone, string> = {
  primary: "glass-fill-primary",
  accent: "glass-fill-accent",
  glow: "glass-fill-glow",
  brand: "glass-fill-brand",
  success: "glass-fill-success",
  warning: "glass-fill-warning",
  info: "glass-fill-info",
  danger: "glass-fill-danger",
};

const toneText: Record<Tone, string> = {
  primary: "text-primary-foreground [text-shadow:0_1px_0_hsl(220_40%_15%/0.35)]",
  accent: "text-accent-foreground [text-shadow:0_1px_0_hsl(220_40%_15%/0.35)]",
  glow: "text-white [text-shadow:0_1px_0_hsl(220_40%_15%/0.35)]",
  brand: "text-primary-foreground [text-shadow:0_1px_0_hsl(220_40%_15%/0.35)]",
  success: "text-white [text-shadow:0_1px_0_hsl(158_60%_15%/0.4)]",
  warning: "text-[hsl(var(--warning-foreground))] [text-shadow:0_1px_0_hsl(0_0%_100%/0.35)]",
  info: "text-white [text-shadow:0_1px_0_hsl(210_60%_20%/0.4)]",
  danger: "text-white [text-shadow:0_1px_0_hsl(0_60%_20%/0.4)]",
};

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  framed?: boolean;
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
        <div className={cn("relative z-10", toneText[tone])}>{children}</div>
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
