import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Users, Ruler, Calendar, Eye } from "lucide-react";
import Viewer360 from "@/components/Viewer360";
import { SpaceModal } from "@/components/SpaceModal";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Space } from "@/types/supabase";

const Espacios = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [upcomingUnavailableIds, setUpcomingUnavailableIds] = useState<string[]>([]);

  useEffect(() => {
    fetchSpaces();
    checkUpcomingUnavailability();
  }, []);


  const fetchSpaces = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('status', 'available')
      .order('order_index');
    
    if (!error && data) {
      const transformed = data.map((item: any) => ({
        ...item,
        images: Array.isArray(item.images) ? item.images : [],
        amenities: Array.isArray(item.amenities) ? item.amenities : [],
        specs: item.specs || {}
      }));
      setSpaces(transformed);
    }
    setLoading(false);
  };

  const checkUpcomingUnavailability = async () => {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    const { data, error } = await supabase
      .from('space_unavailability')
      .select('space_id')
      .lte('start_date', thirtyDaysLater.toISOString().split('T')[0])
      .gte('end_date', today.toISOString().split('T')[0]);

    if (!error && data) {
      const ids = [...new Set(data.map(item => item.space_id))];
      setUpcomingUnavailableIds(ids);
    }
  };


  const handleViewDetails = (space: Space) => {
    setSelectedSpace(space);
    setModalOpen(true);
  };


  const filteredSpaces = spaces
    .map(space => {
      const isUpcomingUnavailable = upcomingUnavailableIds.includes(space.id);
      
      return { 
        ...space, 
        isAvailable: !isUpcomingUnavailable
      };
    })
    .sort((a, b) => {
      if (a.isAvailable === b.isAvailable) return 0;
      return a.isAvailable ? -1 : 1;
    });

  return (
    <div className="min-h-screen pt-14 sm:pt-16">
      {/* Hero Section */}
      <section className="gradient-primary text-primary-foreground py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 sm:mb-6">
            NUESTROS ESPACIOS
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto font-heading">
            ESTUDIOS PROFESIONALES EQUIPADOS CON TECNOLOGÍA DE VANGUARDIA PARA TUS PRODUCCIONES
          </p>
        </div>
      </section>

      {/* 360° Virtual Tour Section */}
      <section className="py-12 sm:py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-4">
              <Eye className="inline-block mr-3 h-8 w-8" />
              TOUR VIRTUAL 360°
            </h2>
            <p className="text-muted-foreground font-heading text-lg max-w-2xl mx-auto">
              EXPLORÁ NUESTRO ESTUDIO DE FILMACIÓN EN UNA EXPERIENCIA INMERSIVA. ARRASTRÁ PARA MOVERTE.
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <Viewer360 
              imageSrc="/images/360-studio.jpg" 
              height="500px" 
            />
          </div>
        </div>
      </section>


      {/* Spaces Section */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12 sm:py-16 lg:py-20">
              <p className="text-2xl sm:text-3xl lg:text-brutal">CARGANDO...</p>
            </div>
          ) : filteredSpaces.length === 0 ? (
            <div className="text-center py-12 sm:py-16 lg:py-20 border-2 sm:border-4 border-foreground p-8 sm:p-12 lg:p-16">
              <p className="text-2xl sm:text-3xl lg:text-brutal mb-4">NO HAY ESPACIOS DISPONIBLES</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {filteredSpaces.map((space) => (
                <Card
                  key={space.id}
                  className="hover-lift overflow-hidden transition-all duration-300"
                >
                  {/* Carrusel de imágenes */}
                  {space.images.length > 0 ? (
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
                              {index === 0 && (
                                <Badge 
                                  variant={space.isAvailable ? "default" : "destructive"}
                                  className="absolute top-4 right-4"
                                >
                                  {space.isAvailable ? "DISPONIBLE" : "NO DISPONIBLE"}
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
                  ) : (
                    <div className="h-[300px] bg-muted flex items-center justify-center">
                      <span className="text-brutal text-4xl opacity-20">SIN IMAGEN</span>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="text-2xl font-heading">{space.name}</CardTitle>
                    <CardDescription className="text-base font-heading">
                      {space.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Info Grid */}
                    {space.specs && (
                      <div className="grid grid-cols-2 gap-4">
                        {space.specs.capacity && (
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground font-heading">CAPACIDAD</p>
                              <p className="font-semibold font-heading">{space.specs.capacity}</p>
                            </div>
                          </div>
                        )}
                        {space.specs.size && (
                          <div className="flex items-center gap-2">
                            <Ruler className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground font-heading">TAMAÑO</p>
                              <p className="font-semibold font-heading">{space.specs.size}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Amenities */}
                    {space.amenities && space.amenities.length > 0 && (
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
                    )}

                    {/* Schedule */}
                    {space.specs?.schedule && (
                      <div className="text-sm text-muted-foreground font-heading pt-2 border-t">
                        {space.specs.schedule}
                      </div>
                    )}

                    {/* Promotion */}
                    {space.promotion && (
                      <div className="bg-primary/10 border-2 border-primary p-3">
                        <p className="font-heading text-sm text-primary font-bold">
                          {space.promotion}
                        </p>
                      </div>
                    )}

                    {/* Price */}
                    <div className="pt-4 border-t">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-primary font-heading">
                          ${space.price.toLocaleString()}
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
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-3 sm:mb-4">
            ¿NECESITAS UN ESPACIO PERSONALIZADO?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto font-heading">
            CONTACTANOS PARA DISCUTIR TUS NECESIDADES ESPECÍFICAS Y CREAR EL AMBIENTE PERFECTO PARA TU PROYECTO.
          </p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/contacto">
              <MapPin className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
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
