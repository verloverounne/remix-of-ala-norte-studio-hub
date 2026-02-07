import { useRef, forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Plus, ChevronDown, ChevronRight, X, ChevronsUpDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/LazyImage";
import { cn, formatEquipmentName } from "@/lib/utils";
import type { EquipmentWithCategory } from "@/types/supabase";
import { EquipmentListView } from "./EquipmentListView";
import { CollapsibleSubcategory } from "./CollapsibleSubcategory";
import type { ViewMode } from "./ViewModeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
type EquipmentWithStock = EquipmentWithCategory;
type SortOption = "alphabetic" | "price-asc" | "price-desc";
interface Category {
  id: string;
  name: string;
  slug: string;
}
interface SubcategoryItem {
  id: string;
  name: string;
  category_id: string;
  order_index?: number | null;
}
interface CategorySectionProps {
  category: Category;
  equipment: EquipmentWithStock[];
  subcategories: SubcategoryItem[];
  onAddToCart: (item: EquipmentWithStock) => void;
  onViewDetails: (item: EquipmentWithStock) => void;
  getCartQuantity: (id: string) => number;
  canAddMore: (item: EquipmentWithStock) => boolean;
  stickyTop: number;
  defaultExpanded?: boolean;
  onCategoryActivate?: (categoryId: string) => void;
  viewMode?: ViewMode;
  sortOption?: SortOption;
  onSubcategorySelect?: (subcategoryId: string) => void;
  selectedSubcategories?: string[];
  forceExpandSubcategories?: Set<string>;
}
export interface CategorySectionRef {
  scrollIntoView: () => void;
  expand: () => void;
  collapse: () => void;
}
export const CategorySection = forwardRef<CategorySectionRef, CategorySectionProps>(
  (
    {
      category,
      equipment,
      subcategories,
      onAddToCart,
      onViewDetails,
      getCartQuantity,
      canAddMore,
      stickyTop,
      defaultExpanded = false,
      onCategoryActivate,
      viewMode = "cards",
      sortOption = "subcategory",
      onSubcategorySelect,
      selectedSubcategories = [],
      forceExpandSubcategories,
    },
    ref,
  ) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [allSubcategoriesExpanded, setAllSubcategoriesExpanded] = useState(true);
    const [subcategoryStates, setSubcategoryStates] = useState<Record<string, boolean>>({});

    // Initialize subcategory states when subcategories change or category expands
    useEffect(() => {
      if (isExpanded && subcategories.length > 0) {
        const initialStates: Record<string, boolean> = {};
        subcategories.forEach((sub) => {
          const subcatId = sub.id;
          const isForceExpanded = forceExpandSubcategories?.has(subcatId);
          const shouldExpand =
            isForceExpanded || (selectedSubcategories.length === 0 ? true : selectedSubcategories.includes(subcatId));
          initialStates[subcatId] = shouldExpand;
        });
        initialStates["no-subcategory"] = true;
        setSubcategoryStates(initialStates);
        setAllSubcategoriesExpanded(Object.values(initialStates).every((v) => v));
      }
    }, [isExpanded, subcategories, forceExpandSubcategories, selectedSubcategories]);
    const toggleAllSubcategories = () => {
      const newState = !allSubcategoriesExpanded;
      setAllSubcategoriesExpanded(newState);
      const newStates: Record<string, boolean> = {};
      subcategories.forEach((sub) => {
        newStates[sub.id] = newState;
      });
      newStates["no-subcategory"] = newState;
      setSubcategoryStates(newStates);
    };
    const handleSubcategoryToggle = (subcatId: string, expanded: boolean) => {
      setSubcategoryStates((prev) => {
        const newStates = {
          ...prev,
          [subcatId]: expanded,
        };
        setAllSubcategoriesExpanded(Object.values(newStates).every((v) => v));
        return newStates;
      });
    };
    useImperativeHandle(ref, () => ({
      scrollIntoView: () => {
        sectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      },
      expand: () => {
        setIsExpanded(true);
      },
      collapse: () => {
        setIsExpanded(false);
      },
    }));

    // Group equipment by subcategory for headers - ALWAYS group by subcategory
    const groupedBySubcategory = () => {
      const groups: {
        subcategory: SubcategoryItem | null;
        items: EquipmentWithStock[];
      }[] = [];
      const subcategoryMap = new Map<string, EquipmentWithStock[]>();
      const noSubcategory: EquipmentWithStock[] = [];
      equipment.forEach((item) => {
        if (item.subcategory_id) {
          if (!subcategoryMap.has(item.subcategory_id)) {
            subcategoryMap.set(item.subcategory_id, []);
          }
          subcategoryMap.get(item.subcategory_id)!.push(item);
        } else {
          noSubcategory.push(item);
        }
      });

      // Sort subcategories by order_index
      const sortedSubs = [...subcategories].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
      sortedSubs.forEach((sub) => {
        const items = subcategoryMap.get(sub.id);
        if (items && items.length > 0) {
          groups.push({
            subcategory: sub,
            items,
          });
        }
      });
      if (noSubcategory.length > 0) {
        groups.push({
          subcategory: null,
          items: noSubcategory,
        });
      }
      return groups;
    };
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
              behavior: "smooth",
            });
          }
        }, 50);
      }
    };
    const groups = groupedBySubcategory();
    return (
      <section
        ref={sectionRef}
        id={`categoria-${category.slug}`}
        className="relative bg-foreground"
        style={{
          scrollMarginTop: `${stickyTop + 8}px`,
        }}
      >
        {/* Sticky Category Header with Collapse */}
        <div
          className="z-20 bg-foreground mb-0 -mt-px my-0"
          style={{
            top: `${stickyTop - 1}px`,
          }}
        >
          <div className="justify-n px-2 sm:px-4 flex items-center justify-start gap-[32px] text-foreground bg-inherit">
            <button
              onClick={handleHeaderClick}
              className="flex items-center gap-1 sm:gap-3 cursor-pointer hover:text-primary transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-background" />
              ) : (
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-background" />
              )}
              <h2 className="font-heading text-sm sm:text-lg md:text-xl uppercase truncate bg-transparent text-background">
                {category.name}
              </h2>
              <Badge
                variant="secondary"
                className="text-[10px] sm:text-xs px-1.5 py-0 flex-shrink-0 bg-[#131211] text-[#fbf2ee]"
              >
                {equipment.length}
              </Badge>
            </button>

            {/* Subcategory dropdown 
            {subcategories.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="link" size="sm" className="px-2 text-background text-xs font-heading uppercase">
                    Subcategorías
                    <ChevronDown className="h-3 w-3 ml-1 texto-background" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-transparent z-50">
                  {subcategories.map((sub) => (
                    <DropdownMenuItem
                      key={sub.id}
                      onClick={() => onSubcategorySelect?.(sub.id)}
                      className={cn(
                        "font-heading text-xs uppercase cursor-pointer",
                        selectedSubcategories.includes(sub.id) && "bg-primary text-primary-foreground",
                      )}
                    >
                      {sub.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
*/}
            {/* Toggle all subcategories button */}
            {subcategories.length > 0 && (
              <Button
                variant="link"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAllSubcategories();
                }}
                className="h-8 px-2 text-xs font-heading uppercase gap-1"
                title={allSubcategoriesExpanded ? "Colapsar todas" : "Expandir todas"}
              >
                <ChevronsUpDown className="h-6 w-6" />
                <span className="hidden sm:inline">{allSubcategoriesExpanded ? "Colapsar" : "Expandir"}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Equipment Grid - Collapsible with Subcategory Headers */}
        {isExpanded && (
          <div
            ref={gridRef}
            className="p-3 sm:p-4 border-[#201e1d] border-0 px-16 bg-background max-w-screen ml-[16px]"
          >
            {equipment.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <p className="font-heading text-lg">No hay equipos en esta categoría</p>
              </div>
            ) : viewMode === "list" ? (
              // List view with subcategory headers
              <div className="space-y-2">
                {groups.map((group) => {
                  const subcatId = group.subcategory?.id || "no-subcategory";
                  const isSubcategoryExpanded = subcategoryStates[subcatId] ?? true;
                  return (
                    <div key={group.subcategory?.id || "no-subcategory"}>
                      <CollapsibleSubcategory
                        name={group.subcategory?.name || "Sin subcategoría"}
                        count={group.items.length}
                        isExpanded={isSubcategoryExpanded}
                        onToggle={(expanded) => handleSubcategoryToggle(subcatId, expanded)}
                      >
                        <EquipmentListView
                          equipment={group.items}
                          onAddToCart={onAddToCart}
                          onViewDetails={onViewDetails}
                          getCartQuantity={getCartQuantity}
                          canAddMore={canAddMore}
                        />
                      </CollapsibleSubcategory>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Card view with subcategory headers
              <div className="space-y-2">
                {groups.map((group) => {
                  const subcatId = group.subcategory?.id || "no-subcategory";
                  const isSubcategoryExpanded = subcategoryStates[subcatId] ?? true;
                  return (
                    <div key={group.subcategory?.id || "no-subcategory"}>
                      <CollapsibleSubcategory
                        name={group.subcategory?.name || "Sin subcategoría"}
                        count={group.items.length}
                        isExpanded={isSubcategoryExpanded}
                        onToggle={(expanded) => handleSubcategoryToggle(subcatId, expanded)}
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                          {group.items.map((item) => {
                            const cartQty = getCartQuantity(item.id);
                            const canAdd = canAddMore(item);
                            return (
                              <Card
                                key={item.id}
                                className="overflow-hidden group relative border-0 shadow-none hover:shadow-sm bg-transparent"
                              >
                                <CardContent className="p-2 sm:p-3 flex flex-col space-y-2 px-[4px] bg-muted text-stone-200">
                                  <h3
                                    className="font-heading normal-case text-xs leading-tight pt-2 line-clamp-2 cursor-pointer transition-colors h-[5em] text-left font-medium text-foreground mx-[4px] sm:text-sm"
                                    onClick={() => onViewDetails(item)}
                                  >
                                    {formatEquipmentName(item.name)}
                                  </h3>
                                  <div
                                    className="relative aspect-square cursor-pointer duotone-hover-group overflow-hidden"
                                    onClick={() => onViewDetails(item)}
                                  >
                                    <div
                                      className={cn(
                                        "absolute bottom-2 right-2 z-10 rounded-none px-2 py-0.5 flex items-center justify-center font-heading text-[10px] sm:text-xs shadow-brutal-sm",
                                        cartQty > 0
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-muted text-muted-foreground",
                                      )}
                                    >
                                      {cartQty}/{item.stock_quantity}
                                    </div>
                                    {item.image_url ? (
                                      <LazyImage
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-full group-hover:scale-105 transition-all duration-300 rounded-none text-foreground bg-stone-50 px-[8px]"
                                        placeholderClassName="w-full h-full"
                                        aspectRatio="square"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-muted">
                                        <span className="text-2xl sm:text-3xl opacity-20 font-heading bg-background">
                                          ?
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="mt-auto flex items-center gap-2">
                                    <div className="flex-1 flex items-baseline gap-1">
                                      <span className="font-heading text-lg sm:text-xl text-[#f82020]">
                                        ${item.price_per_day > 0 ? (item.price_per_day / 1000).toFixed(0) + "K" : "—"}
                                      </span>
                                      <span className="text-muted-foreground font-mono text-[10px]">/día</span>
                                    </div>
                                    {item.status === "available" ? (
                                      <Button
                                        size="sm"
                                        className="h-8 sm:h-9 w-8 sm:w-9 p-0 overflow-hidden transition-all duration-300 hover:w-[100px] sm:hover:w-[120px] hover:px-2 sm:hover:px-3 font-black flex-shrink-0 group relative flex items-center justify-center gap-0 bg-primary"
                                        onClick={() => onAddToCart(item)}
                                        disabled={!canAdd}
                                      >
                                        {canAdd ? (
                                          <>
                                            <Plus className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 m-0" />
                                            <span className="whitespace-nowrap opacity-0 w-0 overflow-hidden transition-all duration-300 group-hover:opacity-100 group-hover:w-auto group-hover:ml-2 font-black">
                                              AGREGAR
                                            </span>
                                          </>
                                        ) : (
                                          <span className="text-[10px] font-black">MÁX</span>
                                        )}
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        className="h-8 sm:h-9 w-8 sm:w-9 p-0 font-black flex-shrink-0 flex items-center justify-center bg-secondary text-accent"
                                        disabled
                                      >
                                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </CollapsibleSubcategory>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>
    );
  },
);
CategorySection.displayName = "CategorySection";
export default CategorySection;
