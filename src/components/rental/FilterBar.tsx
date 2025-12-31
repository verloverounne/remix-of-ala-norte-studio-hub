import { useState, useEffect, useRef } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSubcategories: string[];
  onSubcategoriesChange: (subcategories: string[]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  activeCategoryId?: string | null;
}

export const FilterBar = ({
  searchTerm,
  onSearchChange,
  selectedSubcategories,
  onSubcategoriesChange,
  onClearFilters,
  hasActiveFilters,
  activeCategoryId
}: FilterBarProps) => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSubcategories = async () => {
      const { data } = await supabase
        .from("subcategories")
        .select("*")
        .order("order_index");
      
      if (data) {
        setSubcategories(data);
      }
    };
    fetchSubcategories();
  }, []);

  // Close filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  // Filter subcategories by active category
  const filteredSubcategories = activeCategoryId
    ? subcategories.filter(sub => sub.category_id === activeCategoryId)
    : subcategories;

  const toggleSubcategory = (id: string) => {
    if (selectedSubcategories.includes(id)) {
      onSubcategoriesChange(selectedSubcategories.filter(s => s !== id));
    } else {
      onSubcategoriesChange([...selectedSubcategories, id]);
    }
  };

  return (
    <section ref={filterRef} className="border-b-2 sm:border-b-4 border-foreground bg-muted/30">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
        {/* Search bar - always single line */}
        <div className="flex flex-row gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-7 sm:pl-10 border-2 border-foreground font-heading uppercase text-xs sm:text-sm h-8 sm:h-10"
            />
          </div>
          
          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="border-2 border-foreground h-8 sm:h-10 px-2 sm:px-3"
            >
              <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
              {selectedSubcategories.length > 0 && (
                <Badge variant="secondary" className="ml-1 sm:ml-2 text-[10px] h-4 px-1">
                  {selectedSubcategories.length}
                </Badge>
              )}
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-8 sm:h-10 px-2"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Expandable subcategory filters */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent>
            <div className="pt-2 sm:pt-3 border-t-2 border-foreground/20">
              <h4 className="font-heading text-xs sm:text-sm mb-2 uppercase text-muted-foreground">Subcategorías</h4>
              {filteredSubcategories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay subcategorías para esta categoría</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filteredSubcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => toggleSubcategory(sub.id)}
                      className={`px-3 py-1.5 text-xs sm:text-sm font-heading uppercase border-2 transition-all ${
                        selectedSubcategories.includes(sub.id)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-foreground/50 hover:border-foreground"
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
};

export default FilterBar;
