import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { EquipmentWithCategory } from "@/types/supabase";
import { Search, Plus, Minus, MessageCircle } from "lucide-react";
import equipmentHero from "@/assets/equipment-hero.jpg";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { EquipmentModal } from "@/components/EquipmentModal";
import { SubcategoryFilter } from "@/components/SubcategoryFilter";
import { LazyImage } from "@/components/LazyImage";

const Equipos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [equipment, setEquipment] = useState<EquipmentWithCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentWithCategory | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  // Removed: selectedBrands, budgetRange, startDate, endDate, unavailableEquipmentIds, upcomingUnavailableIds
  const { addItem, items, calculateSubtotal } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchEquipment();
  }, []);

  // Removed: checkUpcomingUnavailability and checkAvailability effects

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

  // Removed: checkUpcomingUnavailability and checkAvailability functions

  // Fuzzy search helper
  const fuzzyMatch = (text: string, search: string): boolean => {
    if (!search) return true;
    text = text.toLowerCase();
    search = search.toLowerCase();
    
    // Direct match
    if (text.includes(search)) return true;
    
    // Character-by-character fuzzy matching
    let searchIdx = 0;
    for (let i = 0; i < text.length && searchIdx < search.length; i++) {
      if (text[i] === search[searchIdx]) {
        searchIdx++;
      }
    }
    if (searchIdx === search.length) return true;
    
    // Levenshtein distance for typos
    const words = text.split(/\s+/);
    for (const word of words) {
      if (levenshteinDistance(word, search) <= Math.max(1, Math.floor(search.length * 0.3))) {
        return true;
      }
    }
    
    return false;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[len1][len2];
  };

  const filteredEquipment = equipment
    .filter((item) => {
      const matchesSearch = fuzzyMatch(item.name, searchTerm) ||
                           fuzzyMatch(item.brand || '', searchTerm) ||
                           fuzzyMatch(item.model || '', searchTerm);
      
      const matchesCategory = selectedCategories.length === 0 || 
                             (item.category_id && selectedCategories.includes(item.category_id));
      
      const matchesSubcategory = selectedSubcategories.length === 0 || 
                                  (item.subcategory_id && selectedSubcategories.includes(item.subcategory_id));
      
      return matchesSearch && matchesCategory && matchesSubcategory;
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
    <div className="min-h-screen bg-background pt-14 sm:pt-16">
      {/* Hero Section Brutal */}
      <div className="relative h-[250px] sm:h-[350px] lg:h-[400px] border-b-4 border-foreground overflow-hidden">
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

      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        {/* Intro Text */}
        <div className="text-center mb-8">
          <p className="text-xl sm:text-2xl font-heading text-muted-foreground">
            Equipos curados y listos para tu proyecto
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            ⚠️ Contenido simulado para demostración. Prototipo funcional de frontend y backend.
          </p>
        </div>
        {/* Layout con Filtros Laterales */}
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Sidebar Filtros Izquierda */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-20 border-2 sm:border-4 border-foreground p-4 sm:p-6 bg-card shadow-brutal max-h-[calc(100vh-6rem)] overflow-y-auto">
              {/* Búsqueda con botón limpiar */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="BUSCAR..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-2 border-foreground font-heading uppercase text-sm"
                    />
                  </div>
                   {(searchTerm || selectedSubcategories.length > 0 || selectedCategories.length > 0) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedSubcategories([]);
                        setSelectedCategories([]);
                      }}
                      className="whitespace-nowrap"
                    >
                      LIMPIAR
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Filtros por Categoría y Subcategoría */}
              <SubcategoryFilter
                selectedSubcategories={selectedSubcategories}
                onSubcategoriesChange={setSelectedSubcategories}
                selectedCategories={selectedCategories}
                onCategoriesChange={setSelectedCategories}
              />

              {/* Removed: Brand, Budget and Availability filters */}
            </div>
          </aside>

          {/* Main Content - Grid de Equipos */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12 sm:py-16 lg:py-20 border-2 sm:border-4 border-foreground p-8 sm:p-12 lg:p-16">
                <p className="text-2xl sm:text-3xl lg:text-brutal">CARGANDO...</p>
              </div>
            ) : filteredEquipment.length === 0 ? (
              <div className="text-center py-12 sm:py-16 lg:py-20 border-2 sm:border-4 border-foreground p-8 sm:p-12 lg:p-16">
                <p className="text-2xl sm:text-3xl lg:text-brutal mb-4">NO SE ENCONTRARON EQUIPOS</p>
              </div>
            ) : (
              <>
                <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-muted-foreground font-heading">
                  Mostrando {filteredEquipment.length} equipo{filteredEquipment.length !== 1 ? 's' : ''}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {filteredEquipment.map((item, index) => {
              const statusBadge = getStatusBadge(item.status);
              const showUnavailable = item.status !== 'available';
              
              
                    return (
                      <Card 
                        key={item.id}
                        className="overflow-hidden group"
                      >
                  <div className="relative">
                    {item.image_url ? (
                      <LazyImage
                        src={item.image_url}
                        alt={item.name}
                        className="grayscale group-hover:scale-110 transition-transform duration-300"
                        placeholderClassName="border-b-2 border-foreground"
                      />
                    ) : (
                      <div className="aspect-video w-full flex items-center justify-center bg-muted border-b-2 border-foreground">
                        <span className="text-brutal text-4xl opacity-20">NO IMG</span>
                      </div>
                    )}
                    
                    {/* Badge de disponibilidad */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      {showUnavailable ? (
                        <Badge variant="destructive" className="font-heading">
                          NO DISPONIBLE
                        </Badge>
                      ) : (
                        <Badge variant="success" className="font-heading">
                          DISPONIBLE
                        </Badge>
                      )}
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

          {/* Sidebar Derecha - Carrito */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-20 border-2 sm:border-4 border-foreground p-4 sm:p-6 bg-card shadow-brutal max-h-[calc(100vh-6rem)] overflow-y-auto">
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

              
              {/* Nota de advertencia */}
              <p className="text-xs text-muted-foreground/60 mt-4 text-center">
                ⚠️ Contenido simulado. Prototipo funcional.
              </p>
            </div>
          </aside>
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
