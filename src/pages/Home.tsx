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
    direction: 'down'
  });
  return <section className="relative border-y border-border bg-background overflow-hidden">
      <div className="py-12 sm:py-16 lg:py-20">
        <div ref={headerParallax.ref as any} style={headerParallax.style} className="container mx-auto px-4 mb-8 sm:mb-12">
          <div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-brutal mb-2 sm:mb-4">RENTAL DESTACADO</h2>
            <p className="text-sm sm:text-base lg:text-sm text-muted-foreground font-heading leading-tight">
              TECNOLOGÍA DE PRIMER NIVEL PARA TUS PROYECTOS
            </p>
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
    direction: 'up'
  });
  const contentParallax = useParallax({
    speed: 0.5,
    direction: 'down'
  });
  return <CarouselItem className="pl-0 basis-full">
      <Link to={`/equipos?id=${equipment.id}`}>
        <div className="relative h-[70vh] bg-foreground/95 overflow-hidden group cursor-pointer">
          {equipment.image_url && <div ref={imageParallax.ref as any} style={imageParallax.style} className="absolute inset-0 w-full h-[120%]">
              <img src={equipment.image_url} alt={equipment.name} className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity" />
            </div>}
          <div ref={contentParallax.ref as any} style={contentParallax.style} className="absolute inset-0 flex items-center justify-center">
            <div className="text-center z-10 p-8 max-w-4xl">
              <h3 className="font-heading text-6xl md:text-8xl mb-6 uppercase text-background">
                {equipment.name}
              </h3>
              {equipment.featured_copy && <p className="text-xl md:text-2xl text-background/80 mb-8 font-heading">
                  {equipment.featured_copy}
                </p>}
              <div className="flex items-center justify-center gap-6 mb-6">
                <span className="font-heading text-4xl text-primary bg-background/90 px-8 py-4 border border-background shadow-brutal">
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
const CTASection = () => {
  const contentParallax = useParallax({
    speed: 0.5,
    direction: 'down'
  });
  return <section className="py-12 sm:py-20 lg:py-32 text-foreground relative border-y border-border bg-background border">
      <div className="container mx-auto px-4 relative">
        <div ref={contentParallax.ref as any} style={contentParallax.style} className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-brutal mb-4 sm:mb-6 lg:mb-8">
            ¿Estás por encarar un rodaje?
          </h2>
          <p className="text-sm sm:text-base lg:text-sm mb-6 sm:mb-8 lg:mb-12 font-heading leading-tight">
            Contanos qué querés filmar y armamos una propuesta de equipamiento a medida.
          </p>
          <Button asChild variant="outline" size="lg" className="bg-background text-foreground">
            <Link to="/cotizador">Hablemos de tu proyecto</Link>
          </Button>
        </div>
      </div>
    </section>;
};

// Componente para la sección Cartoni con parallax y video de fondo
const CartoniSection = () => {
  const [backgroundVideo, setBackgroundVideo] = useState<string | null>(null);

  const logoParallax = useParallax({
    speed: 0.6,
    direction: 'up'
  });
  const contentParallax = useParallax({
    speed: 0.5,
    direction: 'down'
  });

  useEffect(() => {
    const fetchBackgroundVideo = async () => {
      const { data } = await supabase
        .from('gallery_images')
        .select('image_url, media_type')
        .eq('page_type', 'cartoni_home')
        .order('order_index')
        .limit(1);
      
      if (data && data.length > 0 && data[0].media_type === 'video') {
        setBackgroundVideo(data[0].image_url);
      }
    };
    fetchBackgroundVideo();
  }, []);

  return (
    <section className="relative py-16 lg:py-24 border-y border-border border overflow-hidden">
      {/* Video de fondo */}
      {backgroundVideo && (
        <video
          src={backgroundVideo}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}
      {/* Overlay oscuro para legibilidad */}
      <div className="absolute inset-0 bg-background/70 z-[1]" />
      
      {/* Contenido */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 my-[61px]">
          <div ref={logoParallax.ref as any} style={logoParallax.style} className="flex-shrink-0">
            
          </div>
          <div ref={contentParallax.ref as any} style={contentParallax.style} className="flex-1 text-center lg:text-left">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl mb-4">
              SELLER & SERVICE <span className="text-primary">OFICIAL CARTONI</span>
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl leading-tight">
              Ala Norte es representante oficial de Cartoni en Argentina. Venta, reparación y mantenimiento de
              trípodes y cabezales profesionales con garantía y repuestos originales.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-4">
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
    </section>
  );
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

      {/* Services Section */}
      <ServicesSection />

      {/* Featured Equipment Section - Full Width Slider */}
      {featuredEquipment.length > 0 && <FeaturedEquipmentSection featuredEquipment={featuredEquipment} equipmentApi={equipmentApi} setEquipmentApi={setEquipmentApi} currentEquipmentSlide={currentEquipmentSlide} setCurrentEquipmentSlide={setCurrentEquipmentSlide} />}

      {/* Productions Slider Section */}
      <ProductionsSlider />

      {/* CTA Section */}
      <CTASection />

      {/* Cartoni Official Dealer Section */}
      <CartoniSection />
    </div>;
};
export default Home;