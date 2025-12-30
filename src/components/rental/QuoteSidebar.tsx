import { Button } from "@/components/ui/button";

interface CartItem {
  id: string;
  name: string;
  brand?: string;
  pricePerDay: number;
  imageUrl?: string;
  quantity: number;
}

interface QuoteSidebarProps {
  items: CartItem[];
  calculateSubtotal: (days: number) => number;
}

export const QuoteSidebar = ({ items, calculateSubtotal }: QuoteSidebarProps) => {
  return (
    <div className="lg:sticky lg:top-40 border-2 sm:border-4 border-foreground p-4 sm:p-6 bg-card shadow-brutal max-h-[calc(100vh-12rem)] overflow-y-auto">
      <h3 className="font-heading text-lg sm:text-xl mb-4 uppercase border-b-2 border-foreground pb-2">
        Cotización
      </h3>
      
      {items.length === 0 ? (
        <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
          Carrito vacío
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="text-sm border-b border-foreground/20 pb-2">
              <p className="font-heading truncate text-xs sm:text-sm">{item.name}</p>
              <p className="text-xs text-muted-foreground break-words">
                {item.quantity}x ${item.pricePerDay.toLocaleString()}/día
              </p>
            </div>
          ))}
          
          <div className="border-t-2 border-foreground pt-4 mt-4">
            <div className="flex justify-between items-baseline mb-2 gap-2">
              <span className="font-heading text-xs sm:text-sm">Subtotal (1 día):</span>
              <span className="font-heading text-base sm:text-xl break-words">${calculateSubtotal(1).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-baseline text-muted-foreground text-xs gap-2">
              <span>Semana:</span>
              <span className="break-words">${calculateSubtotal(7).toLocaleString()}</span>
            </div>
          </div>
          
          <Button 
            className="w-full mt-4" 
            onClick={() => window.location.href = '/cotizador'}
          >
            IR A COTIZAR
          </Button>
        </div>
      )}

      {/* Warning note */}
      <p className="text-xs text-muted-foreground/60 mt-4 text-center">
        ⚠️ Contenido simulado. Prototipo funcional.
      </p>
    </div>
  );
};

export default QuoteSidebar;
