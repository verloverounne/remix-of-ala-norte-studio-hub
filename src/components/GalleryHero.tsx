import { useState } from "react";
import { Clock, Calendar, ArrowRight, Ruler, MapPin, Sparkles, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import type { Space } from "@/types/supabase";
interface GalleryHeroProps {
  space: Space;
}
export const GalleryHero = ({ space }: GalleryHeroProps) => {
  const [muted, setMuted] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  <section className="relative min-h-screen pt-16 lg:pt-0 flex items-center bg-background">
    {" "}
    {/* Desktop: 2 Column Layout */}
    <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8 w-full h-screen">
      {/* Left Column: Text Content */}
      <div className="container mx-auto px-4 lg:px-8 flex items-center">
        <div className="space-y-6 w-full">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Clock className="mr-2 h-4 w-4" />
            BLOQUES DE {space.block_hours || 4}HS
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold">
            {space.hero_title || space.name}
          </h1>

          <p className="text-sm sm:text-base md:text-sm max-w-2xl font-heading text-muted-foreground leading-tight">
            {space.hero_subtitle || space.description}
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg">
              <span className="text-2xl sm:text-3xl font-bold font-heading">
                ${(space.block_price || space.price)?.toLocaleString()}
              </span>
              <span className="text-sm opacity-80">/ bloque {space.block_hours || 4}hs</span>
            </div>
            {space.surface_area && (
              <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-lg">
                <Ruler className="h-5 w-5" />
                <span className="font-heading font-bold">{space.surface_area}</span>
              </div>
            )}
            {space.location && (
              <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-lg">
                <MapPin className="h-5 w-5" />
                <span className="font-heading">{space.location}</span>
              </div>
            )}
          </div>

          {space.discount_text && (
            <div className="inline-flex items-center gap-2 bg-primary/20 border-2 border-primary px-4 py-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-heading font-bold text-primary">{space.discount_text}</span>
            </div>
          )}

          <div>
            <Button variant="hero" size="lg" asChild className="text-lg">
              <Link to="/contacto">
                <Calendar className="mr-2 h-5 w-5" />
                {space.cta_text || "RESERVAR BLOQUE"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column: Vertical Video - Full Width and Height */}
      {space.video_url ? (
        <div className="relative w-full h-full">
          <video src={space.video_url} className="w-full h-full object-cover" autoPlay loop muted={muted} playsInline />
          <button
            onClick={() => setMuted(!muted)}
            className="absolute top-4 right-4 z-20 p-3 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background/90 transition-colors"
            aria-label={muted ? "Activar sonido" : "Silenciar"}
          >
            {muted ? <VolumeX className="h-5 w-5 text-foreground" /> : <Volume2 className="h-5 w-5 text-foreground" />}
          </button>
        </div>
      ) : (
        <div className="relative w-full h-full bg-muted flex items-center justify-center">
          <p className="text-muted-foreground font-heading">Video no disponible</p>
        </div>
      )}
    </div>
    {/* Mobile: Horizontal Slider */}
    <div className="lg:hidden w-full h-screen overflow-hidden">
      <Carousel
        className="w-full h-full"
        setApi={setApi}
        opts={{
          loop: false,
          align: "start",
          dragFree: true,
          containScroll: "trimSnaps",
        }}
      >
        <CarouselContent className="-ml-0 h-full flex">
          {/* Slide 1: Text Content */}
          <CarouselItem className="pl-0 basis-full shrink-0 grow-0 w-screen h-full flex items-center">
            <div className="container mx-auto px-4 py-12 space-y-6">
              <Badge variant="secondary" className="text-lg px-4 py-2 text-[#9d1402]">
                <Clock className="mr-2 h-4 w-4" />
                BLOQUES DE {space.block_hours || 4}HS
              </Badge>

              <h1 className="text-3xl sm:text-4xl font-heading font-bold">{space.hero_title || space.name}</h1>

              <p className="text-sm sm:text-base max-w-2xl font-heading text-muted-foreground leading-tight">
                {space.hero_subtitle || space.description}
              </p>

              <div className="flex-wrap gap-4 flex-col flex items-start justify-start">
                <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg">
                  <span className="text-2xl font-bold font-heading">lg:hidden w-full h-screen</span>
                  <span className="text-sm opacity-80">/ bloque {space.block_hours || 4}hs</span>
                </div>
                {space.surface_area && (
                  <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-lg">
                    <Ruler className="h-5 w-5" />
                    <span className="font-heading font-bold">{space.surface_area}</span>
                  </div>
                )}
                {space.location && (
                  <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-lg">
                    <MapPin className="h-5 w-5" />
                    <span className="font-heading">{space.location}</span>
                  </div>
                )}
              </div>

              {space.discount_text && (
                <div className="inline-flex items-center gap-2 border-2 border-primary px-4 py-2 rounded-lg bg-transparent">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-heading font-bold text-primary">{space.discount_text}</span>
                </div>
              )}

              <div>
                <Button variant="hero" size="lg" asChild className="text-lg">
                  <Link to="/contacto">
                    <Calendar className="mr-2 h-5 w-5" />
                    {space.cta_text || "RESERVAR BLOQUE"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </CarouselItem>

          {/* Slide 2: Video */}
          {space.video_url && (
            <CarouselItem className="pl-0 basis-full shrink-0 grow-0 w-screen h-full flex items-center justify-center">
              <div className="relative w-full flex items-center justify-center">
                <div className="relative w-full max-w-sm">
                  <video
                    src={space.video_url}
                    className="w-full object-contain"
                    autoPlay
                    loop
                    muted={muted}
                    playsInline
                  />
                  <button
                    onClick={() => setMuted(!muted)}
                    className="absolute top-4 right-4 z-20 p-3 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background/90 transition-colors"
                    aria-label={muted ? "Activar sonido" : "Silenciar"}
                  >
                    {muted ? (
                      <VolumeX className="h-5 w-5 text-foreground" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
      </Carousel>

      {/* Navigation dots for mobile */}
      {space.video_url && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          <button
            onClick={() => api?.scrollTo(0)}
            className="h-2 w-2 rounded-full bg-primary transition-all"
            aria-label="Ir a texto"
          />
          <button
            onClick={() => api?.scrollTo(1)}
            className="h-2 w-2 rounded-full bg-background/40 transition-all"
            aria-label="Ir a video"
          />
        </div>
      )}
    </div>
  </section>;
};
