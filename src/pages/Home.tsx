import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import { InstitutionalSlider } from "@/components/InstitutionalSlider";
import { ProductionsSlider } from "@/components/ProductionsSlider";
import { HomeVideoHeroSlider } from "@/components/HomeVideoHeroSlider";
import { ServicesSection } from "@/components/ServicesSection";
import { useParallax } from "@/hooks/useParallax";

// Componente para la sección de equipos destacados con parallax
interface FeaturedEquipmentSectionProps {
  featuredEquipment: any[];
  equipmentApi: CarouselApi | undefined;
  setEquipmentApi: (api: CarouselApi | undefined) => void;
  currentEquipmentSlide: number;
  setCurrentEquipmentSlide: (index: number) => void;
}
const FeaturedEquipmentSection = ({
  featuredEquipment,
  equipmentApi,
  setEquipmentApi,
  currentEquipmentSlide,
  setCurrentEquipmentSlide
}: FeaturedEquipmentSectionProps) => {
  const headerParallax = useParallax({
    speed: 0.5,
    direction: "down"
  });
  return <section className="relative border-y border-border bg-background overflow-hidden">
      <div className="py-12 lg:py-20 sm:py-0 bg-foreground">
        <div ref={headerParallax.ref as any} style={headerParallax.style} className="container mx-auto mb-8 sm:mb-12 px-[32px] border-background bg-foreground">
          <div>
            <h2 className="font-heading text-3xl lg:text-brutal mb-2 sm:mb-4 my-[64px] text-center sm:text-5xl text-primary">RENTAL DESTACADO</h2>
            {/*          <p className="text-sm sm:text-base lg:text-sm text-muted-foreground font-heading leading-tight">
              TECNOLOGÍA DE PRIMER NIVEL PARA TUS PROYECTOS
             </p> */}
          </div>
        </div>

        <Carousel className="w-full" setApi={setEquipmentApi}>
          <CarouselContent className="-ml-0">
            {featuredEquipment.map(equipment => <EquipmentSlide key={equipment.id} equipment={equipment} />)}
          </CarouselContent>
        </Carousel>

        {/* Navigation dots */}
        <div className="flex justify-center gap-3 mt-8">
          {featuredEquipment.map((_, index) => <button key={index} onClick={() => equipmentApi?.scrollTo(index)} className={`h-2 rounded-full transition-all ${index === currentEquipmentSlide ? "w-12 bg-primary" : "w-2 bg-foreground/40"}`} aria-label={`Ir al equipo ${index + 1}`} />)}
        </div>
      </div>
    </section>;
};

// Componente para cada slide de equipo con parallax
interface EquipmentSlideProps {
  equipment: any;
}
const EquipmentSlide = ({
  equipment
}: EquipmentSlideProps) => {
  const imageParallax = useParallax({
    speed: 0.8,
    direction: "up"
  });
  const contentParallax = useParallax({
    speed: 0.5,
    direction: "down"
  });
  return <CarouselItem className="pl-0 basis-full">
      <Link to={`/equipos?id=${equipment.id}`}>
        <div className="relative h-[70vh] bg-foreground/95 overflow-hidden group cursor-pointer">
          {equipment.image_url && <div ref={imageParallax.ref as any} style={imageParallax.style} className="absolute inset-0 w-full h-[120%]">
              <img src={equipment.image_url} alt={equipment.name} className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity" />
            </div>}
          <div ref={contentParallax.ref as any} style={contentParallax.style} className="absolute inset-0 flex items-center justify-center">
            <div className="text-center z-10 p-8 max-w-4xl">
              <h3 className="font-heading text-6xl md:text-8xl mb-6 uppercase text-background">{equipment.name}</h3>
              {equipment.featured_copy && <p className="text-xl md:text-2xl text-background/80 mb-8 font-heading">{equipment.featured_copy}</p>}
              <div className="flex items-center justify-center gap-6 mb-6">
                <span className="font-heading text-primary px-8 py-4 border border-background shadow-brutal text-base bg-foreground">
                  ${equipment.price_per_day}/día
                </span>
              </div>
              <Button variant="hero" size="lg" className="group-hover:shadow-brutal-lg transition-shadow">
                VER DETALLES <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </CarouselItem>;
};

// Componente para la sección CTA con parallax
import ctaBackground from "@/assets/cta-background.jpg";
const CTASection = () => {
  const contentParallax = useParallax({
    speed: 0.5,
    direction: "down"
  });
  return <section className="relative border-y border-border overflow-hidden min-h-[90vh] flex items-center duotone-hover-group">
      {/* Background image with duotone treatment */}
      <div className="absolute inset-0 w-full h-full border-0">
        <img alt="" className="w-full h-full image-duotone border-0 object-cover" src="/lovable-uploads/fb5916aa-2049-4f18-aa32-4bfb53fbdc4f.png" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 container mx-auto px-4 flex">
        <div ref={contentParallax.ref as any} style={contentParallax.style} className="max-w-2xl p-6 backdrop-blur-lg rounded-lg backdrop-blur-lg py-[68px] mx-[16px] px-[24px]">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-4 sm:mb-6 text-background my-0 px-0 font-extrabold">
            ¿Tenés un rodaje en mente?
          </h2>
          <p className="text-sm mb-6 font-heading leading-tight my-[6px] sm:mb-[57px] px-0 text-background font-normal sm:text-lg">
            Contanos qué querés filmar y armamos una propuesta de equipamiento a medida.
          </p>
          <Button asChild variant="default" size="lg">
            <Link to="/cotizador">Hablemos de tu proyecto</Link>
          </Button>
        </div>
      </div>
    </section>;
};

// Componente para la sección Cartoni con parallax y video de fondo
const CartoniSection = () => {
  const [backgroundVideo, setBackgroundVideo] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<"idle" | "loaded" | "error">("idle");
  const logoParallax = useParallax({
    speed: 0.6,
    direction: "up"
  });
  const contentParallax = useParallax({
    speed: 0.5,
    direction: "down"
  });
  useEffect(() => {
    const fetchBackgroundVideo = async () => {
      const {
        data,
        error
      } = await supabase.from("gallery_images").select("image_url, media_type").eq("page_type", "cartoni_home" as string).order("order_index").limit(1);
      if (error) {
        console.warn("[CartoniSection] Error trayendo video de fondo:", error.message);
        return;
      }
      const row = data?.[0];
      if (row?.image_url) {
        // Si subieron algo por error como imagen, igual lo intentamos usar como src
        setBackgroundVideo(row.image_url);
      }
    };
    fetchBackgroundVideo();
  }, []);
  return <section className="relative border-y border-border">
      {/* Contenedor del video - el video define el alto */}
      <div className="relative w-full">
        {backgroundVideo && <video key={backgroundVideo} autoPlay loop muted playsInline preload="auto" crossOrigin="anonymous" onCanPlay={() => setVideoStatus("loaded")} onError={() => {
        console.warn("[CartoniSection] No se pudo reproducir el video. Recomendación: MP4 H.264 + AAC. URL:", backgroundVideo);
        setVideoStatus("error");
      }} className="w-full h-auto min-h-[720px] object-cover object-top">
            <source src={backgroundVideo} type="video/mp4" />
          </video>}

        {/* Overlay para legibilidad
         <div className="pointer-events-none absolute inset-0 bg-background/0 z-[1]" />
          */}

        {/* Contenido - superpuesto, abajo izquierda */}
        <div className="absolute inset-0 z-10 flex items-end">
          <div className="container mx-auto px-4 pb-16">
            <div ref={contentParallax.ref as any} style={contentParallax.style} className="max-w-2xl p-6 backdrop-blur-lg bg-rin/50 rounded-lg backdrop-blur-lg py-[68px] max-w-2xl mx-[16px] px-[24px]">
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl mb-4 text-foreground">
                SELLER & SERVICE <span className="text-foreground">OFICIAL CARTONI</span>
              </h2>
              <p className="text-2x1-foreground mb-6 leading-tight text-sm font-medium">
                Ala Norte es representante oficial de Cartoni en Argentina. Venta, reparación y mantenimiento de
                trípodes y cabezales profesionales con garantía y repuestos originales.
              </p>
              <div className="flex flex-wrap justify-start gap-2 sm:gap-4">
                <Button asChild variant="default" size="lg" className="flex-1 sm:flex-none">
                  <Link to="/cartoni">CONOCER MÁS</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="flex-1 sm:flex-none">
                  <a href="https://www.cartoni.com/dealers/" target="_blank" rel="noopener noreferrer">
                    VER EN CARTONI.COM
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
const Home = () => {
  const [featuredEquipment, setFeaturedEquipment] = useState<any[]>([]);
  const [equipmentApi, setEquipmentApi] = useState<CarouselApi>();
  const [currentEquipmentSlide, setCurrentEquipmentSlide] = useState(0);
  useEffect(() => {
    const fetchFeaturedEquipment = async () => {
      const {
        data
      } = await supabase.from("equipment").select("*").eq("featured", true).limit(6);
      if (data) setFeaturedEquipment(data);
    };
    fetchFeaturedEquipment();
  }, []);
  useEffect(() => {
    if (!equipmentApi) return;
    equipmentApi.on("select", () => {
      setCurrentEquipmentSlide(equipmentApi.selectedScrollSnap());
    });
  }, [equipmentApi]);
  return <div className="min-h-screen bg-background">
      {/* Institutional Slider - Before Hero */}
      <InstitutionalSlider pageType="home" />

      {/* Hero Section - Video Slider with CTAs */}
      <HomeVideoHeroSlider />

      {/* Productions Slider Section */}
      <ProductionsSlider />

      {/* CTA Section */}
      <CTASection />

      {/* Services Section */}
      <ServicesSection />

      {/* Cartoni Official Dealer Section */}
      <CartoniSection />

      {/* Featured Equipment Section - Full Width Slider */}
      {featuredEquipment.length > 0 && <FeaturedEquipmentSection featuredEquipment={featuredEquipment} equipmentApi={equipmentApi} setEquipmentApi={setEquipmentApi} currentEquipmentSlide={currentEquipmentSlide} setCurrentEquipmentSlide={setCurrentEquipmentSlide} />}
    </div>;
};
export default Home;