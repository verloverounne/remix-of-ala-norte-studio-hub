import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LazyImage } from "@/components/LazyImage";
import { cn, formatEquipmentName } from "@/lib/utils";
import type { EquipmentWithCategory } from "@/types/supabase";
type EquipmentWithStock = EquipmentWithCategory;
interface EquipmentListViewProps {
  equipment: EquipmentWithStock[];
  onAddToCart: (item: EquipmentWithStock) => void;
  onViewDetails: (item: EquipmentWithStock) => void;
  getCartQuantity: (id: string) => number;
  canAddMore: (item: EquipmentWithStock) => boolean;
}
export const EquipmentListView = ({
  equipment,
  onAddToCart,
  onViewDetails,
  getCartQuantity,
  canAddMore
}: EquipmentListViewProps) => {
  if (equipment.length === 0) {
    return <div className="text-center py-8 sm:py-12 text-muted-foreground">
        <p className="font-heading text-lg">No hay equipos disponibles</p>
      </div>;
  }
  return <div className="divide-y divide-foreground/10">
      {equipment.map(item => {
      const cartQty = getCartQuantity(item.id);
      const canAdd = canAddMore(item);
      return <div key={item.id} className="flex items-center max-w-screen-lg gap-3 py-3 transition-colors border-[#2e2c29] bg-background mx-2">
            {/* Thumbnail */}
            <div className="w-8 h-8 sm:w-16 sm:h-16 flex-shrink-0 cursor-pointer overflow-hidden bg-muted" onClick={() => onViewDetails(item)}>
              {item.image_url ? <LazyImage src={item.image_url} alt={item.name} className="w-full h-full object-cover" placeholderClassName="w-full h-full" aspectRatio="square" /> : <div className="w-full h-full flex items-center justify-center">
                  <span className="text-lg opacity-20 font-heading">?</span>
                </div>}
            </div>

            {/* Name - clickable */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onViewDetails(item)}>
              <h3 className="font-heading text-xs sm:text-sm normal-case line-clamp-2 hover:text-primary transition-colors">
                {formatEquipmentName(item.name)}
              </h3>
              {item.brand && <span className="text-[10px] text-muted-foreground uppercase">
                  {item.brand}
                </span>}
            </div>

            {/* Price */}
            <div className="flex-shrink-0 text-right">
              <span className="font-heading text-sm sm:text-base text-[#f82020]">
                ${item.price_per_day > 0 ? (item.price_per_day / 1000).toFixed(0) + 'K' : '—'}
              </span>
              <span className="text-muted-foreground font-mono text-[9px] sm:text-[10px] ml-0.5">/día</span>
            </div>

            {/* Badge - reserved/total */}
            <Badge variant="secondary" className={cn("flex-shrink-0 text-[10px] px-2 py-0.5 font-heading border-0", cartQty > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
              {cartQty}/{item.stock_quantity}
            </Badge>

            {/* Add button */}
            {item.status === 'available' ? <Button size="sm" className="h-8 w-8 p-0 flex-shrink-0 bg-primary" onClick={() => onAddToCart(item)} disabled={!canAdd}>
                {canAdd ? <Plus className="h-4 w-4" /> : <span className="text-[10px] font-black">MÁX</span>}
              </Button> : <Button size="sm" className="h-8 w-8 p-0 flex-shrink-0" disabled>
                <X className="h-4 w-4" />
              </Button>}
          </div>;
    })}
    </div>;
};
export default EquipmentListView;