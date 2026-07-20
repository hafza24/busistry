import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Minimal, refined button system:
// - Border radius 16-18px (rounded-2xl ≈ 16px)
// - 1px border, neutral (no colorful borders)
// - Very subtle shadow
// - Generous horizontal padding for whitespace
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-sm font-semibold border border-border/70 shadow-[0_1px_2px_hsl(160_20%_10%/0.04)] ring-offset-background transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#00A3A3] text-white border-transparent hover:bg-[#00A3A3]",
        destructive:
          "bg-destructive text-destructive-foreground border-transparent hover:bg-destructive",
        outline:
          "bg-background text-foreground hover:bg-muted/60",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary",
        ghost:
          "border-transparent shadow-none hover:bg-muted/60 hover:text-foreground hover:translate-y-0",
        link:
          "border-transparent shadow-none text-primary underline-offset-4 hover:underline hover:translate-y-0",
        glass:
          "bg-[#00A3A3] text-white border-transparent hover:bg-[#00A3A3]",
        "glass-accent":
          "bg-[#00A3A3] text-white border-transparent hover:bg-[#00A3A3]",
        "glass-brand":
          "bg-[#00A3A3] text-white border-transparent hover:bg-[#00A3A3]",
        "glass-success":
          "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] border-transparent",
        "glass-warning":
          "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] border-transparent",
        "glass-info":
          "bg-[hsl(var(--info))] text-[hsl(var(--info-foreground))] border-transparent",
        "glass-danger":
          "bg-destructive text-destructive-foreground border-transparent",
      },
      size: {
        default: "h-[52px] px-6 py-2",
        sm: "h-10 px-4",
        lg: "h-[52px] px-8",
        icon: "h-[52px] w-[52px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
