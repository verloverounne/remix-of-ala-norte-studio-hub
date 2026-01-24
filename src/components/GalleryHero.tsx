import { useState, useRef, useEffect } from "react";
import { Calendar, ArrowRight, MapPin, Sparkles, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { Space } from "@/types/supabase";
import { useParallax } from "@/hooks/useParallax";
interface GalleryHeroProps {
  space: Space;
}
export const GalleryHero = ({ space }: GalleryHeroProps) => {
  const [muted, setMuted] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [videoOrientation, setVideoOrientation] = useState<"horizontal" | "vertical" | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Parallax para desktop
  const videoParallax = useParallax({
    speed: 0.6,
    direction: "up",
  });
  const contentParallax = useParallax({
    speed: 0.4,
    direction: "down",
  });
  useEffect(() => {
    const checkDevice = () => {
      const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 1024;
      setIsMobile(isTouchDevice || isSmallScreen);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setVideoOrientation(video.videoWidth > video.videoHeight ? "horizontal" : "vertical");
  };

  // Estilos dinámicos para que el video se vea completo en mobile
  const getMobileVideoStyles = (): React.CSSProperties => {
    if (!videoOrientation) {
      return {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        objectFit: "cover",
        width: "100%",
        height: "100%",
      };
    }
    const baseStyles: React.CSSProperties = {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      objectFit: "cover",
    };

    // Video vertical: ancho 100%, alto automático
    // Video horizontal: alto 100%, ancho automático
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
  return (
    <section className="relative min-h-screen bg-foreground">
      {/* Desktop: 2 Column Layout */}
      <div className="hidden lg:grid lg:grid-cols-2 w-full min-h-screen">
        {/* Left Column: Text Content */}
        <div className="flex flex-col justify-end h-screen pl-8 pr-8 lg:pl-16 lg:pr-16 pb-[16vh] bg-background">
          <div className="space-y-6 w-full h-full py-[61px] my-0">
            {/* Price Badge */}
            <div className="flex flex-col items-start gap-4 my-0" style={{ marginBottom: "clamp(24px, 4vh, 64px)" }}>
              <div className="flex items-center justify-center gap-2 text-primary px-4 py-2 rounded-lg w-full max-w-fit bg-foreground">
                <span className="text-2xl font-bold font-heading text-background sm:text-xl">
                  ${(space.block_price || space.price)?.toLocaleString()}
                </span>
                <span className="text-2x1 opacity-100 text-background text-sm">
                  / bloque {space.block_hours || 4}hs
                </span>
              </div>
            </div>

            {/* Title + Location + Subtitle */}
            <div className="flex flex-wrap gap-4 items-center">
              <h1
                className="font-heading font-bold text-foreground"
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 6rem)",
                  lineHeight: 1.1,
                }}
              >
                {space.hero_title || space.name}
              </h1>
              {space.location && (
                <div className="flex items-left gap-2 px-4 py-2 rounded-lg border-2 bg-background border-foreground border-solid">
                  <MapPin className="h-5 w-5 text-input" />
                  <span className="font-heading text-foreground">{space.location}</span>
                </div>
              )}
              <p
                className="..."
                style={{ marginTop: "clamp(24px, 4vh, 48px)", marginBottom: "clamp(16px, 3vh, 32px)" }}
              >
                {space.hero_subtitle || space.description}
              </p>
            </div>
          </div>
          {/* Features - 2 columns */}
          {space.features && Array.isArray(space.features) && space.features.length > 0 && (
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-[48px]">
              {(space.features as string[]).map((feature, index) => (
                <p key={index} className="text-sm text-muted-foreground font-heading flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {feature}
                </p>
              ))}
            </div>
          )}

          {/* Discount */}
          {space.discount_text && (
            <div className="inline-flex items-center gap-2 border-2 border-primary px-4 py-2 rounded-none">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-heading font-bold text-primary text-xl">{space.discount_text}</span>¿
            </div>
          )}

          {/* CTA Button */}
          <div>
            <Button variant="default" size="lg" asChild className="text-lg w-full max-w-fit">
              <Link to="/contacto">
                <Calendar className="mr-2 h-5 w-5" />
                {space.cta_text || "RESERVAR BLOQUE"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
        {/* Right Column: Video with Parallax */}
        {space.video_url ? (
          <div ref={videoParallax.ref as any} className="h-screen overflow-hidden relative duotone-hover-group">
            <video
              ref={videoRef}
              src={space.video_url}
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
            <button
              onClick={() => setMuted(!muted)}
              className="absolute top-4 right-4 z-20 p-3 backdrop-blur-sm rounded-full transition-colors my-[64px] bg-transparent border-0 text-background"
              aria-label={muted ? "Activar sonido" : "Silenciar"}
            >
              {muted ? (
                <VolumeX className="h-5 w-5 text-foreground" />
              ) : (
                <Volume2 className="h-5 w-5 text-foreground" />
              )}
            </button>
          </div>
        ) : (
          <div className="relative w-full h-full bg-muted flex items-center justify-center">
            <p className="text-muted-foreground font-heading">Video no disponible</p>
          </div>
        )}
      </div>

      {/* Mobile: Video background with overlaid content - pattern from HomeVideoHeroSlider */}
      <div className="lg:hidden h-screen relative">
        {/* Video de fondo completo */}
        {space.video_url && (
          <div
            className="relative duotone-hover-group"
            style={{
              width: "100vw",
              height: "100vh",
              overflow: "hidden",
            }}
          >
            <video
              ref={videoRef}
              src={space.video_url}
              className="video-duotone"
              style={getMobileVideoStyles()}
              autoPlay
              loop
              muted={muted}
              playsInline
              onLoadedMetadata={handleLoadedMetadata}
            />
          </div>
        )}

        {/* Content overlay with backdrop-blur */}
        <div className="absolute inset-0 flex items-end justify-center pb-[64px]">
          <div
            ref={contentParallax.ref as any}
            style={contentParallax.style}
            className="backdrop-blur-lg bg-background/40 rounded-lg mx-4 px-6 py-8 max-w-lg"
          >
            {/* Price Badge */}
            <div className="flex items-center gap-2 text-primary px-4 py-2 rounded-lg w-fit bg-foreground mb-4">
              <span className="font-bold font-heading text-background text-base">
                ${(space.block_price || space.price)?.toLocaleString()}
              </span>
              <span className="text-background font-extralight text-xs">/ bloque {space.block_hours || 4}hs</span>
            </div>

            {/* Title */}
            <h1 className="font-heading font-bold text-foreground text-4xl mb-2">{space.hero_title || space.name}</h1>

            {/* Location */}
            {space.location && (
              <div className="flex items-center gap-2 rounded-lg border-2 bg-background border-foreground px-3 py-1 mb-4 w-fit">
                <MapPin className="h-4 w-4 text-input" />
                <span className="font-heading text-foreground text-sm">{space.location}</span>
              </div>
            )}

            {/* Subtitle */}
            <p className="font-heading text-foreground leading-tight font-medium text-base mb-4">
              {space.hero_subtitle || space.description}
            </p>

            {/* Features - 2 columns */}
            {space.features && Array.isArray(space.features) && space.features.length > 0 && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-4">
                {(space.features as string[]).map((feature, index) => (
                  <p key={index} className="text-xs text-muted-foreground font-heading flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {feature}
                  </p>
                ))}
              </div>
            )}

            {/* Discount */}
            {space.discount_text && (
              <div className="inline-flex items-center gap-2 border-2 border-primary px-3 py-1.5 rounded-lg mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-heading font-bold text-primary text-lg">{space.discount_text}</span>
              </div>
            )}

            {/* CTA Button */}
            <Button variant="default" size="lg" asChild className="w-full">
              <Link to="/contacto">
                <Calendar className="mr-2 h-4 w-4" />
                {space.cta_text || "RESERVAR BLOQUE"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Mute Button for mobile */}
        {space.video_url && (
          <button
            onClick={() => setMuted(!muted)}
            className="absolute top-4 right-4 z-20 p-3 backdrop-blur-sm transition-colors mt-[60px] bg-transparent border-0 rounded-none"
            aria-label={muted ? "Activar sonido" : "Silenciar"}
          >
            {muted ? <VolumeX className="h-5 w-5 text-background" /> : <Volume2 className="h-5 w-5 text-background" />}
          </button>
        )}
      </div>
    </section>
  );
};
