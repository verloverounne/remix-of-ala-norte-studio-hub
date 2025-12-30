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
      <div className="container mx-auto px-4 py-4 sm:py-6">
        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar equipos..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-2 border-foreground font-heading uppercase text-sm h-10 sm:h-11"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="border-2 border-foreground h-10 sm:h-11 px-3 sm:px-4"
            >
              <Filter className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Filtros</span>
              {selectedSubcategories.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedSubcategories.length}
                </Badge>
              )}
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-10 sm:h-11"
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        </div>

        {/* Expandable subcategory filters */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent>
            <div className="pt-4 border-t-2 border-foreground/20">
              <h4 className="font-heading text-sm mb-3 uppercase text-muted-foreground">Subcategorías</h4>
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
