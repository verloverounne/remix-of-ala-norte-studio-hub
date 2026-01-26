import { useRef, forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Plus, ChevronDown, ChevronRight, X } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/LazyImage";
import { cn, formatEquipmentName } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  onCategoryActivate?: (categoryId: string) => void;
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
  defaultExpanded = false,
  onCategoryActivate
}, ref) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  useImperativeHandle(ref, () => ({
    scrollIntoView: () => {
      sectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
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
      const {
        data,
        error
      } = await supabase.from("subcategories").select("*").eq("category_id", category.id).order("order_index");
      if (!error && data) {
        setSubcategories(data);
      }
    };
    fetchSubcategories();
  }, [category.id]);

  // Filter equipment by selected subcategory
  const filteredEquipment = selectedSubcategory === "all" ? equipment : equipment.filter(e => e.subcategory_id === selectedSubcategory);
  const handleHeaderClick = () => {
    const wasExpanded = isExpanded;
    setIsExpanded(!isExpanded);

    // Notify parent to activate this category's tab
    onCategoryActivate?.(category.id);

    // If expanding, scroll to show the grid at the top edge after a brief delay
    if (!wasExpanded) {
      setTimeout(() => {
        if (sectionRef.current) {
          const headerHeight = stickyTop + 52; // nav bar + category header height
          const sectionTop = sectionRef.current.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: sectionTop - headerHeight + 52,
            // Position so grid starts at top
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  };
  return <section ref={sectionRef} id={`categoria-${category.slug}`} className="relative" style={{
    scrollMarginTop: `${stickyTop + 8}px`
  }}>
      {/* Sticky Category Header with Collapse - z-20 - same height as filter bar */}
      <div className="sticky z-20 bg-background mb-0 -mt-px" style={{
      top: `${stickyTop - 1}px`
    }}>
        <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 h-[40px] sm:h-[52px]">
          <button onClick={handleHeaderClick} className="flex items-center gap-1 sm:gap-3 cursor-pointer hover:text-primary transition-colors">
            {isExpanded ? <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 transition-transform flex-shrink-0" /> : <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform flex-shrink-0" />}
            <h2 className="font-heading text-sm sm:text-lg md:text-xl uppercase truncate bg-background">
              {category.name}
            </h2>
            <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0 flex-shrink-0 text-primary-dark bg-background">
              {filteredEquipment.length}
            </Badge>
          </button>
          
          {/* Subcategory Dropdown */}
          {subcategories.length > 0 && isExpanded && <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
              <SelectTrigger className="w-[140px] sm:w-[180px] h-8 sm:h-9 text-xs sm:text-sm font-heading">
                <SelectValue placeholder="Subcategoría" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="all" className="font-heading text-xs sm:text-sm">
                  Todas
                </SelectItem>
                {subcategories.map(sub => <SelectItem key={sub.id} value={sub.id} className="font-heading text-xs sm:text-sm">
                    {sub.name}
                  </SelectItem>)}
              </SelectContent>
            </Select>}
        </div>
      </div>

      {/* Equipment Grid - Collapsible */}
      {isExpanded && <div ref={gridRef} className="p-3 sm:p-4 border-[#201e1d] border-0 bg-[#201e1d]">
          {filteredEquipment.length === 0 ? <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <p className="font-heading text-lg">No hay equipos en esta categoría</p>
            </div> : <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {filteredEquipment.map(item => {
          const cartQty = getCartQuantity(item.id);
          const canAdd = canAddMore(item);
          return <Card key={item.id} className="overflow-hidden group relative border-0 shadow-none hover:shadow-sm bg-[#2e2c29]">
                    <CardContent className="p-2 sm:p-3 flex flex-col space-y-2 bg-destructive px-[4px] border-0 border-transparent shadow-none">
                      {/* 1. Nombre del equipo - formateado */}
                      <h3 className="font-heading normal-case text-xs leading-tight pt-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors h-[5em] sm:text-xs text-left font-extralight" onClick={() => onViewDetails(item)}>
                        {formatEquipmentName(item.name)}
                      </h3>
                      
                      {/* 2. Foto */}
                      <div className="relative aspect-square cursor-pointer duotone-hover-group overflow-hidden" onClick={() => onViewDetails(item)}>
                        
                        {/* Cart quantity badge with stock indicator - esquina inferior derecha */}
                        <div className={cn("absolute bottom-2 right-2 z-10 rounded-none px-2 py-0.5 flex items-center justify-center font-heading text-[10px] sm:text-xs shadow-brutal-sm", cartQty > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                          {cartQty}/{item.stock_quantity}
                        </div>
                        
                        {item.image_url ? <LazyImage src={item.image_url} alt={item.name} className="w-full h-full group-hover:scale-105 transition-all duration-300 rounded-none" placeholderClassName="w-full h-full" aspectRatio="square" /> : <div className="w-full h-full flex items-center justify-center bg-muted">
                            <span className="text-2xl sm:text-3xl opacity-20 font-heading">?</span>
                          </div>}
                      </div>
                      
                      {/* 4. Precio y Botón agregar - en la misma fila */}
                      <div className="mt-auto flex items-center gap-2">
                        {/* Precio - mitad izquierda */}
                        <div className="flex-1 flex items-baseline gap-1">
                          <span className="text-primary font-heading text-lg sm:text-xl">
                            ${item.price_per_day > 0 ? (item.price_per_day / 1000).toFixed(0) + 'K' : '—'}
                          </span>
                          <span className="text-muted-foreground font-mono text-[10px]">/día</span>
                        </div>
                        
                        {/* Botón agregar - cuadrado que se expande en hover */}
                        {item.status === 'available' ? <Button size="sm" className="h-8 sm:h-9 w-8 sm:w-9 p-0 overflow-hidden transition-all duration-300 hover:w-[100px] sm:hover:w-[120px] hover:px-2 sm:hover:px-3 font-black flex-shrink-0 group relative flex items-center justify-center gap-0" onClick={() => onAddToCart(item)} disabled={!canAdd}>
                            {canAdd ? <>
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 m-0" />
                                <span className="whitespace-nowrap opacity-0 w-0 overflow-hidden transition-all duration-300 group-hover:opacity-100 group-hover:w-auto group-hover:ml-2 font-black">
                                  AGREGAR
                                </span>
                              </> : <span className="text-[10px] font-black">MÁX</span>}
                          </Button> : <Button size="sm" className="h-8 sm:h-9 w-8 sm:w-9 p-0 font-black flex-shrink-0 flex items-center justify-center" disabled>
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>}
                      </div>
                    </CardContent>
                  </Card>;
        })}
            </div>}
        </div>}
    </section>;
});
CategorySection.displayName = "CategorySection";
export default CategorySection;