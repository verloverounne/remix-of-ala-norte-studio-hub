import { Link } from "react-router-dom";
import { Camera, Video, Mic, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import heroImage from "@/assets/hero-studio.jpg";

const services = [
  {
    icon: Camera,
    title: "Cámaras Profesionales",
    description: "Equipos de cine y fotografía de última generación para tus proyectos.",
  },
  {
    icon: Video,
    title: "Producción Audiovisual",
    description: "Servicios completos de producción, desde pre hasta post producción.",
  },
  {
    icon: Mic,
    title: "Audio Profesional",
    description: "Micrófonos, grabadoras y equipos de sonido de primer nivel.",
  },
  {
    icon: Lightbulb,
    title: "Iluminación",
    description: "Sistema completo de iluminación para cualquier tipo de proyecto.",
  },
];

const testimonials = [
  {
    name: "María González",
    role: "Directora de Cine",
    content: "Ala Norte tiene el mejor equipamiento y servicio. Siempre profesionales y confiables.",
  },
  {
    name: "Juan Pérez",
    role: "Fotógrafo",
    content: "Los espacios son increíbles y el equipo técnico es de primer nivel. Altamente recomendado.",
  },
  {
    name: "Laura Martínez",
    role: "Productora",
    content: "Trabajo con Ala Norte desde hace años. Su compromiso y calidad son excepcionales.",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 gradient-hero" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center text-primary-foreground">
          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 animate-fade-in-up">
            Rental Audiovisual
            <br />
            <span className="text-primary-lighter">Profesional</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Equipos de vanguardia, espacios profesionales y servicios de producción de primer nivel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Button asChild variant="hero" size="lg">
              <Link to="/equipos">
                Ver Equipos <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/cotizador">Cotizar Ahora</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold mb-4">
              Nuestros Servicios
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Soluciones completas para tus proyectos audiovisuales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card
                key={index}
                className="hover-lift transition-all duration-300 border-2 hover:border-primary"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-heading font-bold mb-6">
            ¿Listo para tu próximo proyecto?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Obtén una cotización personalizada en minutos. Nuestro equipo está listo para ayudarte.
          </p>
          <Button asChild variant="outline" size="lg">
            <Link to="/cotizador">Cotizar Proyecto</Link>
          </Button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold mb-4">
              Lo que dicen nuestros clientes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover-lift">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
