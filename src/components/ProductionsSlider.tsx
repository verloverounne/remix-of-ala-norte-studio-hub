import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { useGalleryImages } from "@/hooks/useGalleryImages";

export const ProductionsSlider = () => {
  const { getByPageType, loading } = useGalleryImages();
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const images = getByPageType("producciones");

  useEffect(() => {
    if (!api) return;
    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap());
    });
  }, [api]);

  if (loading || images.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background border-y-4 border-foreground">
      <div className="container mx-auto px-4 mb-8 sm:mb-12">
        <div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-brutal mb-2 sm:mb-4">
            PRODUCCIONES EN ALA NORTE
          </h2>
          <p className="text-sm sm:text-base lg:text-sm text-muted-foreground font-heading leading-tight">
            PROYECTOS REALIZADOS EN NUESTRA GALERÍA DE FILMACIÓN
          </p>
        </div>
      </div>

      <Carousel className="w-full" setApi={setApi} opts={{ loop: true }}>
        <CarouselContent className="-ml-0">
          {images.map((image) => (
            <CarouselItem key={image.id} className="pl-0 basis-full md:basis-1/2 lg:basis-1/3">
              <div className="relative aspect-[4/3] overflow-hidden mx-2 group duotone-hover-group">
                {image.media_type === "video" ? (
                  <video
                    src={image.vertical_video_url || image.image_url}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 video-duotone"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={image.image_url}
                    alt={image.title || "Producción en Ala Norte"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 image-duotone"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {(image.title || image.description) && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    {image.title && (
                      <h3 className="font-heading text-lg font-bold text-background mb-1">
                        {image.title}
                      </h3>
                    )}
                    {image.description && (
                      <p className="text-sm text-background/80 font-heading">{image.description}</p>
                    )}
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>

      {/* Navigation dots */}
      <div className="flex justify-center gap-2 mt-8">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? "w-8 bg-primary" : "w-2 bg-foreground/40"
            }`}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductionsSlider;
