import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollIndicatorProps {
  className?: string;
  onClick?: () => void;
}

export const ScrollIndicator = ({ className, onClick }: ScrollIndicatorProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-background/80 hover:text-background transition-colors cursor-pointer group",
        className
      )}
      aria-label="Scroll hacia abajo"
    >
      <span className="text-xs font-heading uppercase tracking-wider opacity-70 group-hover:opacity-100">
        Scroll
      </span>
      <div className="relative">
        <ChevronDown className="h-6 w-6 animate-bounce" />
      </div>
    </button>
  );
};

export default ScrollIndicator;
