import { Link } from "react-router-dom";
import { Camera, Video, Mic, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@/assets/hero-studio.jpg";

const services = [
  {
    icon: Camera,
    title: "CÁMARAS PROFESIONALES",
    description: "Equipos de cine y fotografía de última generación para tus proyectos.",
  },
  {
    icon: Video,
    title: "PRODUCCIÓN AUDIOVISUAL",
    description: "Servicios completos de producción, desde pre hasta post producción.",
  },
  {
    icon: Mic,
    title: "AUDIO PROFESIONAL",
    description: "Micrófonos, grabadoras y equipos de sonido de primer nivel.",
  },
  {
    icon: Lightbulb,
    title: "ILUMINACIÓN",
    description: "Sistema completo de iluminación para cualquier tipo de proyecto.",
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

const Home = () => {
  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Section Brutalista */}
      <section className="relative h-[90vh] overflow-hidden border-b-4 border-foreground">
        <div
          className="absolute inset-0 bg-cover bg-center grayscale"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-foreground/85" />
          <div className="absolute inset-0 grid-brutal opacity-10" />
        </div>

        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-4xl">
            <div className="border-l-8 border-primary pl-8 mb-8">
              <h1 className="text-brutal text-background text-8xl md:text-[12rem] leading-none mb-4">
                RENTAL
                <br />
                AUDIOVISUAL
              </h1>
            </div>
            <p className="text-2xl md:text-3xl text-secondary font-mono mb-12 max-w-2xl">
              EQUIPOS DE VANGUARDIA / ESPACIOS PROFESIONALES / PRODUCCIÓN DE PRIMER NIVEL
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Button asChild variant="hero" size="lg">
                <Link to="/equipos">
                  VER EQUIPOS <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/cotizador">COTIZAR AHORA</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Número decorativo brutal */}
        <div className="absolute bottom-8 right-8 text-primary opacity-20 font-heading text-[200px] leading-none">
          01
        </div>
      </section>

      {/* Services Section Brutal */}
      <section className="py-32 bg-background relative">
        <div className="absolute inset-0 grid-brutal opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="mb-20 border-l-8 border-secondary pl-8">
            <h2 className="text-brutal mb-4">SERVICIOS</h2>
            <p className="text-xl text-muted-foreground font-mono max-w-2xl">
              SOLUCIONES COMPLETAS PARA TUS PROYECTOS AUDIOVISUALES
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                className="group hover:shadow-brutal-red hover:-translate-x-2 hover:-translate-y-2 transition-none"
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 border-4 border-foreground bg-primary flex items-center justify-center mb-6 shadow-brutal-sm">
                    <service.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-heading text-xl mb-4 uppercase tracking-wider">
                    {service.title}
                  </h3>
                  <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Número decorativo */}
        <div className="absolute top-8 right-8 text-secondary opacity-10 font-heading text-[200px] leading-none">
          02
        </div>
      </section>

      {/* CTA Section Brutal */}
      <section className="py-32 bg-primary text-primary-foreground relative border-y-4 border-foreground">
        <div className="absolute inset-0 grid-brutal opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-brutal mb-8">
              ¿LISTO PARA TU
              <br />
              PRÓXIMO PROYECTO?
            </h2>
            <p className="text-2xl mb-12 font-mono">
              OBTÉN UNA COTIZACIÓN PERSONALIZADA EN MINUTOS.
              <br />
              NUESTRO EQUIPO ESTÁ LISTO PARA AYUDARTE.
            </p>
            <Button asChild variant="outline" size="lg" className="bg-background text-foreground">
              <Link to="/cotizador">COTIZAR PROYECTO</Link>
            </Button>
          </div>
        </div>

        {/* Número decorativo */}
        <div className="absolute bottom-8 left-8 text-primary-foreground opacity-20 font-heading text-[200px] leading-none">
          03
        </div>
      </section>

      {/* Testimonials Section Brutal */}
      <section className="py-32 bg-background relative">
        <div className="absolute inset-0 grid-brutal opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="mb-20 border-l-8 border-secondary pl-8">
            <h2 className="text-brutal mb-4">TESTIMONIOS</h2>
            <p className="text-xl text-muted-foreground font-mono">
              LO QUE DICEN NUESTROS CLIENTES
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-none">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="text-primary font-heading text-6xl leading-none mb-4">"</div>
                    <p className="font-mono text-sm leading-relaxed">
                      {testimonial.content}
                    </p>
                  </div>
                  <div className="border-t-3 border-foreground pt-4">
                    <p className="font-heading text-lg uppercase">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Número decorativo */}
        <div className="absolute top-8 left-8 text-secondary opacity-10 font-heading text-[200px] leading-none">
          04
        </div>
      </section>
    </div>
  );
};

export default Home;
