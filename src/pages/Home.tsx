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
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
    title: "AUDIO PROFESIONAL",
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
  { id: 3, title: "ESPACIO FOTOGRÁFICO", subtitle: "Ciclorama 6x4m" },
  { id: 4, title: "ESTUDIO PODCAST", subtitle: "Equipado" },
];

const Home = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [featuredEquipment, setFeaturedEquipment] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);

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
      const { data } = await supabase
        .from('equipment')
        .select('*')
        .eq('featured', true)
        .limit(6);
      if (data) setFeaturedEquipment(data);
    };
    fetchFeaturedEquipment();

    // Mock blog posts (replace with actual data later)
    setBlogPosts([
      {
        id: 1,
        title: "Cómo elegir la cámara perfecta para tu próximo proyecto",
        image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=500&fit=crop",
        date: "10 Nov 2025"
      },
      {
        id: 2,
        title: "Entrevista: Directores de Fotografía Argentinos",
        image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=500&fit=crop",
        date: "5 Nov 2025"
      },
      {
        id: 3,
        title: "Behind the Scenes: Rodaje en Bariloche",
        image: "https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?w=800&h=500&fit=crop",
        date: "1 Nov 2025"
      }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Section - Full Slider with 360 Tours */}
      <section className="relative h-screen overflow-hidden border-b-4 border-foreground">
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
                  transition: "transform 0.1s ease-out" 
                }}
              >
                {/* Iframe placeholder for 360 tour */}
                <div className="w-full h-full bg-gray-dark/50 flex items-center justify-center relative">
                  <div className="text-center z-10 relative p-8">
                    <p className="font-heading text-background text-5xl md:text-7xl mb-4 font-bold">
                      {space.title}
                    </p>
                    <p className="font-heading text-background/80 text-2xl md:text-4xl mb-6">
                      {space.subtitle}
                    </p>
                    <div className="border-4 border-background/30 rounded-lg p-6 bg-foreground/30 backdrop-blur-sm">
                      <p className="text-background/60 text-lg mb-2">
                        Iframe Placeholder para Recorrido 360°
                      </p>
                      <p className="text-background/40 text-sm">
                        Aquí se integrará el tour virtual interactivo
                      </p>
                    </div>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                      <Button asChild variant="hero" size="lg">
                        <Link to="/espacios">VER ESPACIOS</Link>
                      </Button>
                      <Button asChild variant="secondary" size="lg">
                        <Link to="/equipos">
                          VER EQUIPOS <ArrowRight className="ml-2" />
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
                        i === index ? 'w-12 bg-primary' : 'w-2 bg-background/40'
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
      <section className="py-32 bg-background relative">
        <div className="container mx-auto px-4 relative">
          <div className="mb-20 border-l-8 border-secondary pl-8">
            <h2 className="font-heading text-brutal mb-4">SERVICIOS</h2>
            <p className="text-xl text-muted-foreground font-heading max-w-2xl">
              SOLUCIONES COMPLETAS PARA TUS PROYECTOS AUDIOVISUALES
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Link key={index} to={service.link}>
                <Card className="group hover:shadow-brutal-red hover:-translate-x-2 hover:-translate-y-2 transition-none h-full cursor-pointer">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 border-4 border-foreground bg-primary flex items-center justify-center mb-6 shadow-brutal-sm">
                      <service.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="font-heading text-xl mb-4 uppercase tracking-wider">
                      {service.title}
                    </h3>
                    <p className="font-heading text-sm text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Equipment Section */}
      {featuredEquipment.length > 0 && (
        <section className="py-32 bg-muted/30 relative border-y-4 border-foreground">
          <div className="container mx-auto px-4 relative">
            <div className="mb-20 border-l-8 border-primary pl-8">
              <h2 className="font-heading text-brutal mb-4">EQUIPOS DESTACADOS</h2>
              <p className="text-xl text-muted-foreground font-heading">
                TECNOLOGÍA DE PRIMER NIVEL PARA TUS PROYECTOS
              </p>
            </div>

            <Carousel className="w-full">
              <CarouselContent>
                {featuredEquipment.map((equipment) => (
                  <CarouselItem key={equipment.id} className="md:basis-1/2 lg:basis-1/3">
                    <Link to={`/equipos?id=${equipment.id}`}>
                      <Card className="group hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-none h-full">
                        <CardContent className="p-6">
                          <div className="aspect-video bg-muted rounded border-2 border-foreground mb-4 overflow-hidden">
                            {equipment.image_url && (
                              <img 
                                src={equipment.image_url} 
                                alt={equipment.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <h3 className="font-heading text-lg mb-2 uppercase">
                            {equipment.name}
                          </h3>
                          {equipment.featured_copy && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {equipment.featured_copy}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="font-heading text-xl text-primary">
                              ${equipment.price_per_day}/día
                            </span>
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-32 bg-primary text-primary-foreground relative border-y-4 border-foreground">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-heading text-brutal mb-8">
              ¿LISTO PARA TU
              <br />
              PRÓXIMO PROYECTO?
            </h2>
            <p className="text-2xl mb-12 font-heading">
              OBTÉN UNA COTIZACIÓN PERSONALIZADA EN MINUTOS.
              <br />
              NUESTRO EQUIPO ESTÁ LISTO PARA AYUDARTE.
            </p>
            <Button asChild variant="outline" size="lg" className="bg-background text-foreground">
              <Link to="/cotizador">COTIZAR PROYECTO</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-32 bg-background relative">
        <div className="container mx-auto px-4 relative">
          <div className="mb-20 text-center">
            <h2 className="font-heading text-brutal mb-6">MÁS QUE EQUIPOS,<br />SOMOS TU EQUIPO</h2>
            <p className="text-xl text-muted-foreground font-heading max-w-3xl mx-auto mb-16">
              En Ala Norte, combinamos tecnología de punta con experiencia profesional 
              para llevar tus proyectos audiovisuales al siguiente nivel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-2 border-foreground shadow-brutal">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 border-4 border-foreground bg-primary flex items-center justify-center mx-auto mb-6 shadow-brutal-sm">
                  <Music className="h-10 w-10 text-primary-foreground" />
                </div>
                <h3 className="font-heading text-2xl mb-4 uppercase">SONIDO</h3>
                <p className="text-muted-foreground font-heading text-sm">
                  Especialistas en captura y postproducción de audio profesional para cine, 
                  música y contenido digital.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-foreground shadow-brutal">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 border-4 border-foreground bg-primary flex items-center justify-center mx-auto mb-6 shadow-brutal-sm">
                  <Camera className="h-10 w-10 text-primary-foreground" />
                </div>
                <h3 className="font-heading text-2xl mb-4 uppercase">FOTOGRAFÍA</h3>
                <p className="text-muted-foreground font-heading text-sm">
                  Equipo fotográfico de última generación para proyectos comerciales, 
                  cinematográficos y artísticos.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-foreground shadow-brutal">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 border-4 border-foreground bg-primary flex items-center justify-center mx-auto mb-6 shadow-brutal-sm">
                  <Film className="h-10 w-10 text-primary-foreground" />
                </div>
                <h3 className="font-heading text-2xl mb-4 uppercase">POSTPRODUCCIÓN</h3>
                <p className="text-muted-foreground font-heading text-sm">
                  Espacios equipados y tecnología avanzada para edición, color grading 
                  y finalización de proyectos.
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

      {/* Blog Section */}
      {blogPosts.length > 0 && (
        <section className="py-32 bg-muted/30 relative border-y-4 border-foreground">
          <div className="container mx-auto px-4 relative">
            <div className="mb-20 border-l-8 border-secondary pl-8">
              <h2 className="font-heading text-brutal mb-4">ÚLTIMAS NOVEDADES</h2>
              <p className="text-xl text-muted-foreground font-heading">
                CONSEJOS, TUTORIALES Y CASOS DE ÉXITO
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {blogPosts.map((post) => (
                <Card key={post.id} className="border-2 border-foreground shadow-brutal overflow-hidden hover:shadow-brutal-lg transition-shadow">
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <p className="text-xs text-muted-foreground mb-2 font-heading">{post.date}</p>
                    <h3 className="font-heading text-lg mb-4 line-clamp-2">
                      {post.title}
                    </h3>
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
            <p className="text-xl text-muted-foreground font-heading">
              LO QUE DICEN NUESTROS CLIENTES
            </p>
          </div>

          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="border-2 border-foreground shadow-brutal h-full">
                    <CardContent className="p-8">
                      <div className="mb-6">
                        <div className="text-primary font-heading text-6xl leading-none mb-4">"</div>
                        <p className="font-heading text-sm leading-relaxed">
                          {testimonial.content}
                        </p>
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
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
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
