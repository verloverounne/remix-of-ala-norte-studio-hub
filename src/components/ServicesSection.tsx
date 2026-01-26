import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { useParallax } from "@/hooks/useParallax";
import { useScrollParallax } from "@/hooks/useScrollParallax";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Json } from "@/integrations/supabase/types";
const parseBullets = (bullets: Json | null): string[] => {
  if (!bullets) return [];
  if (Array.isArray(bullets)) {
    return bullets.filter((b): b is string => typeof b === "string");
  }
  return [];
};
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
const ServiceSlide = ({
  service,
  index
}: ServiceSlideProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaParallax = useParallax({
    speed: 0.6,
    direction: "up"
  });

  // Hook para scroll-driven parallax en mobile
  const {
    containerRef,
    contentStyle
  } = useScrollParallax();
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
  return <div className="flex-[0_0_100%] min-w-0 h-screen">
      {/* Desktop: 2 columnas - imagen izquierda, texto derecha con blur */}
      <div className="hidden lg:grid lg:grid-cols-2 h-full">
        {/* Columna izquierda: Media con parallax y duotono */}
        <div ref={mediaParallax.ref as any} className="h-full  relative duotone-hover-group bg-muted">
          {hasMedia ? isVideo ? <video ref={videoRef} src={mediaUrl!} className="video-duotone sticky top-0 absolute left-0 top-0 w-full h-full object-cover border-0 bg-[#2e2c29]" style={{
          ...mediaParallax.style
        }} autoPlay loop muted playsInline /> : <img src={mediaUrl!} alt={service.title} className="image-duotone absolute left-0 top-0 w-full h-full object-cover" style={{
          ...mediaParallax.style
        }} /> : <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="font-heading text-6xl text-muted-foreground/30">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>}
        </div>

        {/* Columna derecha: Texto con fondo - sin parallax para mantener visibilidad */}
        <div className="flex-col h-full p-8 lg:p-12 xl:p-16 overflow-y-auto bg-background flex items-center justify-center">
          <div className="max-w-xl text-foreground space-y-4">
            <div className="space-y-3">
              <span className="font-heading text-sm text-muted-foreground uppercase tracking-wider">
                Servicio {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase text-foreground font-sans">
                {service.title}
              </h3>
            </div>

            {service.description && <p className="text-sm sm:text-base leading-tight text-foreground">{service.description}</p>}

            {service.bullets && service.bullets.length > 0 && <ul className="space-y-2">
                {service.bullets.map((bullet, i) => <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base text-foreground">{bullet}</span>
                  </li>)}
              </ul>}

            {(service.cta_label || service.button_text) && (service.cta_url || service.button_link) && <div className="pt-16 pb-64 mx-32 ">
                <Button asChild size="lg" className="font-heading uppercase">
                  <Link to={service.cta_url || service.button_link!}>{service.cta_label || service.button_text}</Link>
                </Button>
              </div>}
          </div>
        </div>
      </div>
      {/* Mobile: Media de fondo sticky con contenido que sube por parallax basado en scroll */}
      <div ref={containerRef} className="lg:hidden h-[200vh] relative">
        {/* Media de fondo - sticky para mantenerse visible (z-0) */}
        <div className=" h-screen z-0 duotone-hover-group" onClick={handleMobileTap}>
          {hasMedia ? isVideo ? <video ref={videoRef} src={mediaUrl!} className="sticky absolute top-4 video-duotone h-full object-cover " autoPlay loop muted playsInline /> : <img src={mediaUrl!} alt={service.title} className="image-duotone w-full h-9/1 object-cover" /> : <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="font-heading text-6xl text-muted-foreground/30">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>}

          {/* Overlay oscuro */}
          <div className="absolute inset-0 bg-foreground/40 pointer-events-none" />
        </div>

        {/* Contenido con parallax basado en scroll - z-10 para estar encima del video */}
        <div className="sticky bottom-1 z-10 pointer-events-none" style={{
        marginTop: "-180vh",
        ...contentStyle
      }}>
          <div className="h-screen pb-8 px-4 flex items-end justify-center">
            <div className="backdrop-blur-lg bg-[#423c38]/50 p-6 w-full bg-background/60 text-foreground max-h-[80vh] overflow-y-auto mx-4 mb-16 lg-32 xl-64 pointer-events-auto">
              <span className="text-xs font-heading uppercase tracking-wider mb-2 block text-primary">
                Servicio {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-heading uppercase leading-tight mb-3 text-foreground text-2xl">{service.title}</h3>
              {service.description && <p className="mb-4 leading-relaxed text-foreground font-sm text-xs mb-sm lg-medium">
                  {service.description}
                </p>}

              {/* Bullets list - fully visible */}
              {service.bullets && service.bullets.length > 0 && <ul className="space-y-2 mb-4">
                  {service.bullets.map((bullet, i) => <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span className="text-foreground font-sm text-xs mb-sm lg-medium">{bullet}</span>
                    </li>)}
                </ul>}

              {(service.button_text || service.cta_label) && (service.button_link || service.cta_url) && <Button asChild variant="default" size="sm">
                  <Link to={service.button_link || service.cta_url!}>
                    {service.button_text || service.cta_label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>}
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export const ServicesSection = () => {
  const [services, setServices] = useState<HomeService[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Main content carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    skipSnaps: false
  });

  // Note: Mobile tabs carousel removed - now using dropdown
  useEffect(() => {
    const fetchServices = async () => {
      const {
        data,
        error
      } = await supabase.from("home_services").select("id, title, description, image_url, section_media_type, section_video_url, button_text, button_link, bullets, cta_label, cta_url, order_index, is_active").eq("is_active", true).order("order_index");
      if (!error && data) {
        setServices(data.map(s => ({
          ...s,
          order_index: s.order_index ?? 0,
          section_media_type: s.section_media_type ?? null,
          section_video_url: s.section_video_url ?? null,
          bullets: parseBullets(s.bullets),
          cta_label: s.cta_label ?? null,
          cta_url: s.cta_url ?? null
        })));
      }
      setLoading(false);
    };
    fetchServices();
  }, []);
  const scrollTo = useCallback((index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
  }, [emblaApi]);
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
  if (loading) {
    return <section className="min-h-[500px] lg:min-h-[700px] bg-background flex items-center justify-center">
        <div className="animate-pulse font-heading text-xl">Cargando servicios...</div>
      </section>;
  }
  if (services.length === 0) {
    return null;
  }
  return <section className="relative bg-background">
      <div className="pb-[24px] px-0 text-foreground sm:py-[24px] py-0 pt-[32px] bg-[#201e1d] border-0">
        <h2 className="pt-[36px] font-sans text-center text-sm mb:text-2x1 lg:text-3xl xl:text-6x1 font-thin text-background bg-transparent mx-[3px] px-[16px]">
          Equipamiento, espacios y equipo técnico para que tu producción salga adelante
        </h2>
      </div>
      {/* Tab Navigation - Dropdown on mobile, horizontal tabs on desktop */}
      <div className="container z-30 my-0 bg-[#201e1d]">
        <div className="mx-0 border-0 sm:py-0 bg-transparent py-0 pt-0">
          {/* Mobile: Dropdown select tied to active slide */}
          <div className="sm:hidden py-3 w-screen">
            <Select value={String(activeIndex)} onValueChange={value => handleTabClick(Number(value))}>
              <SelectTrigger className="w-full bg-background border-border font-heading text-sm uppercase">
                <SelectValue>
                  {services[activeIndex]?.title || "Seleccionar servicio"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                {services.map((service, index) => <SelectItem key={service.id} value={String(index)} className="font-heading text-sm uppercase cursor-pointer">
                    {service.title}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          {/* Desktop: horizontal row */}
          <div className="hidden sm:flex items-center justify-between gap-0">
            {services.map((service, index) => <button key={service.id} onClick={() => handleTabClick(index)} className={cn("flex-1 font-heading text-xs transition-all rounded-none shadow-none px-0 py-[16px]", activeIndex === index ? "bg-primary text-primary-foreground" : "bg-background text-foreground border border-border hover:bg-muted")}>
                {service.title}
              </button>)}
          </div>
        </div>
      </div>
      {/* Carousel Container */}
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex bg-foreground">
            {services.map((service, index) => <ServiceSlide key={service.id} service={service} index={index} />)}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button onClick={scrollPrev} className={cn("absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 border shadow-brutal transition-all py-[4px] px-[4px] text-foreground bg-primary border-foreground my-px mx-[16px]", activeIndex === 0 && "opacity-50 cursor-not-allowed")} disabled={activeIndex === 0} aria-label="Anterior">
          <ChevronLeft className="h-[16px] w-[16px]" />
        </button>
        <button onClick={scrollNext} className={cn("absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 border shadow-brutal transition-all px-[4px] py-[4px] text-background bg-primary border-foreground mx-[16px]", activeIndex === services.length - 1 && "opacity-50 cursor-not-allowed")} disabled={activeIndex === services.length - 1} aria-label="Siguiente">
          <ChevronRight className="w-[16px] h-[16px] text-foreground mx-px" />
        </button>
        {/* Dots indicator */}
      </div>
    </section>;
};
export default ServicesSection;