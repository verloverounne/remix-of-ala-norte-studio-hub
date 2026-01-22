import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { cn, formatEquipmentName } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { EquipmentWithCategory } from "@/types/supabase";
import { RelatedEquipment } from "./RelatedEquipment";

interface EquipmentModalProps {
  equipment: EquipmentWithCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart?: (item: EquipmentWithCategory) => void;
  getCartQuantity?: (id: string) => number;
  canAddMore?: (item: EquipmentWithCategory) => boolean;
  onViewDetails?: (item: EquipmentWithCategory) => void;
}

export const EquipmentModal = ({
  equipment,
  open,
  onOpenChange,
  onAddToCart,
  getCartQuantity,
  canAddMore,
  onViewDetails,
}: EquipmentModalProps) => {
  const [equipmentImages, setEquipmentImages] = useState<string[]>([]);

  // Fetch images from equipment_images table
  useEffect(() => {
    if (!equipment?.id || !open) return;

    const fetchEquipmentImages = async () => {
      const { data, error } = await supabase
        .from("equipment_images")
        .select("image_url, order_index")
        .eq("equipment_id", equipment.id)
        .order("order_index");

      if (!error && data && data.length > 0) {
        setEquipmentImages(data.map((img) => img.image_url));
      } else {
        setEquipmentImages([]);
      }
    };

    fetchEquipmentImages();
  }, [equipment?.id, open]);

  if (!equipment) return null;

  // Combinar imágenes: equipment_images primero, luego principal, luego adicionales
  const allImages: string[] = [];

  // Agregar imágenes de equipment_images table primero
  equipmentImages.forEach((img) => {
    if (img && !allImages.includes(img)) {
      allImages.push(img);
    }
  });

  // Agregar imagen principal si existe y no está duplicada
  if (equipment.image_url && !allImages.includes(equipment.image_url)) {
    allImages.push(equipment.image_url);
  }

  // Agregar imágenes adicionales del campo images (evitando duplicados)
  if (Array.isArray(equipment.images)) {
    equipment.images.forEach((img) => {
      if (img && !allImages.includes(img)) {
        allImages.push(img);
      }
    });
  }

  // Si no hay imágenes, usar placeholder
  const images = allImages.length > 0 ? allImages : ["/placeholder.svg"];

  const cartQty = getCartQuantity?.(equipment.id) ?? 0;
  const canAdd = canAddMore?.(equipment) ?? true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[90vw] md:w-[50vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between gap-4">
          <DialogTitle className="flex items-center justify-between gap-2 w-full">
            {formatEquipmentName(equipment.name)}
          </DialogTitle>
        </DialogHeader>

        {/* Carrusel de imágenes */}
        <Carousel className="w-full">
          <CarouselContent>
            {images.map((img, index) => (
              <CarouselItem key={index}>
                <div className="aspect-video bg-muted overflow-hidden border-2 border-foreground">
                  <img src={img} alt={`${equipment.name} - ${index + 1}`} className="w-full h-full object-cover" />
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
        {/* Badge y botón agregar */}
        {onAddToCart && (
          <div className="flex items-center justify-between gap-2 w-full">
            <div
              className={cn(
                "rounded-none px-2 py-0.5 font-heading text-xs",
                cartQty > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {cartQty}/{equipment.stock_quantity}
            </div>

            {equipment.status === "available" ? (
              <Button
                size="sm"
                className="h-8 px-3 font-black"
                onClick={() => onAddToCart(equipment)}
                disabled={!canAdd}
              >
                {canAdd ? (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    AGREGAR
                  </>
                ) : (
                  <span className="text-xs">MÁXIMO</span>
                )}
              </Button>
            ) : (
              <Button size="sm" className="h-8 px-3" disabled>
                <X className="h-4 w-4 mr-1" />
                NO DISP.
              </Button>
            )}
          </div>
        )}

        <div className="space-y-6">
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
                <Badge>{equipment.categories.name}</Badge>
              </div>
            )}
          </div>

          {/* Descripción */}
          {equipment.description && (
            <div>
              <h3 className="font-heading text-xl mb-2 uppercase">DESCRIPCIÓN</h3>
              <p className="text-muted-foreground font-heading leading-relaxed">{equipment.description}</p>
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
                      {typeof spec === "string" ? spec : spec.label || spec.value || JSON.stringify(spec)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Precios */}
          <div className="border-t-2 border-foreground pt-4">
            <h3 className="font-heading text-xl mb-4 uppercase">PRECIOS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border-2 border-foreground p-4">
                <p className="text-sm text-muted-foreground font-heading">POR DÍA</p>
                <p className="font-heading text-3xl text-primary">${(equipment.price_per_day / 1000).toFixed(0)}K</p>
              </div>
              {equipment.price_per_week && (
                <div className="border-2 border-foreground p-4">
                  <p className="text-sm text-muted-foreground font-heading">POR SEMANA</p>
                  <p className="font-heading text-3xl text-primary">${(equipment.price_per_week / 1000).toFixed(0)}K</p>
                </div>
              )}
            </div>
          </div>

          {/* Related Equipment */}
          <Separator className="my-6" />
          <RelatedEquipment
            equipmentId={equipment.id}
            categoryId={equipment.category_id || undefined}
            subcategoryId={equipment.subcategory_id || undefined}
            onAddToCart={onAddToCart}
            getCartQuantity={getCartQuantity}
            canAddMore={canAddMore}
            onViewDetails={onViewDetails}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
