import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { ScrollIndicator } from "@/components/ui/ScrollIndicator";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useHeaderVisibility } from "@/hooks/useHeaderVisibility";

interface HeroSlide {
  id: string;
  image_url: string;
  media_type?: string | null;
  title: string | null;
  description: string | null;
  order_index: number;
  category_id?: string | null;
}

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

interface HeroCarouselRentalProps {
  onCategoryChange?: (categoryId: string | null) => void;
  categories: Category[];
  activeCategory: string | null;
  equipmentCounts: Record<string, number>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSubcategories: string[];
  onSubcategoriesChange: (subcategories: string[]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  navBarRef?: React.RefObject<HTMLDivElement>;
}

export const HeroCarouselRental = ({
  onCategoryChange,
  categories,
  activeCategory,
  equipmentCounts,
  searchTerm,
  onSearchChange,
  selectedSubcategories,
  onSubcategoriesChange,
  onClearFilters,
  hasActiveFilters,
  navBarRef,
}: HeroCarouselRentalProps) => {
  // Map of category_id -> slide with background media from admin
  const [categoryBackgrounds, setCategoryBackgrounds] = useState<Record<string, HeroSlide>>({});
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const { isVisible: isHeaderVisible, isHovering: isHeaderHovering, isMobile } = useHeaderVisibility();
  
  // Calculate sticky top based on header visibility
  // Mobile: header always visible, h-10 (40px)
  // Desktop: h-14 (56px) when visible, 0 when hidden
  const stickyNavTop = isMobile ? 40 : (isHeaderVisible || isHeaderHovering ? 56 : 0);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Fetch background media for each category from admin
  useEffect(() => {
    const fetchBackgrounds = async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("page_type", "hero_rental")
        .not("category_id", "is", null);

      if (!error && data) {
        const bgMap: Record<string, HeroSlide> = {};
        data.forEach((slide) => {
          if (slide.category_id) {
            bgMap[slide.category_id] = slide;
          }
        });
        setCategoryBackgrounds(bgMap);
      }
      setLoading(false);
    };

    fetchBackgrounds();
  }, []);

  // Fetch subcategories
  useEffect(() => {
    const fetchSubcategories = async () => {
      const { data } = await supabase.from("subcategories").select("*").order("order_index");

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
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      const index = api.selectedScrollSnap();
      setCurrentSlide(index);

      if (categories[index]) {
        onCategoryChange?.(categories[index].id);
      }
    };

    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
    };
  }, [api, categories, onCategoryChange]);

  // Sync carousel with external category changes
  useEffect(() => {
    if (!api || !activeCategory || categories.length === 0) return;

    try {
      if (!api.scrollSnapList || api.scrollSnapList().length === 0) {
        return;
      }

      const slideIndex = categories.findIndex((c) => c.id === activeCategory);
      if (slideIndex !== -1 && slideIndex !== currentSlide) {
        api.scrollTo(slideIndex);
      }
    } catch (error) {
      console.debug("Carousel API not ready yet");
    }
  }, [activeCategory, api, categories, currentSlide]);

  const scrollToSlide = (index: number) => {
    api?.scrollTo(index);
  };

  const handleChipClick = (categoryId: string, index: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    scrollToSlide(index);
    onCategoryChange?.(categoryId);
  };

  const filteredSubcategories = activeCategory
    ? subcategories.filter((sub) => sub.category_id === activeCategory)
    : subcategories;

  const toggleSubcategory = (id: string) => {
    if (selectedSubcategories.includes(id)) {
      onSubcategoriesChange(selectedSubcategories.filter((s) => s !== id));
    } else {
      onSubcategoriesChange([...selectedSubcategories, id]);
    }
  };

  const getBackgroundForCategory = (categoryId: string): HeroSlide | null => {
    return categoryBackgrounds[categoryId] || null;
  };

  if (loading || categories.length === 0) {
    return (
      <div className="h-[75vh] bg-muted animate-pulse flex items-center justify-center">
        <span className="text-muted-foreground font-heading">CARGANDO...</span>
      </div>
    );
  }

  return (
    <div ref={heroRef}>
      {/* Carousel slides - one per category, using backgrounds from admin */}
      <section className="relative overflow-hidden">
        <Carousel className="w-full" setApi={setApi}>
          <CarouselContent className="-ml-0">
            {categories.map((category) => {
              const bg = getBackgroundForCategory(category.id);

              return (
                <CarouselItem key={category.id} className="pl-0 basis-full">
                  <div className="relative h-[75vh] overflow-hidden duotone-hover-group">
                    {bg?.media_type === "video" && bg.image_url ? (
                      <video
                        src={bg.image_url}
                        className="w-full h-full object-cover video-duotone"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : bg?.image_url ? (
                      <img
                        src={bg.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover image-duotone"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-foreground via-foreground/90 to-primary/30" />
                    )}

                    {/* Text overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center z-10 p-4 sm:p-8 max-w-4xl">
                        <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 uppercase text-background drop-shadow-lg">
                          {bg?.title || category.name.toUpperCase()}
                        </h1>
                        {bg?.description && (
                          <p className="text-sm sm:text-base md:text-lg text-background/90 font-heading drop-shadow-md max-w-2xl mx-auto">
                            {bg.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {/* Navigation arrows */}
          {categories.length > 1 && (
            <>
              <CarouselPrevious className="left-2 sm:left-4 h-8 w-8 sm:h-10 sm:w-10 border-2 border-background bg-background/20 hover:bg-background/40 text-background" />
              <CarouselNext className="right-2 sm:right-4 h-8 w-8 sm:h-10 sm:w-10 border-2 border-background bg-background/20 hover:bg-background/40 text-background" />
            </>
          )}

          {/* Scroll indicator */}
          <ScrollIndicator className="text-background/80 hover:text-background" />
        </Carousel>
      </section>

      {/* Sticky Navigation Bar - flush with hero, adjusts to header visibility */}
      <div
        ref={navBarRef}
        className="sticky z-40 bg-background border-b border-foreground/10 -mt-px transition-[top] duration-300"
        style={{ top: `${stickyNavTop}px` }}
      >
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-center gap-1 sm:gap-2 py-1.5 sm:py-2 h-[40px] sm:h-[52px]">
            {/* Category chips - always show all 5 categories */}
            <div className="flex items-center overflow-x-auto scrollbar-hide gap-1 sm:gap-2">
              {categories.map((category, index) => {
                const count = equipmentCounts[category.id] || 0;
                const isActive = index === currentSlide;

                return (
                  <button
                    key={category.id}
                    onClick={() => handleChipClick(category.id, index)}
                    className={cn(
                      "flex-shrink-0 px-2 py-1 sm:px-3 sm:py-1.5 font-heading text-[10px] sm:text-xs uppercase transition-all whitespace-nowrap",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-brutal-sm"
                        : "bg-background text-foreground hover:bg-muted",
                    )}
                  >
                    <span>{category.name}</span>
                    {count > 0 && (
                      <span
                        className={cn(
                          "ml-1 sm:ml-1.5 text-[9px] sm:text-[10px]",
                          isActive ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        ({count})
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Search button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (isFilterOpen) setIsFilterOpen(false);
                }}
                className={cn(
                  "h-7 w-7 sm:h-9 sm:w-9 p-0 flex-shrink-0",
                  isSearchOpen && "bg-primary text-primary-foreground",
                )}
              >
                {isSearchOpen ? <X className="h-3 w-3 sm:h-4 sm:w-4" /> : <Search className="h-3 w-3 sm:h-4 sm:w-4" />}
              </Button>

              {/* Filter button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsFilterOpen(!isFilterOpen);
                  if (isSearchOpen) setIsSearchOpen(false);
                }}
                className={cn(
                  "h-7 sm:h-9 px-2 flex-shrink-0",
                  isFilterOpen && "bg-primary text-primary-foreground",
                )}
              >
                <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                {selectedSubcategories.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-[9px] h-4 px-1">
                    {selectedSubcategories.length}
                  </Badge>
                )}
              </Button>

              {/* Clear filters */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-7 sm:h-9 px-1.5 flex-shrink-0">
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Expandable search bar */}
          <Collapsible open={isSearchOpen}>
            <CollapsibleContent>
              <div className="pb-2 sm:pb-3 border-t border-foreground/20 pt-2">
                <div className="relative">
                  <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar equipos..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-7 sm:pl-10 font-heading uppercase text-xs sm:text-sm h-8 sm:h-10"
                    autoFocus
                  />
                  {searchTerm && (
                    <button onClick={() => onSearchChange("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                      <X className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Expandable subcategory filters */}
          <div ref={filterRef}>
            <Collapsible open={isFilterOpen}>
              <CollapsibleContent>
                <div className="pb-2 sm:pb-3 pt-2">
                  <h4 className="font-heading text-xs mb-2 uppercase text-muted-foreground">Subcategorías</h4>
                  {filteredSubcategories.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No hay subcategorías para esta categoría</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {filteredSubcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => toggleSubcategory(sub.id)}
                          className={`px-2 py-1 text-[10px] sm:text-xs font-heading uppercase transition-all ${
                            selectedSubcategories.includes(sub.id)
                              ? "bg-primary text-primary-foreground"
                              : "bg-background text-foreground hover:bg-muted"
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
        </div>
      </div>

    </div>
  );
};

export default HeroCarouselRental;
