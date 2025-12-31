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
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";

interface HeroSlide {
  id: string;
  image_url: string;
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
  // Search and filter props
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSubcategories: string[];
  onSubcategoriesChange: (subcategories: string[]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  // Ref for measuring nav height
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
  navBarRef
}: HeroCarouselRentalProps) => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Search and filter state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount to ensure hero is visible
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const fetchSlides = async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("page_type", "hero_rental")
        .order("order_index");

      if (!error && data && data.length > 0) {
        // Map slides to categories based on order
        const mappedSlides = data.map((slide, index) => ({
          ...slide,
          category_id: categories[index]?.id || null
        }));
        setSlides(mappedSlides);
      }
      setLoading(false);
    };

    if (categories.length > 0) {
      fetchSlides();
    }
  }, [categories]);

  // Fetch subcategories
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
      
      // Trigger category scroll when slide changes
      const displayedSlides = slides.length > 0 ? slides : placeholderSlides;
      if (displayedSlides[index]?.category_id) {
        onCategoryChange?.(displayedSlides[index].category_id);
      }
    };

    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
    };
  }, [api, slides, onCategoryChange]);

  // Sync carousel with external category changes
  useEffect(() => {
    if (!api || !activeCategory) return;
    
    // Ensure API is fully initialized before using it
    try {
      // Check if the carousel engine is ready
      if (!api.scrollSnapList || api.scrollSnapList().length === 0) {
        return;
      }
      
      const displayedSlides = slides.length > 0 ? slides : placeholderSlides;
      const slideIndex = displayedSlides.findIndex(s => s.category_id === activeCategory);
      if (slideIndex !== -1 && slideIndex !== currentSlide) {
        api.scrollTo(slideIndex);
      }
    } catch (error) {
      // API not ready yet, will sync on next update
      console.debug('Carousel API not ready yet');
    }
  }, [activeCategory, api, slides]);

  const scrollToSlide = (index: number) => {
    api?.scrollTo(index);
  };

  const scrollToHero = () => {
    // Scroll to top of the page to show hero
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChipClick = (categoryId: string, index: number) => {
    scrollToSlide(index);
    onCategoryChange?.(categoryId);
    // Scroll back to hero to show the selected category slide
    scrollToHero();
  };

  // Filter subcategories by active category
  const filteredSubcategories = activeCategory
    ? subcategories.filter(sub => sub.category_id === activeCategory)
    : subcategories;

  const toggleSubcategory = (id: string) => {
    if (selectedSubcategories.includes(id)) {
      onSubcategoriesChange(selectedSubcategories.filter(s => s !== id));
    } else {
      onSubcategoriesChange([...selectedSubcategories, id]);
    }
  };

  // Placeholder slides when no images are configured
  const placeholderSlides: HeroSlide[] = categories.map((cat, index) => ({
    id: `placeholder-${cat.id}`,
    image_url: "",
    title: cat.name.toUpperCase(),
    description: `Explora nuestro catálogo de ${cat.name.toLowerCase()}`,
    order_index: index,
    category_id: cat.id
  }));

  const displaySlides = slides.length > 0 ? slides : placeholderSlides;

  if (loading) {
    return (
      <div className="h-[50vh] bg-muted animate-pulse flex items-center justify-center border-b-4 border-foreground">
        <span className="text-muted-foreground font-heading">CARGANDO...</span>
      </div>
    );
  }

  return (
    <div ref={heroRef}>
      {/* Fixed Navigation Bar - at very top */}
      <div 
        ref={navBarRef}
        className="fixed top-0 left-0 right-0 z-50 bg-background border-b-2 border-foreground"
      >
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center gap-1 sm:gap-2 py-1.5 sm:py-2 h-[40px] sm:h-[52px]">
            {/* Category chips */}
            <div className="flex-1 flex overflow-x-auto scrollbar-hide gap-1 sm:gap-2 -mx-1 px-1">
              {displaySlides.map((slide, index) => {
                const category = categories.find(c => c.id === slide.category_id);
                const count = category ? equipmentCounts[category.id] || 0 : 0;
                const isActive = index === currentSlide;
                
                return (
                  <button
                    key={slide.id}
                    onClick={() => category && handleChipClick(category.id, index)}
                    className={cn(
                      "flex-shrink-0 px-2 py-1 sm:px-3 sm:py-1.5 font-heading text-[10px] sm:text-xs uppercase border-2 transition-all whitespace-nowrap",
                      isActive 
                        ? "bg-primary text-primary-foreground border-primary shadow-brutal-sm" 
                        : "bg-background text-foreground border-foreground hover:bg-muted"
                    )}
                  >
                    <span>{category?.name || slide.title || `Slide ${index + 1}`}</span>
                    {count > 0 && (
                      <span className={cn(
                        "ml-1 sm:ml-1.5 text-[9px] sm:text-[10px]",
                        isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        ({count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if (isFilterOpen) setIsFilterOpen(false);
              }}
              className={cn(
                "border-2 border-foreground h-7 w-7 sm:h-9 sm:w-9 p-0 flex-shrink-0",
                isSearchOpen && "bg-primary text-primary-foreground border-primary"
              )}
            >
              {isSearchOpen ? <X className="h-3 w-3 sm:h-4 sm:w-4" /> : <Search className="h-3 w-3 sm:h-4 sm:w-4" />}
            </Button>
            
            {/* Filter button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
                if (isSearchOpen) setIsSearchOpen(false);
              }}
              className={cn(
                "border-2 border-foreground h-7 sm:h-9 px-2 flex-shrink-0",
                isFilterOpen && "bg-primary text-primary-foreground border-primary"
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
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-7 sm:h-9 px-1.5 flex-shrink-0"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
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
                    className="pl-7 sm:pl-10 border-2 border-foreground font-heading uppercase text-xs sm:text-sm h-8 sm:h-10"
                    autoFocus
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => onSearchChange("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
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
                <div className="pb-2 sm:pb-3 border-t border-foreground/20 pt-2">
                  <h4 className="font-heading text-xs mb-2 uppercase text-muted-foreground">Subcategorías</h4>
                  {filteredSubcategories.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No hay subcategorías para esta categoría</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {filteredSubcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => toggleSubcategory(sub.id)}
                          className={`px-2 py-1 text-[10px] sm:text-xs font-heading uppercase border-2 transition-all ${
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
        </div>
      </div>

      {/* Spacer for fixed nav */}
      <div className="h-[40px] sm:h-[52px]" />

      {/* Carousel slides - scrolls with body */}
      <section className="relative overflow-hidden">
        <Carousel className="w-full" setApi={setApi}>
          <CarouselContent className="-ml-0">
            {displaySlides.map((slide) => (
              <CarouselItem key={slide.id} className="pl-0 basis-full">
                <div className="relative h-[40vh] sm:h-[45vh] overflow-hidden">
                  {slide.image_url ? (
                    <img
                      src={slide.image_url}
                      alt={slide.title || "Equipos rental"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-foreground via-foreground/90 to-primary/30" />
                  )}
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
                  
                  {/* Text overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center z-10 p-4 sm:p-8 max-w-4xl">
                      {slide.title && (
                        <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 uppercase text-background drop-shadow-lg">
                          {slide.title}
                        </h1>
                      )}
                      {slide.description && (
                        <p className="text-sm sm:text-base md:text-lg text-background/90 font-heading drop-shadow-md max-w-2xl mx-auto">
                          {slide.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Navigation arrows */}
          {displaySlides.length > 1 && (
            <>
              <CarouselPrevious className="left-2 sm:left-4 h-8 w-8 sm:h-10 sm:w-10 border-2 border-background bg-background/20 hover:bg-background/40 text-background" />
              <CarouselNext className="right-2 sm:right-4 h-8 w-8 sm:h-10 sm:w-10 border-2 border-background bg-background/20 hover:bg-background/40 text-background" />
            </>
          )}
          
          {/* Scroll indicator */}
          <ScrollIndicator className="text-background/80 hover:text-background" />
        </Carousel>
      </section>
    </div>
  );
};

export default HeroCarouselRental;
