import { useState, useEffect } from "react";
import { Eye, MapPin, Clock, Check, Calendar, Mic, Headphones, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Space } from "@/types/supabase";
import Viewer360 from "@/components/Viewer360";
import { VideoHeroSlider } from "@/components/VideoHeroSlider";

const SalaGrabacion = () => {
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch space data
    const { data: spaceData } = await supabase
      .from('spaces')
      .select('*')
      .eq('slug', 'sala-grabacion')
      .single();
    
    if (spaceData) {
      setSpace({
        ...spaceData,
        images: Array.isArray(spaceData.images) ? spaceData.images as string[] : [],
        features: Array.isArray(spaceData.features) ? spaceData.features as string[] : [],
        included_items: Array.isArray(spaceData.included_items) ? spaceData.included_items as string[] : [],
        optional_services: Array.isArray(spaceData.optional_services) ? spaceData.optional_services as string[] : [],
        amenities: Array.isArray(spaceData.amenities) ? spaceData.amenities as any[] : [],
        specs: spaceData.specs || {}
      } as Space);
    }
    
    setLoading(false);
  };

  // Default features for recording studio
  const defaultFeatures = [
    { icon: Mic, title: "GRABACIÓN", description: "Estudio profesional de grabación de audio" },
    { icon: Headphones, title: "MEZCLA", description: "Espacio acústicamente tratado para mezcla" },
    { icon: Monitor, title: "POSTPRODUCCIÓN", description: "Suite completa para edición y postproducción" },
  ];

  if (loading || !space) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Video Slider */}
      <VideoHeroSlider pageType="sala_grabacion_hero" space={space} />

      {/* Quick Features Section */}
      <section className="py-8 sm:py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {defaultFeatures.map((feature, index) => (
              <div key={index} className="bg-background border border-foreground p-6 shadow-brutal hover:translate-x-1 hover:-translate-y-1 transition-transform">
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-heading font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground font-heading">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      {space.features && space.features.length > 0 && (
        <section className="py-12 sm:py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-8 text-center">
              CARACTERÍSTICAS DEL ESPACIO
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {space.features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 bg-secondary border border-foreground p-4 shadow-brutal hover:translate-x-1 hover:-translate-y-1 transition-transform"
                >
                  <Check className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="font-heading">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Details Section with Featured Image */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Featured Image */}
            <div className="relative aspect-video lg:aspect-square overflow-hidden rounded-lg border border-foreground shadow-brutal">
              <img
                src={space.featured_image || (space.images && space.images[0]) || "/placeholder.svg"}
                alt={space.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-4">DETALLES DEL ESPACIO</h2>
                <p className="text-muted-foreground font-heading text-lg">
                  {space.detailed_description || space.description}
                </p>
              </div>

              {/* Included Items */}
              {space.included_items && space.included_items.length > 0 && (
                <div>
                  <h3 className="text-xl font-heading font-bold mb-3 flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" /> INCLUIDO EN EL BLOQUE
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {space.included_items.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-primary">•</span>
                        <span className="font-heading">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Schedule Info */}
              <div className="bg-secondary border border-foreground p-4 rounded-lg">
                <h3 className="font-heading font-bold mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> HORARIOS
                </h3>
                <p className="text-sm text-muted-foreground font-heading">
                  {space.schedule_weekday}
                </p>
                <p className="text-sm text-muted-foreground font-heading">
                  {space.schedule_weekend}
                </p>
              </div>

              {/* Optional Services */}
              {space.optional_services && space.optional_services.length > 0 && (
                <div>
                  <h3 className="text-xl font-heading font-bold mb-3">SERVICIOS OPCIONALES</h3>
                  <div className="flex flex-wrap gap-2">
                    {space.optional_services.map((service, index) => (
                      <Badge key={index} variant="outline" className="font-heading">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Layout Description */}
              {space.layout_description && (
                <div className="bg-muted p-4 rounded-lg border-l border-primary">
                  <h3 className="font-heading font-bold mb-2">LAYOUT DEL ESTUDIO</h3>
                  <p className="text-sm text-muted-foreground font-heading">{space.layout_description}</p>
                </div>
              )}

              <Button variant="hero" size="lg" asChild className="w-full sm:w-auto">
                <Link to="/contacto">
                  <Calendar className="mr-2 h-5 w-5" />
                  {space.cta_text || "RESERVAR BLOQUE"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 360° Virtual Tour Section */}
      {space.tour_360_url && (
        <section className="py-12 sm:py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-4">
                <Eye className="inline-block mr-3 h-8 w-8" />
                TOUR VIRTUAL 360°
              </h2>
              <p className="text-muted-foreground font-heading text-lg max-w-2xl mx-auto">
                EXPLORÁ NUESTRA SALA EN UNA EXPERIENCIA INMERSIVA. ARRASTRÁ PARA MOVERTE.
              </p>
            </div>
            <div className="max-w-5xl mx-auto">
              <Viewer360 
                imageSrc={space.tour_360_url} 
                height="500px" 
              />
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-3 sm:mb-4">
            ¿QUERÉS RESERVAR NUESTRA SALA?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto font-heading">
            CONTACTANOS PARA CONOCER DISPONIBILIDAD Y TARIFAS ESPECIALES PARA TU PRODUCCIÓN.
          </p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/contacto">
              <Mic className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              CONTACTAR
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default SalaGrabacion;
