import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { ChevronDown, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/LazyImage";
import { cn } from "@/lib/utils";
import type { EquipmentWithCategory } from "@/types/supabase";

interface EquipmentWithStock extends EquipmentWithCategory {
  stock_quantity?: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryAccordionProps {
  category: Category;
  equipment: EquipmentWithStock[];
  isExpanded: boolean;
  onToggle: () => void;
  onAddToCart: (item: EquipmentWithStock) => void;
  onViewDetails: (item: EquipmentWithStock) => void;
  getCartQuantity: (id: string) => number;
  canAddMore: (item: EquipmentWithStock) => boolean;
}

export interface CategoryAccordionRef {
  scrollIntoView: () => void;
}

export const CategoryAccordion = forwardRef<CategoryAccordionRef, CategoryAccordionProps>(({ 
  category, 
  equipment, 
  isExpanded, 
  onToggle, 
  onAddToCart, 
  onViewDetails,
  getCartQuantity,
  canAddMore
}, ref) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    scrollIntoView: () => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }));

  return (
    <section 
      ref={sectionRef}
      id={`categoria-${category.slug}`}
      className="scroll-mt-28 sm:scroll-mt-32"
    >
      {/* Accordion Header */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between p-4 sm:p-6 border-2 sm:border-4 border-foreground bg-card transition-all",
          isExpanded ? "shadow-brutal" : "hover:shadow-brutal-sm"
        )}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <h2 className="font-heading text-xl sm:text-2xl md:text-3xl uppercase">
            {category.name}
          </h2>
          <Badge variant="secondary" className="text-xs sm:text-sm px-2 py-0.5">
            {equipment.length} {equipment.length === 1 ? 'equipo' : 'equipos'}
          </Badge>
        </div>
        <ChevronDown 
          className={cn(
            "h-6 w-6 sm:h-8 sm:w-8 transition-transform duration-200",
            isExpanded && "rotate-180"
          )} 
        />
      </button>

      {/* Accordion Content */}
      <div
        ref={contentRef}
        className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="border-x-2 sm:border-x-4 border-b-2 sm:border-b-4 border-foreground p-4 sm:p-6 bg-background">
          {equipment.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <p className="font-heading text-lg">No hay equipos en esta categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {equipment.map((item) => {
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
      </div>
    </section>
  );
});

CategoryAccordion.displayName = "CategoryAccordion";

export default CategoryAccordion;
