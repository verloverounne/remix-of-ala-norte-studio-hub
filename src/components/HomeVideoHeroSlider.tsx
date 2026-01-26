import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
import { useParallax } from "@/hooks/useParallax";
import heroLogo from "@/assets/hero-logo.png";
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
    cta_label: "Recorré la galería",
    cta_link: "/galeria",
  },
  {
    media_url: "",
    media_type: "image",
    title: "SALA DE SONIDO / POSTPRODUCCIÓN",
    subtitle:
      " Descripción	Suites de post-producción con estaciones de trabajo profesionales, monitoreo calibrado y ambiente acústico controlado.",
    cta_label: "Conocé la sala",
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
  const [isLandscape, setIsLandscape] = useState(false);
  useEffect(() => {
    const checkDevice = () => {
      const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isTouchDevice || isSmallScreen);
      setIsMobileOrTablet(window.innerWidth < 1024);
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);
  const videoParallax = useParallax({
    speed: 0.6,
    direction: "up",
  });
  const contentParallax = useParallax({
    speed: 0.4,
    direction: "down",
  });
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setVideoOrientation(video.videoWidth > video.videoHeight ? "horizontal" : "vertical");
  };

  // Use vertical video only on mobile/tablet in portrait; landscape uses horizontal video
  const mediaUrl =
    slide.media_type === "video" && isMobileOrTablet && !isLandscape && slide.vertical_video_url
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

    // Portrait video (taller than wide): width 100%, height auto
    // Landscape video (wider than tall): height 100%, width auto (overflow hidden)
    return videoOrientation === "vertical"
      ? {
          ...baseStyles,
          width: "100vw",
          height: "auto",
          minHeight: "100%",
        }
      : {
          ...baseStyles,
          height: "100vh",
          width: "auto",
          minWidth: "100%",
        };
  };
  const hasMedia = mediaUrl && mediaUrl.trim() !== "";
  return (
    <CarouselItem className="h-screen pl-0">
      {/* Desktop: 2 columnas - contenedor 100vh */}
      <div className="hidden md:grid md:grid-cols-2 h-screen bg-foreground">
        {/* Columna izquierda: Texto posicionado al 90% del alto de pantalla */}
        <div className="sticky flex flex-col justify-end h-screen pl-8 pr-8 lg:pl-16 lg:pr-16 pb-[16vh] px-0 text-left text-4xl gap-[24px]">
          <h1
            className="text-background font-bold mb-4 leading-tight border-0 font-sans leading-ti"
            style={{
              fontSize: "clamp(2rem, 5vw, 4rem)",
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}
          >
            {slide.title}
          </h1>
          <p className="text-background text-base mb-base lg-2x1">{slide.subtitle}</p>
          {slide.cta_label && slide.cta_link && (
            <Link to={slide.cta_link}>
              <Button variant="default" size="lg">
                {slide.cta_label}
              </Button>
            </Link>
          )}
        </div>

        {/* Columna derecha: Video con parallax y duotono */}
        <div ref={videoParallax.ref as any} className="h-screen overflow-hidden relative duotone-hover-group">
          {hasMedia ? (
            slide.media_type === "video" ? (
              <video
                ref={videoRef}
                src={mediaUrl}
                className="video-duotone w-full object-cover"
                style={{
                  height: "130%",
                  position: "absolute",
                  top: "0",
                  left: "0",
                  ...videoParallax.style,
                }}
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
                className="image-duotone w-full object-cover"
                style={{
                  height: "130%",
                  position: "absolute",
                  top: "0",
                  left: "0",
                  ...videoParallax.style,
                }}
              />
            )
          ) : null}
        </div>
      </div>

      {/* Mobile: layout horizontal con video/imagen de fondo */}
      <div className="md:hidden h-screen relative">
        <div
          className="relative duotone-hover-group"
          style={{
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          {hasMedia ? (
            slide.media_type === "video" ? (
              <video
                ref={videoRef}
                src={mediaUrl}
                className="video-duotone absolute inset-0 w-full h-full object-cover"
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
                className="image-duotone absolute inset-0 w-full h-full object-cover"
              />
            )
          ) : null}
        </div>

        <div className="absolute inset-0 flex items-end justify-center mb-[64px]">
          <div
            ref={contentParallax.ref as any}
            style={contentParallax.style}
            className="backdrop-blur-lg bg-[#423c38]/50 text-center text-background/ px-8 pl-[32px] pb-[32px] my-[16px] mx-[16px] "
          >
            <h1 className="text-background md:text-6xl font-bold mb-2 text-4xl py-[32px] pt-[32px]">{slide.title}</h1>
            <p className="text-background mb-16 text-right font-medium text-xs mb:text-sm">{slide.subtitle}</p>
            {slide.cta_label && slide.cta_link && (
              <Link to={slide.cta_link}>
                <Button variant="default">{slide.cta_label}</Button>
              </Link>
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
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);
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
          })),
        );
      } else {
        // Use defaults with generated IDs
        setSlides(
          defaultSlides.map((s, i) => ({
            ...s,
            id: `default-${i}`,
            order_index: i,
          })),
        );
      }
    };
    fetchSlides();
  }, []);

  // Autoplay effect - advances every 4 seconds until user interacts
  useEffect(() => {
    if (!api || !autoplayEnabled || slides.length <= 1) return;
    autoplayIntervalRef.current = setInterval(() => {
      api.scrollNext();
    }, 10000);
    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
    };
  }, [api, autoplayEnabled, slides.length]);

  // Stop autoplay on user interaction
  const handleUserInteraction = () => {
    if (autoplayEnabled) {
      setAutoplayEnabled(false);
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
        autoplayIntervalRef.current = null;
      }
    }
  };
  useEffect(() => {
    if (!api) return;
    api.on("select", () => setCurrentSlide(api.selectedScrollSnap()));
  }, [api]);
  const hasVideos = slides.some((s) => s.media_type === "video" && s.media_url);
  return (
    <section
      className="relative h-screen overflow-hidden border-b-4 border-foreground"
      onMouseDown={handleUserInteraction}
      onTouchStart={handleUserInteraction}
    >
      <Carousel
        className="w-full h-screen"
        setApi={setApi}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent className="h-screen -ml-0">
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
          onClick={() => {
            handleUserInteraction();
            setMuted(!muted);
          }}
          className="absolute top-4 right-4 z-20 p-3 backdrop-blur-sm transition-colors my-[60px] bg-transparent border-0 rounded-none shadow-none"
          aria-label={muted ? "Activar sonido" : "Silenciar"}
        >
          {muted ? <VolumeX className="h-5 w-5 text-background" /> : <Volume2 className="h-5 w-5 text-background" />}
        </button>
      )}

      {/* Logo centrado en la parte superior */}
      <div className="absolute top-2 left-0 right-0 z-20 flex justify-center mt-1 md:2 lg:8 lg:mb-12 my-0">
        <img
          src={heroLogo}
          alt="Ala Norte Logo"
          className="sticky top-0 z-20 object-contain w-28 md:1/4 lg:1/8 xl:1/6 "
        />
      </div>
      {/* Navigation dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              handleUserInteraction();
              api?.scrollTo(index);
            }}
            className={`h-2 rounded-full transition-all ${index === currentSlide ? "w-12 bg-primary" : "w-2 bg-background/40"}`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
export default HomeVideoHeroSlider;
