import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-heading uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-2 border-foreground hover:scale-105 hover:backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:shadow-brutal hover:-translate-x-1 hover:-translate-y-1",
        hero: "bg-primary text-primary-foreground shadow-brutal-lg hover:shadow-brutal-red hover:-translate-x-2 hover:-translate-y-2 text-lg",
        outline: "bg-transparent text-foreground hover:bg-foreground hover:text-background",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover hover:shadow-brutal hover:-translate-x-1 hover:-translate-y-1",
        ghost: "border-0 hover:bg-accent hover:text-accent-foreground",
        link: "border-0 text-primary underline-offset-4 hover:underline hover:text-primary-hover",
        destructive: "bg-destructive text-destructive-foreground hover:shadow-brutal-red",
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
