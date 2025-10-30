import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { EquipmentWithCategory } from "@/types/supabase";
import { Search, Plus, Minus } from "lucide-react";
import equipmentHero from "@/assets/equipment-hero.jpg";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { EquipmentModal } from "@/components/EquipmentModal";
import { SubcategoryFilter } from "@/components/SubcategoryFilter";

const Equipos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [equipment, setEquipment] = useState<EquipmentWithCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentWithCategory | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('equipment')
      .select(`
        *,
        categories (*),
        subcategories (*)
      `)
      .order('order_index');
    
    if (!error && data) {
      const transformedData = data.map((item: any) => ({
        ...item,
        images: Array.isArray(item.images) ? item.images : []
      }));
      setEquipment(transformedData);
    }
    setLoading(false);
  };

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubcategory = selectedSubcategories.length === 0 || 
                                (item.subcategory_id && selectedSubcategories.includes(item.subcategory_id));
    return matchesSearch && matchesSubcategory;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { text: "DISPONIBLE", variant: "success" as const },
      rented: { text: "RENTADO", variant: "destructive" as const },
      maintenance: { text: "MANTENIMIENTO", variant: "outline" as const },
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
  };


  const getQuantity = (id: string) => quantities[id] || 1;

  const updateQuantity = (id: string, delta: number) => {
    const current = getQuantity(id);
    const newValue = Math.max(1, current + delta);
    setQuantities({ ...quantities, [id]: newValue });
  };

  const handleAddToCart = (item: EquipmentWithCategory) => {
    const quantity = getQuantity(item.id);
    addItem(
      {
        id: item.id,
        name: item.name,
        brand: item.brand || undefined,
        pricePerDay: item.price_per_day,
        imageUrl: item.image_url || undefined,
      },
      quantity
    );
    toast({
      title: "Agregado a reserva",
      description: `${quantity}x ${item.name} agregado al carrito`,
    });
    setQuantities({ ...quantities, [item.id]: 1 });
  };

  const handleViewDetails = (item: EquipmentWithCategory) => {
    setSelectedEquipment(item);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Section Brutal */}
      <div className="relative h-[400px] border-b-4 border-foreground overflow-hidden">
        <img
          src={equipmentHero}
          alt="Equipos"
          className="w-full h-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-foreground/80" />
        <div className="absolute inset-0 grid-brutal opacity-20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-brutal text-background">EQUIPOS</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Layout con Filtros Laterales */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filtros */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 border-4 border-foreground p-6 bg-card shadow-brutal">
              {/* Búsqueda */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="BUSCAR..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 border-foreground font-heading uppercase"
                  />
                </div>
              </div>
              
              {/* Filtros por Subcategoría */}
              <SubcategoryFilter
                selectedSubcategories={selectedSubcategories}
                onSubcategoriesChange={setSelectedSubcategories}
              />
              
              {/* Botón limpiar filtros */}
              {(searchTerm || selectedSubcategories.length > 0) && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedSubcategories([]);
                  }}
                >
                  LIMPIAR FILTROS
                </Button>
              )}
            </div>
          </aside>

          {/* Main Content - Grid de Equipos */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-20 border-4 border-foreground p-16">
                <p className="text-brutal text-3xl">CARGANDO...</p>
              </div>
            ) : filteredEquipment.length === 0 ? (
              <div className="text-center py-20 border-4 border-foreground p-16">
                <p className="text-brutal text-3xl mb-4">NO SE ENCONTRARON EQUIPOS</p>
              </div>
            ) : (
              <>
                <div className="mb-6 text-sm text-muted-foreground font-heading">
                  Mostrando {filteredEquipment.length} equipo{filteredEquipment.length !== 1 ? 's' : ''}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredEquipment.map((item, index) => {
              const statusBadge = getStatusBadge(item.status);
              
                    return (
                      <Card 
                        key={item.id}
                        className="overflow-hidden group"
                      >
                  <div className="aspect-video bg-muted relative overflow-hidden border-b-2 border-foreground">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover grayscale group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <span className="text-brutal text-4xl opacity-20">NO IMG</span>
                      </div>
                    )}
                    
                    {/* Badge de estado */}
                    <div className="absolute top-4 right-4">
                      <Badge variant={statusBadge.variant as any}>
                        {statusBadge.text}
                      </Badge>
                    </div>
                  </div>

                      <CardContent className="p-6">
                        {/* Subcategoría */}
                        {item.subcategories && (
                          <Badge variant="secondary" className="mb-3">
                            {item.subcategories.name}
                          </Badge>
                        )}
                    
                    <h3 className="font-heading text-2xl mb-2 uppercase">{item.name}</h3>
                    {item.brand && (
                      <p className="text-muted-foreground font-mono mb-4">{item.brand}</p>
                    )}
                    
                    <div className="border-t-2 border-foreground pt-4 mt-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-primary font-heading text-4xl">
                          ${(item.price_per_day / 1000).toFixed(0)}K
                        </span>
                        <span className="text-muted-foreground font-mono">/día</span>
                      </div>
                      {item.price_per_week && (
                        <div className="text-sm text-muted-foreground mt-1 font-mono">
                          Semana: ${(item.price_per_week / 1000).toFixed(0)}K
                        </div>
                      )}
                    </div>
                  </CardContent>

                   <CardFooter className="p-6 pt-0 flex flex-col gap-3">
                    <div className="flex gap-2 w-full">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleViewDetails(item)}
                      >
                        DETALLES
                      </Button>
                    </div>
                    {item.status === 'available' && (
                      <div className="flex items-center gap-2 w-full">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="h-10 w-10"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={getQuantity(item.id)}
                            onChange={(e) => setQuantities({ ...quantities, [item.id]: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="text-center font-heading text-lg h-10 w-20"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="h-10 w-10"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button 
                          className="flex-1" 
                          onClick={() => handleAddToCart(item)}
                        >
                          AGREGAR
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
      
      {/* Equipment Modal */}
      <EquipmentModal 
        equipment={selectedEquipment}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default Equipos;
