import { Helmet } from "react-helmet";
import { ExternalLink, Wrench, ShoppingBag, Award, Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const CARTONI_LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cartoni_logo.svg/1200px-Cartoni_logo.svg.png";

interface CartoniSlide {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  media_type: string | null;
}

const Cartoni = () => {
  const [slides, setSlides] = useState<CartoniSlide[]>([]);
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchSlides = async () => {
      const { data } = await supabase
        .from('gallery_images')
        .select('id, title, description, image_url, media_type')
        .eq('page_type', 'cartoni')
        .order('order_index');
      
      if (data && data.length > 0) {
        setSlides(data);
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (!api) return;
    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap());
    });
  }, [api]);

  const hasSlides = slides.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Cartoni - Seller y Service Oficial | Ala Norte</title>
        <meta
          name="description"
          content="Ala Norte es Seller y Service Oficial de Cartoni en Argentina. Venta, reparación y mantenimiento de trípodes y cabezales profesionales Cartoni."
        />
      </Helmet>

      {/* Hero Section with Carousel */}
      {hasSlides ? (
        <section className="relative pt-16 sm:pt-20">
          <Carousel className="w-full" setApi={setApi} opts={{ loop: true }}>
            <CarouselContent className="-ml-0">
              {slides.map((slide) => (
                <CarouselItem key={slide.id} className="pl-0 basis-full">
                  <div className="relative h-[60vh] sm:h-[70vh] w-full overflow-hidden duotone-hover-group">
                    {/* Full-width background media */}
                    {slide.media_type === 'video' ? (
                      <video
                        src={slide.image_url}
                        className="absolute inset-0 w-full h-full object-cover video-duotone"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={slide.image_url}
                        alt={slide.title || "Cartoni"}
                        className="absolute inset-0 w-full h-full object-cover image-duotone"
                      />
                    )}
                    
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent" />
                    
                    {/* Content with blur background */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative z-10 text-center px-4 sm:px-8 max-w-4xl mx-auto">
                        <div className="inline-block backdrop-blur-md bg-foreground/80 px-6 sm:px-12 py-6 sm:py-10 border border-background/20">
                          <img
                            src={CARTONI_LOGO}
                            alt="Cartoni Logo"
                            className="h-12 sm:h-16 md:h-20 mx-auto mb-4 sm:mb-6 bg-background/90 p-3 rounded"
                          />
                          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 sm:mb-4 uppercase text-background">
                            SELLER & SERVICE
                            <br />
                            <span className="text-primary">OFICIAL CARTONI</span>
                          </h1>
                          <p className="text-sm sm:text-base md:text-lg text-background/90 font-heading mb-4 sm:mb-6 max-w-2xl mx-auto">
                            ALA NORTE ES REPRESENTANTE OFICIAL DE CARTONI EN ARGENTINA
                          </p>
                          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                            <Button asChild variant="hero" size="lg">
                              <a
                                href="https://www.cartoni.com/dealers/"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                VER EN CARTONI.COM <ExternalLink className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                              </a>
                            </Button>
                            <Button asChild variant="secondary" size="lg">
                              <Link to="/contacto">CONTACTAR <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" /></Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Navigation dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    index === currentSlide 
                      ? "w-12 bg-primary" 
                      : "w-2 bg-background/40 hover:bg-background/60"
                  )}
                  aria-label={`Ir a slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        // Fallback hero without slides
        <section className="relative py-20 lg:py-32 bg-background text-foreground border-b border-foreground overflow-hidden pt-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-8">
                <img
                  src={CARTONI_LOGO}
                  alt="Cartoni Logo"
                  className="h-16 md:h-24 mx-auto bg-background p-4 rounded-lg"
                />
              </div>
              <h1 className="font-heading text-4xl md:text-6xl lg:text-brutal mb-6">
                SELLER & SERVICE
                <br />
                <span className="text-primary">OFICIAL CARTONI</span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground font-heading mb-8 leading-tight">
                ALA NORTE ES REPRESENTANTE OFICIAL DE CARTONI EN ARGENTINA
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild variant="hero" size="lg">
                  <a
                    href="https://www.cartoni.com/dealers/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    VER EN CARTONI.COM <ExternalLink className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link to="/contacto">CONTACTAR</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="font-heading text-3xl md:text-5xl mb-4">NUESTROS SERVICIOS</h2>
            <p className="text-sm text-muted-foreground font-heading leading-tight">
              COMO DEALER OFICIAL OFRECEMOS SERVICIOS COMPLETOS
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-foreground p-8 bg-card hover:shadow-brutal transition-shadow">
              <div className="h-16 w-16 bg-primary text-primary-foreground flex items-center justify-center mb-6 border border-foreground">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-2xl mb-4">VENTA</h3>
              <p className="text-muted-foreground">
                Venta oficial de toda la línea de productos Cartoni: trípodes, cabezales fluidos,
                dollies, pedestales y accesorios profesionales para cine y broadcast.
              </p>
            </div>

            <div className="border border-foreground p-8 bg-card hover:shadow-brutal transition-shadow">
              <div className="h-16 w-16 bg-primary text-primary-foreground flex items-center justify-center mb-6 border border-foreground">
                <Wrench className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-2xl mb-4">SERVICE TÉCNICO</h3>
              <p className="text-muted-foreground">
                Servicio técnico autorizado con técnicos certificados. Reparación, mantenimiento
                preventivo y calibración de equipos Cartoni con repuestos originales.
              </p>
            </div>

            <div className="border border-foreground p-8 bg-card hover:shadow-brutal transition-shadow">
              <div className="h-16 w-16 bg-primary text-primary-foreground flex items-center justify-center mb-6 border border-foreground">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-2xl mb-4">GARANTÍA OFICIAL</h3>
              <p className="text-muted-foreground">
                Todos los productos vendidos cuentan con garantía oficial Cartoni.
                Soporte técnico directo y acceso a actualizaciones y mejoras.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Cartoni */}
      <section className="py-16 lg:py-24 bg-background border-y border-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h2 className="font-heading text-3xl md:text-5xl mb-4">SOBRE CARTONI</h2>
              <p className="text-sm text-muted-foreground font-heading leading-tight">
                EXCELENCIA ITALIANA DESDE 1935
              </p>
            </div>

            <div className="prose prose-lg max-w-none text-foreground">
              <p className="text-sm mb-6 leading-tight">
                <strong>Cartoni</strong> es una empresa italiana fundada en 1935, reconocida mundialmente
                por fabricar los mejores soportes de cámara profesionales del mercado. Sus productos
                son utilizados en las producciones cinematográficas y televisivas más importantes del mundo.
              </p>
              <p className="text-sm mb-6 leading-tight">
                Con casi 90 años de experiencia, Cartoni combina la tradición artesanal italiana con
                la más avanzada tecnología para crear trípodes y cabezales que ofrecen precisión,
                suavidad y durabilidad incomparables.
              </p>
              <p className="text-sm leading-tight">
                Como <strong>Seller y Service Oficial</strong> en Argentina, Ala Norte garantiza el
                acceso a productos originales, precios competitivos y servicio técnico especializado
                para toda la línea Cartoni.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-5xl mb-8">CONTACTANOS</h2>
            <p className="text-sm text-muted-foreground mb-8 leading-tight">
              Para consultas sobre productos Cartoni, cotizaciones o servicio técnico
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <span>+54 (11) 4718-0732</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <span>info@alanortecinedigital.com</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Virrey Liniers 1565, Florida, Buenos Aires</span>
              </div>
            </div>

            <Button asChild variant="default" size="lg">
              <Link to="/contacto">ENVIAR CONSULTA</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Cartoni;
