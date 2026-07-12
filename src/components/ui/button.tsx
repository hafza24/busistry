import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "glass-surface glass-fill-primary px-4 font-semibold tracking-wide text-primary-foreground [text-shadow:0_1px_0_hsl(158_60%_15%/0.4)]",
        destructive:
          "glass-surface glass-fill-danger px-4 font-semibold tracking-wide text-white [text-shadow:0_1px_0_hsl(0_60%_20%/0.4)]",
        outline:
          "glass-surface glass-fill-primary px-4 font-semibold tracking-wide text-primary-foreground [text-shadow:0_1px_0_hsl(158_60%_15%/0.4)]",
        secondary:
          "glass-surface glass-fill-primary px-4 font-semibold tracking-wide text-primary-foreground [text-shadow:0_1px_0_hsl(158_60%_15%/0.4)]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass:
          "glass-surface glass-fill-primary px-6 font-semibold tracking-wide text-primary-foreground [text-shadow:0_1px_0_hsl(220_40%_15%/0.35)]",
        "glass-accent":
          "glass-surface glass-fill-accent px-6 font-semibold tracking-wide text-accent-foreground [text-shadow:0_1px_0_hsl(220_40%_15%/0.35)]",
        "glass-brand":
          "glass-surface glass-fill-brand px-6 font-semibold tracking-wide text-primary-foreground [text-shadow:0_1px_0_hsl(220_40%_15%/0.35)]",
        "glass-success":
          "glass-surface glass-fill-success px-6 font-semibold tracking-wide text-white [text-shadow:0_1px_0_hsl(158_60%_15%/0.4)]",
        "glass-warning":
          "glass-surface glass-fill-warning px-6 font-semibold tracking-wide text-[hsl(var(--warning-foreground))] [text-shadow:0_1px_0_hsl(0_0%_100%/0.35)]",
        "glass-info":
          "glass-surface glass-fill-info px-6 font-semibold tracking-wide text-white [text-shadow:0_1px_0_hsl(210_60%_20%/0.4)]",
        "glass-danger":
          "glass-surface glass-fill-danger px-6 font-semibold tracking-wide text-white [text-shadow:0_1px_0_hsl(0_60%_20%/0.4)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
