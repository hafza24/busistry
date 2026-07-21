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
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-semibold border border-border/70 shadow-elev ring-offset-background transition-[transform,background-color,box-shadow,color,border-color] duration-200 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground disabled:border-border disabled:shadow-none disabled:hover:translate-y-0 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-transparent hover:bg-neutral hover:text-neutral-foreground active:bg-neutral/95",
        destructive:
          "bg-destructive text-destructive-foreground border-transparent hover:bg-neutral hover:text-neutral-foreground active:bg-neutral/95",
        outline:
          "bg-background text-foreground hover:bg-neutral/10 hover:text-neutral hover:border-neutral/40 active:bg-neutral/15",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-neutral hover:text-neutral-foreground active:bg-neutral/95",
        ghost:
          "border-transparent shadow-none hover:bg-neutral/10 hover:text-neutral hover:translate-y-0 active:bg-neutral/15",
        link:
          "border-transparent shadow-none text-primary underline-offset-4 hover:underline hover:text-neutral hover:translate-y-0",
        glass:
          "bg-primary text-primary-foreground border-transparent hover:bg-neutral hover:text-neutral-foreground active:bg-neutral/95",
        "glass-accent":
          "bg-primary text-primary-foreground border-transparent hover:bg-neutral hover:text-neutral-foreground active:bg-neutral/95",
        "glass-brand":
          "bg-primary text-primary-foreground border-transparent hover:bg-neutral hover:text-neutral-foreground active:bg-neutral/95",
        "glass-success":
          "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] border-transparent hover:bg-neutral hover:text-neutral-foreground",
        "glass-warning":
          "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] border-transparent hover:bg-neutral hover:text-neutral-foreground",
        "glass-info":
          "bg-[hsl(var(--info))] text-[hsl(var(--info-foreground))] border-transparent hover:bg-neutral hover:text-neutral-foreground",
        "glass-danger":
          "bg-destructive text-destructive-foreground border-transparent hover:bg-neutral hover:text-neutral-foreground active:bg-neutral/95",
      },

      size: {
        default: "h-12 px-6 py-2 [&_svg]:size-4",
        sm: "h-10 px-4 text-sm [&_svg]:size-4",
        lg: "h-12 px-6 [&_svg]:size-4",
        icon: "h-12 w-12 [&_svg]:size-4",
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
