import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSubcategoryProps {
  name: string;
  count: number;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export const CollapsibleSubcategory = ({
  name,
  count,
  children,
  defaultExpanded = true,
}: CollapsibleSubcategoryProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full border-b border-foreground/20 pb-2 mb-3 px-2 hover:text-primary transition-colors cursor-pointer"
      >
        {isExpanded ? (
          <ChevronDown className="h-3 w-3 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
        )}
        <h3 className="font-heading text-xs sm:text-sm uppercase text-muted-foreground">
          {name}
          <span className="ml-2 text-[10px]">({count})</span>
        </h3>
      </button>
      {isExpanded && children}
    </div>
  );
};

export default CollapsibleSubcategory;
