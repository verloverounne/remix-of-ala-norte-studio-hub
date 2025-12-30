import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Send, Headphones, GraduationCap, Package, MapPin, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { InstitutionalSlider } from "@/components/InstitutionalSlider";

const Servicios = () => {
  const services = [
    {
      icon: <Headphones className="h-8 w-8" />,
      title: "Asesoría Técnica",
      description: "Te ayudamos a elegir el equipo perfecto para tu proyecto. Nuestro equipo técnico está disponible para resolver todas tus dudas."
    },
    {
      icon: <Send className="h-8 w-8" />,
      title: "Envíos Federales",
      description: "Enviamos a todo el país. Tu equipo llega a tiempo, sin importar dónde estés produciendo."
    },
    {
      icon: <Phone className="h-8 w-8" />,
      title: "Soporte Remoto 24/7",
      description: "Asistencia técnica cuando la necesites. Nuestro equipo está disponible para resolver problemas en tiempo real."
    },
    {
      icon: <GraduationCap className="h-8 w-8" />,
      title: "Talleres y Capacitaciones",
      description: "Formaciones técnicas para sacarle el máximo provecho a tu equipo. Desde iluminación hasta cámaras."
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: "Combos Personalizados",
      description: "Arma tu paquete ideal. Te armamos combos a medida según las necesidades de tu producción."
    }
  ];

  const workshops = [
    {
      title: "Iluminación para Cine",
      date: "15 de Diciembre, 2025",
      duration: "4 horas",
      type: "Presencial"
    },
    {
      title: "Workflow con Cámaras RED",
      date: "22 de Diciembre, 2025",
      duration: "3 horas",
      type: "Online"
    },
    {
      title: "Sonido Directo Profesional",
      date: "10 de Enero, 2026",
      duration: "5 horas",
      type: "Presencial"
    }
  ];

  const testimonials = [
    {
      name: "Martín Rodríguez",
      project: "Cortometraje 'El Silencio'",
      text: "El soporte técnico fue increíble. Nos resolvieron un problema de última hora y pudimos terminar el rodaje sin contratiempos."
    },
    {
      name: "Laura García",
      project: "Publicidad Nacional",
      text: "Los combos personalizados nos ahorraron tiempo y dinero. El equipo llegó perfecto y configurado para nuestras necesidades."
    },
    {
      name: "Diego Fernández",
      project: "Serie Web",
      text: "Los talleres son excelentes. Aprendí a usar el equipo de forma profesional antes del rodaje. Super recomendable."
    }
  ];

  return (
    <div className="min-h-screen pt-14 sm:pt-16 lg:pt-20">
      {/* Institutional Slider - Full Width */}
      <InstitutionalSlider pageType="servicios" />

      {/* Hero Section */}
      <section className="py-12 sm:py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 tracking-tight">
              MÁS QUE EQUIPOS, SOMOS TU EQUIPO
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              Ofrecemos servicios integrales para que tu producción sea un éxito. 
              Desde asesoría técnica hasta capacitaciones, estamos para apoyarte en cada paso.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl mb-8 sm:mb-12 text-center">
            NUESTROS SERVICIOS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service, index) => (
              <Card key={index} className="border-2 border-foreground shadow-brutal hover:shadow-brutal-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4 text-primary">{service.icon}</div>
                  <CardTitle className="font-heading text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Envíos Section with Map Icon */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-8">
              <MapPin className="h-12 w-12 text-primary" />
              <h2 className="font-heading text-3xl md:text-4xl">ENVÍOS A TODO EL PAÍS</h2>
            </div>
            <p className="text-center text-lg mb-6">
              Trabajamos con las principales empresas de logística para garantizar que tu equipo 
              llegue en tiempo y forma. Desde Buenos Aires hasta Ushuaia, tu producción no espera.
            </p>
            <div className="flex justify-center">
              <Button asChild size="lg" className="font-heading">
                <Link to="/contacto">CONSULTAR ENVÍOS</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Workshops Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 mb-12">
            <Calendar className="h-10 w-10 text-primary" />
            <h2 className="font-heading text-3xl md:text-4xl">PRÓXIMOS TALLERES</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {workshops.map((workshop, index) => (
              <Card key={index} className="border-2 border-foreground shadow-brutal">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">{workshop.title}</CardTitle>
                  <CardDescription>
                    <div className="space-y-1 mt-2">
                      <p className="font-semibold">{workshop.date}</p>
                      <p>{workshop.duration} • {workshop.type}</p>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full font-heading">
                    INSCRIBIRSE
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl mb-12 text-center">
            TESTIMONIOS DE SERVICIOS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 border-foreground shadow-brutal">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">{testimonial.name}</CardTitle>
                  <CardDescription className="font-semibold">{testimonial.project}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl mb-6">
              ¿NECESITÁS UN SERVICIO ESPECÍFICO?
            </h2>
            <p className="text-lg mb-8 text-muted-foreground">
              Cada producción es única. Contanos qué necesitás y armamos una solución a tu medida.
            </p>
            <Button asChild size="lg" className="font-heading">
              <Link to="/contacto">CONTACTANOS</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Servicios;
