import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LazyImage } from "@/components/LazyImage";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import { useParallax } from "@/hooks/useParallax";

interface HomeService {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  button_text: string | null;
  button_link: string | null;
  order_index: number;
  is_active: boolean;
}

// Componente para cada slide de servicio con parallax
interface ServiceSlideProps {
  service: HomeService;
  index: number;
}

const ServiceSlide = ({ service, index }: ServiceSlideProps) => {
  // Parallax para la imagen (se mueve más lento)
  const imageParallax = useParallax({ speed: 0.8, direction: "up" });
  // Parallax para el texto (se mueve más rápido)
  const textParallax = useParallax({ speed: 0.5, direction: "down" });

  return (
    <div className="flex-[0_0_100%] min-w-0">
      <div className="container mx-auto px-8 py-8 lg:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[400px] lg:min-h-[500px]">
          {/* Text Column */}
          <div
            ref={textParallax.ref as any}
            style={textParallax.style}
            className={cn("order-2 lg:order-1", index % 2 === 1 && "lg:order-2")}
          >
            <div className="border-l border-primary pl-4 sm:pl-8 mb-6 sm:mb-8">
              <span className="text-xs sm:text-sm font-heading text-muted-foreground uppercase tracking-wider">
                Servicio {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mt-2 uppercase leading-tight">
                {service.title}
              </h3>
            </div>

            {service.description && (
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed max-w-xl">
                {service.description}
              </p>
            )}

            {service.button_text && service.button_link && (
              <Button asChild variant="default" size="lg">
                <Link to={service.button_link}>
                  {service.button_text}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>

          {/* Image Column */}
          <div className={cn("order-1 lg:order-2", index % 2 === 1 && "lg:order-1")}>
            <div
              ref={imageParallax.ref as any}
              style={imageParallax.style}
              className="relative aspect-[4/3] lg:aspect-[3/2] overflow-hidden border border-border shadow-brutal duotone-hover-group"
            >
              {service.image_url ? (
                <LazyImage
                  src={service.image_url}
                  alt={service.title}
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="font-heading text-4xl text-muted-foreground/30">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ServicesSection = () => {
  const [services, setServices] = useState<HomeService[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    skipSnaps: false,
  });

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from("home_services")
        .select("*")
        .eq("is_active", true)
        .order("order_index");

      if (!error && data) {
        setServices(data);
      }
      setLoading(false);
    };

    fetchServices();
  }, []);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) {
        emblaApi.scrollTo(index);
      }
    },
    [emblaApi],
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleTabClick = (index: number) => {
    setActiveIndex(index);
    scrollTo(index);
  };

  if (loading) {
    return (
      <section className="min-h-[500px] lg:min-h-[700px] bg-background flex items-center justify-center border-y border-border">
        <div className="animate-pulse font-heading text-xl">Cargando servicios...</div>
      </section>
    );
  }

  if (services.length === 0) {
    return null;
  }

  return (
    <section className="relative border-y border-border bg-background">
      {/* Section Header */}
      <div className="container mx-auto px-4 pt-12 pb-6 lg:pt-16 lg:pb-8">
        <div className="max-w-3xl">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl uppercase mb-4">
            Alquiler de equipamiento audiovisual profesional
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg lg:text-xl leading-relaxed">
            Ya seas estudiante, realizador independiente, productor o creativo audiovisual, tenés a disposición cámaras,
            luces, sonido y accesorios pensados para rodajes chicos, medianos y grandes.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-30 bg-background border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide py-0 gap-0">
            {services.map((service, index) => (
              <button
                key={service.id}
                onClick={() => handleTabClick(index)}
                className={cn(
                  "flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 font-heading text-xs sm:text-sm uppercase tracking-wider transition-all border-b -mb-[1px] whitespace-nowrap",
                  activeIndex === index
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                {service.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {services.map((service, index) => (
              <ServiceSlide key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={scrollPrev}
          className={cn(
            "absolute left-1 top-1/2 -translate-y-1/2 z-20 p-3 bg-background border border-border shadow-brutal transition-all hover:bg-muted",
            activeIndex === 0 && "opacity-50 cursor-not-allowed",
          )}
          disabled={activeIndex === 0}
          aria-label="Anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={scrollNext}
          className={cn(
            "absolute right-1 top-1/2 -translate-y-1/2 z-20 p-3 bg-background border border-border shadow-brutal transition-all hover:bg-muted",
            activeIndex === services.length - 1 && "opacity-50 cursor-not-allowed",
          )}
          disabled={activeIndex === services.length - 1}
          aria-label="Siguiente"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 py-6">
          {services.map((_, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(index)}
              className={cn(
                "w-3 h-3 border border-border transition-all",
                activeIndex === index ? "bg-primary" : "bg-transparent hover:bg-muted",
              )}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
