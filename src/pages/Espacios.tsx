import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Ruler, Calendar } from "lucide-react";
import space1 from "@/assets/space-1.jpg";
import space2 from "@/assets/space-2.jpg";

const spaces = [
  {
    id: 1,
    name: "Estudio de Grabación Pro",
    image: space1,
    description:
      "Estudio profesional con aislamiento acústico completo y equipamiento de última generación.",
    capacity: "4-6 personas",
    size: "35 m²",
    amenities: [
      "Consola de mezcla SSL",
      "Monitores Genelec",
      "Sala de grabación aislada",
      "Tratamiento acústico profesional",
    ],
    price: "50,000",
    available: true,
  },
  {
    id: 2,
    name: "Estudio Fotográfico",
    image: space2,
    description:
      "Espacio amplio con ciclorama blanco, equipamiento de iluminación profesional y área de makeup.",
    capacity: "8-10 personas",
    size: "60 m²",
    amenities: [
      "Ciclorama blanco 6x4m",
      "Sistema de iluminación completo",
      "Área de makeup y vestuario",
      "WiFi de alta velocidad",
    ],
    price: "40,000",
    available: true,
  },
];

const Espacios = () => {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="gradient-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
            Nuestros Espacios
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Estudios profesionales equipados con tecnología de vanguardia para
            tus producciones
          </p>
        </div>
      </section>

      {/* Spaces Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {spaces.map((space) => (
              <Card
                key={space.id}
                className="hover-lift overflow-hidden transition-all duration-300"
              >
                <div className="relative h-[300px] overflow-hidden">
                  <img
                    src={space.image}
                    alt={space.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  {space.available && (
                    <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                      Disponible
                    </Badge>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="text-2xl">{space.name}</CardTitle>
                  <CardDescription className="text-base">
                    {space.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Capacidad
                        </p>
                        <p className="font-semibold">{space.capacity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ruler className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Tamaño</p>
                        <p className="font-semibold">{space.size}</p>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <h4 className="font-semibold mb-2">Incluye:</h4>
                    <ul className="space-y-1">
                      {space.amenities.map((amenity, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-primary">•</span>
                          <span>{amenity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price */}
                  <div className="pt-4 border-t">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">
                        ${space.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        por día
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button variant="hero" className="flex-1">
                    <Calendar className="mr-2 h-4 w-4" />
                    Reservar
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Ver detalles
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">
            ¿Necesitas un espacio personalizado?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Contactanos para discutir tus necesidades específicas y crear el
            ambiente perfecto para tu proyecto.
          </p>
          <Button variant="hero" size="lg">
            <MapPin className="mr-2 h-5 w-5" />
            Contactar
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Espacios;
