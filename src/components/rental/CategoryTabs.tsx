import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  order_index?: number;
}

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string | null;
  onCategoryClick: (categoryId: string) => void;
  equipmentCounts: Record<string, number>;
}

export const CategoryTabs = ({ 
  categories, 
  activeCategory, 
  onCategoryClick,
  equipmentCounts 
}: CategoryTabsProps) => {
  const [isSticky, setIsSticky] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-64px 0px 0px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Sentinel element for detecting sticky state */}
      <div ref={sentinelRef} className="h-0" />
      
      {/* Sticky tabs bar */}
      <div 
        ref={tabsRef}
        className={cn(
          "sticky top-14 sm:top-16 z-40 bg-background border-b-2 sm:border-b-4 border-foreground transition-shadow",
          isSticky && "shadow-brutal"
        )}
      >
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex overflow-x-auto scrollbar-hide py-2 sm:py-3 gap-1 sm:gap-2 -mx-2 px-2">
            {categories.map((category) => {
              const count = equipmentCounts[category.id] || 0;
              const isActive = activeCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryClick(category.id)}
                  className={cn(
                    "flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 font-heading text-xs sm:text-sm uppercase border-2 transition-all whitespace-nowrap",
                    isActive 
                      ? "bg-primary text-primary-foreground border-primary shadow-brutal-sm" 
                      : "bg-background text-foreground border-foreground hover:bg-muted"
                  )}
                >
                  <span>{category.name}</span>
                  {count > 0 && (
                    <span className={cn(
                      "ml-1.5 sm:ml-2 text-[10px] sm:text-xs",
                      isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>
                      ({count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryTabs;
