import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

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
}

export const HeroCarouselRental = ({ onCategoryChange, categories }: HeroCarouselRentalProps) => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

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
      if (slides[index]?.category_id) {
        onCategoryChange?.(slides[index].category_id);
      }
    };

    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
    };
  }, [api, slides, onCategoryChange]);

  const scrollToSlide = (index: number) => {
    api?.scrollTo(index);
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
      <div className="h-[40vh] sm:h-[50vh] lg:h-[60vh] bg-muted animate-pulse flex items-center justify-center border-b-4 border-foreground">
        <span className="text-muted-foreground font-heading">CARGANDO...</span>
      </div>
    );
  }

  return (
    <section className="relative border-b-4 border-foreground overflow-hidden">
      <Carousel className="w-full" setApi={setApi}>
        <CarouselContent className="-ml-0">
          {displaySlides.map((slide) => (
            <CarouselItem key={slide.id} className="pl-0 basis-full">
              <div className="relative h-[40vh] sm:h-[50vh] lg:h-[60vh] overflow-hidden">
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
                      <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-2 sm:mb-4 uppercase text-background drop-shadow-lg">
                        {slide.title}
                      </h1>
                    )}
                    {slide.description && (
                      <p className="text-lg sm:text-xl md:text-2xl text-background/90 font-heading drop-shadow-md max-w-2xl mx-auto">
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
            <CarouselPrevious className="left-2 sm:left-4 lg:left-8 h-10 w-10 sm:h-12 sm:w-12 border-2 border-background bg-background/20 hover:bg-background/40 text-background" />
            <CarouselNext className="right-2 sm:right-4 lg:right-8 h-10 w-10 sm:h-12 sm:w-12 border-2 border-background bg-background/20 hover:bg-background/40 text-background" />
          </>
        )}
      </Carousel>

      {/* Category dots navigation */}
      {displaySlides.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-2 sm:gap-3 z-20 px-4">
          {displaySlides.map((slide, index) => {
            const category = categories.find(c => c.id === slide.category_id);
            return (
              <button
                key={slide.id}
                onClick={() => scrollToSlide(index)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 font-heading text-xs sm:text-sm uppercase transition-all border-2 ${
                  index === currentSlide 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-background/20 text-background border-background/50 hover:bg-background/40"
                }`}
              >
                {category?.name || slide.title || `Slide ${index + 1}`}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default HeroCarouselRental;
