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
      <div className="py-8 sm:py-12 lg:py-[16px] pt-[16px] pb-[16px]">
        <div
          ref={headerParallax.ref as any}
          style={headerParallax.style}
          className="container mx-auto mb-6 sm:mb-10 lg:mb-12 bg-white"
        >
          <div className="">
            <h2
              className="font-sans text-center text-muted py-0 sm:mt-6 sm:mb-10 lg:mb-14 tracking-tight leading-[1.05] text-xl my-0 text-neutral-900 font-thin mb-[16px] mt-[16px]"
              style={{ fontSize: "clamp(1.75rem, 5vw, 4rem)" }}
            >
              EQUIPOS DESTACADOS
            </h2>
          </div>
        </div>

        <Carousel className="w-full" setApi={setEquipmentApi}>
          <CarouselContent className="-ml-0">
            {featuredEquipment.map((equipment, index) => (
              <EquipmentSlide
                key={equipment.id}
                equipment={equipment}
                isActive={index === currentEquipmentSlide}
              />
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
  isActive?: boolean;
}
const EquipmentSlide = ({ equipment, isActive }: EquipmentSlideProps) => {
  const imageParallax = useParallax({
    speed: 0.08,
    direction: "up",
  });

  const contentParallax = useParallax({
    speed: 0.12,
    direction: "down",
  });

  // Counter to re-trigger the squash-bounce animation each time the slide becomes active
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => {
    if (isActive) setAnimKey((k) => k + 1);
  }, [isActive]);

  return (
    <CarouselItem className="pl-0 basis-full">
      <Link to={`/equipos?id=${equipment.id}`}>
        <div className="relative h-[62vh] sm:h-[70vh] lg:h-[78vh] overflow-hidden group cursor-pointer flex-col px-4 sm:py-10 lg:py-12 gap-6 sm:gap-8 pb-[8px] py-0 flex items-center justify-start pt-0">
          {equipment.image_url && (
            <div
              ref={imageParallax.ref as any}
              style={imageParallax.style}
              className="flex-1 w-full min-h-0 flex items-center justify-center"
            >
              <img
                key={animKey}
                src={equipment.image_url}
                alt={equipment.name}
                className="max-h-full max-w-full w-auto h-auto object-contain animate-squash-bounce origin-center will-change-transform"
              />
            </div>
          )}


          <div
            ref={contentParallax.ref as any}
            style={contentParallax.style}
            className="relative z-10 flex-col gap-3 sm:gap-4 text-center max-w-2xl flex items-center justify-center"
          >
            <h3
              className="uppercase font-sans font-bold tracking-tight leading-[1.2] text-center text-neutral-900"
              style={{ fontSize: "clamp(1.25rem, 3.5vw, 2.5rem)" }}
            >
              {equipment.name}
            </h3>

            <Button variant="hero" size="sm" className="group-hover:shadow-brutal-lg transition-shadow">
              VER DETALLES <ArrowRight className="ml-2" />
            </Button>
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
    <section className="relative border-y border-border overflow-hidden duotone-hover-group min-h-[560px]">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          alt=""
          src="/lovable-uploads/7fc2168e-0efa-4479-96f7-31ea0af80766.jpg"
          className="w-full h-full object-cover image-duotone"
        />
      </div>

      {/* Overlay opcional para mejorar lectura */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative z-10 w-full min-h-[560px] flex items-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div
          ref={contentParallax.ref as any}
          style={contentParallax.style}
          className="backdrop-blur-lg text-center px-8 pt-16 pb-8 max-w-2xl rounded-sm bg-inherit"
        >
          <h2
            className="font-sans font-semibold text-[#fbf2ee] mb-4 sm:mb-6"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            ¿TENÉS UN PROYECTO EN MENTE?
          </h2>

          <p className="text-sm sm:text-lg text-[#fbf2ee] mb-6 sm:mb-10 font-normal leading-tight">
            Contá con AL NORTE para la producción integral, armamos proyectos desde cero, presentación a fondos,
            asesorías de proyectos en desarrollo, armado de equipo completo.
          </p>

          <Button asChild variant="default" size="lg">
            <Link to="/contacto">Hablemos de tu proyecto</Link>
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
