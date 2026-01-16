import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
import { useParallax } from "@/hooks/useParallax";

interface HeroSlide {
  id: string;
  media_url: string;
  media_type: "image" | "video";
  vertical_video_url?: string | null;
  title: string;
  subtitle: string;
  cta_label?: string | null;
  cta_link?: string | null;
  order_index: number;
}

// Default slides if DB is empty (fallback)
const defaultSlides: Omit<HeroSlide, "id" | "order_index">[] = [
  {
    media_url: "",
    media_type: "video",
    title: "MAS QUE UN RENTAL",
    subtitle: "Trabajamos codo a codo con vos en cada proyecto.",
    cta_label: "Explorá el catálogo",
    cta_link: "/equipos",
  },
  {
    media_url: "",
    media_type: "image",
    title: "GALERÍA DE FILMACIÓN",
    subtitle: "más que un set: comodidad, flexibilidad y apoyo profesional en 150 m²",
    cta_label: "Conocé los detalles",
    cta_link: "/galeria",
  },
  {
    media_url: "",
    media_type: "image",
    title: "ESTUDIO DE SONIDO / POSTPRODUCCIÓN",
    subtitle: "Isla de edición y sala de grabación insonorizada",
    cta_label: "conocé el estudio",
    cta_link: "/sala-grabacion",
  },
];

// Individual slide component with parallax
interface HeroSlideProps {
  slide: HeroSlide;
  index: number;
  videoRef: (el: HTMLVideoElement | null) => void;
  muted: boolean;
}

const HeroSlideComponent = ({ slide, index, videoRef, muted }: HeroSlideProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [videoOrientation, setVideoOrientation] = useState<"horizontal" | "vertical" | null>(null);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsMobileOrTablet(window.innerWidth < 1024);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const videoParallax = useParallax({ speed: 0.6, direction: "up" });
  const contentParallax = useParallax({ speed: 0.4, direction: "down" });

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setVideoOrientation(video.videoWidth > video.videoHeight ? "horizontal" : "vertical");
  };

  // Use vertical video on mobile/tablet if available
  const mediaUrl = slide.media_type === "video" && isMobileOrTablet && slide.vertical_video_url 
    ? slide.vertical_video_url 
    : slide.media_url;

  const getMobileVideoStyles = (): React.CSSProperties => {
    if (!isMobile || !videoOrientation) return videoParallax.style;
    
    const baseStyles: React.CSSProperties = {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      objectFit: "cover",
    };

    return videoOrientation === "horizontal"
      ? { ...baseStyles, height: "100vh", width: "auto", minWidth: "100%" }
      : { ...baseStyles, width: "100vw", height: "auto", minHeight: "100%" };
  };

  const getVideoClasses = () => {
    const baseClasses = "video-duotone";
    if (isMobile && videoOrientation) return `${baseClasses} ${videoOrientation}`;
    return `${baseClasses} absolute inset-0 w-full h-full object-cover`;
  };

  const hasMedia = mediaUrl && mediaUrl.trim() !== "";

  return (
    <CarouselItem className="h-full pl-0">
      <div
        className="relative duotone-hover-group"
        style={{
          width: isMobile ? "100vw" : "100%",
          height: isMobile ? "100vh" : "100%",
          overflow: "hidden",
        }}
      >
        {hasMedia ? (
          slide.media_type === "video" ? (
            <video
              ref={videoRef}
              src={mediaUrl}
              className={getVideoClasses()}
              style={getMobileVideoStyles()}
              autoPlay
              loop
              muted={muted}
              playsInline
              onLoadedMetadata={handleLoadedMetadata}
            />
          ) : (
            <img
              src={mediaUrl}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover image-duotone"
            />
          )
        ) : (
          <div className="w-full h-full bg-foreground/95 flex items-center justify-center">
            <div className="text-center text-background/40">
              <p className="text-lg mb-2">Media placeholder</p>
              <p className="text-sm">Sube imagen o video desde el admin en "Home - Hero Videos"</p>
            </div>
          </div>
        )}

        {/* Content overlay with parallax */}
        <div
          ref={contentParallax.ref as any}
          style={contentParallax.style}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <div className="text-center p-4 sm:p-6 lg:p-8 max-w-4xl">
            <h2 className="text-background text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-4 font-bold drop-shadow-lg font-sans lg:text-8xl">
              {slide.title}
            </h2>
            <p className="font-heading text-background/90 text-lg sm:text-xl lg:text-4xl mb-6 sm:mb-8 drop-shadow-md md:text-lg font-normal">
              {slide.subtitle}
            </p>
            {slide.cta_label && slide.cta_link && (
              <Button asChild variant="hero" size="lg" className="text-base sm:text-lg">
                <Link to={slide.cta_link} className="border-0">
                  {slide.cta_label}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </CarouselItem>
  );
};

export const HomeVideoHeroSlider = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [muted, setMuted] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const fetchSlides = async () => {
      const { data } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("page_type", "home_hero")
        .order("order_index");

      if (data && data.length > 0) {
        setSlides(
          data.map((item) => ({
            id: item.id,
            media_url: item.image_url,
            media_type: (item.media_type as "image" | "video") || "image",
            vertical_video_url: item.vertical_video_url || null,
            title: item.title || defaultSlides[item.order_index || 0]?.title || "ALA NORTE",
            subtitle: item.description || defaultSlides[item.order_index || 0]?.subtitle || "",
            cta_label: defaultSlides[item.order_index || 0]?.cta_label || null,
            cta_link: defaultSlides[item.order_index || 0]?.cta_link || null,
            order_index: item.order_index || 0,
          }))
        );
      } else {
        // Use defaults with generated IDs
        setSlides(
          defaultSlides.map((s, i) => ({
            ...s,
            id: `default-${i}`,
            order_index: i,
          }))
        );
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (!api) return;
    api.on("select", () => setCurrentSlide(api.selectedScrollSnap()));
  }, [api]);

  const hasVideos = slides.some((s) => s.media_type === "video" && s.media_url);

  return (
    <section className="relative min-h-[500px] lg:min-h-[700px] overflow-hidden border-b-4 border-foreground">
      <Carousel className="w-full h-full" setApi={setApi} opts={{ loop: true }}>
        <CarouselContent className="h-full -ml-0">
          {slides.map((slide, index) => (
            <HeroSlideComponent
              key={slide.id}
              slide={slide}
              index={index}
              videoRef={(el) => (videoRefs.current[index] = el)}
              muted={muted}
            />
          ))}
        </CarouselContent>
      </Carousel>

      {/* Mute/Unmute Button - only show if there are videos */}
      {hasVideos && (
        <button
          onClick={() => setMuted(!muted)}
          className="absolute top-4 right-4 z-20 p-3 bg-background/20 backdrop-blur-sm rounded-full hover:bg-background/40 transition-colors"
          aria-label={muted ? "Activar sonido" : "Silenciar"}
        >
          {muted ? <VolumeX className="h-5 w-5 text-background" /> : <Volume2 className="h-5 w-5 text-background" />}
        </button>
      )}

      {/* Navigation dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`h-2 rounded-full transition-all ${index === currentSlide ? "w-12 bg-primary" : "w-2 bg-background/40"}`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HomeVideoHeroSlider;
