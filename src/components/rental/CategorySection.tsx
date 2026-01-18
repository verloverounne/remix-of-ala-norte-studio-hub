import { useRef, forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Plus, ChevronDown, ChevronRight, X } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/LazyImage";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { EquipmentWithCategory } from "@/types/supabase";

type EquipmentWithStock = EquipmentWithCategory;

// Formatear nombre: primera letra mayúscula, resto minúsculas, siglas en mayúsculas
const formatEquipmentName = (name: string): string => {
  // Lista de siglas comunes que deben mantenerse en mayúsculas
  const acronyms = ['HD', 'SDI', 'HDMI', 'USB', 'LED', 'HMI', 'AC', 'DC', 'RGB', 'DMX', 'XLR', 'BNC', 'NP', 'BP', 'AB', 'V', 'PL', 'EF', 'RF', 'MFT', 'E', 'S35', 'FF', '4K', '8K', '2K', 'UHD', 'RAW', 'SSD', 'CFast', 'SD', 'CF', 'LUT', 'ND', 'IR', 'UV', 'VR', 'AR', 'XR', 'AI', 'DI', 'LF', 'S16', 'S8', 'ARRI', 'RED', 'SONY', 'CANON', 'ZEISS', 'COOKE', 'ANGENIEUX', 'FUJINON', 'LEITZ', 'SIGMA', 'TILTA', 'DJI', 'APUTURE', 'GODOX', 'NANLITE', 'LITEPANELS', 'KINO', 'DEDOLIGHT', 'ASTERA', 'QUASAR', 'ROSCO', 'CHIMERA', 'SNAPBAG', 'SOFTBOX', 'FRESNEL', 'PAR', 'MR', 'ALEXA', 'VENICE', 'FX', 'C70', 'C300', 'C500', 'R5', 'R6', 'A7', 'FX3', 'FX6', 'FX9', 'FS5', 'FS7', 'EOS', 'XC', 'XF', 'Z', 'S1H', 'GH', 'BMPCC', 'URSA', 'KOMODO', 'RAPTOR', 'MONSTRO', 'GEMINI', 'HELIUM', 'DRAGON', 'MINI', 'LT', 'XT', 'SXT', 'LPL', 'SP', 'CP', 'UP', 'MP', 'DP', 'MK', 'CN', 'T', 'F', 'MM', 'CM', 'M', 'KG', 'LB', 'W', 'WH', 'AH', 'MAH', 'V-MOUNT', 'GOLD', 'ANTON', 'BAUER', 'IDX', 'PAG', 'CORE', 'SWX', 'BEBOB', 'BLUESHAPE', 'FXLION', 'DYNACORE', 'HAWK', 'VANTAGE', 'PANAVISION', 'MOVIECAM', 'KINEFINITY', 'BLACKMAGIC', 'ATOMOS', 'SMALLHD', 'TVL', 'SHOGUN', 'NINJA', 'SUMO', 'TERADEK', 'BOLT', 'CUBE', 'COLR', 'SACHTLER', 'OCONNOR', 'CARTONI', 'RONFORD', 'BAKER', 'MILLER', 'LIBEC', 'MANFROTTO', 'GITZO', 'EASYRIG', 'READYRIG', 'STEADICAM', 'MOVI', 'RONIN', 'GIMBAL', 'CRANE', 'RS', 'RSC', 'SC', 'NUCLEUS', 'WCU', 'CFORCE', 'CMOTION', 'PRESTON', 'BARTECH', 'HEDEN', 'PDMOVIE', 'FOLLOWFOCUS', 'MATTEBOX', 'CLAMP', 'ROD', '15MM', '19MM', 'LWS', 'SWS', 'BRIDGE', 'PLATE', 'CAGE', 'RIG', 'SHOULDER', 'HANDHELD', 'TRIPOD', 'DOLLY', 'SLIDER', 'JIB', 'CRANE', 'TECHNOCRANE', 'SCORPIO', 'LAMBDA', 'SUPERTECHNO', 'MOVIEBIRD', 'GFCRANE', 'HEAD', 'FLUID', 'GEARED', 'DUTCH', 'TILT', 'PAN', 'NODAL', 'LEVELING', 'SPEEDRAIL', 'PIPE', 'JUNIOR', 'BABY', 'COMBO', 'CSTAND', 'AVENGER', 'KUPO', 'GRIP', 'GOBO', 'FLAG', 'FLOPPY', 'SOLID', 'NET', 'SILK', 'DIFF', 'FRAME', 'BUTTERFLY', 'OVERHEAD', 'REFLECTOR', 'BOUNCE', 'NEGATIVE', 'POLY', 'BEAD', 'GRIFF', 'ULTRA', 'DINO', 'MAXI', 'BRUTE', 'WENDY', 'BLONDE', 'REDHEAD', 'MOLE', 'RICHARDSON', 'SKYPANEL', 'ORBITER', 'S60', 'S30', 'S120', 'MAX', 'PRO', 'PLUS', 'LITE', 'AIR', 'II', 'III', 'IV', 'V', 'VI', 'X', 'XL', 'XXL', 'S', 'L', 'XS', 'XXS'];
  
  return name.split(' ').map((word, index) => {
    const upperWord = word.toUpperCase();
    // Si es una sigla conocida, mantenerla en mayúsculas
    if (acronyms.includes(upperWord)) {
      return upperWord;
    }
    // Si contiene números mezclados con letras (ej: "4x4", "16mm"), mantener original
    if (/\d/.test(word) && /[a-zA-Z]/.test(word)) {
      return word;
    }
    // Si es todo números, mantener
    if (/^\d+$/.test(word)) {
      return word;
    }
    // Primera palabra: primera letra mayúscula, resto minúsculas
    // Otras palabras: todo minúsculas
    if (index === 0) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    return word.toLowerCase();
  }).join(' ');
};

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface CategorySectionProps {
  category: Category;
  equipment: EquipmentWithStock[];
  onAddToCart: (item: EquipmentWithStock) => void;
  onViewDetails: (item: EquipmentWithStock) => void;
  getCartQuantity: (id: string) => number;
  canAddMore: (item: EquipmentWithStock) => boolean;
  stickyTop: number;
  defaultExpanded?: boolean;
}

export interface CategorySectionRef {
  scrollIntoView: () => void;
  expand: () => void;
  collapse: () => void;
}

export const CategorySection = forwardRef<CategorySectionRef, CategorySectionProps>(({ 
  category, 
  equipment, 
  onAddToCart, 
  onViewDetails,
  getCartQuantity,
  canAddMore,
  stickyTop,
  defaultExpanded = false
}, ref) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  useImperativeHandle(ref, () => ({
    scrollIntoView: () => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    expand: () => {
      setIsExpanded(true);
    },
    collapse: () => {
      setIsExpanded(false);
    }
  }));

  // Fetch subcategories for this category
  useEffect(() => {
    const fetchSubcategories = async () => {
      const { data, error } = await supabase
        .from("subcategories")
        .select("*")
        .eq("category_id", category.id)
        .order("order_index");

      if (!error && data) {
        setSubcategories(data);
      }
    };

    fetchSubcategories();
  }, [category.id]);

  // Filter equipment by selected subcategory
  const filteredEquipment = selectedSubcategory === "all"
    ? equipment
    : equipment.filter(e => e.subcategory_id === selectedSubcategory);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <section 
      ref={sectionRef}
      id={`categoria-${category.slug}`}
      className="relative"
      style={{ scrollMarginTop: `${stickyTop + 8}px` }}
    >
      {/* Sticky Category Header with Collapse - z-20 - same height as filter bar */}
      <div 
        className="sticky z-20 bg-background mb-0"
        style={{ top: `${stickyTop}px` }}
      >
        <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 h-[40px] sm:h-[52px]">
          <button 
            onClick={toggleExpand}
            className="flex items-center gap-1 sm:gap-3 cursor-pointer hover:text-primary transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 transition-transform flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform flex-shrink-0" />
            )}
            <h2 className="font-heading text-sm sm:text-lg md:text-xl uppercase truncate">
              {category.name}
            </h2>
            <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0 flex-shrink-0">
              {filteredEquipment.length}
            </Badge>
          </button>
          
          {/* Subcategory Dropdown */}
          {subcategories.length > 0 && isExpanded && (
            <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
              <SelectTrigger className="w-[140px] sm:w-[180px] h-8 sm:h-9 text-xs sm:text-sm font-heading">
                <SelectValue placeholder="Subcategoría" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="all" className="font-heading text-xs sm:text-sm">
                  Todas
                </SelectItem>
                {subcategories.map((sub) => (
                  <SelectItem 
                    key={sub.id} 
                    value={sub.id}
                    className="font-heading text-xs sm:text-sm"
                  >
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Equipment Grid - Collapsible */}
      {isExpanded && (
        <div className="p-3 sm:p-4 bg-background">
          {filteredEquipment.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <p className="font-heading text-lg">No hay equipos en esta categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {filteredEquipment.map((item) => {
                const cartQty = getCartQuantity(item.id);
                const canAdd = canAddMore(item);

                return (
                  <Card 
                    key={item.id}
                    className="overflow-hidden group relative border-0 shadow-none hover:shadow-none [box-shadow:none!important] hover:[box-shadow:none!important]"
                  >
                    <CardContent className="p-2 sm:p-3 flex flex-col space-y-2">
                      {/* 1. Nombre del equipo - formateado */}
                      <h3 
                        className="font-heading text-xs sm:text-sm leading-tight pt-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors h-[5em]"
                        onClick={() => onViewDetails(item)}
                      >
                        {formatEquipmentName(item.name)}
                      </h3>
                      
                      {/* 2. Foto */}
                      <div className="relative aspect-square cursor-pointer duotone-hover-group overflow-hidden" onClick={() => onViewDetails(item)}>
                        
                        {/* Cart quantity badge with stock indicator - esquina inferior derecha */}
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
                      
                      {/* 4. Precio y Botón agregar - en la misma fila */}
                      <div className="mt-auto flex items-center gap-2">
                        {/* Precio - mitad izquierda */}
                        <div className="flex-1 flex items-baseline gap-1">
                          <span className="text-primary font-heading text-lg sm:text-xl">
                            ${item.price_per_day > 0 ? (item.price_per_day / 1000).toFixed(0) + 'K' : '—'}
                          </span>
                          <span className="text-muted-foreground font-mono text-[10px]">/día</span>
                        </div>
                        
                        {/* Botón agregar - cuadrado que se expande en hover */}
                        {item.status === 'available' ? (
                          <Button 
                            size="sm"
                            className="h-8 sm:h-9 w-8 sm:w-9 p-0 overflow-hidden transition-all duration-300 hover:w-[100px] sm:hover:w-[120px] hover:px-2 sm:hover:px-3 font-black flex-shrink-0 group relative flex items-center justify-center gap-0"
                            onClick={() => onAddToCart(item)}
                            disabled={!canAdd}
                          >
                            {canAdd ? (
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
          )}
        </div>
      )}
    </section>
  );
});

CategorySection.displayName = "CategorySection";

export default CategorySection;
