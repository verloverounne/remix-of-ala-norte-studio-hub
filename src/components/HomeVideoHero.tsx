import { useState, useEffect, useRef } from "react";
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
import { Volume2, VolumeX, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface VideoItem {
  id: string;
  video_url: string;
  title: string | null;
  description: string | null;
  order_index: number;
}

const spaces360 = [
  {
    id: 1,
    title: "SOMOS MAS QUE UN RENTAL",
    subtitle: "En Ala Norte cada rodaje tiene su propia historia.",
    cta: {
      label: "VER EQUIPOS",
      link: "/equipos",
    },
  },
  {
    id: 2,
    title: "GALERÍA DE FILMACIÓN",
    subtitle: "150 m²",
    cta: {
      label: "VER GALERÍA",
      link: "/galeria",
    },
  },
  {
    id: 3,
    title: "SALA DE SONIDO",
    subtitle: "ProTools Ultimate",
    cta: {
      label: "VER SALA",
      link: "/sala-grabacion",
    },
  },
];

export const HomeVideoHero = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [muted, setMuted] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("page_type", "home_hero")
        .order("order_index");

      if (data) {
        setVideos(data.map(item => ({
          ...item,
          video_url: item.image_url
        })));
      }
    };
    fetchVideos();
  }, []);

  useEffect(() => {
    if (!api) return;
    api.on("select", () => {
      const newSlide = api.selectedScrollSnap();
      setCurrentSlide(newSlide);
      
      videoRefs.current.forEach((video, index) => {
        if (video) {
          if (index === newSlide) {
            video.play();
          } else {
            video.pause();
            video.currentTime = 0;
          }
        }
      });
    });
  }, [api]);

  // Fallback con espacios estáticos si no hay videos
  const hasVideos = videos.length > 0;
  const slideCount = hasVideos ? videos.length : spaces360.length;

  return (
    <section className="relative h-[50vh] overflow-hidden border-y-4 border-foreground">
      {hasVideos ? (
        <>
          <Carousel className="w-full h-full" setApi={setApi} opts={{ loop: true }}>
            <CarouselContent className="h-full -ml-0">
              {videos.map((video, index) => (
                <CarouselItem key={video.id} className="h-full pl-0">
                  <div className="relative h-full w-full overflow-hidden">
                    <video
                      ref={el => videoRefs.current[index] = el}
                      src={video.video_url}
                      className="w-full h-full object-cover"
                      autoPlay={index === 0}
                      loop
                      muted={muted}
                      playsInline
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-foreground/20" />
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center z-10 p-4 sm:p-6 lg:p-8">
                        {video.title && (
                          <p className="font-heading text-background text-3xl sm:text-4xl md:text-5xl lg:text-7xl mb-2 sm:mb-4 font-bold">
                            {video.title}
                          </p>
                        )}
                        {video.description && (
                          <p className="font-heading text-background/80 text-lg sm:text-xl md:text-2xl lg:text-3xl">
                            {video.description}
                          </p>
                        )}
                      </div>
                    </div>
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
            className="absolute top-4 right-4 z-20 p-3 bg-background/20 backdrop-blur-sm rounded-full hover:bg-background/40 transition-colors"
            aria-label={muted ? "Activar sonido" : "Silenciar"}
          >
            {muted ? (
              <VolumeX className="h-5 w-5 text-background" />
            ) : (
              <Volume2 className="h-5 w-5 text-background" />
            )}
          </button>
        </>
      ) : (
        // Fallback: Slider estático con espacios
        <Carousel className="w-full h-full" setApi={setApi} opts={{ loop: true }}>
          <CarouselContent className="h-full -ml-0">
            {spaces360.map((space, index) => (
              <CarouselItem key={space.id} className="h-full pl-0">
                <div className="relative h-full w-full bg-foreground/95 flex items-center justify-center">
                  <div className="text-center z-10 p-4 sm:p-6 lg:p-8">
                    <p className="font-heading text-background text-3xl sm:text-4xl md:text-5xl lg:text-7xl mb-2 sm:mb-4 font-bold">
                      {space.title}
                    </p>
                    <p className="font-heading text-background/80 text-lg sm:text-xl md:text-2xl lg:text-3xl mb-4 sm:mb-6">
                      {space.subtitle}
                    </p>
                    {space.cta && (
                      <Button asChild variant="hero" size="lg">
                        <Link to={space.cta.link}>
                          {space.cta.label}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 via-transparent to-foreground/40" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {spaces360.length > 1 && (
            <>
              <CarouselPrevious className="left-4 z-20" />
              <CarouselNext className="right-4 z-20" />
            </>
          )}
        </Carousel>
      )}

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {Array.from({ length: slideCount }).map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? "w-12 bg-primary" : "w-2 bg-background/40"
            }`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HomeVideoHero;
