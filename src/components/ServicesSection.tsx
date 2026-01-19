import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { useParallax } from "@/hooks/useParallax";
interface HomeService {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  section_media_type: string | null;
  section_video_url: string | null;
  button_text: string | null;
  button_link: string | null;
  order_index: number;
  is_active: boolean;
}

// Componente para cada slide de servicio con layout hero-like
interface ServiceSlideProps {
  service: HomeService;
  index: number;
}
const ServiceSlide = ({ service, index }: ServiceSlideProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaParallax = useParallax({
    speed: 0.6,
    direction: "up",
  });
  const isVideo = service.section_media_type === "video" && service.section_video_url;
  const mediaUrl = isVideo ? service.section_video_url : service.image_url;
  const hasMedia = mediaUrl && mediaUrl.trim() !== "";
  return (
    <div className="flex-[0_0_100%] min-w-0">
      {/* Desktop: 2 columnas - imagen izquierda, texto derecha con blur */}
      <div className="hidden lg:grid lg:grid-cols-2">
        {/* Columna izquierda: Media con parallax y duotono */}
        <div
          ref={mediaParallax.ref as any}
          className="min-h-[900px] max-h-[1200px] overflow-hidden relative duotone-hover-group bg-muted"
        >
          {hasMedia ? (
            isVideo ? (
              <video
                ref={videoRef}
                src={mediaUrl!}
                className="video-duotone absolute left-0 top-0 w-full h-full object-cover"
                style={{
                  ...mediaParallax.style,
                }}
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={mediaUrl!}
                alt={service.title}
                className="image-duotone absolute left-0 top-0 w-full h-full object-cover"
                style={{
                  ...mediaParallax.style,
                }}
              />
            )
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="font-heading text-6xl text-muted-foreground/30">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>

        {/* Columna derecha: Texto con fondo */}
        <div className="flex flex-col justify-end h-full p-8 lg:p-12 xl:p-16 bg-background">
          <div className="max-w-xl text-foreground">
            <span className="text-xs font-heading uppercase tracking-wider mb-2 block text-foreground">
              Servicio {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="font-heading text-3xl uppercase leading-tight mb-4 text-foreground xl:text-6xl">
              {service.title}
            </h3>
            {service.description && (
              <p className="text-sm mb-6 leading-relaxed text-foreground">{service.description}</p>
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
        </div>
      </div>

      {/* Mobile: Media de fondo con texto superpuesto */}
      <div className="lg:hidden h-[70vh] relative">
        {/* Media de fondo */}
        <div className="absolute inset-0 duotone-hover-group">
          {hasMedia ? (
            isVideo ? (
              <video
                src={mediaUrl!}
                className="video-duotone w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img src={mediaUrl!} alt={service.title} className="image-duotone w-full h-full object-cover" />
            )
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="font-heading text-6xl text-muted-foreground/30">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>

        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-foreground/40" />

        {/* Contenido con blur */}
        <div className="absolute inset-0 flex items-end p-6">
          <div className="backdrop-blur-md bg-foreground/70 p-6 w-full">
            <span className="text-xs font-heading text-background/60 uppercase tracking-wider mb-1 block">
              Servicio {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="font-heading text-2xl text-background uppercase leading-tight mb-2">{service.title}</h3>
            {service.description && (
              <p className="text-sm text-background/80 mb-4 leading-relaxed line-clamp-3">{service.description}</p>
            )}
            {service.button_text && service.button_link && (
              <Button asChild variant="default" size="sm">
                <Link to={service.button_link}>
                  {service.button_text}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
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
        .select(
          "id, title, description, image_url, section_media_type, section_video_url, button_text, button_link, order_index, is_active",
        )
        .eq("is_active", true)
        .order("order_index");
      if (!error && data) {
        setServices(
          data.map((s) => ({
            ...s,
            order_index: s.order_index ?? 0,
            section_media_type: s.section_media_type ?? null,
            section_video_url: s.section_video_url ?? null,
          })),
        );
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
      <section className="min-h-[500px] lg:min-h-[700px] bg-background flex items-center justify-center">
        <div className="animate-pulse font-heading text-xl">Cargando servicios...</div>
      </section>
    );
  }
  if (services.length === 0) {
    return null;
  }
  return (
    <section className="relative bg-background">
      {/* Section Header 
       <div className="py-6 sm:py-8 mx-4 sm:mx-8">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-brutal uppercase">NUESTROS SERVICIOS</h2>
       </div>
       {/* Tab Navigation - Label/Tag Style - Full width on mobile */}
      <div className="sticky top-0 z-30 bg-foreground">
        <div className="container mx-auto px-4 bg-foreground">
          <div className="py-2 sm:py-3">
            {/* Mobile: vertical stack, full width */}
            <div className="flex flex-col gap-1 sm:hidden">
              {services.map((service, index) => (
                <button
                  key={service.id}
                  onClick={() => handleTabClick(index)}
                  className={cn(
                    "w-full px-3 py-2 font-heading text-xs uppercase transition-all text-left",
                    activeIndex === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-foreground text-background hover:bg-primary-dark",
                  )}
                >
                  {service.title}
                </button>
              ))}
            </div>
            {/* Desktop: horizontal row, centered */}
            <div className="hidden sm:flex items-center justify-center gap-2">
              {services.map((service, index) => (
                <button
                  key={service.id}
                  onClick={() => handleTabClick(index)}
                  className={cn(
                    "px-3 py-1.5 font-heading text-xs uppercase transition-all",
                    activeIndex === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-foreground text-background hover:bg-primary-dark",
                  )}
                >
                  {service.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex bg-foreground">
            {services.map((service, index) => (
              <ServiceSlide key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>

        {/* Navigation Arrows 
         <button
          onClick={scrollPrev}
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-background border border-border shadow-brutal transition-all hover:bg-muted",
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
            "absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-background border border-border shadow-brutal transition-all hover:bg-muted",
            activeIndex === services.length - 1 && "opacity-50 cursor-not-allowed",
          )}
          disabled={activeIndex === services.length - 1}
          aria-label="Siguiente"
         >
          <ChevronRight className="h-6 w-6" />
         </button>
         {/* Dots indicator */}
        <div className="flex justify-center gap-2 py-6 bg-background">
          {services.map((_, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(index)}
              className={cn(
                "w-3 h-3 border border-border transition-all rounded-full",
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
