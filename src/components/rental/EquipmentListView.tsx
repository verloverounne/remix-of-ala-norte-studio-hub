import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      return <div key={item.id} className="flex items-center max-w-screen transition-colors bg-background gap-12px] mx-[16px] py-[6px] border-gray-light">
            {/* Name - clickable */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onViewDetails(item)}>
              <h3 className="font-heading text-xs normal-case line-clamp-3 hover:text-primary transition-colors sm:text-xs font-medium mx-[8px]">
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
            <Badge variant="secondary" className={cn("flex-shrink-0 text-[10px] px-2 py-0.5 font-heading border-0 mx-4 bg-neutral-200", cartQty > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
              {cartQty}/{item.stock_quantity}
            </Badge>

            {/* Add button */}
            {item.status === 'available' ? <Button size="sm" className="h-6 w-6 p-0 flex-shrink-0 bg-primary" onClick={() => onAddToCart(item)} disabled={!canAdd}>
                {canAdd ? <Plus className="h-4 w-4" /> : <span className="text-[10px] font-black">MÁX</span>}
              </Button> : <Button size="sm" className="h-8 w-8 p-0 flex-shrink-0" disabled>
                <X className="h-4 w-4" />
              </Button>}
          </div>;
    })}
    </div>;
};
export default EquipmentListView;