import { Link } from "react-router-dom";
import { Camera, Video, Mic, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRef, useEffect } from "react";

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

      {/* Testimonials Section */}
      <section className="py-32 bg-background relative">
        <div className="container mx-auto px-4 relative">
          <div className="mb-20 border-l-8 border-secondary pl-8">
            <h2 className="font-heading text-brutal mb-4">TESTIMONIOS</h2>
            <p className="text-xl text-muted-foreground font-heading">
              LO QUE DICEN NUESTROS CLIENTES
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-none">
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
            ))}
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
