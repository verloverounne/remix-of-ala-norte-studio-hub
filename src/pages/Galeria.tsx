import { useState, useRef, useCallback, useEffect } from "react";
import { Calendar, Maximize2, Minimize2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Viewer360Gallery from "@/components/Viewer360Gallery";
import { GalleryHero } from "@/components/GalleryHero";
import { ProductionsSlider } from "@/components/ProductionsSlider";
import { useGalleryImages } from "@/hooks/useGalleryImages";
import { useSpace } from "@/hooks/useSpace";

const Galeria = () => {
  const { space, loading } = useSpace("galeria");
  const { getByPageType } = useGalleryImages();
  const [tour360Open, setTour360Open] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const galeriaImages = getByPageType("galeria");
  const featuredMediaImage = galeriaImages[0]?.image_url || null;

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      modalContentRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const tour360HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://aframe.io/releases/1.4.2/aframe.min.js"><\/script>
  <style>
    * { margin: 0; padding: 0; }
    body { overflow: hidden; font-family: 'Poppins', sans-serif; }
    .hint {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,0.7); color: white; padding: 8px 16px;
      font-size: 11px; z-index: 1000; text-transform: uppercase; letter-spacing: 1px;
      opacity: 1; transition: opacity 1s;
    }
    .controls {
      position: fixed; bottom: 20px; right: 20px; z-index: 1000; display: flex; gap: 10px;
    }
    .btn {
      padding: 8px 16px; background: rgba(0,0,0,0.85); color: white; border: none;
      cursor: pointer; font-weight: 700; font-size: 12px; text-transform: uppercase;
      letter-spacing: 1px; transition: background 0.2s;
    }
    .btn:hover { background: #D4A017; }
  </style>
</head>
<body>
  <div class="hint" id="hint">Arrastrá para explorar el espacio</div>
  <a-scene vr-mode-ui="enabled: false" loading-screen="enabled: false" embedded style="width:100%;height:100vh;">
    <a-sky id="sky" src="https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//360.jpg" rotation="0 -30 0" scale="-1 1 1"></a-sky>
    <a-camera look-controls="reverseMouseDrag: true; touchEnabled: true" fov="80" position="0 1.6 0"></a-camera>
  </a-scene>
  <script>
    setTimeout(() => { const h = document.getElementById('hint'); if (h) h.style.opacity = '0'; }, 4000);
  <\/script>
</body>
</html>
  `;

  if (loading || !space) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-heading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Full width */}
      <GalleryHero space={space} />

      {/* Details Section */}
      <section className="py-12 sm:py-16 my-[64px]">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          {/* Two-column: Featured Image + Carousel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start py-[64px]">
            {/* Left Column: Featured Image + 360 button + Floor Plan */}
            <div className="space-y-6">
              <div className="relative aspect-video lg:aspect-square overflow-hidden rounded-lg group">
                <img
                  src={featuredMediaImage || space.featured_image || (space.images && space.images[0]) || "/placeholder.svg"}
                  alt={space.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-0 border-solid border-primary shadow-sm">
                  <Button
                    onClick={() => setTour360Open(true)}
                    variant="hero"
                    size="lg"
                    className="shadow-2xl backdrop-blur-sm border-0 bg-transparent text-primary border-primary px-[16px]"
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    360
                  </Button>
                </div>
              </div>

              {/* Floor Plan - Only visible on desktop */}
              <div className="hidden lg:block relative overflow-hidden rounded-lg">
                <img
                  alt="Plano ilustrativo del estudio"
                  className="w-full h-auto object-contain bg-background"
                  src="/lovable-uploads/7a26e0e7-4882-4604-9b3b-88bda06e16c1.jpg"
                />
              </div>
            </div>

            {/* Right Column: Image Carousel */}
            <div className="relative aspect-video lg:aspect-square overflow-hidden rounded-lg">
              {galeriaImages.length > 0 ? (
                <>
                  <img
                    src={galeriaImages[carouselIndex]?.image_url || "/placeholder.svg"}
                    alt={galeriaImages[carouselIndex]?.title || `Galería ${carouselIndex + 1}`}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                  {galeriaImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setCarouselIndex((prev) => (prev - 1 + galeriaImages.length) % galeriaImages.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-primary text-primary-foreground rounded-sm p-2 shadow-brutal hover:translate-x-[-2px] transition-transform"
                        aria-label="Anterior"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setCarouselIndex((prev) => (prev + 1) % galeriaImages.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-primary text-primary-foreground rounded-sm p-2 shadow-brutal hover:translate-x-[2px] transition-transform"
                        aria-label="Siguiente"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {galeriaImages.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCarouselIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === carouselIndex ? "bg-primary w-4" : "bg-white/60"}`}
                            aria-label={`Ir a imagen ${i + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground font-heading">Sin imágenes</p>
                </div>
              )}
            </div>
          </div>

          {/* Text Content - Single column below */}
          <div className="space-y-8 w-screen mt-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-4">El espacio</h2>
              <p className="text-muted-foreground font-heading text-base font-medium">
                {space.detailed_description || space.description}
              </p>
            </div>

            {space.layout_description && (
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-heading font-bold mb-2">Plano de la galería</h3>
                <p className="text-sm text-muted-foreground font-heading">{space.layout_description}</p>
              </div>
            )}

            {/* Floor Plan - Mobile only */}
            <div className="lg:hidden relative overflow-hidden rounded-lg">
              <img
                src="/lovable-uploads/7a26e0e7-4882-4604-9b3b-88bda06e16c1.jpg"
                alt="Plano ilustrativo del estudio"
                className="w-full h-auto object-contain bg-background"
              />
            </div>

            {space.features && Array.isArray(space.features) && space.features.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-1">
                {(space.features as string[]).map((feature, index) => (
                  <p key={index} className="text-sm text-muted-foreground font-heading flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {feature}
                  </p>
                ))}
              </div>
            )}

            {space.included_items && space.included_items.length > 0 && (
              <div>
                <h3 className="text-xl font-heading font-bold mb-3 flex items-center gap-2">
                  Incluido sin cargo adicional
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {space.included_items.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-primary">•</span>
                      <span className="font-heading">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-foreground p-4 rounded-lg border-0 bg-inherit px-0">
              <h3 className="font-heading font-bold mb-2 flex items-center gap-2">HORARIOS</h3>
              <p className="text-sm text-muted-foreground font-heading">{space.schedule_weekday}</p>
              <p className="text-sm text-muted-foreground font-heading">{space.schedule_weekend}</p>
            </div>

            {space.optional_services && space.optional_services.length > 0 && (
              <div>
                <h3 className="text-xl font-heading font-bold mb-3">Servicios adicionales</h3>
                <div className="flex flex-wrap gap-2">
                  {space.optional_services.map((service, index) => (
                    <Badge key={index} variant="outline" className="font-heading">
                      {service}
                    </Badge>
                  ))}
                </div>
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
      </section>

      {/* 360° Virtual Tour Section - Full bleed */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-4">
              Ya conocés la galería ALA NORTE?
            </h2>
            <p className="text-muted-foreground font-heading text-lg">
              Explorá la galería antes de tu reserva. Arrastrá para moverte y conocer cada rincón del espacio.
            </p>
          </div>
        </div>
        <div className="w-full">
          <Viewer360Gallery
            imageSrc="https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//360.jpg"
            secondImageSrc="https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//361.jpg"
            height="100vh"
            mobileHeight="80vh"
          />
        </div>
      </section>

      {/* Productions Slider - Full bleed like Home */}
      <ProductionsSlider />

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-3 sm:mb-4">
            ¿Querés reservar la galería?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto font-heading leading-tight">
            Hablemos de tu proyecto. Te contamos disponibilidad, armamos una propuesta a medida y coordinamos todo para
            que llegues tranquilo al rodaje.
          </p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/contacto">CONTACTAR</Link>
          </Button>
        </div>
      </section>

      {/* 360 Tour Modal */}
      <Dialog open={tour360Open} onOpenChange={setTour360Open}>
        <DialogContent
          ref={modalContentRef}
          className="max-w-[95vw] w-[95vw] h-[85vh] p-0 border-0 bg-black overflow-hidden [&>button]:z-50 [&>button]:text-white [&>button]:bg-black/60 [&>button]:rounded-full [&>button]:p-2 [&>button]:top-3 [&>button]:right-3"
        >
          <DialogTitle className="sr-only">Recorrido 360° Galería</DialogTitle>
          <div className="absolute top-3 right-14 z-50">
            <Button
              onClick={toggleFullscreen}
              variant="ghost"
              size="icon"
              className="text-white bg-black/60 rounded-full hover:bg-primary hover:text-primary-foreground h-9 w-9"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
          <iframe
            srcDoc={tour360HTML}
            className="w-full h-full border-0"
            allow="fullscreen; xr-spatial-tracking"
            title="Tour 360° Galería"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Galeria;
