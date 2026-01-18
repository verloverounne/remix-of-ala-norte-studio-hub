import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X } from "lucide-react";
import { LazyImage } from "@/components/LazyImage";
import { cn } from "@/lib/utils";
import type { EquipmentWithCategory } from "@/types/supabase";

// Formatear nombre: primera letra mayúscula, resto minúsculas, siglas en mayúsculas
const formatEquipmentName = (name: string): string => {
  const acronyms = ['HD', 'SDI', 'HDMI', 'USB', 'LED', 'HMI', 'AC', 'DC', 'RGB', 'DMX', 'XLR', 'BNC', 'NP', 'BP', 'AB', 'V', 'PL', 'EF', 'RF', 'MFT', 'E', 'S35', 'FF', '4K', '8K', '2K', 'UHD', 'RAW', 'SSD', 'CFast', 'SD', 'CF', 'LUT', 'ND', 'IR', 'UV', 'VR', 'AR', 'XR', 'AI', 'DI', 'LF', 'S16', 'S8', 'ARRI', 'RED', 'SONY', 'CANON', 'ZEISS', 'COOKE', 'ANGENIEUX', 'FUJINON', 'LEITZ', 'SIGMA', 'TILTA', 'DJI', 'APUTURE', 'GODOX', 'NANLITE', 'LITEPANELS', 'KINO', 'DEDOLIGHT', 'ASTERA', 'QUASAR', 'ROSCO', 'CHIMERA', 'SNAPBAG', 'SOFTBOX', 'FRESNEL', 'PAR', 'MR', 'ALEXA', 'VENICE', 'FX', 'C70', 'C300', 'C500', 'R5', 'R6', 'A7', 'FX3', 'FX6', 'FX9', 'FS5', 'FS7', 'EOS', 'XC', 'XF', 'Z', 'S1H', 'GH', 'BMPCC', 'URSA', 'KOMODO', 'RAPTOR', 'MONSTRO', 'GEMINI', 'HELIUM', 'DRAGON', 'MINI', 'LT', 'XT', 'SXT', 'LPL', 'SP', 'CP', 'UP', 'MP', 'DP', 'MK', 'CN', 'T', 'F', 'MM', 'CM', 'M', 'KG', 'LB', 'W', 'WH', 'AH', 'MAH', 'V-MOUNT', 'GOLD', 'ANTON', 'BAUER', 'IDX', 'PAG', 'CORE', 'SWX', 'BEBOB', 'BLUESHAPE', 'FXLION', 'DYNACORE', 'HAWK', 'VANTAGE', 'PANAVISION', 'MOVIECAM', 'KINEFINITY', 'BLACKMAGIC', 'ATOMOS', 'SMALLHD', 'TVL', 'SHOGUN', 'NINJA', 'SUMO', 'TERADEK', 'BOLT', 'CUBE', 'COLR', 'SACHTLER', 'OCONNOR', 'CARTONI', 'RONFORD', 'BAKER', 'MILLER', 'LIBEC', 'MANFROTTO', 'GITZO', 'EASYRIG', 'READYRIG', 'STEADICAM', 'MOVI', 'RONIN', 'GIMBAL', 'CRANE', 'RS', 'RSC', 'SC', 'NUCLEUS', 'WCU', 'CFORCE', 'CMOTION', 'PRESTON', 'BARTECH', 'HEDEN', 'PDMOVIE', 'FOLLOWFOCUS', 'MATTEBOX', 'CLAMP', 'ROD', '15MM', '19MM', 'LWS', 'SWS', 'BRIDGE', 'PLATE', 'CAGE', 'RIG', 'SHOULDER', 'HANDHELD', 'TRIPOD', 'DOLLY', 'SLIDER', 'JIB', 'CRANE', 'TECHNOCRANE', 'SCORPIO', 'LAMBDA', 'SUPERTECHNO', 'MOVIEBIRD', 'GFCRANE', 'HEAD', 'FLUID', 'GEARED', 'DUTCH', 'TILT', 'PAN', 'NODAL', 'LEVELING', 'SPEEDRAIL', 'PIPE', 'JUNIOR', 'BABY', 'COMBO', 'CSTAND', 'AVENGER', 'KUPO', 'GRIP', 'GOBO', 'FLAG', 'FLOPPY', 'SOLID', 'NET', 'SILK', 'DIFF', 'FRAME', 'BUTTERFLY', 'OVERHEAD', 'REFLECTOR', 'BOUNCE', 'NEGATIVE', 'POLY', 'BEAD', 'GRIFF', 'ULTRA', 'DINO', 'MAXI', 'BRUTE', 'WENDY', 'BLONDE', 'REDHEAD', 'MOLE', 'RICHARDSON', 'SKYPANEL', 'ORBITER', 'S60', 'S30', 'S120', 'MAX', 'PRO', 'PLUS', 'LITE', 'AIR', 'II', 'III', 'IV', 'V', 'VI', 'X', 'XL', 'XXL', 'S', 'L', 'XS', 'XXS'];
  
  return name.split(' ').map((word, index) => {
    const upperWord = word.toUpperCase();
    if (acronyms.includes(upperWord)) return upperWord;
    if (/\d/.test(word) && /[a-zA-Z]/.test(word)) return word;
    if (/^\d+$/.test(word)) return word;
    if (index === 0) return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    return word.toLowerCase();
  }).join(' ');
};

interface RelatedEquipmentProps {
  equipmentId: string;
  categoryId?: string;
  subcategoryId?: string;
  onAddToCart?: (item: EquipmentWithCategory) => void;
  getCartQuantity?: (id: string) => number;
  canAddMore?: (item: EquipmentWithCategory) => boolean;
  onViewDetails?: (item: EquipmentWithCategory) => void;
}

export const RelatedEquipment = ({
  equipmentId,
  categoryId,
  subcategoryId,
  onAddToCart: externalAddToCart,
  getCartQuantity: externalGetCartQuantity,
  canAddMore: externalCanAddMore,
  onViewDetails,
}: RelatedEquipmentProps) => {
  const [relatedItems, setRelatedItems] = useState<EquipmentWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, items: cartItems } = useCart();
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
    if (externalAddToCart) {
      externalAddToCart(item);
    } else {
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
    }
  };

  const getCartQty = (id: string): number => {
    if (externalGetCartQuantity) return externalGetCartQuantity(id);
    const cartItem = cartItems.find(i => i.id === id);
    return cartItem?.quantity || 0;
  };

  const canAdd = (item: EquipmentWithCategory): boolean => {
    if (externalCanAddMore) return externalCanAddMore(item);
    const cartItem = cartItems.find(i => i.id === item.id);
    const currentQty = cartItem?.quantity || 0;
    return currentQty < item.stock_quantity;
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
      <h3 className="font-heading text-xl uppercase">Equipos Relacionados</h3>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {relatedItems.map((item) => {
          const cartQty = getCartQty(item.id);
          const itemCanAdd = canAdd(item);

          return (
            <Card 
              key={item.id}
              className="overflow-hidden group relative border-0 shadow-none hover:shadow-none [box-shadow:none!important] hover:[box-shadow:none!important]"
            >
              <CardContent className="p-2 sm:p-3 flex flex-col space-y-2">
                {/* 1. Nombre del equipo - formateado sin uppercase */}
                <h3 
                  className="font-heading text-xs sm:text-sm leading-tight pt-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors h-[5em]"
                  onClick={() => onViewDetails?.(item)}
                >
                  {formatEquipmentName(item.name)}
                </h3>
                
                {/* 2. Foto con badge */}
                <div 
                  className="relative aspect-square cursor-pointer duotone-hover-group overflow-hidden"
                  onClick={() => onViewDetails?.(item)}
                >
                  {/* Cart quantity badge */}
                  <div className={cn(
                    "absolute bottom-2 right-2 z-10 rounded-none px-2 py-0.5 flex items-center justify-center font-heading text-[10px] sm:text-xs shadow-brutal-sm",
                    cartQty > 0 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {cartQty}/{item.stock_quantity}
                  </div>
                  
                  {item.image_url ? (
                    <LazyImage
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full group-hover:scale-105 transition-all duration-300"
                      placeholderClassName="w-full h-full"
                      aspectRatio="square"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-2xl sm:text-3xl opacity-20 font-heading">?</span>
                    </div>
                  )}
                </div>
                
                {/* 3. Precio y Botón agregar */}
                <div className="mt-auto flex items-center gap-2">
                  <div className="flex-1 flex items-baseline gap-1">
                    <span className="text-primary font-heading text-lg sm:text-xl">
                      ${item.price_per_day > 0 ? (item.price_per_day / 1000).toFixed(0) + 'K' : '—'}
                    </span>
                    <span className="text-muted-foreground font-mono text-[10px]">/día</span>
                  </div>
                  
                  {item.status === 'available' ? (
                    <Button 
                      size="sm"
                      className="h-8 sm:h-9 w-8 sm:w-9 p-0 overflow-hidden transition-all duration-300 hover:w-[100px] sm:hover:w-[120px] hover:px-2 sm:hover:px-3 font-black flex-shrink-0 group relative flex items-center justify-center gap-0"
                      onClick={() => handleAddToCart(item)}
                      disabled={!itemCanAdd}
                    >
                      {itemCanAdd ? (
                        <>
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 m-0" />
                          <span className="whitespace-nowrap opacity-0 w-0 overflow-hidden transition-all duration-300 group-hover:opacity-100 group-hover:w-auto group-hover:ml-2 font-black">
                            AGREGAR
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] font-black">MÁX</span>
                      )}
                    </Button>
                  ) : (
                    <Button size="sm" className="h-8 sm:h-9 w-8 sm:w-9 p-0 font-black flex-shrink-0 flex items-center justify-center" disabled>
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};