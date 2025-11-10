import { Link } from "react-router-dom";
import { Camera, Video, Mic, Lightbulb, ArrowRight, Users, Music, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const services = [
  {
    icon: Camera,
    title: "CÁMARAS PROFESIONALES",
    description: "Equipos de cine y fotografía de última generación para tus proyectos.",
    link: "/equipos?category=camaras",
  },
  {
    icon: Video,
    title: "PRODUCCIÓN Y POSTPRODUCCIÓN AUDIOVISUAL",
    description: "Servicios completos de producción, desde pre hasta post producción.",
    link: "/espacios",
  },
  {
    icon: Mic,
    title: "SONIDO PROFESIONAL",
    description: "Micrófonos, grabadoras y equipos de sonido de primer nivel.",
    link: "/equipos?category=audio",
  },
  {
    icon: Lightbulb,
    title: "ILUMINACIÓN",
    description: "Sistema completo de iluminación para cualquier tipo de proyecto.",
    link: "/equipos?category=iluminacion",
  },
];

const testimonials = [
  {
    name: "MARÍA GONZÁLEZ",
    role: "Directora de Cine",
    content: "Ala Norte tiene el mejor equipamiento y servicio. Siempre profesionales y confiables.",
  },
  {
    name: "JUAN PÉREZ",
    role: "Fotógrafo",
    content: "Los espacios son increíbles y el equipo técnico es de primer nivel. Altamente recomendado.",
  },
  {
    name: "LAURA MARTÍNEZ",
    role: "Productora",
    content: "Trabajo con Ala Norte desde hace años. Su compromiso y calidad son excepcionales.",
  },
];

const spaces360 = [
  { id: 1, title: "GALERÍA DE FILMACIÓN", subtitle: "150 m²" },
  { id: 2, title: "SALA DE SONIDO", subtitle: "ProTools Ultimate" },
  { id: 3, title: "ESPACIO SOCIAL & COCINA", subtitle: "Cocina Equipada" },
  { id: 4, title: "BAÑO DE PRODUCCIÓN", subtitle: "Luz Especial para Maquillaje y Peinado" },
];

const Home = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [featuredEquipment, setFeaturedEquipment] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
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

    // Mock blog posts (replace with actual data later)
    setBlogPosts([
      {
        id: 1,
        title: "Cómo elegir la cámara perfecta para tu próximo proyecto",
        image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=500&fit=crop",
        date: "10 Nov 2025",
      },
      {
        id: 2,
        title: "Entrevista: Directores de Fotografía Argentinos",
        image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=500&fit=crop",
        date: "5 Nov 2025",
      },
      {
        id: 3,
        title: "Behind the Scenes: Rodaje en Bariloche",
        image: "https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?w=800&h=500&fit=crop",
        date: "1 Nov 2025",
      },
    ]);
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

      {/* Services Section */}
      <section className="py-12 sm:py-16 lg:py-32 bg-background relative">
        <div className="container mx-auto px-4 relative">
          <div className="mb-8 sm:mb-12 lg:mb-20 border-l-4 sm:border-l-8 border-secondary pl-4 sm:pl-8">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-brutal mb-2 sm:mb-4">SERVICIOS</h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground font-heading max-w-2xl">
              SOLUCIONES COMPLETAS PARA TUS PROYECTOS AUDIOVISUALES
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {services.map((service, index) => (
              <Link key={index} to={service.link}>
                <Card className="group hover:shadow-brutal-red hover:-translate-x-2 hover:-translate-y-2 transition-none h-full cursor-pointer">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 border-4 border-foreground bg-primary flex items-center justify-center mb-6 shadow-brutal-sm">
                      <service.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="font-heading text-xl mb-4 uppercase tracking-wider">{service.title}</h3>
                    <p className="font-heading text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                  </CardContent>
                </Card>
              </Link>
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

      {/* About Us Section - Team Profiles */}
      <section className="py-12 sm:py-20 lg:py-32 bg-background relative">
        <div className="container mx-auto px-4 relative">
          <div className="mb-12 sm:mb-16 lg:mb-20 border-l-4 sm:border-l-8 border-secondary pl-4 sm:pl-8">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-brutal mb-2 sm:mb-4">NUESTRO EQUIPO</h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground font-heading max-w-3xl">
              Somos el equipo de Ala Norte.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-16">
            <Card className="border-3 border-foreground shadow-brutal overflow-hidden">
              <div className="aspect-square bg-muted overflow-hidden border-b-3 border-foreground">
                <img
                  src="https://images.unsplash.com/"
                  alt="Especialista en Sonido"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-8 text-center">
                <h3 className="font-heading text-2xl mb-2 uppercase">Persona 0</h3>
                <div className="w-16 h-1 bg-primary mx-auto mb-4"></div>
                <p className="text-primary font-heading text-lg mb-4 uppercase">Sonido</p>
                <p className="text-muted-foreground font-heading text-sm leading-relaxed">
                  Especialista en captura y postproducción de audio profesional con más de 15 años de experiencia en
                  cine, música y contenido digital.
                </p>
              </CardContent>
            </Card>

            <Card className="border-3 border-foreground shadow-brutal overflow-hidden">
              <div className="aspect-square bg-muted overflow-hidden border-b-3 border-foreground">
                <img
                  src="https://images.unsplash.com/"
                  alt="Especialista en Fotografía"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-8 text-center">
                <h3 className="font-heading text-2xl mb-2 uppercase">persona1</h3>
                <div className="w-16 h-1 bg-primary mx-auto mb-4"></div>
                <p className="text-primary font-heading text-lg mb-4 uppercase">Cámara</p>
                <p className="text-muted-foreground font-heading text-sm leading-relaxed">
                  Directora de fotografía con experiencia en proyectos comerciales, cinematográficos y artísticos de
                  alto nivel.
                </p>
              </CardContent>
            </Card>

            <Card className="border-3 border-foreground shadow-brutal overflow-hidden">
              <div className="aspect-square bg-muted overflow-hidden border-b-3 border-foreground">
                <img
                  src="https://images.unsplash.com/"
                  alt="Especialista en Postproducción"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-8 text-center">
                <h3 className="font-heading text-2xl mb-2 uppercase">Persona 2</h3>
                <div className="w-16 h-1 bg-primary mx-auto mb-4"></div>
                <p className="text-primary font-heading text-lg mb-4 uppercase">Postproducción</p>
                <p className="text-muted-foreground font-heading text-sm leading-relaxed">
                  Experto en edición, color grading y finalización de proyectos con tecnología de última generación.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/contacto">CONTACTANOS</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Tabs Section - Diferenciales */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="mb-8 sm:mb-10 border-l-4 border-secondary pl-4 sm:pl-6">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-brutal mb-2 sm:mb-4">DIFERENCIALES</h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground font-heading">
              Lo que nos hace únicos en la industria
            </p>
          </div>

          <Tabs defaultValue="galeria" className="w-full">
            <TabsList className="w-full grid grid-cols-2 lg:grid-cols-4 h-auto gap-2 bg-transparent mb-6">
              <TabsTrigger
                value="galeria"
                className="font-heading text-sm sm:text-base py-3 border border-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Galería
              </TabsTrigger>
              <TabsTrigger
                value="red"
                className="font-heading text-sm sm:text-base py-3 border border-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Red Federal
              </TabsTrigger>
              <TabsTrigger
                value="talleres"
                className="font-heading text-sm sm:text-base py-3 border border-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Talleres
              </TabsTrigger>
              <TabsTrigger
                value="soporte"
                className="font-heading text-sm sm:text-base py-3 border border-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Soporte
              </TabsTrigger>
            </TabsList>

            <TabsContent value="galeria" className="mt-0">
              <Card className="border-2 border-foreground">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-heading text-xl sm:text-2xl lg:text-3xl mb-4">Galería de Producciones</h3>
                  <p className="text-sm sm:text-base text-muted-foreground font-heading mb-6">
                    Espacios profesionales diseñados específicamente para producciones de alto nivel. Desde sets de
                    filmación hasta estudios de fotografía completamente equipados.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="aspect-video bg-muted border border-foreground"></div>
                    <div className="aspect-video bg-muted border border-foreground"></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="red" className="mt-0">
              <Card className="border-2 border-foreground">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-heading text-xl sm:text-2xl lg:text-3xl mb-4">Red Federal</h3>
                  <p className="text-sm sm:text-base text-muted-foreground font-heading mb-6">
                    Presencia en todo el país con equipos de última generación. Accede a nuestros servicios desde
                    cualquier punto de Argentina con la misma calidad y profesionalismo.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 border border-foreground bg-background">
                      <p className="font-heading text-base font-bold mb-1">Buenos Aires</p>
                      <p className="text-xs text-muted-foreground">Centro principal</p>
                    </div>
                    <div className="p-4 border border-foreground bg-background">
                      <p className="font-heading text-base font-bold mb-1">Córdoba</p>
                      <p className="text-xs text-muted-foreground">Hub central</p>
                    </div>
                    <div className="p-4 border border-foreground bg-background">
                      <p className="font-heading text-base font-bold mb-1">Mendoza</p>
                      <p className="text-xs text-muted-foreground">Sede regional</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="talleres" className="mt-0">
              <Card className="border-2 border-foreground">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-heading text-xl sm:text-2xl lg:text-3xl mb-4">Talleres y Capacitación</h3>
                  <p className="text-sm sm:text-base text-muted-foreground font-heading mb-6">
                    Formación continua con profesionales de la industria. Aprende las últimas técnicas y tendencias en
                    producción audiovisual con nuestros workshops especializados.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-4 p-4 border border-foreground bg-background">
                      <Camera className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-heading font-bold text-sm mb-1">Cinematografía Avanzada</p>
                        <p className="text-xs text-muted-foreground">Técnicas profesionales de cámara y composición</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 border border-foreground bg-background">
                      <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-heading font-bold text-sm mb-1">Iluminación Profesional</p>
                        <p className="text-xs text-muted-foreground">Domina el arte de la luz en producciones</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 border border-foreground bg-background">
                      <Mic className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-heading font-bold text-sm mb-1">Audio para Cine</p>
                        <p className="text-xs text-muted-foreground">Captura y diseño sonoro de alto nivel</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="soporte" className="mt-0">
              <Card className="border-2 border-foreground">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-heading text-xl sm:text-2xl lg:text-3xl mb-4">Soporte 24/7</h3>
                  <p className="text-sm sm:text-base text-muted-foreground font-heading mb-6">
                    Asistencia técnica especializada disponible cuando la necesites. Nuestro equipo de expertos está
                    listo para resolver cualquier inconveniente durante tu producción.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border-2 border-primary bg-primary/5">
                      <h4 className="font-heading text-base font-bold mb-2">Asistencia Técnica</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Soporte inmediato para configuración y troubleshooting de equipos durante tu alquiler.
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/soporte">Más Info</Link>
                      </Button>
                    </div>
                    <div className="p-4 border-2 border-foreground bg-background">
                      <h4 className="font-heading text-base font-bold mb-2">Asesoramiento</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Consultoría sobre el mejor equipamiento para tu proyecto específico.
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/contacto">Contactar</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Blog Section */}
      {blogPosts.length > 0 && (
        <section className="py-12 sm:py-20 lg:py-32 bg-muted/30 relative border-y-4 border-foreground">
          <div className="container mx-auto px-4 relative">
            <div className="mb-8 sm:mb-12 lg:mb-20 border-l-4 sm:border-l-8 border-secondary pl-4 sm:pl-8">
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-brutal mb-2 sm:mb-4">ÚLTIMAS NOVEDADES</h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground font-heading">
                CONSEJOS, TUTORIALES Y CASOS DE ÉXITO
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
              {blogPosts.map((post) => (
                <Card
                  key={post.id}
                  className="border-2 border-foreground shadow-brutal overflow-hidden hover:shadow-brutal-lg transition-shadow"
                >
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-6">
                    <p className="text-xs text-muted-foreground mb-2 font-heading">{post.date}</p>
                    <h3 className="font-heading text-lg mb-4 line-clamp-2">{post.title}</h3>
                    <Button asChild variant="outline" size="sm" className="w-full font-heading">
                      <Link to="/blog">LEER MÁS</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button asChild variant="default" size="lg">
                <Link to="/blog">
                  VER TODO EL BLOG <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section className="py-32 bg-background relative">
        <div className="container mx-auto px-4 relative">
          <div className="mb-20 border-l-8 border-secondary pl-8">
            <h2 className="font-heading text-brutal mb-4">TESTIMONIOS</h2>
            <p className="text-xl text-muted-foreground font-heading">LO QUE DICEN NUESTROS CLIENTES</p>
          </div>

          <div className="relative">
            <Carousel className="w-full max-w-5xl mx-auto">
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <Card className="border-2 border-foreground shadow-brutal h-full">
                      <CardContent className="p-8">
                        <div className="mb-6">
                          <div className="text-primary font-heading text-6xl leading-none mb-4">"</div>
                          <p className="font-heading text-sm leading-relaxed">{testimonial.content}</p>
                        </div>
                        <div className="border-t-3 border-foreground pt-4">
                          <p className="font-heading text-lg uppercase">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground font-heading">{testimonial.role}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 -translate-x-1/2" />
              <CarouselNext className="right-0 translate-x-1/2" />
            </Carousel>
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
