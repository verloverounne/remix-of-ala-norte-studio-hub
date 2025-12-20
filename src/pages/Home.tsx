import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

const spaces360 = [
  { id: 1, title: "GALERÍA DE FILMACIÓN", subtitle: "150 m²" },
  { id: 2, title: "SALA DE SONIDO", subtitle: "ProTools Ultimate" },
  { id: 3, title: "ESPACIO SOCIAL & COCINA", subtitle: "Cocina Equipada" },
  { id: 4, title: "BAÑO DE PRODUCCIÓN", subtitle: "Luz Especial para Maquillaje y Peinado" },
];

const Home = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [featuredEquipment, setFeaturedEquipment] = useState<any[]>([]);
  const [equipmentApi, setEquipmentApi] = useState<CarouselApi>();
  const [currentEquipmentSlide, setCurrentEquipmentSlide] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollLeft = scrollContainerRef.current.scrollLeft;
        const cards = scrollContainerRef.current.querySelectorAll(".space-card");
        cards.forEach((card, index) => {
          const htmlCard = card as HTMLElement;
          const offset = scrollLeft * (0.5 + index * 0.1);
          htmlCard.style.transform = `translateX(-${offset * 0.3}px)`;
        });
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    // Fetch featured equipment
    const fetchFeaturedEquipment = async () => {
      const { data } = await supabase.from("equipment").select("*").eq("featured", true).limit(6);
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

  return (
    <div className="min-h-screen bg-background pt-14 sm:pt-16">
      {/* Hero Section - Full Slider with 360 Tours */}
      <section className="relative h-[60vh] sm:h-[80vh] lg:h-screen overflow-hidden border-b-4 border-foreground">
        <div className="absolute inset-0 bg-foreground/95" />

        <div
          ref={scrollContainerRef}
          className="relative z-10 h-full overflow-x-auto overflow-y-hidden scroll-smooth hide-scrollbar"
          style={{ scrollSnapType: "x mandatory" }}
        >
          <div className="flex h-full">
            {spaces360.map((space, index) => (
              <div
                key={space.id}
                className="space-card flex-shrink-0 w-screen h-full relative overflow-hidden"
                style={{
                  scrollSnapAlign: "start",
                  transition: "transform 0.1s ease-out",
                }}
              >
                {/* Iframe placeholder for 360 tour */}
                <div className="w-full h-full bg-gray-dark/50 flex items-center justify-center relative">
                  <div className="text-center z-10 relative p-4 sm:p-6 lg:p-8">
                    <p className="font-heading text-background text-3xl sm:text-4xl md:text-5xl lg:text-7xl mb-2 sm:mb-4 font-bold">
                      {space.title}
                    </p>
                    <p className="font-heading text-background/80 text-lg sm:text-xl md:text-2xl lg:text-4xl mb-4 sm:mb-6">
                      {space.subtitle}
                    </p>
                    <div className="border-2 sm:border-4 border-background/30 rounded-lg p-3 sm:p-4 lg:p-6 bg-foreground/30 backdrop-blur-sm">
                      <p className="text-background/60 text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">
                        Iframe Placeholder para Recorrido 360°
                      </p>
                      <p className="text-background/40 text-xs sm:text-sm">
                        Aquí se integrará el tour virtual interactivo
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-6 lg:mt-8 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
                      <Button asChild variant="hero" size="sm" className="sm:text-base">
                        <Link to="/espacios">VER ESPACIOS</Link>
                      </Button>
                      <Button asChild variant="secondary" size="sm" className="sm:text-base">
                        <Link to="/equipos">
                          VER EQUIPOS <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  {/* Future iframe will go here */}
                  {/* <iframe src="360-tour-url" className="w-full h-full" /> */}
                  <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 via-transparent to-foreground/40" />
                </div>

                {/* Navigation indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                  {spaces360.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full transition-all ${
                        i === index ? "w-12 bg-primary" : "w-2 bg-background/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Featured Equipment Section - Full Width Slider */}
      {featuredEquipment.length > 0 && (
        <section className="relative border-y-4 border-foreground bg-muted/30 overflow-hidden">
          <div className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 mb-8 sm:mb-12">
              <div className="border-l-4 sm:border-l-8 border-primary pl-4 sm:pl-8">
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-brutal mb-2 sm:mb-4">EQUIPOS DESTACADOS</h2>
                <p className="text-base sm:text-lg lg:text-xl text-muted-foreground font-heading">
                  TECNOLOGÍA DE PRIMER NIVEL PARA TUS PROYECTOS
                </p>
              </div>
            </div>

            <Carousel className="w-full" setApi={setEquipmentApi}>
              <CarouselContent className="-ml-0">
                {featuredEquipment.map((equipment) => (
                  <CarouselItem key={equipment.id} className="pl-0 basis-full">
                    <Link to={`/equipos?id=${equipment.id}`}>
                      <div className="relative h-[70vh] bg-foreground/95 overflow-hidden group cursor-pointer">
                        {equipment.image_url && (
                          <img
                            src={equipment.image_url}
                            alt={equipment.name}
                            className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity"
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center z-10 p-8 max-w-4xl">
                            <h3 className="font-heading text-6xl md:text-8xl mb-6 uppercase text-background">
                              {equipment.name}
                            </h3>
                            {equipment.featured_copy && (
                              <p className="text-xl md:text-2xl text-background/80 mb-8 font-heading">
                                {equipment.featured_copy}
                              </p>
                            )}
                            <div className="flex items-center justify-center gap-6 mb-6">
                              <span className="font-heading text-4xl text-primary bg-background/90 px-8 py-4 border-3 border-background shadow-brutal">
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
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Navigation dots */}
            <div className="flex justify-center gap-3 mt-8">
              {featuredEquipment.map((_, index) => (
                <button
                  key={index}
                  onClick={() => equipmentApi?.scrollTo(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentEquipmentSlide ? "w-12 bg-primary" : "w-2 bg-foreground/40"
                  }`}
                  aria-label={`Ir al equipo ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 sm:py-20 lg:py-32 bg-primary text-primary-foreground relative border-y-4 border-foreground">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-brutal mb-4 sm:mb-6 lg:mb-8">
              ¿LISTO PARA TU
              <br />
              PRÓXIMO PROYECTO?
            </h2>
            <p className="text-base sm:text-lg lg:text-2xl mb-6 sm:mb-8 lg:mb-12 font-heading">
              OBTÉN UNA COTIZACIÓN PERSONALIZADA EN MINUTOS.
              <br className="hidden sm:block" />
              NUESTRO EQUIPO ESTÁ LISTO PARA AYUDARTE.
            </p>
            <Button asChild variant="outline" size="lg" className="bg-background text-foreground">
              <Link to="/cotizador">COTIZAR PROYECTO</Link>
            </Button>
          </div>
        </div>
      </section>





      {/* Instagram Stories Section - Full Width */}
      <section className="relative border-y-4 border-foreground bg-foreground overflow-hidden">
        <div className="py-20">
          <div className="container mx-auto px-4 mb-12">
            <div className="border-l-8 border-primary pl-8">
              <h2 className="font-heading text-brutal mb-4 text-background">SIGUENOS EN INSTAGRAM</h2>
              <p className="text-xl text-background/80 font-heading">NUESTROS ÚLTIMOS PROYECTOS Y DETRÁS DE CÁMARAS</p>
            </div>
          </div>

          <div className="relative">
            <Carousel className="w-full">
              <CarouselContent className="-ml-0">
                {[1, 2, 3, 4, 5].map((story) => (
                  <CarouselItem key={story} className="pl-0 basis-full md:basis-1/3 lg:basis-1/4">
                    <div className="relative aspect-[9/16] bg-muted overflow-hidden group cursor-pointer border-4 border-background">
                      <img
                        src={`https://images.unsplash.com/photo-${1492691527719 + story}-6dd46a0f1123?w=600&h=900&fit=crop`}
                        alt={`Instagram Story ${story}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <p className="text-background font-heading text-sm uppercase">Ver en Instagram</p>
                        </div>
                      </div>
                      <div className="absolute top-4 left-4 right-4 flex gap-1">
                        <div className="h-1 flex-1 bg-background/40 rounded-full overflow-hidden">
                          <div className="h-full bg-background w-full"></div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 -translate-x-1/2 bg-background text-foreground" />
              <CarouselNext className="right-0 translate-x-1/2 bg-background text-foreground" />
            </Carousel>
          </div>
        </div>
      </section>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Home;
