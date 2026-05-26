import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { InstitutionalSlider } from "@/components/InstitutionalSlider";
import { ProductionsSlider } from "@/components/ProductionsSlider";
import { HomeVideoHeroSlider } from "@/components/HomeVideoHeroSlider";
import { ServicesSection } from "@/components/ServicesSection";
import { useParallax } from "@/hooks/useParallax";
import { useGalleryImages } from "@/hooks/useGalleryImages";
import { HomePreloader } from "@/components/HomePreloader";
import { useVideoPreloader } from "@/hooks/useVideoPreloader";
import { Seo } from "@/components/Seo";

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
  setCurrentEquipmentSlide,
}: FeaturedEquipmentSectionProps) => {
  const headerParallax = useParallax({
    speed: 0.2,
    direction: "down",
  });
  return (
    <section className="bg-white overflow-hidden">
      <div className="py-8 sm:py-12 lg:py-16 bg-white">
        <div
          ref={headerParallax.ref as any}
          style={headerParallax.style}
          className="container mx-auto mb-6 sm:mb-10 lg:mb-12 bg-white"
        >
          <div className="bg-white">
            <h2
              className="font-sans text-center bg-muted-foreground text-muted py-0 my-0 mt-4 sm:mt-6 mb-6 sm:mb-10 lg:mb-14 tracking-tight leading-[1.05] bg-white font-extrabold text-3xl"
              style={{ fontSize: "clamp(1.75rem, 5vw, 4rem)" }}
            >
              EQUIPOS DESTACADOS
            </h2>
          </div>
        </div>

        <Carousel className="w-full" setApi={setEquipmentApi}>
          <CarouselContent className="-ml-0">
            {featuredEquipment.map((equipment) => (
              <EquipmentSlide key={equipment.id} equipment={equipment} />
            ))}
          </CarouselContent>
        </Carousel>

        {/* Navigation dots */}
        <div className="flex justify-center gap-3 mt-4 h-2">
          {featuredEquipment.map((_, index) => (
            <button
              key={index}
              onClick={() => equipmentApi?.scrollTo(index)}
              className={`h-2 rounded-full transition-all ${index === currentEquipmentSlide ? "w-12 bg-primary" : "w-2 bg-foreground/40"}`}
              aria-label={`Ir al equipo ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Componente para cada slide de equipo con parallax
interface EquipmentSlideProps {
  equipment: any;
}
const EquipmentSlide = ({ equipment }: EquipmentSlideProps) => {
  const imageParallax = useParallax({
    speed: 0.1,
    direction: "up",
  });
  const contentParallax = useParallax({
    speed: 0.2,
    direction: "down",
  });
  return (
    <CarouselItem className="pl-0 basis-full">
      <Link to={`/equipos?id=${equipment.id}`}>
        <div className="relative h-[80vh] sm:h-[85vh] lg:h-[90vh] overflow-hidden group cursor-pointer bg-white">
          {/* Imagen ocupando todo el alto del slide */}
          <div className="absolute inset-0 overflow-hidden duotone-hover-group bg-white">
            {equipment.image_url && (
              <div
                ref={imageParallax.ref as any}
                style={imageParallax.style}
                className="absolute inset-0 w-full h-full flex items-center justify-center"
              >
                <img
                  src={equipment.image_url}
                  alt={equipment.name}
                  className="image-duotone max-h-full max-w-full object-contain"
                />
              </div>
            )}
          </div>

          {/* Nombre + CTA superpuestos al fondo de la imagen */}
          <div
            ref={contentParallax.ref as any}
            style={contentParallax.style}
            className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center justify-end pb-6 sm:pb-10 lg:pb-14 pointer-events-none"
          >
            <div className="text-center p-3 sm:p-4 max-w-2xl pointer-events-auto">
              <h3
                className="mb-3 sm:mb-4 uppercase text-center font-sans text-primary font-bold mt-0 line-clamp-2 tracking-tight leading-[1.2]"
                style={{ fontSize: "clamp(1.25rem, 3.5vw, 2.5rem)" }}
              >
                {equipment.name}
              </h3>
              <Button variant="hero" size="sm" className="group-hover:shadow-brutal-lg transition-shadow">
                VER DETALLES <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </CarouselItem>
  );
};

// Componente para la sección CTA con parallax
import ctaBackground from "@/assets/cta-background.jpg";
const CTASection = () => {
  const contentParallax = useParallax({
    speed: 0.5,
    direction: "down",
  });
  return (
    <section className="relative border-y border-border overflow-hidden flex items-center duotone-hover-group">
      {/* Background image with duotone treatment */}
      <div className="absolute inset-0 w-full">
        <img
          alt=""
          className="w-full h-full image-duotone object-cover mx-[8px] mr-0 ml-0 px-0"
          src="/lovable-uploads/7fc2168e-0efa-4479-96f7-31ea0af80766.jpg"
        />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 container mx-auto flex px-[16px] py-[128px] my-0">
        <div
          ref={contentParallax.ref as any}
          style={contentParallax.style}
          className="backdrop-blur-lg text-center text-background/ px-8 pl-[32px] pb-[32px] my-[16px] mx-[16px] pt-[64px] max-w-2xl rounded-sm bg-inherit"
        >
          <h2
            className="mb-4 sm:mb-6 my-0 px-0 font-sans my-[64px] mb-[2px] mx-0 font-semibold text-[#fbf2ee]"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            ¿TENÉS UN PROYECTO EN MENTE?
          </h2>
          <p className="text-sm mb-6 font-heading leading-tight my-[6px] sm:mb-[57px] px-0 font-normal sm:text-lg text-[#fbf2ee]">
            Contá con AL NORTE para la producción integral, armamos proyectos desde cero, presentación a fondos,
            asesorías de proyectos en desarrollo, armado de equipo completo.
          </p>
          <Button asChild variant="default" size="lg">
            <Link to="/cotizador">Hablemos de tu proyecto</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

// Componente para la sección Cartoni con parallax y video de fondo
const CartoniSection = () => {
  const { getByPageType } = useGalleryImages();
  const [videoStatus, setVideoStatus] = useState<"idle" | "loaded" | "error">("idle");
  const contentParallax = useParallax({
    speed: 0.5,
    direction: "down",
  });

  // Get cartoni_home video from consolidated gallery images
  const cartoniImages = getByPageType("cartoni_home");
  const backgroundVideo = cartoniImages[0]?.image_url || null;
  return (
    <section className="relative border-y border-border">
      {/* Contenedor del video - el video define el alto */}
      <div className="relative w-full">
        {backgroundVideo && (
          <video
            key={backgroundVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            onCanPlay={() => setVideoStatus("loaded")}
            onError={() => {
              console.warn(
                "[CartoniSection] No se pudo reproducir el video. Recomendación: MP4 H.264 + AAC. URL:",
                backgroundVideo,
              );
              setVideoStatus("error");
            }}
            className="w-full h-auto min-h-[720px] object-cover object-top"
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        )}

        {/* Overlay para legibilidad
                               <div className="pointer-events-none absolute inset-0 bg-background/0 z-[1]" />
                                */}

        {/* Contenido - superpuesto, abajo izquierda */}
        <div className="absolute inset-0 z-10 flex items-end">
          <div className="container mx-auto px-4 pb-16">
            <div
              ref={contentParallax.ref as any}
              style={contentParallax.style}
              className="max-w-2xl p-6 backdrop-blur-lg py-[68px] max-w-2xl mx-[16px] px-[24px] rounded-sm"
            >
              <h2 className="mb-4 text-foreground font-sans font-thin" style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}>
                SELLER & SERVICE <span className="text-foreground">OFICIAL CARTONI</span>
              </h2>
              <p className="text-2x1-foreground mb-6 leading-tight font-medium text-base">
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
    </section>
  );
};
const Home = () => {
  const [featuredEquipment, setFeaturedEquipment] = useState<any[]>([]);
  const [equipmentApi, setEquipmentApi] = useState<CarouselApi>();
  const [currentEquipmentSlide, setCurrentEquipmentSlide] = useState(0);
  const { progress, isComplete, isLoading } = useVideoPreloader();

  useEffect(() => {
    supabase
      .from("equipment")
      .select("*")
      .eq("featured", true)
      .order("order_index")
      .then(({ data }) => {
        if (data) setFeaturedEquipment(data);
      });
  }, []);
  useEffect(() => {
    if (!equipmentApi) return;
    equipmentApi.on("select", () => {
      setCurrentEquipmentSlide(equipmentApi.selectedScrollSnap());
    });
  }, [equipmentApi]);

  // Auto-play featured equipment slider
  useEffect(() => {
    if (!equipmentApi || featuredEquipment.length <= 1) return;
    const interval = setInterval(() => {
      if (equipmentApi.canScrollNext()) {
        equipmentApi.scrollNext();
      } else {
        equipmentApi.scrollTo(0);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [equipmentApi, featuredEquipment.length]);

  // Show preloader while videos are loading
  if (isLoading) {
    return <HomePreloader progress={progress} isComplete={isComplete} />;
  }
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Ala Norte — Rental audiovisual y productora en Buenos Aires"
        description="Rental de cámaras, ópticas, iluminación y grip. Estudios, sala de sonido y producción audiovisual integral en Vicente López, Buenos Aires."
        path="/"
      />
      {/* Institutional Slider - Before Hero */}
      <InstitutionalSlider pageType="home" />

      {/* Hero Section - Video Slider with CTAs */}
      <HomeVideoHeroSlider />

      {/* Featured Equipment Section - Full Width Slider */}
      {featuredEquipment.length > 0 && (
        <FeaturedEquipmentSection
          featuredEquipment={featuredEquipment}
          equipmentApi={equipmentApi}
          setEquipmentApi={setEquipmentApi}
          currentEquipmentSlide={currentEquipmentSlide}
          setCurrentEquipmentSlide={setCurrentEquipmentSlide}
        />
      )}

      {/* Services Section */}
      <ServicesSection />
      {/* CTA Section */}
      <CTASection />
      {/* Cartoni Official Dealer Section */}
      <CartoniSection />

      {/* Productions Slider Section */}
      <ProductionsSlider />
    </div>
  );
};
export default Home;
