import { useState, useEffect, useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useHeaderVisibility } from "@/hooks/useHeaderVisibility";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface HomeService {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  hero_image_url: string | null;
  hero_media_type?: string | null;
  hero_video_url?: string | null;
  bullets: string[];
  cta_label: string | null;
  cta_url: string | null;
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

  return (
    <div 
      ref={heroRef} 
      className={cn(
        "z-30 transition-all duration-300",
        isSticky ? "sticky top-0" : "relative"
      )}
    >
      {/* Hero content with padding for header */}
      <div className={cn(
        "transition-all duration-300",
        (isHeaderVisible || isHeaderHovering) ? "pt-16 sm:pt-20" : "pt-0"
      )}>
        {/* Full-width Carousel slides */}
        <section className="relative overflow-hidden">
          <Carousel className="w-full" setApi={setApi} opts={{ loop: true }}>
            <CarouselContent className="-ml-0">
              {services.map((service) => (
                <CarouselItem key={service.id} className="pl-0 basis-full">
                  <div className="relative h-[60vh] sm:h-[70vh] w-full overflow-hidden duotone-hover-group">
                    {/* Full-width background media */}
                    {service.hero_media_type === 'video' && service.hero_video_url ? (
                      <video
                        src={service.hero_video_url}
                        className="absolute inset-0 w-full h-full object-cover video-duotone"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (service.hero_image_url || service.image_url) ? (
                      <img
                        src={service.hero_image_url || service.image_url || ""}
                        alt={service.title}
                        className="absolute inset-0 w-full h-full object-cover image-duotone"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-foreground via-foreground/90 to-primary/30" />
                    )}
                    
                    {/* Dark overlay for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent" />
                    
                    {/* Content overlay with blur background */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative z-10 text-center px-4 sm:px-8 max-w-4xl mx-auto">
                        {/* Blur background box */}
                        <div className="inline-block backdrop-blur-md bg-foreground/80 px-6 sm:px-12 py-6 sm:py-10 border border-background/20">
                          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 sm:mb-4 uppercase text-background">
                            {service.title}
                          </h1>
                          {service.description && (
                            <p className="text-sm sm:text-base md:text-lg text-background/90 font-heading mb-4 sm:mb-6 max-w-2xl mx-auto">
                              {service.description}
                            </p>
                          )}
                          {service.cta_url && service.cta_label && (
                            <Button asChild variant="hero" size="lg">
                              <Link to={service.cta_url}>
                                {service.cta_label} <ArrowRight className="ml-2" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Navigation dots - same style as hero */}
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {services.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentSlide 
                    ? "w-12 bg-primary" 
                    : "w-2 bg-background/40 hover:bg-background/60"
                )}
                aria-label={`Ir a servicio ${index + 1}`}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ServicesHeroSlider;
