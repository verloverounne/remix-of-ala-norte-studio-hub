import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import type { Space } from "@/types/supabase";
import { SpaceAvailabilityCalendar } from "./SpaceAvailabilityCalendar";

interface SpaceModalProps {
  space: Space | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SpaceModal = ({ space, open, onOpenChange }: SpaceModalProps) => {
  if (!space) return null;

  const specs = space.specs as any || {};
  const amenities = Array.isArray(space.amenities) ? space.amenities : [];
  const images = Array.isArray(space.images) ? space.images : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-3xl uppercase">
            {space.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vista 360 Placeholder */}
          <div className="w-full h-[400px] border-4 border-foreground bg-muted flex items-center justify-center">
            <div className="text-center">
              <p className="font-heading text-2xl mb-2">VISTA 360° A-FRAME</p>
              <p className="text-muted-foreground">
                [Aquí se insertará el iframe con la vista 360 del espacio]
              </p>
            </div>
          </div>

          {/* Carrusel de imágenes */}
          {images.length > 0 && (
            <div>
              <h3 className="font-heading text-xl mb-4 uppercase">IMÁGENES DEL ESPACIO</h3>
              <Carousel className="w-full">
                <CarouselContent>
                  {images.map((img, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-video bg-muted overflow-hidden border-2 border-foreground">
                        <img
                          src={img}
                          alt={`${space.name} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {images.length > 1 && (
                  <>
                    <CarouselPrevious />
                    <CarouselNext />
                  </>
                )}
              </Carousel>
            </div>
          )}

          {/* Descripción detallada */}
          {space.description && (
            <div>
              <h3 className="font-heading text-xl mb-2 uppercase">DESCRIPCIÓN</h3>
              <p className="text-muted-foreground font-heading leading-relaxed">
                {space.description}
              </p>
            </div>
          )}

          {space.detailed_description && (
            <div>
              <h3 className="font-heading text-xl mb-2 uppercase">DETALLES</h3>
              <p className="text-muted-foreground font-heading leading-relaxed">
                {space.detailed_description}
              </p>
            </div>
          )}

          {/* Información del espacio */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {specs.capacity && (
              <div className="border-2 border-foreground p-4">
                <p className="text-sm text-muted-foreground font-heading mb-1">CAPACIDAD</p>
                <p className="font-heading text-lg">{specs.capacity}</p>
              </div>
            )}
            {specs.size && (
              <div className="border-2 border-foreground p-4">
                <p className="text-sm text-muted-foreground font-heading mb-1">TAMAÑO</p>
                <p className="font-heading text-lg">{specs.size}</p>
              </div>
            )}
            <div className="border-2 border-foreground p-4">
              <p className="text-sm text-muted-foreground font-heading mb-1">PRECIO</p>
              <p className="font-heading text-lg text-primary">${space.price.toLocaleString()}</p>
            </div>
          </div>

          {/* Horarios */}
          {specs.schedule && (
            <div>
              <h3 className="font-heading text-xl mb-2 uppercase">HORARIOS Y VALORES</h3>
              <p className="text-muted-foreground font-heading">{specs.schedule}</p>
            </div>
          )}

          {/* Amenities incluidos */}
          {amenities.length > 0 && (
            <div>
              <h3 className="font-heading text-xl mb-2 uppercase">INCLUYE</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {amenities.map((amenity: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary font-heading">•</span>
                    <span className="text-muted-foreground font-heading">{amenity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Especificaciones técnicas */}
          {specs.specs_list && Array.isArray(specs.specs_list) && specs.specs_list.length > 0 && (
            <div>
              <h3 className="font-heading text-xl mb-2 uppercase">ESPECIFICACIONES</h3>
              <ul className="space-y-2">
                {specs.specs_list.map((spec: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary font-heading">•</span>
                    <span className="text-muted-foreground font-heading">{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Opcionales */}
          {specs.optionals && Array.isArray(specs.optionals) && specs.optionals.length > 0 && (
            <div>
              <h3 className="font-heading text-xl mb-2 uppercase">OPCIONALES</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {specs.optionals.map((optional: string, index: number) => (
                  <div key={index} className="border-2 border-foreground p-3 text-center">
                    <p className="font-heading text-sm">{optional}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Promoción */}
          {space.promotion && (
            <div className="bg-primary/10 border-2 border-primary p-4">
              <p className="font-heading text-lg text-primary">{space.promotion}</p>
            </div>
          )}

          {/* Availability Calendar */}
          {space.status === 'available' && (
            <>
              <Separator className="my-6" />
              <SpaceAvailabilityCalendar
                spaceId={space.id}
                price={space.price}
                spaceName={space.name}
              />
            </>
          )}

          {/* Slider de trabajos realizados */}
          <div>
            <h3 className="font-heading text-xl mb-4 uppercase">TRABAJOS REALIZADOS</h3>
            <div className="border-2 border-foreground p-8 bg-muted flex items-center justify-center">
              <p className="text-muted-foreground font-heading">
                [Slider de trabajos realizados en este espacio]
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
