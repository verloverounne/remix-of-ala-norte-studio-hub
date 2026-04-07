import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { useParallax } from "@/hooks/useParallax";
import { useScrollParallax } from "@/hooks/useScrollParallax";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATIC_HOME_SERVICES } from "@/data/servicesData";
interface HomeService {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  section_media_type: string | null;
  section_video_url: string | null;
  button_text: string | null;
  button_link: string | null;
  bullets: string[];
  cta_label: string | null;
  cta_url: string | null;
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

  // Hook para scroll-driven parallax en mobile
  const { containerRef, contentStyle } = useScrollParallax();
  const isVideo = service.section_media_type === "video" && service.section_video_url;
  const mediaUrl = isVideo ? service.section_video_url : service.image_url;
  const hasMedia = mediaUrl && mediaUrl.trim() !== "";

  // Handle mobile tap to toggle video play/pause and duotone
  const handleMobileTap = (e: React.MouseEvent) => {
    const target = e.target as Element;
    // Don't toggle if tapping on buttons/links
    if (target.closest("a, button")) return;
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }

    // Toggle duotone class for images
    if (!isVideo && containerRef.current) {
      const img = containerRef.current.querySelector(".image-duotone");
      if (img) {
        img.classList.toggle("duotone-tap-active");
      }
    }
  };
  return (
    <div className="flex-[0_0_100%] min-w-0 h-screen">
      {/* Desktop: 2 columnas - imagen izquierda, texto derecha con blur */}
      <div className="hidden lg:grid lg:grid-cols-2 h-full">
        {/* Columna izquierda: Media con parallax y duotono */}
        <div ref={mediaParallax.ref as any} className="h-full  relative duotone-hover-group bg-muted">
          {hasMedia ? (
            isVideo ? (
              <video
                ref={videoRef}
                src={mediaUrl!}
                className="video-duotone absolute inset-0 w-full h-full object-cover border-0 bg-[#2e2c29]"
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
                className="image-duotone absolute inset-0 w-full h-full object-cover"
                style={{
                  ...mediaParallax.style,
                }}
              />
            )
          ) : (
            <div className="w-full h-full bg-muted flex">
              <span className="font-heading text-6xl text-muted-foreground/30">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>

        {/* Columna derecha: Texto con fondo - sin parallax para mantener visibilidad */}
        <div className="flex-col h-full p-8 lg:p-12 xl:p-16 overflow-y-auto flex items-center justify-center bg-secondary">
          <div className="max-w full mx-4 mb:mx-16 lg:mx-24 text-foreground space-y-4">
            <div className="space-y-3">
              <span className="font-heading text-sm text-muted-foreground uppercase tracking-wider">
                Servicio {String(index + 1).padStart(2, "0")}
              </span>
              <h3
                className="uppercase text-foreground font-sans font-thin"
                style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
              >
                {service.title}
              </h3>
            </div>

            {service.description && (
              <p className="text-sm sm:text-base leading-tight text-foreground">{service.description}</p>
            )}

            {service.bullets && service.bullets.length > 0 && (
              <ul className="space-y-2">
                {service.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base text-foreground">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {(service.cta_label || service.button_text) && (service.cta_url || service.button_link) && (
              <div className="pt-16 pb-64 w-full mx-px items-">
                <Button asChild size="lg" className="font-heading uppercase">
                  <Link to={service.cta_url || service.button_link!}>{service.cta_label || service.button_text}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile/Tablet: Fondo sólido sin video */}
      <div className="lg:hidden bg-foreground">
        <div className="min-h-screen px-4 flex items-start justify-center text-foreground bg-background py-0">
          <div className="max-w-2xl mx-0 px-0 py-0">
            <span className="text-xs font-heading uppercase tracking-wider mb-2 block text-background">
              Servicio {String(index + 1).padStart(2, "0")}
            </span>

            {service.description && <p className="mb-4 leading-relaxed text-inherit text-xl">{service.description}</p>}
            <h3
              className="uppercase leading-tight mb-3 font-sans font-thin text-inherit"
              style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)" }}
            >
              {service.title}
            </h3>
            {service.bullets && service.bullets.length > 0 && (
              <ul className="space-y-2 mb-4">
                {service.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-xs text-background">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {(service.button_text || service.cta_label) && (service.button_link || service.cta_url) && (
              <div className="flex flex-wrap justify-start gap-2 sm:gap-4">
                <Button asChild variant="default" size="lg" className="flex-1 sm:flex-none">
                  <Link to={service.button_link || service.cta_url!}>{service.button_text || service.cta_label}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export const ServicesSection = () => {
  const services: HomeService[] = STATIC_HOME_SERVICES;
  const [activeIndex, setActiveIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Main content carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    skipSnaps: false,
  });
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

  // Sync main carousel events
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
  if (services.length === 0) {
    return null;
  }
  return (
    <section className="relative bg-background">
      <div className="pb-[24px] px-8 lg:px-16 text-foreground sm:py-[24px] py-0 pt-[32px] border-0 bg-background">
        <h2
          className="font-sans text-center my-[12px] text-3xl text-foreground font-medium"
          style={{ fontSize: "clamp(1rem, 3vw, 2rem)" }}
        >
          Equipamiento, espacios y equipo técnico para que tu producción salga adelante
        </h2>

        {/* Tab Navigation - Dropdown on mobile, horizontal tabs on desktop */}
        <div className="w-full">
          {/* Mobile: Dropdown select tied to active slide */}
          <div className="sm:hidden py-3 w-full border-primary">
            <Select
              value={String(activeIndex)}
              onValueChange={(value) => handleTabClick(Number(value))}
              open={dropdownOpen}
              onOpenChange={setDropdownOpen}
            >
              <SelectTrigger className="w-full bg-background text-primary font-heading text-sm uppercase border-0 border-b-2 border-b-primary rounded-none hover:bg-primary hover:text-background transition-colors">
                <SelectValue>{services[activeIndex]?.title || "Seleccionar servicio"}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background z-50 border-0 text-center">
                {services.map((service, index) => (
                  <SelectItem
                    key={service.id}
                    value={String(index)}
                    className="font-heading text-sm uppercase cursor-pointer text-primary hover:bg-primary hover:text-background focus:bg-primary focus:text-background"
                  >
                    {service.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Desktop: horizontal row - link style */}
          <div className={cn("hidden sm:flex items-center justify-center gap-6", dropdownOpen && "hidden")}>
            {services.map((service, index) => (
              <button
                key={service.id}
                onClick={() => handleTabClick(index)}
                className={cn(
                  "font-heading text-xs uppercase tracking-wider transition-all py-2 border-b-2 bg-transparent",

                  activeIndex === index
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:border-foreground/30",
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

        {/* ISO Badge */}
        <div className="absolute bottom-0 right-0 z-30 translate-x-[50%] translate-y-[50%] -rotate-45 pointer-events-none">
          <img
            src="https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/publicimages/uiu/solo iso@4x.png"
            alt="ISO Certification"
            className="w-[200px] md:w-[300px] opacity-80"
          />
        </div>
      </div>
    </section>
  );
};
export default ServicesSection;
