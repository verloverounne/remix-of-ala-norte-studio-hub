import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Space {
  id: number;
  name: string;
  images: string[];
  description: string;
  capacity: string;
  size: string;
  amenities: string[];
  price: string;
  schedule?: string;
  discount?: string;
  optionals?: string[];
  specs?: string[];
}

interface SpaceModalProps {
  space: Space | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SpaceModal = ({ space, open, onOpenChange }: SpaceModalProps) => {
  if (!space) return null;

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
          <div>
            <h3 className="font-heading text-xl mb-4 uppercase">IMÁGENES DEL ESPACIO</h3>
            <Carousel className="w-full">
              <CarouselContent>
                {space.images.map((img, index) => (
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
              {space.images.length > 1 && (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              )}
            </Carousel>
          </div>

          {/* Descripción detallada */}
          <div>
            <h3 className="font-heading text-xl mb-2 uppercase">DESCRIPCIÓN</h3>
            <p className="text-muted-foreground font-heading leading-relaxed">
              {space.description}
            </p>
          </div>

          {/* Información del espacio */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="border-2 border-foreground p-4">
              <p className="text-sm text-muted-foreground font-heading mb-1">CAPACIDAD</p>
              <p className="font-heading text-lg">{space.capacity}</p>
            </div>
            <div className="border-2 border-foreground p-4">
              <p className="text-sm text-muted-foreground font-heading mb-1">TAMAÑO</p>
              <p className="font-heading text-lg">{space.size}</p>
            </div>
            <div className="border-2 border-foreground p-4">
              <p className="text-sm text-muted-foreground font-heading mb-1">PRECIO</p>
              <p className="font-heading text-lg text-primary">${space.price}</p>
            </div>
          </div>

          {/* Horarios */}
          {space.schedule && (
            <div>
              <h3 className="font-heading text-xl mb-2 uppercase">HORARIOS Y VALORES</h3>
              <p className="text-muted-foreground font-heading">{space.schedule}</p>
            </div>
          )}

          {/* Amenities incluidos */}
          {space.amenities.length > 0 && (
            <div>
              <h3 className="font-heading text-xl mb-2 uppercase">INCLUYE</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {space.amenities.map((amenity, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary font-heading">•</span>
                    <span className="text-muted-foreground font-heading">{amenity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Especificaciones técnicas */}
          {space.specs && space.specs.length > 0 && (
            <div>
              <h3 className="font-heading text-xl mb-2 uppercase">ESPECIFICACIONES</h3>
              <ul className="space-y-2">
                {space.specs.map((spec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary font-heading">•</span>
                    <span className="text-muted-foreground font-heading">{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Opcionales */}
          {space.optionals && space.optionals.length > 0 && (
            <div>
              <h3 className="font-heading text-xl mb-2 uppercase">OPCIONALES</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {space.optionals.map((optional, index) => (
                  <div key={index} className="border-2 border-foreground p-3 text-center">
                    <p className="font-heading text-sm">{optional}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Descuentos */}
          {space.discount && (
            <div className="bg-primary/10 border-2 border-primary p-4">
              <p className="font-heading text-lg text-primary">{space.discount}</p>
            </div>
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

          {/* Sección de comentarios */}
          <div>
            <h3 className="font-heading text-xl mb-4 uppercase">COMENTARIOS</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="comments" className="font-heading">
                  ¿Tienes alguna pregunta sobre este espacio?
                </Label>
                <Textarea
                  id="comments"
                  placeholder="Escribe tu comentario o consulta..."
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
