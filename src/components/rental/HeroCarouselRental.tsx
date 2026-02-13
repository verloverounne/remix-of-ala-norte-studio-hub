import { useState, useEffect, useRef } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselApi, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { ScrollIndicator } from "@/components/ui/ScrollIndicator";
interface HeroSlide {
  id: string;
  image_url: string;
  media_type?: string | null;
  title: string | null;
  description: string | null;
  order_index: number;
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

// Static hero backgrounds - hardcoded from admin panel snapshot
const STATIC_HERO_BACKGROUNDS: Record<string, HeroSlide> = {
  // Cámara
  "4d52bbca-3bcb-4c73-ac1b-5b6d437e9163": {
    id: "static-camara",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//1768951104500_camara_fondo_blanco_gonzalo.mp4",
    media_type: "video",
    title: null,
    description: null,
    order_index: 1
  },
  // Iluminación
  "f0edceff-b3b4-4735-ab37-b9e3f4bb905a": {
    id: "static-iluminacion",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1768951451525_luces.mp4",
    media_type: "video",
    title: null,
    description: null,
    order_index: 2
  },
  // Audio
  "bdaa1e73-8532-4b85-8495-6ef8bba5be31": {
    id: "static-audio",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1768951063587_sonido.mp4",
    media_type: "video",
    title: null,
    description: null,
    order_index: 3
  },
  // Grip
  "d9e6fca2-0d23-41c8-b782-8216d97e86a5": {
    id: "static-grip",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1768951477713_grips.mp4",
    media_type: "video",
    title: null,
    description: null,
    order_index: 4
  }
  // Energía: no video configured, will use gradient fallback
};
export const HeroCarouselRental = ({
  categories,
  activeCategory,
  onCategoryChange
}: HeroCarouselRentalProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant"
    });
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
      const slideIndex = categories.findIndex((c) => c.id === activeCategory);
      if (slideIndex !== -1 && slideIndex !== currentSlide) {
        api.scrollTo(slideIndex);
      }
    } catch (error) {
      console.debug("Carousel API not ready yet");
    }
  }, [activeCategory, api, categories, currentSlide]);
  const getBackgroundForCategory = (categoryId: string): HeroSlide | null => {
    return STATIC_HERO_BACKGROUNDS[categoryId] || null;
  };
  if (categories.length === 0) {
    return <div className="h-[75vh] bg-muted animate-pulse flex items-center justify-center">
        <span className="text-muted-foreground font-heading">CARGANDO...</span>
      </div>;
  }
  return <div ref={heroRef} className="relative">
      {/* Carousel slides - one per category, using static backgrounds */}
      <section className="relative overflow-hidden">
        <Carousel className="w-full" setApi={setApi}>
          <CarouselContent className="-ml-0">
            {categories.map((category) => {
            const bg = getBackgroundForCategory(category.id);
            return <CarouselItem key={category.id} className="pl-0 basis-full">
                  <div className="relative h-[40vh] overflow-hidden duotone-hover-group">
                    {bg?.media_type === "video" && bg.image_url ? <video src={bg.image_url} className="w-full h-full object-cover video-duotone" autoPlay loop muted playsInline /> : bg?.image_url ? <img src={bg.image_url} alt={category.name} className="w-full h-full object-cover image-duotone" loading="lazy" /> : <div className="w-full h-full" />}

                    {/* Text overlay */}
                    <div className="absolute inset-0 py-[22px] flex items-center justify-center">
                      <div className="text-center z-10 p-4 sm:p-8 max-w-4xl my-[93px]">
                        <h1 className="font-heading sm:text-3xl mb-2 uppercase drop-shadow-lg mx-0 font-extrabold lg:text-6xl md:text-7xl text-primary text-3xl px-[24px] py-[2px]">
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