import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import type { EquipmentWithCategory } from "@/types/supabase";

interface RelatedEquipmentProps {
  equipmentId: string;
  categoryId?: string;
  subcategoryId?: string;
}

export const RelatedEquipment = ({
  equipmentId,
  categoryId,
  subcategoryId,
}: RelatedEquipmentProps) => {
  const [relatedItems, setRelatedItems] = useState<EquipmentWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchRelatedEquipment();
  }, [equipmentId, categoryId, subcategoryId]);

  const fetchRelatedEquipment = async () => {
    setLoading(true);

    // First try to get recommended equipment from recommendations table
    const { data: recommendations } = await supabase
      .from("equipment_recommendations")
      .select(`
        recommended_id,
        reason,
        equipment:recommended_id (
          *,
          categories (*),
          subcategories (*)
        )
      `)
      .eq("equipment_id", equipmentId)
      .limit(6);

    if (recommendations && recommendations.length > 0) {
      const items = recommendations
        .map((rec: any) => rec.equipment)
        .filter((item: any) => item && item.status === "available")
        .map((item: any) => ({
          ...item,
          images: Array.isArray(item.images) ? item.images : []
        }));
      
      setRelatedItems(items);
      setLoading(false);
      return;
    }

    // Fallback: Get equipment from same subcategory or category
    let query = supabase
      .from("equipment")
      .select(`
        *,
        categories (*),
        subcategories (*)
      `)
      .eq("status", "available")
      .neq("id", equipmentId);

    if (subcategoryId) {
      query = query.eq("subcategory_id", subcategoryId);
    } else if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query.limit(6);

    if (!error && data) {
      const transformedData = data.map((item: any) => ({
        ...item,
        images: Array.isArray(item.images) ? item.images : []
      }));
      setRelatedItems(transformedData);
    }

    setLoading(false);
  };

  const handleAddToCart = (item: EquipmentWithCategory) => {
    addItem({
      id: item.id,
      name: item.name,
      brand: item.brand || undefined,
      pricePerDay: item.price_per_day,
      imageUrl: item.image_url || undefined,
      stockQuantity: item.stock_quantity,
    });
    
    toast({
      title: "Agregado a reserva",
      description: `${item.name} agregado al carrito`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (relatedItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="font-heading text-xl uppercase">Equipos Relacionados</h3>
        <Badge variant="secondary" className="text-xs">
          Frecuentemente alquilados juntos
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedItems.map((item) => (
          <Card key={item.id} className="overflow-hidden group">
            <div className="aspect-video bg-muted relative overflow-hidden border-b-2 border-foreground">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover grayscale group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-2xl opacity-20 font-heading">NO IMG</span>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <h4 className="font-heading text-lg uppercase line-clamp-2 mb-2">
                {item.name}
              </h4>
              {item.brand && (
                <p className="text-xs text-muted-foreground font-mono mb-3">
                  {item.brand}
                </p>
              )}

              <div className="flex items-baseline gap-2">
                <span className="text-primary font-heading text-2xl">
                  ${(item.price_per_day / 1000).toFixed(0)}K
                </span>
                <span className="text-muted-foreground font-mono text-xs">/día</span>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
              <Button
                onClick={() => handleAddToCart(item)}
                size="sm"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                AGREGAR
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
