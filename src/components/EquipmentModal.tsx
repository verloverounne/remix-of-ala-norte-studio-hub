import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { EquipmentWithCategory } from "@/types/supabase";

interface EquipmentModalProps {
  equipment: EquipmentWithCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EquipmentModal = ({ equipment, open, onOpenChange }: EquipmentModalProps) => {
  if (!equipment) return null;

  // Parse images - could be array or single URL
  const images = equipment.image_url 
    ? Array.isArray(equipment.image_url) 
      ? equipment.image_url 
      : [equipment.image_url]
    : ["/placeholder.svg"];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { text: "DISPONIBLE", variant: "success" as const },
      rented: { text: "RENTADO", variant: "destructive" as const },
      maintenance: { text: "MANTENIMIENTO", variant: "outline" as const },
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
  };

  const statusBadge = getStatusBadge(equipment.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-3xl uppercase flex items-center gap-4">
            {equipment.name}
            <Badge variant={statusBadge.variant as any}>
              {statusBadge.text}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Carrusel de imágenes */}
          <Carousel className="w-full">
            <CarouselContent>
              {images.map((img, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-video bg-muted overflow-hidden border-2 border-foreground">
                    <img
                      src={img}
                      alt={`${equipment.name} - ${index + 1}`}
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

          {/* Información básica */}
          <div className="grid grid-cols-2 gap-4">
            {equipment.brand && (
              <div>
                <p className="text-sm text-muted-foreground font-heading">MARCA</p>
                <p className="font-heading text-lg">{equipment.brand}</p>
              </div>
            )}
            {equipment.model && (
              <div>
                <p className="text-sm text-muted-foreground font-heading">MODELO</p>
                <p className="font-heading text-lg">{equipment.model}</p>
              </div>
            )}
            {equipment.categories && (
              <div>
                <p className="text-sm text-muted-foreground font-heading">CATEGORÍA</p>
                <p className="font-heading text-lg">{equipment.categories.name}</p>
              </div>
            )}
          </div>

          {/* Descripción */}
          {equipment.description && (
            <div>
              <h3 className="font-heading text-xl mb-2 uppercase">DESCRIPCIÓN</h3>
              <p className="text-muted-foreground font-heading leading-relaxed">
                {equipment.description}
              </p>
            </div>
          )}

          {/* Especificaciones */}
          {equipment.specs && Array.isArray(equipment.specs) && equipment.specs.length > 0 && (
            <div>
              <h3 className="font-heading text-xl mb-2 uppercase">ESPECIFICACIONES</h3>
              <ul className="space-y-2">
                {equipment.specs.map((spec: any, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary font-heading">•</span>
                    <span className="text-muted-foreground font-heading">
                      {typeof spec === 'string' ? spec : spec.label || spec.value || JSON.stringify(spec)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Precios */}
          <div className="border-t-2 border-foreground pt-4">
            <h3 className="font-heading text-xl mb-4 uppercase">PRECIOS</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-foreground p-4">
                <p className="text-sm text-muted-foreground font-heading">POR DÍA</p>
                <p className="font-heading text-3xl text-primary">
                  ${(equipment.price_per_day / 1000).toFixed(0)}K
                </p>
              </div>
              {equipment.price_per_week && (
                <div className="border-2 border-foreground p-4">
                  <p className="text-sm text-muted-foreground font-heading">POR SEMANA</p>
                  <p className="font-heading text-3xl text-primary">
                    ${(equipment.price_per_week / 1000).toFixed(0)}K
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
