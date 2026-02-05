import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-sm font-heading font-bold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3 sm:[&_svg]:size-4 [&_svg]:shrink-0 border-0 hover:scale-102 hover:backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "bg-primary text-foreground hover:shadow-brutal hover:-translate-x-1 hover:-translate-y-1",
        hero: "bg-primary text-foreground shadow-brutal-lg hover:shadow-brutal-red hover:-translate-x-1 sm:hover:-translate-x-2 hover:-translate-y-1 sm:hover:-translate-y-2 text-sm sm:text-base lg:text-lg",
        outline: "bg-transparent text-foreground border border-foreground hover:bg-foreground hover:text-background",
        secondary: "bg-primary text-foreground hover:shadow-brutal hover:-translate-x-1 hover:-translate-y-1",
        ghost: "hover:bg-primary hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-hover",
        destructive: "bg-destructive text-foreground hover:shadow-brutal-red",
      },
      size: {
        default: "h-10 sm:h-11 md:h-12 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3",
        sm: "h-8 sm:h-9 md:h-10 px-3 sm:px-4 md:px-6 text-[10px] sm:text-xs",
        lg: "h-12 sm:h-14 md:h-16 px-6 sm:px-8 md:px-12 text-sm sm:text-base md:text-lg font-bold",
        icon: "h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
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
