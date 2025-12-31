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

interface HeroCarouselRentalProps {
  onCategoryChange?: (categoryId: string | null) => void;
  categories: Category[];
  activeCategory: string | null;
  equipmentCounts: Record<string, number>;
}

export const HeroCarouselRental = ({ 
  onCategoryChange, 
  categories,
  activeCategory,
  equipmentCounts
}: HeroCarouselRentalProps) => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

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

  const handleChipClick = (categoryId: string, index: number) => {
    scrollToSlide(index);
    onCategoryChange?.(categoryId);
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
      <div className="h-screen bg-muted animate-pulse flex items-center justify-center border-b-4 border-foreground">
        <span className="text-muted-foreground font-heading">CARGANDO...</span>
      </div>
    );
  }

  return (
    <div 
      ref={heroRef}
      className="border-b-0"
    >
      <section className="relative overflow-hidden">
        <Carousel className="w-full" setApi={setApi}>
          <CarouselContent className="-ml-0">
            {displaySlides.map((slide) => (
              <CarouselItem key={slide.id} className="pl-0 basis-full">
                <div className="relative h-[50vh] overflow-hidden">
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
                        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-2 uppercase text-background drop-shadow-lg">
                          {slide.title}
                        </h1>
                      )}
                      {slide.description && (
                        <p className="text-base sm:text-lg md:text-xl text-background/90 font-heading drop-shadow-md max-w-2xl mx-auto">
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

        {/* Category chips navigation - integrated in hero */}
        <div className="bg-background border-t-2 border-foreground">
          <div className="container mx-auto px-2 sm:px-4">
            <div className="flex overflow-x-auto scrollbar-hide py-2 sm:py-3 gap-1 sm:gap-2 -mx-2 px-2">
              {displaySlides.map((slide, index) => {
                const category = categories.find(c => c.id === slide.category_id);
                const count = category ? equipmentCounts[category.id] || 0 : 0;
                const isActive = index === currentSlide;
                
                return (
                  <button
                    key={slide.id}
                    onClick={() => category && handleChipClick(category.id, index)}
                    className={cn(
                      "flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 font-heading text-xs sm:text-sm uppercase border-2 transition-all whitespace-nowrap",
                      isActive 
                        ? "bg-primary text-primary-foreground border-primary shadow-brutal-sm" 
                        : "bg-background text-foreground border-foreground hover:bg-muted"
                    )}
                  >
                    <span>{category?.name || slide.title || `Slide ${index + 1}`}</span>
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
      </section>
    </div>
  );
};

export default HeroCarouselRental;
