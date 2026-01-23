import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { useParallax } from "@/hooks/useParallax";
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
  // Parallax más lento para el texto - permanece visible más tiempo
  const textParallax = useParallax({
    speed: 0.15,
    direction: "up",
    offset: 100 // Offset inicial para que empiece más arriba
  });
  const isVideo = service.section_media_type === "video" && service.section_video_url;
  const mediaUrl = isVideo ? service.section_video_url : service.image_url;
  const hasMedia = mediaUrl && mediaUrl.trim() !== "";
  return <div className="flex-[0_0_100%] min-w-0 h-screen">
      {/* Desktop: 2 columnas - imagen izquierda, texto derecha con blur */}
      <div className="hidden lg:grid lg:grid-cols-2 h-full">
        {/* Columna izquierda: Media con parallax y duotono */}
        <div ref={mediaParallax.ref as any} className="h-full overflow-hidden relative duotone-hover-group bg-muted">
          {hasMedia ? isVideo ? <video ref={videoRef} src={mediaUrl!} className="video-duotone absolute left-0 top-0 w-full h-full object-cover bg-background border-0" style={{
          ...mediaParallax.style
        }} autoPlay loop muted playsInline /> : <img src={mediaUrl!} alt={service.title} className="image-duotone absolute left-0 top-0 w-full h-full object-cover" style={{
          ...mediaParallax.style
        }} /> : <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="font-heading text-6xl text-muted-foreground/30">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>}
        </div>

        {/* Columna derecha: Texto con fondo y parallax lento - mismo contenido que ServiceSection */}
        <div className="flex flex-col h-full p-8 lg:p-12 xl:p-16 bg-background overflow-hidden items-start justify-center">
          <div ref={textParallax.ref as any} className="max-w-xl text-foreground space-y-6" style={textParallax.style}>
            <div className="space-y-4">
              <span className="font-heading text-sm text-muted-foreground uppercase tracking-wider">
                Servicio {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase text-foreground font-sans">
                {service.title}
              </h3>
            </div>

            {service.description && <p className="text-sm sm:text-base text-muted-foreground leading-tight">{service.description}</p>}

            {service.bullets && service.bullets.length > 0 && <ul className="space-y-3">
                {service.bullets.map((bullet, i) => <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base text-foreground">{bullet}</span>
                  </li>)}
              </ul>}

            {service.cta_label && service.cta_url && <div className="pt-4">
                <Button asChild size="lg" className="font-heading uppercase">
                  <Link to={service.cta_url}>{service.cta_label}</Link>
                </Button>
              </div>}
          </div>
        </div>
      </div>
      {/* Mobile: Media de fondo con texto superpuesto */}
      <div className="lg:hidden h-screen relative">
        {/* Media de fondo */}
        <div className="absolute inset-0 duotone-hover-group">
          {hasMedia ? isVideo ? <video src={mediaUrl!} className="video-duotone w-full h-full object-cover" autoPlay loop muted playsInline /> : <img src={mediaUrl!} alt={service.title} className="image-duotone w-full h-full object-cover" /> : <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="font-heading text-6xl text-muted-foreground/30">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>}
        </div>

        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-foreground/40" />

        {/* Contenido con blur */}
        <div className="absolute inset-0 p-6 flex items-center justify-center my-[32px] px-[32px]">
          <div className="backdrop-blur-md p-6 w-full bg-background/30 text-foreground px-[24px] py-[40px]">
            <span className="text-xs font-heading uppercase tracking-wider mb-1 block text-destructive">
              Servicio {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="font-heading text-2xl uppercase leading-tight mb-2 text-foreground">{service.title}</h3>
            {service.description && <p className="text-sm mb-4 leading-relaxed line-clamp-3 text-foreground font-medium py-[8px]">
                {service.description}
              </p>}
            {service.button_text && service.button_link && <Button asChild variant="default" size="sm">
                <Link to={service.button_link}>
                  {service.button_text}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>}
          </div>
        </div>
      </div>
    </div>;
};
export const ServicesSection = () => {
  const [services, setServices] = useState<HomeService[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    skipSnaps: false
  });
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
      <div className="pt-[60px] pb-[24px] px-0 bg-background text-foreground sm:mx-0 mx-0 sm:py-[24px] py-[12px]">
        <h2 className="pt-[36px] bg-inherit text-foreground mx-[32px] normal-case font-sans font-bold text-center sm:text-3xl text-base py-[12px]">
          Equipamiento, espacios y equipo técnico para que tu producción salga adelante
        </h2>
      </div>
      {/* Tab Navigation - Label/Tag Style - Full width on mobile */}
      <div className="z-30 my-0 pb-0 px-[32px] mx-0 py-[12px] border-0 bg-transparent">
        <div className="container px-0 mx-0">
          <div className="mx-0 border-0 sm:py-0 pt-[48px] bg-transparent py-0">
            {/* Mobile: vertical stack, full width */}
            <div className="flex flex-col gap-1 sm:hidden">
              {services.map((service, index) => <button key={service.id} onClick={() => handleTabClick(index)} className={cn("w-full px-3 py-2 font-heading text-xs uppercase transition-all text-left", activeIndex === index ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-muted")}>
                  {service.title}
                </button>)}
            </div>
            {/* Desktop: horizontal row */}
            <div className="hidden gap-2 sm:flex items-center justify-start mb-[32px] mx-0">
              {services.map((service, index) => <button key={service.id} onClick={() => handleTabClick(index)} className={cn("px-3 py-1.5 font-heading text-xs transition-all rounded-none shadow-none", activeIndex === index ? "bg-primary text-primary-foreground" : "bg-background text-foreground border border-border hover:bg-muted")}>
                  {service.title}
                </button>)}
            </div>
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
        <button onClick={scrollPrev} className={cn("absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 bg-background border border-border shadow-brutal transition-all hover:bg-muted", activeIndex === 0 && "opacity-50 cursor-not-allowed")} disabled={activeIndex === 0} aria-label="Anterior">
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        {/* Dots indicator */}
      </div>
    </section>;
};
export default ServicesSection;