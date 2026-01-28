import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, X } from "lucide-react";
import { CartItem } from "@/hooks/useCart";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
interface CartSidebarProps {
  items: CartItem[];
  calculateSubtotal: (days: number) => number;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  stickyTop?: number;
}
export const CartSidebar = ({
  items,
  calculateSubtotal,
  updateQuantity,
  removeItem,
  stickyTop = 370,
}: CartSidebarProps) => {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const CartContent = () => (
    <>
      {/* Header */}
      <div className="p-4">
        <div className="flex max-h-screen overflow-auto items-center justify-between">
          <h3 className="font-heading text-lg sm:text-xl uppercase">Tu presupuesto</h3>
          <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
            {totalItems} {totalItems === 1 ? "ítem" : "ítems"}
          </span>
        </div>
      </div>

      {/* Items list with internal scroll */}
      <div className="overflow-y-auto flex-1 p-4">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              Todavía no hay equipos en tu lista. Explorá el catálogo y sumá lo que necesitás.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="p-3 bg-card">
                <div className="flex gap-3">
                  {/* Image */}
                  {item.imageUrl && (
                    <div className="w-16 h-16 flex-shrink-0 overflow-hidden">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-sm truncate">{item.name}</p>
                    {item.brand && <p className="text-xs text-muted-foreground">{item.brand}</p>}
                    <p className="text-xs text-muted-foreground mt-1">${item.pricePerDay.toLocaleString()}/día</p>
                  </div>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center justify-between mt-3 pt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-heading text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.stockQuantity !== undefined && item.quantity >= item.stockQuantity}
                      className="w-7 h-7 border-2 border-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-foreground"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    {item.stockQuantity !== undefined && (
                      <span className="text-xs text-muted-foreground ml-1">(máx: {item.stockQuantity})</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-heading text-sm">${(item.pricePerDay * item.quantity).toLocaleString()}</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive/80 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="p-4 bg-muted/30">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-baseline">
              <span className="font-heading text-sm">Subtotal (1 día):</span>
              <span className="font-heading text-xl">${calculateSubtotal(1).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-baseline text-muted-foreground text-xs">
              <span>Semana (7 días):</span>
              <span>${calculateSubtotal(7).toLocaleString()}</span>
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={() => (window.location.href = "/cotizador")}>
            Pedí tu presupuesto
          </Button>
        </div>
      )}
    </>
  );

  // Mobile: Fixed bottom button + Drawer
  if (isMobile) {
    return (
      <>
        {/* Floating button */}
        <div className="fixed bottom-4 center z-40">
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative bg-primary text-primary-foreground p-4 shadow-brutal-sm hover:scale-105 transition-transform py-[12px] px-[12px] my-[8px]"
          >
            <ShoppingCart className="w-[16px] h-[16px]" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 text-destructive-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center bg-[#a59a93]">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Drawer */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="max-h-[85vh] flex flex-col">
            <DrawerHeader>
              <div className="flex items-center justify-between">
                <DrawerTitle className="font-heading text-xl uppercase">Tu Cotización</DrawerTitle>
                <DrawerClose asChild>
                  <button className="p-1">
                    <X className="w-5 h-5" />
                  </button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto">
              <CartContent />
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // Desktop: Sticky sidebar - responsive, no max height
  return (
    <div
      className="sticky z-20 bg-card shadow-brutal"
      style={{
        top: `${stickyTop}px`,
      }}
    >
      <CartContent />
    </div>
  );
};
export default CartSidebar;
