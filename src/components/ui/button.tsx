import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-heading uppercase tracking-wider transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border hover:scale-105",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover hover:-translate-x-0.5 hover:-translate-y-0.5",
        hero: "bg-primary text-primary-foreground hover:bg-primary-hover hover:-translate-x-1 hover:-translate-y-1 text-lg",
        outline: "bg-transparent text-foreground hover:bg-muted",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
        ghost: "border-0 hover:bg-muted",
        link: "border-0 text-primary underline-offset-4 hover:underline hover:text-primary-hover",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
      },
      size: {
        default: "h-12 px-8 py-3",
        sm: "h-10 px-6 text-xs",
        lg: "h-16 px-12 text-lg font-bold",
        icon: "h-12 w-12",
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
