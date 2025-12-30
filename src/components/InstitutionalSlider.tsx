import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  order_index: number;
}

interface InstitutionalSliderProps {
  pageType: "home" | "servicios";
  className?: string;
}

export const InstitutionalSlider = ({ pageType, className = "" }: InstitutionalSliderProps) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("page_type", pageType)
        .order("order_index");

      if (!error && data && data.length > 0) {
        setImages(data);
      }
      setLoading(false);
    };

    fetchImages();
  }, [pageType]);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap());
    });
  }, [api]);

  // Don't render if no images
  if (loading || images.length === 0) {
    return null;
  }

  return (
    <section className={`relative border-y-4 border-foreground overflow-hidden ${className}`}>
      <Carousel className="w-full" setApi={setApi}>
        <CarouselContent className="-ml-0">
          {images.map((image) => (
            <CarouselItem key={image.id} className="pl-0 basis-full">
              <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden">
                <img
                  src={image.image_url}
                  alt={image.title || "Imagen institucional"}
                  className="w-full h-full object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                
                {/* Text overlay */}
                {(image.title || image.description) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center z-10 p-4 sm:p-8 max-w-4xl">
                      {image.title && (
                        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-2 sm:mb-4 uppercase text-background drop-shadow-lg">
                          {image.title}
                        </h2>
                      )}
                      {image.description && (
                        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-background/90 font-heading drop-shadow-md">
                          {image.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-2 sm:left-4 lg:left-8 h-10 w-10 sm:h-12 sm:w-12 border-2 border-background bg-background/20 hover:bg-background/40 text-background" />
            <CarouselNext className="right-2 sm:right-4 lg:right-8 h-10 w-10 sm:h-12 sm:w-12 border-2 border-background bg-background/20 hover:bg-background/40 text-background" />
          </>
        )}
      </Carousel>

      {/* Navigation dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? "w-8 sm:w-12 bg-primary" : "w-2 bg-background/50"
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default InstitutionalSlider;
