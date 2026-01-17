import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Award, Target, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import Map from "@/components/Map";

const Nosotros = () => {
  const values = [
    {
      icon: <Award className="h-8 w-8" />,
      title: "Calidad",
      description: "Solo trabajamos con equipos de primera línea. Tu producción merece lo mejor."
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Empatía",
      description: "Entendemos las necesidades de cada proyecto. Estamos para ayudarte a concretar tu visión."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Comunidad",
      description: "Creemos en la colaboración. Juntos construimos la industria audiovisual argentina."
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Formación",
      description: "Compartimos conocimiento. Queremos que domines el equipo y crezcas profesionalmente."
    }
  ];

  const team = [
    {
      name: "Juan Pérez",
      role: "Director General",
      image: "",
      bio: "15 años en la industria audiovisual. Apasionado por la tecnología y el cine."
    },
    {
      name: "María González",
      role: "Gerente de Operaciones",
      image: "",
      bio: "Experta en logística. Garantiza que cada equipo llegue perfecto a tiempo."
    },
    {
      name: "Carlos Martínez",
      role: "Jefe Técnico",
      image: "",
      bio: "Ingeniero en sonido y DF. 10 años asesorando producciones profesionales."
    },
    {
      name: "Laura Fernández",
      role: "Atención al Cliente",
      image: "",
      bio: "Primera línea de contacto. Te ayuda a encontrar lo que necesitás."
    }
  ];

  const partners = [
    { name: "ARRI", logo: "🎬" },
    { name: "RED Digital Cinema", logo: "📹" },
    { name: "Sony Professional", logo: "📷" },
    { name: "Canon Cinema", logo: "🎥" },
    { name: "Blackmagic Design", logo: "🎞️" },
    { name: "ZEISS", logo: "🔭" }
  ];

  return (
    <div className="min-h-screen pt-14 sm:pt-16 lg:pt-20">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 tracking-tight">
              Un estudio pensado para realizadores
            </h1>
            <p className="text-sm sm:text-base md:text-sm text-muted-foreground leading-tight">
              ALA NORTE nace del trabajo en rodajes reales. Sabemos lo que pasa en set y qué se necesita para llegar con tranquilidad al día de filmación.
            </p>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl mb-8 text-center">
              Más que equipo, acompañamiento
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-sm text-muted-foreground mb-4 leading-tight">
                No solo alquilamos equipamiento audiovisual. Nos interesa entender tu proyecto, sugerir alternativas y ayudarte a tomar decisiones técnicas con criterio.
              </p>
              <p className="text-sm text-muted-foreground mb-4 leading-tight">
                Trabajamos con personas que están empezando y con equipos con experiencia. Lo importante es que tengas una historia que quieras contar.
              </p>
              <p className="text-sm text-muted-foreground leading-tight">
                Te ayudamos a elegir el equipo que mejor se adapta a tu proyecto, a tu presupuesto y a tu forma de trabajar. Podés consultarnos antes, durante y después del rodaje.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl mb-8 sm:mb-12 text-center">
            NUESTROS VALORES
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="border-2 border-border shadow-brutal text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4 text-primary">
                    {value.icon}
                  </div>
                  <CardTitle className="font-heading text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl mb-8 sm:mb-12 text-center">
            NUESTRO EQUIPO
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="border-2 border-border shadow-brutal">
                <div className="relative h-64 overflow-hidden bg-muted flex items-center justify-center">
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-6xl mb-2">👤</div>
                      <p className="text-sm text-muted-foreground">FOTO PRÓXIMAMENTE</p>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="font-heading text-lg">{member.name}</CardTitle>
                  <CardDescription className="font-semibold text-primary">{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section Placeholder */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl mb-8 text-center">
            VIDEO INSTITUCIONAL
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-muted rounded-lg border-4 border-foreground shadow-brutal flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-heading mb-4">PRÓXIMAMENTE</p>
                <p className="text-muted-foreground">Video institucional en producción</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl mb-12 text-center">
            PARTNERS Y ALIANZAS
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {partners.map((partner, index) => (
              <Card key={index} className="border-2 border-border shadow-brutal text-center p-6">
                <div className="text-4xl mb-2">{partner.logo}</div>
                <p className="font-heading text-sm">{partner.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Location with Map */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 mb-8">
            <MapPin className="h-10 w-10 text-primary" />
            <h2 className="font-heading text-3xl md:text-4xl">NUESTRA UBICACIÓN</h2>
          </div>
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="border-2 border-border shadow-brutal overflow-hidden">
              <div className="h-96">
                <Map 
                  address="V. S. de Liniers 1565, Vicente López, Buenos Aires, Argentina"
                  latitude={-34.527}
                  longitude={-58.475}
                />
              </div>
            </Card>
          </div>
          <div className="text-center">
            <p className="text-lg mb-2 font-semibold">V. S. de Liniers 1565</p>
            <p className="text-muted-foreground mb-6">Vicente López, Buenos Aires, Argentina</p>
            <Button asChild size="lg" className="font-heading">
              <Link to="/contacto">VISITANOS</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Nosotros;
