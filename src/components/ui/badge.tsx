import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center border border-foreground px-3 py-1 text-xs font-heading uppercase tracking-wider transition-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer",
        secondary: "bg-secondary text-secondary-foreground hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer",
        destructive: "bg-destructive text-destructive-foreground hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5",
        outline: "text-foreground bg-background hover:bg-foreground hover:text-background cursor-pointer",
        success: "bg-[#70DDB0] text-foreground border border-foreground font-bold tracking-wider hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
