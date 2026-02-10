import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
export interface CollapsibleSubcategoryProps {
  name: string;
  count: number;
  children: ReactNode;
  defaultExpanded?: boolean;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  subcategoryId?: string;
}
export const CollapsibleSubcategory = ({
  name,
  count,
  children,
  defaultExpanded = false,
  isExpanded: controlledExpanded,
  onToggle,
  subcategoryId
}: CollapsibleSubcategoryProps) => {
  const isControlled = controlledExpanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;
  useEffect(() => {
    if (!isControlled) {
      setInternalExpanded(defaultExpanded);
    }
  }, [defaultExpanded, isControlled]);
  const handleToggle = () => {
    const newState = !isExpanded;
    if (isControlled) {
      onToggle?.(newState);
    } else {
      setInternalExpanded(newState);
    }
  };
  return <div className="mb-4" id={subcategoryId ? `subcategory-${subcategoryId}` : undefined}>
      <button onClick={handleToggle} className="flex items-center gap-2 w-full border-b border-foreground/20 pb-2 mb-3 px-2 hover:text-primary transition-colors cursor-pointer bg-card py-[16px]">
        {isExpanded ? <ChevronDown className="h-3 w-3 flex-shrink-0" /> : <ChevronRight className="h-3 w-3 flex-shrink-0" />}
        <h3 className="font-heading text-xs uppercase text-muted-foreground sm:text-base">
          {name}
          <span className="ml-2 text-[10px]">({count})</span>
        </h3>
      </button>
      {isExpanded && children}
    </div>;
};
export default CollapsibleSubcategory;