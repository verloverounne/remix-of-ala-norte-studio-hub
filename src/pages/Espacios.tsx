import { useState } from "react";
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
import { SpaceModal } from "@/components/SpaceModal";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Link } from "react-router-dom";

const spaces = [
  {
    id: 1,
    name: "GALERÍA DE FILMACIÓN",
    images: [space2, space2, space2], // Carousel de 3 imágenes mínimo
    description:
      "El espacio perfecto para tu proyecto. 150 metros cuadrados equipados con tecnología profesional.",
    capacity: "8-10 personas",
    size: "150 m²",
    amenities: [
      "Infinito blanco de 6m ancho x 3m alto",
      "5m de piso blanco",
      "11m de tiro de cámara",
      "Infinito negro incluido",
      "Chroma verde 3m x 6m",
    ],
    specs: [
      "Bloques de 4hs",
      "Infinito blanco de 6 m de ancho x 3 m de alto",
      "5 m de piso blanco y 11 m de tiro de cámara",
      "Infinito negro y Chroma verde (3 m x 6 m) incluidos",
    ],
    luces: [
      "3 fresneles 1k dimerizables de contraluz",
      "16 tubos frontal/cenital",
      "2 x 4 tubos laterales",
    ],
    optionals: [
      "TABLERO TRIFÁSICO",
      "BACK UP GENERADOR",
      "PINTURA",
      "STREAMING",
      "PODCAST",
    ],
    price: "70,000",
    schedule: "Lunes a Viernes de 9 a 18hs - Bloque de 4hs. Fines de semana y fuera de horario consultar.",
    discount: "¡20% DE DESCUENTO EN EQUIPOS EXTRA!",
    available: true,
  },
  {
    id: 2,
    name: "SALA DE SONIDO",
    images: [space1, space1, space1], // Carousel de 3 imágenes mínimo
    description:
      "Locución / Postproducción / Edición / Color. ProTools Ultimate. Climatizada e insonorizada.",
    capacity: "4-6 personas",
    size: "35 m²",
    amenities: [
      "ProTools Ultimate",
      "Consola de mezcla profesional",
      "Monitores de estudio",
      "Sala de grabación aislada",
      "Tratamiento acústico profesional",
      "Climatización",
      "Insonorización completa",
    ],
    specs: [
      "Locución profesional",
      "Postproducción de audio",
      "Edición de video",
      "Color grading",
      "ProTools Ultimate instalado",
      "Climatizada",
      "Insonorizada",
    ],
    price: "50,000",
    schedule: "Lunes a Viernes de 9 a 18hs. Consultar disponibilidad.",
    available: true,
  },
];

const Espacios = () => {
  const [selectedSpace, setSelectedSpace] = useState<typeof spaces[0] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewDetails = (space: typeof spaces[0]) => {
    setSelectedSpace(space);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="gradient-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
            NUESTROS ESPACIOS
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto font-heading">
            ESTUDIOS PROFESIONALES EQUIPADOS CON TECNOLOGÍA DE VANGUARDIA PARA TUS PRODUCCIONES
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
                {/* Carrusel de imágenes */}
                <Carousel className="w-full">
                  <CarouselContent>
                    {space.images.map((img, index) => (
                      <CarouselItem key={index}>
                        <div className="relative h-[300px] overflow-hidden">
                          <img
                            src={img}
                            alt={`${space.name} - ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                          {space.available && index === 0 && (
                            <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                              DISPONIBLE
                            </Badge>
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {space.images.length > 1 && (
                    <>
                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
                    </>
                  )}
                </Carousel>

                <CardHeader>
                  <CardTitle className="text-2xl font-heading">{space.name}</CardTitle>
                  <CardDescription className="text-base font-heading">
                    {space.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground font-heading">
                          CAPACIDAD
                        </p>
                        <p className="font-semibold font-heading">{space.capacity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ruler className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground font-heading">TAMAÑO</p>
                        <p className="font-semibold font-heading">{space.size}</p>
                      </div>
                    </div>
                  </div>

                  {/* Amenities principales */}
                  <div>
                    <h4 className="font-semibold mb-2 font-heading">INCLUYE:</h4>
                    <ul className="space-y-1">
                      {space.amenities.slice(0, 4).map((amenity, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-primary font-heading">•</span>
                          <span className="font-heading">{amenity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Schedule */}
                  {space.schedule && (
                    <div className="text-sm text-muted-foreground font-heading pt-2 border-t">
                      {space.schedule}
                    </div>
                  )}

                  {/* Discount */}
                  {space.discount && (
                    <div className="bg-primary/10 border-2 border-primary p-3">
                      <p className="font-heading text-sm text-primary font-bold">
                        {space.discount}
                      </p>
                    </div>
                  )}

                  {/* Price */}
                  <div className="pt-4 border-t">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary font-heading">
                        ${space.price}
                      </span>
                      <span className="text-sm text-muted-foreground font-heading">
                        por bloque de 4hs
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button 
                    variant="hero" 
                    className="flex-1"
                    onClick={() => handleViewDetails(space)}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    VER DETALLES
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to="/contacto">CONTACTAR</Link>
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
            ¿NECESITAS UN ESPACIO PERSONALIZADO?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto font-heading">
            CONTACTANOS PARA DISCUTIR TUS NECESIDADES ESPECÍFICAS Y CREAR EL AMBIENTE PERFECTO PARA TU PROYECTO.
          </p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/contacto">
              <MapPin className="mr-2 h-5 w-5" />
              CONTACTAR
            </Link>
          </Button>
        </div>
      </section>

      {/* Space Modal */}
      <SpaceModal
        space={selectedSpace}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default Espacios;
