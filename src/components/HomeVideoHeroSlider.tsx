import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
import { useParallax } from "@/hooks/useParallax";
interface VideoSlide {
  id: string;
  video_url: string;
  vertical_video_url?: string | null;
  title: string;
  subtitle: string;
  cta?: {
    label: string;
    link: string;
  };
}

// Componente individual para cada slide con parallax
interface HeroSlideProps {
  slide: VideoSlide;
  index: number;
  videoRef: (el: HTMLVideoElement | null) => void;
  muted: boolean;
}
const HeroSlide = ({
  slide,
  index,
  videoRef,
  muted
}: HeroSlideProps) => {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  useEffect(() => {
    const checkDevice = () => {
      setIsMobileOrTablet(window.innerWidth < 1024); // Tablet y mobile: < 1024px
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Parallax para el video (se mueve más lento que el scroll)
  const videoParallax = useParallax({
    speed: 0.6,
    direction: 'up'
  });
  // Parallax para el contenido (se mueve más rápido)
  const contentParallax = useParallax({
    speed: 0.4,
    direction: 'down'
  });

  // Determinar qué video usar: vertical en mobile/tablet si existe, sino el horizontal
  const videoToUse = isMobileOrTablet && slide.vertical_video_url ? slide.vertical_video_url : slide.video_url;
  return <CarouselItem className="h-full pl-0">
      <div className="relative h-full w-full overflow-hidden duotone-hover-group" style={{
      overflow: 'hidden'
    }}>
        {videoToUse ? <video ref={videoRef} src={videoToUse} className="absolute inset-0 w-full h-full object-cover video-duotone" style={videoParallax.style} autoPlay loop muted={muted} playsInline /> : <div className="w-full h-full bg-foreground/95 flex items-center justify-center">
            <div className="text-center text-background/40">
              <p className="text-lg mb-2">Video placeholder</p>
              <p className="text-sm">Sube un video desde el admin en "Home - Hero Videos"</p>
            </div>
          </div>}
        {/* Content overlay con parallax sutil */}
        <div ref={contentParallax.ref as any} style={contentParallax.style} className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center p-4 sm:p-6 lg:p-8 max-w-4xl">
            <h2 className="text-background text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-4 font-bold drop-shadow-lg font-sans lg:text-8xl">
              {slide.title}
            </h2>
            <p className="font-heading text-background/90 text-lg sm:text-xl lg:text-4xl mb-6 sm:mb-8 drop-shadow-md md:text-lg font-normal">
              {slide.subtitle}
            </p>
            {slide.cta && <Button asChild variant="hero" size="lg" className="text-base sm:text-lg">
                <Link to={slide.cta.link} className="border-0">
                  {slide.cta.label}
                </Link>
              </Button>}
          </div>
        </div>
      </div>
    </CarouselItem>;
};

// Configuración estática de los slides del hero
const heroSlides: Omit<VideoSlide, 'video_url' | 'vertical_video_url'>[] = [{
  id: "1",
  title: "ALA NORTE,MUCHO MAS QUE UN RENTAL",
  subtitle: "Si estás buscando alquilar equipamiento audiovisual profesional, podemos ayudarte a materializar tu visión. Trabajamos codo a codo con vos en cada proyecto.",
  cta: {
    label: "Explorá el catálogo",
    link: "/equipos"
  }
}, {
  id: "2",
  title: "GALERÍA DE FILMACIÓN",
  subtitle: "150 m²",
  cta: {
    label: "VER GALERÍA",
    link: "/galeria"
  }
}, {
  id: "3",
  title: "SALA DE SONIDO",
  subtitle: "ProTools Ultimate",
  cta: {
    label: "VER SALA",
    link: "/sala-grabacion"
  }
}];
export const HomeVideoHeroSlider = () => {
  const [videos, setVideos] = useState<{
    id: string;
    video_url: string;
    vertical_video_url: string | null;
    order_index: number;
  }[]>([]);
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [muted, setMuted] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => {
    const fetchVideos = async () => {
      const {
        data
      } = await supabase.from("gallery_images").select("*").eq("page_type", "home_hero").order("order_index");
      if (data && data.length > 0) {
        setVideos(data.map(item => ({
          id: item.id,
          video_url: item.image_url,
          vertical_video_url: null,
          order_index: item.order_index || 0
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
    });
  }, [api]);

  // Combinar slides con videos (usa placeholder si no hay video)
  const slidesWithVideos = heroSlides.map((slide, index) => ({
    ...slide,
    video_url: videos[index]?.video_url || null,
    vertical_video_url: videos[index]?.vertical_video_url || null
  }));
  return <section className="relative min-h-[500px] lg:min-h-[700px] overflow-hidden border-b-4 border-foreground">
        <Carousel className="w-full h-full" setApi={setApi} opts={{
      loop: true
    }}>
        <CarouselContent className="h-full -ml-0">
          {slidesWithVideos.map((slide, index) => <HeroSlide key={slide.id} slide={slide} index={index} videoRef={el => videoRefs.current[index] = el} muted={muted} />)}
        </CarouselContent>
      </Carousel>

      {/* Mute/Unmute Button */}
      {videos.length > 0 && <button onClick={() => setMuted(!muted)} className="absolute top-4 right-4 z-20 p-3 bg-background/20 backdrop-blur-sm rounded-full hover:bg-background/40 transition-colors" aria-label={muted ? "Activar sonido" : "Silenciar"}>
          {muted ? <VolumeX className="h-5 w-5 text-background" /> : <Volume2 className="h-5 w-5 text-background" />}
        </button>}

      {/* Navigation dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slidesWithVideos.map((_, index) => <button key={index} onClick={() => api?.scrollTo(index)} className={`h-2 rounded-full transition-all ${index === currentSlide ? "w-12 bg-primary" : "w-2 bg-background/40"}`} aria-label={`Ir a slide ${index + 1}`} />)}
      </div>
    </section>;
};
export default HomeVideoHeroSlider;