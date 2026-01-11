import { useState, useEffect, useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { ScrollIndicator } from "@/components/ui/ScrollIndicator";
import { useHeaderVisibility } from "@/hooks/useHeaderVisibility";

interface HomeService {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  hero_image_url: string | null;
  hero_media_type?: string | null;
  hero_video_url?: string | null;
  slug: string | null;
  order_index: number;
  is_active: boolean;
}

interface ServicesHeroSliderProps {
  services: HomeService[];
  activeServiceId: string | null;
  onServiceChange: (serviceId: string | null) => void;
  lastSectionRef?: React.RefObject<HTMLElement>;
}

export const ServicesHeroSlider = ({ 
  services,
  activeServiceId,
  onServiceChange,
  lastSectionRef
}: ServicesHeroSliderProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSticky, setIsSticky] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const { isVisible: isHeaderVisible, isHovering: isHeaderHovering } = useHeaderVisibility();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Calculate when to unstick based on last section position
  useEffect(() => {
    if (!lastSectionRef?.current || !heroRef.current) return;

    const handleScroll = () => {
      const lastSection = lastSectionRef.current;
      const hero = heroRef.current;
      
      if (!lastSection || !hero) return;

      const lastSectionRect = lastSection.getBoundingClientRect();
      const heroHeight = hero.offsetHeight;
      
      // When the bottom of the last section reaches the bottom of the hero, unstick
      const shouldBeSticky = lastSectionRect.bottom > heroHeight;
      
      setIsSticky(shouldBeSticky);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastSectionRef]);

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      const index = api.selectedScrollSnap();
      setCurrentSlide(index);
      
      if (services[index]) {
        onServiceChange(services[index].id);
      }
    };

    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
    };
  }, [api, services, onServiceChange]);

  // Sync carousel with external service changes
  useEffect(() => {
    if (!api || !activeServiceId) return;
    
    try {
      if (!api.scrollSnapList || api.scrollSnapList().length === 0) {
        return;
      }
      
      const slideIndex = services.findIndex(s => s.id === activeServiceId);
      if (slideIndex !== -1 && slideIndex !== currentSlide) {
        api.scrollTo(slideIndex);
      }
    } catch (error) {
      console.debug('Carousel API not ready yet');
    }
  }, [activeServiceId, api, services, currentSlide]);

  const handleChipClick = (serviceId: string, index: number) => {
    onServiceChange(serviceId);
    api?.scrollTo(index);
  };

  return (
    <div 
      ref={heroRef} 
      className={cn(
        "z-30 transition-all duration-300",
        isSticky ? "sticky top-0" : "relative"
      )}
    >
      {/* Fixed Navigation Bar - synced with header visibility */}
      <div 
        className={cn(
          "absolute left-0 right-0 z-40 bg-background border-b border-foreground transition-all duration-300",
          (isHeaderVisible || isHeaderHovering) ? "top-16 sm:top-20" : "top-0"
        )}
      >
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-center gap-1 sm:gap-2 py-1.5 sm:py-2 h-[40px] sm:h-[52px]">
            <div className="flex items-center overflow-x-auto scrollbar-hide gap-1 sm:gap-2">
              {services.map((service, index) => {
                const isActive = index === currentSlide;
                
                return (
                  <button
                    key={service.id}
                    onClick={() => handleChipClick(service.id, index)}
                    className={cn(
                      "flex-shrink-0 px-2 py-1 sm:px-3 sm:py-1.5 font-heading text-[10px] sm:text-xs uppercase border transition-all whitespace-nowrap",
                      isActive 
                        ? "bg-primary text-primary-foreground border-primary shadow-brutal-sm" 
                        : "bg-background text-foreground border-foreground hover:bg-muted"
                    )}
                  >
                    {service.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Hero content with padding for nav bar */}
      <div className={cn(
        "transition-all duration-300",
        (isHeaderVisible || isHeaderHovering) ? "pt-[96px] sm:pt-[132px]" : "pt-[40px] sm:pt-[52px]"
      )}>
        {/* Carousel slides */}
        <section className="relative overflow-hidden">
          <Carousel className="w-full" setApi={setApi}>
            <CarouselContent className="-ml-0">
              {services.map((service) => (
                 <CarouselItem key={service.id} className="pl-0 basis-full">
                   <div className="relative h-[40vh] sm:h-[45vh] overflow-hidden duotone-hover-group">
                     {service.hero_media_type === 'video' && service.hero_video_url ? (
                      <video
                        src={service.hero_video_url}
                        className="w-full h-full object-cover video-duotone"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (service.hero_image_url || service.image_url) ? (
                      <img
                        src={service.hero_image_url || service.image_url || ""}
                        alt={service.title}
                        className="w-full h-full object-cover image-duotone"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-foreground via-foreground/90 to-primary/30" />
                    )}
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
                    
                    {/* Text overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center z-10 p-4 sm:p-8 max-w-4xl">
                        <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 uppercase text-background drop-shadow-lg">
                          {service.title}
                        </h1>
                        {service.description && (
                          <p className="text-sm sm:text-base md:text-lg text-background/90 font-heading drop-shadow-md max-w-2xl mx-auto">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <ScrollIndicator className="text-background/80 hover:text-background" />
          </Carousel>
        </section>
      </div>
    </div>
  );
};

export default ServicesHeroSlider;
