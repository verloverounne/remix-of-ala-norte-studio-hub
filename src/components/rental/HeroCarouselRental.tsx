import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselApi, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { ScrollIndicator } from "@/components/ui/ScrollIndicator";
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
interface HeroCarouselRentalProps {
  categories: Category[];
  activeCategory: string | null;
  onCategoryChange?: (categoryId: string | null) => void;
}
export const HeroCarouselRental = ({
  categories,
  activeCategory,
  onCategoryChange
}: HeroCarouselRentalProps) => {
  const [categoryBackgrounds, setCategoryBackgrounds] = useState<Record<string, HeroSlide>>({});
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant"
    });
  }, []);

  // Fetch background media for each category from admin
  useEffect(() => {
    const fetchBackgrounds = async () => {
      const {
        data,
        error
      } = await supabase.from("gallery_images").select("*").eq("page_type", "hero_rental").not("category_id", "is", null);
      if (!error && data) {
        const bgMap: Record<string, HeroSlide> = {};
        data.forEach(slide => {
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
      const slideIndex = categories.findIndex(c => c.id === activeCategory);
      if (slideIndex !== -1 && slideIndex !== currentSlide) {
        api.scrollTo(slideIndex);
      }
    } catch (error) {
      console.debug("Carousel API not ready yet");
    }
  }, [activeCategory, api, categories, currentSlide]);
  const getBackgroundForCategory = (categoryId: string): HeroSlide | null => {
    return categoryBackgrounds[categoryId] || null;
  };
  if (loading || categories.length === 0) {
    return <div className="h-[75vh] bg-muted animate-pulse flex items-center justify-center">
        <span className="text-muted-foreground font-heading">CARGANDO...</span>
      </div>;
  }
  return <div ref={heroRef} className="relative">
      {/* Carousel slides - one per category, using backgrounds from admin */}
      <section className="relative overflow-hidden">
        <Carousel className="w-full" setApi={setApi}>
          <CarouselContent className="-ml-0">
            {categories.map(category => {
            const bg = getBackgroundForCategory(category.id);
            return <CarouselItem key={category.id} className="pl-0 basis-full">
                  <div className="relative h-[75vh] overflow-hidden duotone-hover-group">
                    {bg?.media_type === "video" && bg.image_url ? <video src={bg.image_url} className="w-full h-full object-cover video-duotone" autoPlay loop muted playsInline /> : bg?.image_url ? <img src={bg.image_url} alt={category.name} className="w-full h-full object-cover image-duotone" loading="lazy" /> : <div className="w-full h-full bg-gradient-to-br from-foreground via-foreground/90 to-primary/30" />}

                    {/* Text overlay */}
                    <div className="absolute inset-0 flex items-end justify-center py-[22px]">
                      <div className="text-center z-10 p-4 sm:p-8 max-w-4xl my-[93px]">
                        <h1 className="font-heading sm:text-3xl mb-2 uppercase drop-shadow-lg mx-0 font-extrabold lg:text-7xl md:text-7xl text-primary px-[24px] py-[12px] text-5xl">
                          {bg?.title || category.name.toUpperCase()}
                        </h1>
                        {bg?.description && <p className="text-sm sm:text-base md:text-lg text-background/90 font-heading drop-shadow-md max-w-2xl mx-auto">
                            {bg.description}
                          </p>}
                      </div>
                    </div>
                  </div>
                </CarouselItem>;
          })}
          </CarouselContent>

          {/* Navigation arrows */}
          {categories.length > 1 && <>
              <CarouselPrevious className="left-2 sm:left-4 h-8 w-8 sm:h-10 sm:w-10 border-2 border-background bg-background/20 hover:bg-background/40 text-background" />
              <CarouselNext className="right-2 sm:right-4 h-8 w-8 sm:h-10 sm:w-10 border-2 border-background bg-background/20 hover:bg-background/40 text-background" />
            </>}

          {/* Scroll indicator */}
          <ScrollIndicator className="text-background/80 hover:text-primary" />
        </Carousel>
      </section>
    </div>;
};
export default HeroCarouselRental;