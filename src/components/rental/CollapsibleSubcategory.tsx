import { useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);
  const [shouldRender, setShouldRender] = useState(isExpanded);

  useEffect(() => {
    if (!isControlled) {
      setInternalExpanded(defaultExpanded);
    }
  }, [defaultExpanded, isControlled]);

  useEffect(() => {
    if (isExpanded) {
      setShouldRender(true);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (shouldRender && contentRef.current) {
      if (isExpanded) {
        const height = contentRef.current.scrollHeight;
        setContentHeight(0);
        requestAnimationFrame(() => {
          setContentHeight(height);
          setTimeout(() => setContentHeight(undefined), 300);
        });
      } else {
        const height = contentRef.current.scrollHeight;
        setContentHeight(height);
        requestAnimationFrame(() => {
          setContentHeight(0);
          setTimeout(() => setShouldRender(false), 300);
        });
      }
    }
  }, [isExpanded, shouldRender]);

  const handleToggle = () => {
    const newState = !isExpanded;
    if (isControlled) {
      onToggle?.(newState);
    } else {
      setInternalExpanded(newState);
    }
  };
  return <div className="mb-4" id={subcategoryId ? `subcategory-${subcategoryId}` : undefined}>
      <button onClick={handleToggle} className="flex items-center gap-2 w-full border-b border-foreground/20 pb-2 mb-3 hover:text-primary transition-colors cursor-pointer bg-card py-[16px] px-0">
        {isExpanded ? <ChevronDown className="h-3 w-3 flex-shrink-0" /> : <ChevronRight className="h-3 w-3 flex-shrink-0" />}
        <h3 className="font-heading text-xs uppercase text-muted-foreground sm:text-base">
          {name}
          <span className="ml-2 text-[10px]">({count})</span>
        </h3>
      </button>
      {shouldRender && (
        <div
          ref={contentRef}
          className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
          style={{ maxHeight: contentHeight !== undefined ? `${contentHeight}px` : 'none' }}
        >
          {children}
        </div>
      )}
    </div>;
};
export default CollapsibleSubcategory;