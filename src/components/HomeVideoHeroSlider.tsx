import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
interface VideoSlide {
  id: string;
  video_url: string;
  title: string;
  subtitle: string;
  cta?: {
    label: string;
    link: string;
  };
}

// Configuración estática de los slides del hero
const heroSlides = [
  {
    id: 1,
    title: "ALA NORTE,MUCHO MAS QUE UN RENTAL",
    subtitle:
      "Si estás buscando alquilar equipamiento audiovisual profesional, podemos ayudarte a materializar tu visión. Trabajamos codo a codo con vos en cada proyecto.",
    cta: {
      label: "Explorá el catálogo",
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
export const HomeVideoHeroSlider = () => {
  const [videos, setVideos] = useState<
    {
      id: string;
      video_url: string;
      order_index: number;
    }[]
  >([]);
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
      if (data && data.length > 0) {
        setVideos(
          data.map((item) => ({
            id: item.id,
            video_url: item.image_url,
            order_index: item.order_index || 0,
          })),
        );
      }
    };
    fetchVideos();
  }, []);
  useEffect(() => {
    if (!api) return;
    api.on("select", () => {
      const newSlide = api.selectedScrollSnap();
      setCurrentSlide(newSlide);

      // Reset all videos to paused + blur state when changing slides
      videoRefs.current.forEach((video) => {
        if (video) {
          video.pause();
          video.currentTime = 0;
         
        }
      });
    });
  }, [api]);

  // Combinar slides con videos (usa placeholder si no hay video)
  const slidesWithVideos = heroSlides.map((slide, index) => ({
    ...slide,
    video_url: videos[index]?.video_url || null,
  }));
  return (
    <section className="relative h-screen overflow-hidden border-b-4 border-foreground">
      <Carousel
        className="w-full h-full"
        setApi={setApi}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent className="h-full -ml-0">
          {slidesWithVideos.map((slide, index) => (
            <CarouselItem key={slide.id} className="h-full pl-0">
              <div className="relative h-screen w-full overflow-hidden">
                {slide.video_url ? (
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    src={slide.video_url}
                    className="w-full h-full object-cover transition-[filter] duration-300 ease-out"
                    style={{
                  
                    }}
                    autoPlay
                    loop
                    muted={muted}
                    playsInline
                    onMouseEnter={(e) => {
                      const video = e.currentTarget;
                     
                    }}
                    onMouseLeave={(e) => {
                      const video = e.currentTarget;
                    
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-foreground/95 flex items-center justify-center">
                    <div className="text-center text-background/40">
                      <p className="text-lg mb-2">Video placeholder</p>
                      <p className="text-sm">Sube un video desde el admin en "Home - Hero Videos"</p>
                    </div>
                  </div>
                )}
                {/* <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                {/* Content overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="text-center p-4 sm:p-6 lg:p-8 max-w-4xl">
                    <h2 className="text-background text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-4 font-bold drop-shadow-lg font-sans lg:text-8xl">
                      {slide.title}
                    </h2>
                    <p className="font-heading text-background/90 text-lg sm:text-xl md:text-2xl lg:text-4xl mb-6 sm:mb-8 drop-shadow-md">
                      {slide.subtitle}
                    </p>
                    {slide.cta && (
                      <Button asChild variant="hero" size="lg" className="text-base sm:text-lg">
                        <Link to={slide.cta.link} className="border-0">
                          {slide.cta.label}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Mute/Unmute Button */}
      {videos.length > 0 && (
        <button
          onClick={() => setMuted(!muted)}
          className="absolute top-24 right-4 z-20 p-3 bg-background/20 backdrop-blur-sm rounded-full hover:bg-background/40 transition-colors"
          aria-label={muted ? "Activar sonido" : "Silenciar"}
        >
          {muted ? <VolumeX className="h-5 w-5 text-background" /> : <Volume2 className="h-5 w-5 text-background" />}
        </button>
      )}

      {/* Navigation dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slidesWithVideos.map((_, index) => (
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
