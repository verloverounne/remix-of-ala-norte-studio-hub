import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, ArrowRight, Ruler, MapPin, Sparkles, Volume2, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
import type { Space } from "@/types/supabase";

interface VideoItem {
  id: string;
  video_url: string;
  title: string | null;
  description: string | null;
  order_index: number;
}

interface VideoHeroSliderProps {
  pageType: "galeria_hero" | "sala_grabacion_hero";
  space: Space;
}

export const VideoHeroSlider = ({ pageType, space }: VideoHeroSliderProps) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [muted, setMuted] = useState(true);
  // refs no necesarias: el duotono es CSS-only y el playback queda en autoplay/loop

  useEffect(() => {
    const fetchVideos = async () => {
      const { data } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("page_type", pageType)
        .order("order_index");

      if (data) {
        setVideos(data.map(item => ({
          ...item,
          video_url: item.image_url // Reutilizamos image_url para videos
        })));
      }
    };
    fetchVideos();
  }, [pageType]);

  useEffect(() => {
    if (!api) return;
    api.on("select", () => {
      const newSlide = api.selectedScrollSnap();
      setCurrentSlide(newSlide);
    });
  }, [api]);

  // Si no hay videos, mostrar fallback con imagen
  if (videos.length === 0) {
    return (
      <section className="relative h-screen">
        <div className="absolute inset-0 bg-foreground/95 flex items-center justify-center">
          <HeroContent space={space} />
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-screen overflow-hidden">
      <Carousel className="w-full h-full" setApi={setApi} opts={{ loop: true }}>
        <CarouselContent className="h-full -ml-0">
          {videos.map((video, index) => (
            <CarouselItem key={video.id} className="h-full pl-0">
              <div className="relative h-screen w-full overflow-hidden duotone-hover-group">
                <video
                  src={video.video_url}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted={muted}
                  playsInline
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {videos.length > 1 && (
          <>
            <CarouselPrevious className="left-4 z-20" />
            <CarouselNext className="right-4 z-20" />
          </>
        )}
      </Carousel>

      {/* Mute/Unmute Button */}
      <button
        onClick={() => setMuted(!muted)}
        className="absolute top-24 right-4 z-20 p-3 bg-background/20 backdrop-blur-sm rounded-full hover:bg-background/40 transition-colors"
        aria-label={muted ? "Activar sonido" : "Silenciar"}
      >
        {muted ? (
          <VolumeX className="h-5 w-5 text-background" />
        ) : (
          <Volume2 className="h-5 w-5 text-background" />
        )}
      </button>

      {/* Hero Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12 z-10">
        <HeroContent space={space} />
      </div>

      {/* Navigation dots */}
      {videos.length > 1 && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? "w-12 bg-primary" : "w-2 bg-background/40"
              }`}
              aria-label={`Ir a video ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

const HeroContent = ({ space }: { space: Space }) => (
  <div className="container mx-auto">
    <Badge variant="secondary" className="mb-4 text-lg px-4 py-2">
      <Clock className="mr-2 h-4 w-4" />
      BLOQUES DE {space.block_hours || 4}HS
    </Badge>
    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4">
      {space.hero_title || space.name}
    </h1>
    <p className="text-lg sm:text-xl md:text-2xl max-w-2xl mb-6 font-heading text-muted-foreground">
      {space.hero_subtitle || space.description}
    </p>
    
    <div className="flex flex-wrap gap-4 items-center mb-6">
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
      <div className="inline-flex items-center gap-2 bg-primary/20 border-2 border-primary px-4 py-2 rounded-lg mb-6">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="font-heading font-bold text-primary">{space.discount_text}</span>
      </div>
    )}

    <Button variant="hero" size="lg" asChild className="text-lg">
      <Link to="/contacto">
        <Calendar className="mr-2 h-5 w-5" />
        {space.cta_text || "RESERVAR BLOQUE"}
        <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
    </Button>
  </div>
);

export default VideoHeroSlider;
