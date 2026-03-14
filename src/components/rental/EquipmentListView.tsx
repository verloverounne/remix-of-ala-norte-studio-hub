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
    return (
      <div className="text-center py-8 sm:py-12 text-muted-foreground">
        <p className="font-heading text-lg">No hay equipos disponibles</p>
      </div>);

  }

  return (
    <div className="divide-y divide-foreground/10">
      {equipment.map((item) => {
        const cartQty = getCartQuantity(item.id);
        const canAdd = canAddMore(item);
        return (
          <div
            key={item.id}
            className="flex items-center max-w-screen transition-colors bg-background px] border-gray-light flex-wrap px-[8px] gap-0 py-0">
            
            {/* Name - clickable */}
            <div className="flex-1 min-w-40 cursor-pointer" onClick={() => onViewDetails(item)}>
              <h3 className="font-heading text-xs normal-case line-clamp-2 hover:text-primary transition-colors font-medium flex flex-1 mx-[12px] sm:text-base">
                {formatEquipmentName(item.name)}
              </h3>
              {item.brand && <span className="text-[10px] text-muted-foreground uppercase">{item.brand}</span>}
            </div>

            {/* Price */}
            <div className="flex-shrink-0 text-right">
              <span className="font-heading text-sm text-primary sm:text-lg">
                ${item.price_per_day > 0 ? (item.price_per_day / 1000).toFixed(0) + "K" : "—"}
              </span>
              <span className="text-muted-foreground font-mono text-[9px] sm:text-[10px] ml-0.5">/día</span>
            </div>

            {/* Badge - reserved/total */}
            <Badge
              variant="secondary"
              className={cn("flex-shrink-0 text-[10px] px-2 py-0.5 font-heading border-0 bg-transparent mx-[8px]",

              cartQty > 0 ? "text-primary" : "bg-muted text-muted-foreground"
              )}>
              
              {cartQty}/{item.stock_quantity}
            </Badge>

            {/* Add button */}
            {item.status === "available" ?
            <Button
              size="sm"
              className="h-4 w-4 p-0 flex-shrink-0 rounded-sm bg-transparent text-primary text-2xl"
              onClick={() => onAddToCart(item)}
              disabled={!canAdd}>
              
                {canAdd ?
              <Plus className="py-0 px-0 my-0 mx-0 w-[24px] h-[24px]" /> :

              <span className="text-[10px] font-black">MÁX</span>
              }
              </Button> :

            <Button size="sm" className="h-8 w-8 p-0 flex-shrink-0 bg-transparent text-xs font-thin" disabled>
                <X className="text-muted w-[12px] h-[12px]" />
              </Button>
            }
          </div>);

      })}
    </div>);

};
export default EquipmentListView;