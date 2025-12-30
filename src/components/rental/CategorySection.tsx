import { useRef, forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { ShoppingCart, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/LazyImage";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { EquipmentWithCategory } from "@/types/supabase";

type EquipmentWithStock = EquipmentWithCategory;

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface CategorySectionProps {
  category: Category;
  equipment: EquipmentWithStock[];
  onAddToCart: (item: EquipmentWithStock) => void;
  onViewDetails: (item: EquipmentWithStock) => void;
  getCartQuantity: (id: string) => number;
  canAddMore: (item: EquipmentWithStock) => boolean;
  stickyTop: number;
  defaultExpanded?: boolean;
}

export interface CategorySectionRef {
  scrollIntoView: () => void;
  expand: () => void;
  collapse: () => void;
}

export const CategorySection = forwardRef<CategorySectionRef, CategorySectionProps>(({ 
  category, 
  equipment, 
  onAddToCart, 
  onViewDetails,
  getCartQuantity,
  canAddMore,
  stickyTop,
  defaultExpanded = false
}, ref) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  useImperativeHandle(ref, () => ({
    scrollIntoView: () => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    expand: () => {
      setIsExpanded(true);
    },
    collapse: () => {
      setIsExpanded(false);
    }
  }));

  // Fetch subcategories for this category
  useEffect(() => {
    const fetchSubcategories = async () => {
      const { data, error } = await supabase
        .from("subcategories")
        .select("*")
        .eq("category_id", category.id)
        .order("order_index");

      if (!error && data) {
        setSubcategories(data);
      }
    };

    fetchSubcategories();
  }, [category.id]);

  // Filter equipment by selected subcategory
  const filteredEquipment = selectedSubcategory === "all"
    ? equipment
    : equipment.filter(e => e.subcategory_id === selectedSubcategory);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <section 
      ref={sectionRef}
      id={`categoria-${category.slug}`}
      className="relative"
      style={{ scrollMarginTop: `${stickyTop + 8}px` }}
    >
      {/* Sticky Category Header with Collapse - z-20 */}
      <div 
        className="sticky z-20 bg-background border-2 sm:border-4 border-foreground mb-0"
        style={{ top: `${stickyTop}px` }}
      >
        <div className="flex items-center justify-between p-3 sm:p-4">
          <button 
            onClick={toggleExpand}
            className="flex items-center gap-2 sm:gap-4 cursor-pointer hover:text-primary transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 transition-transform" />
            ) : (
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 transition-transform" />
            )}
            <h2 className="font-heading text-lg sm:text-xl md:text-2xl uppercase">
              {category.name}
            </h2>
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              {filteredEquipment.length} equipo{filteredEquipment.length !== 1 ? 's' : ''}
            </Badge>
          </button>
          
          {/* Subcategory Dropdown */}
          {subcategories.length > 0 && isExpanded && (
            <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
              <SelectTrigger className="w-[140px] sm:w-[180px] h-8 sm:h-9 text-xs sm:text-sm font-heading border-2 border-foreground">
                <SelectValue placeholder="Subcategoría" />
              </SelectTrigger>
              <SelectContent className="bg-background border-2 border-foreground z-50">
                <SelectItem value="all" className="font-heading text-xs sm:text-sm">
                  Todas
                </SelectItem>
                {subcategories.map((sub) => (
                  <SelectItem 
                    key={sub.id} 
                    value={sub.id}
                    className="font-heading text-xs sm:text-sm"
                  >
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Equipment Grid - Collapsible */}
      {isExpanded && (
        <div className="border-x-2 sm:border-x-4 border-b-2 sm:border-b-4 border-foreground p-3 sm:p-4 bg-background">
          {filteredEquipment.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <p className="font-heading text-lg">No hay equipos en esta categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {filteredEquipment.map((item) => {
                const cartQty = getCartQuantity(item.id);
                const canAdd = canAddMore(item);

                return (
                  <Card 
                    key={item.id}
                    className="overflow-hidden group relative"
                  >
                    {/* Cart quantity badge */}
                    {cartQty > 0 && (
                      <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-heading text-xs sm:text-sm shadow-brutal-sm">
                        {cartQty}
                      </div>
                    )}
                    
                    <div className="relative aspect-square cursor-pointer" onClick={() => onViewDetails(item)}>
                      {item.image_url ? (
                        <LazyImage
                          src={item.image_url}
                          alt={item.name}
                          className="grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300 object-cover"
                          placeholderClassName="border-b-2 border-foreground"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted border-b-2 border-foreground">
                          <span className="text-2xl sm:text-3xl opacity-20 font-heading">?</span>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-2 sm:p-3">
                      {item.subcategories && (
                        <Badge variant="secondary" className="mb-1 text-[10px] sm:text-xs px-1.5 py-0">
                          {item.subcategories.name}
                        </Badge>
                      )}
                      
                      <h3 
                        className="font-heading text-xs sm:text-sm leading-tight mb-1 uppercase line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => onViewDetails(item)}
                      >
                        {item.name}
                      </h3>
                      
                      {item.brand && (
                        <p className="text-muted-foreground font-mono text-[10px] sm:text-xs truncate">{item.brand}</p>
                      )}
                      
                      <div className="border-t border-foreground/30 pt-2 mt-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-primary font-heading text-lg sm:text-xl">
                            ${item.price_per_day > 0 ? (item.price_per_day / 1000).toFixed(0) + 'K' : '—'}
                          </span>
                          <span className="text-muted-foreground font-mono text-[10px]">/día</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-2 sm:p-3 pt-0">
                      {item.status === 'available' ? (
                        <Button 
                          size="sm"
                          className="w-full text-xs sm:text-sm h-8 sm:h-9"
                          onClick={() => onAddToCart(item)}
                          disabled={!canAdd}
                        >
                          {canAdd ? (
                            <>
                              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              AGREGAR
                            </>
                          ) : (
                            'MÁXIMO'
                          )}
                        </Button>
                      ) : (
                        <Button size="sm" className="w-full text-xs h-8" disabled>
                          NO DISPONIBLE
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
});

CategorySection.displayName = "CategorySection";

export default CategorySection;
