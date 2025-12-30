import { useState, useEffect } from "react";
import { Mic, Eye, Headphones, Monitor } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  order_index: number;
}

const SalaGrabacion = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('page_type', 'sala_grabacion')
      .order('order_index');
    
    if (!error && data) {
      setImages(data);
    }
    setLoading(false);
  };

  const features = [
    { icon: Mic, title: "GRABACIÓN", description: "Estudio profesional de grabación de audio" },
    { icon: Headphones, title: "MEZCLA", description: "Espacio acústicamente tratado para mezcla" },
    { icon: Monitor, title: "POSTPRODUCCIÓN", description: "Suite completa para edición y postproducción" },
  ];

  return (
    <div className="min-h-screen pt-14 sm:pt-16">
      {/* Hero Section */}
      <section className="gradient-primary text-primary-foreground py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 sm:mb-6">
            SALA DE GRABACIÓN / POSTPRODUCCIÓN
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto font-heading">
            ESPACIO PROFESIONAL PARA GRABACIÓN, MEZCLA Y POSTPRODUCCIÓN DE AUDIO
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-background border-2 border-foreground p-6 shadow-brutal hover:translate-x-1 hover:-translate-y-1 transition-transform">
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-heading font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground font-heading">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Carousel Section */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold">
              <Eye className="inline-block mr-3 h-8 w-8" />
              NUESTRAS INSTALACIONES
            </h2>
          </div>
          
          {loading ? (
            <div className="text-center py-12 sm:py-16 lg:py-20">
              <p className="text-2xl sm:text-3xl font-heading">CARGANDO...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 sm:py-16 lg:py-20 border-2 sm:border-4 border-foreground p-8 sm:p-12 lg:p-16">
              <p className="text-2xl sm:text-3xl font-heading mb-4">NO HAY IMÁGENES DISPONIBLES</p>
              <p className="text-muted-foreground font-heading">Las imágenes se cargarán desde el panel de administración.</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <Carousel className="w-full" opts={{ loop: true }}>
                <CarouselContent>
                  {images.map((img) => (
                    <CarouselItem key={img.id}>
                      <div className="relative aspect-video overflow-hidden rounded-lg border-4 border-foreground shadow-brutal">
                        <img
                          src={img.image_url}
                          alt={img.title || "Sala de Grabación"}
                          className="w-full h-full object-cover"
                        />
                        {(img.title || img.description) && (
                          <div className="absolute bottom-0 left-0 right-0 bg-background/90 p-4 sm:p-6">
                            {img.title && (
                              <h3 className="text-lg sm:text-xl md:text-2xl font-heading font-bold">{img.title}</h3>
                            )}
                            {img.description && (
                              <p className="text-sm sm:text-base text-muted-foreground mt-1 font-heading">{img.description}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 sm:left-4" />
                <CarouselNext className="right-2 sm:right-4" />
              </Carousel>
            </div>
          )}
        </div>
      </section>

      {/* Thumbnails Grid */}
      {images.length > 0 && (
        <section className="py-8 sm:py-12 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((img) => (
                <div key={img.id} className="aspect-square overflow-hidden rounded border-2 border-foreground shadow-brutal-sm hover:scale-105 transition-transform">
                  <img
                    src={img.image_url}
                    alt={img.title || "Sala de Grabación"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
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
