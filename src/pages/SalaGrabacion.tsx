import { useState, useRef, useCallback, useEffect } from "react";
import { Seo } from "@/components/Seo";
import { Calendar, Maximize2, Minimize2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Viewer360 from "@/components/Viewer360";
import { GalleryHero } from "@/components/GalleryHero";
import { ProductionsSlider } from "@/components/ProductionsSlider";
import { useGalleryImages } from "@/hooks/useGalleryImages";
import { useSpace } from "@/hooks/useSpace";

const SALA_360_IMAGE =
  "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//36-1%203.JPG";

const SalaGrabacion = () => {
  const { space, loading } = useSpace("sala-grabacion");
  const { getByPageType } = useGalleryImages();
  const [tour360Open, setTour360Open] = useState(false);
  const [planoOpen, setPlanoOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const allSalaImages = getByPageType("sala-grabacion");
  // Plano image: match by URL or title containing "plano"
  const isPlano = (img: { image_url?: string; title?: string | null }) =>
    img.image_url?.toLowerCase().includes("plano") || img.title?.toLowerCase().includes("plano");
  const GALERIA_PLANO_URL =
    "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//gallery_1775335547737_plano_galeria.png";
  const planoImage = { image_url: GALERIA_PLANO_URL, title: "Plano" };
  // Slideshow excludes the plano (it's shown separately as floor plan)
  const salaImages = allSalaImages.filter((img) => !isPlano(img));
  const featuredMediaImage = GALERIA_PLANO_URL;
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

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

  // Auto-advance carousel with slow zoom transition
  useEffect(() => {
    if (salaImages.length <= 1) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % salaImages.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [salaImages.length]);

  // Buffered preload: load current + next 3 images in advance
  useEffect(() => {
    if (salaImages.length === 0) return;
    const indicesToPreload = [0, 1, 2, 3].map((offset) => (carouselIndex + offset) % salaImages.length);
    indicesToPreload.forEach((idx) => {
      if (loadedImages.has(idx)) return;
      const url = salaImages[idx]?.image_url;
      if (!url) return;
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setLoadedImages((prev) => {
          if (prev.has(idx)) return prev;
          const next = new Set(prev);
          next.add(idx);
          return next;
        });
      };
    });
  }, [carouselIndex, salaImages, loadedImages]);

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
  </style>
</head>
<body>
  <div class="hint" id="hint">Arrastrá para explorar el espacio</div>
  <a-scene vr-mode-ui="enabled: false" loading-screen="enabled: false" embedded style="width:100%;height:100vh;">
    <a-sky id="sky" src="${SALA_360_IMAGE}" rotation="180 0 0" scale="-1 1 1"></a-sky>
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
      <Seo
        title="Sala de Sonido y Postproducción | Ala Norte"
        description="Sala de grabación y postproducción de audio con tour 360°. Equipamiento profesional para doblaje, foley, mezcla y diseño sonoro en Buenos Aires."
        path="/sala-grabacion"
      />
      {/* Hero Section - Full width */}
      <GalleryHero space={space} />

      {/* Details Section */}
      <section className="mb-0 mt-0 sm:py-0">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 bg-muted py-0 pt-[64px]">
          {/* Two-column: Featured Image + Text */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start py-0">
            {/* Left Column: Featured Image */}
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => featuredMediaImage && setPlanoOpen(true)}
                className="overflow-hidden group rounded-sm block w-full cursor-zoom-in"
                aria-label="Ampliar plano"
              >
                <img
                  src={
                    featuredMediaImage ||
                    space.featured_image ||
                    (space.images && space.images[0]) ||
                    "/placeholder.svg"
                  }
                  alt={space.name}
                  className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02] py-0 mb-0 my-0"
                />
              </button>
              {space.layout_description && (
                <div className="bg-muted p-4 rounded-lg py-[16px] px-0">
                  <h3 className="font-heading font-bold mb-2 text-background">Plano de la sala</h3>
                  <p className="font-heading text-lg font-medium text-background">{space.layout_description}</p>
                </div>
              )}
            </div>

            {/* Right Column: Text Content */}
            <div className="space-y-6 h-full py-[64px] pt-0">
              <div>
                <h2 className="text-2xl font-heading font-bold mb-4 sm:text-6xl py-[32px] pt-0 mt-0 px-0">
                  El espacio
                </h2>
                <p className="text-muted-foreground font-heading font-medium text-xl">
                  {space.detailed_description || space.description}
                </p>
              </div>

              {space.features && Array.isArray(space.features) && space.features.length > 0 && (
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-lg">
                  {(space.features as string[]).map((feature, index) => (
                    <p
                      key={index}
                      className="text-muted-foreground font-heading flex items-start gap-2 text-xl font-thin"
                    >
                      <span className="text-primary">•</span>
                      {feature}
                    </p>
                  ))}
                </div>
              )}

              {space.included_items && space.included_items.length > 0 && (
                <div>
                  <h3 className="text-xl font-heading font-bold flex items-center gap-16 py-[32px]">
                    Incluido sin cargo adicional
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {space.included_items.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-muted-foreground text-base">
                        <span className="text-primary">•</span>
                        <span className="font-heading">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-4 my-[64px] mb-0 mt-[78px]">
                <Button variant="hero" size="lg" onClick={() => setTour360Open(true)} className="w-full sm:w-auto">
                  <Eye className="mr-2 h-5 w-5" />
                  RECORRIDO VIRTUAL
                </Button>
                <Button variant="hero" size="lg" asChild className="w-full sm:w-auto">
                  <Link to="/contacto">
                    <Calendar className="mr-2 h-5 w-5" />
                    {space.cta_text || "RESERVAR BLOQUE"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule + Optional Services */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 my-[32px] mb-[64px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-[32px]">
          <div>
            <h3 className="font-heading font-bold mb-2 flex items-center gap-2">HORARIOS</h3>
            <p className="font-heading text-2xl font-bold text-primary">{space.schedule_weekday}</p>
            <p className="font-heading text-lg text-inherit font-light">{space.schedule_weekend}</p>
          </div>

          {space.optional_services && space.optional_services.length > 0 && (
            <div>
              <h3 className="text-xl font-heading font-bold mb-3">Servicios adicionales</h3>
              <div className="flex flex-wrap gap-2">
                {space.optional_services.map((service, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="inline-flex items-center rounded-md border px-3 py-1 text-xs uppercase tracking-wider transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer font-heading font-medium border-primary-light text-foreground bg-background"
                  >
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slideshow Block */}
      <section className="py-12 space-y-8 bg-foreground text-background sm:py-0 pb-[64px]">
        <div className="w-full">
          <div className="relative aspect-video overflow-hidden bg-foreground">
            {salaImages.length > 0 ? (
              <>
                <img
                  src={salaImages[carouselIndex]?.image_url || "/placeholder.svg"}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60 z-0"
                />
                {salaImages.map((img, i) => (
                  <img
                    key={img.id || i}
                    src={img.image_url || "/placeholder.svg"}
                    alt={img.title || `Sala de grabación ${i + 1}`}
                    onLoad={() =>
                      setLoadedImages((prev) => {
                        if (prev.has(i)) return prev;
                        const next = new Set(prev);
                        next.add(i);
                        return next;
                      })
                    }
                    style={{
                      transitionTimingFunction: "cubic-bezier(0.45, 0.0, 0.25, 1)",
                    }}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[6000ms] will-change-[opacity] ${
                      i === carouselIndex && loadedImages.has(i)
                        ? "opacity-100 animate-ken-burns z-[1]"
                        : "opacity-0 z-0"
                    }`}
                  />
                ))}
                {salaImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCarouselIndex((prev) => (prev - 1 + salaImages.length) % salaImages.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-primary text-primary-foreground rounded-sm p-2 shadow-brutal hover:translate-x-[-2px] transition-transform"
                      aria-label="Anterior"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCarouselIndex((prev) => (prev + 1) % salaImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-primary text-primary-foreground rounded-sm p-2 shadow-brutal hover:translate-x-[2px] transition-transform"
                      aria-label="Siguiente"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {salaImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCarouselIndex(i)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            i === carouselIndex ? "bg-primary w-4" : "bg-white/60"
                          }`}
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
      </section>

      {/* 360° Virtual Tour Section */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-4">
              Ya conocés la sala de grabación?
            </h2>
            <p className="text-muted-foreground font-heading text-lg">
              Explorá la sala antes de tu reserva. Arrastrá para moverte y conocer cada rincón del espacio.
            </p>
          </div>
        </div>
        <div className="w-full">
          <Viewer360 imageSrc={SALA_360_IMAGE} height="100vh" mobileHeight="80vh" />
        </div>
      </section>

      {/* Productions Slider */}
      <ProductionsSlider />

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-3 sm:mb-4 text-center">
            ¿Querés reservar la sala?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto font-heading leading-tight">
            Hablemos de tu proyecto. Te contamos disponibilidad, armamos una propuesta a medida y coordinamos todo para
            que llegues tranquilo a la sesión.
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
          <DialogTitle className="sr-only">Recorrido 360° Sala de Grabación</DialogTitle>
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
            title="Tour 360° Sala de Grabación"
          />
        </DialogContent>
      </Dialog>

      {/* Plano Modal */}
      <Dialog open={planoOpen} onOpenChange={setPlanoOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 border-0 bg-background overflow-auto [&>button]:z-50 [&>button]:text-foreground [&>button]:bg-background [&>button]:rounded-sm [&>button]:p-2 [&>button]:top-3 [&>button]:right-3 [&>button]:shadow-brutal-sm">
          <DialogTitle className="sr-only">Plano ilustrativo de la sala</DialogTitle>
          <div className="w-full h-full flex items-center justify-center p-4">
            <img
              src={planoImage?.image_url || featuredMediaImage || "/placeholder.svg"}
              alt={planoImage?.title || "Plano ilustrativo de la sala"}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalaGrabacion;
