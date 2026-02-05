import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { EquipmentWithCategory } from "@/types/supabase";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useHeaderVisibility } from "@/hooks/useHeaderVisibility";
import { useEquipmentData } from "@/hooks/useEquipmentData";
import { EquipmentModal } from "@/components/EquipmentModal";
import { HeroCarouselRental } from "@/components/rental/HeroCarouselRental";
import { CategorySection, CategorySectionRef } from "@/components/rental/CategorySection";
import { CartSidebar } from "@/components/rental/CartSidebar";
import { ViewModeToggle, ViewMode } from "@/components/rental/ViewModeToggle";
import { cn } from "@/lib/utils";
import { Search, Filter, X, ArrowUpDown, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
type EquipmentWithStock = EquipmentWithCategory;
type SortOption = "alphabetic" | "price-asc" | "price-desc";
const Equipos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    equipment,
    categories,
    subcategories,
    loading
  } = useEquipmentData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentWithStock | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(true); // Default to OPEN
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortOption, setSortOption] = useState<SortOption>("alphabetic");
  const {
    addItem,
    items,
    calculateSubtotal,
    updateQuantity,
    removeItem
  } = useCart();
  const {
    toast
  } = useToast();
  const {
    isMobile,
    isVisible
  } = useHeaderVisibility();

  // Read equipment ID from URL and open modal automatically
  useEffect(() => {
    const equipmentId = searchParams.get("id");
    if (equipmentId && equipment.length > 0 && !loading) {
      const foundEquipment = equipment.find(e => e.id === equipmentId);
      if (foundEquipment) {
        setSelectedEquipment(foundEquipment);
        setModalOpen(true);
      }
    }
  }, [searchParams, equipment, loading]);

  // Handle modal close - clear URL parameter
  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      // Remove the id parameter from URL when closing modal
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("id");
      setSearchParams(newParams, {
        replace: true
      });
    }
  };

  // Calcular top dinámico basado en visibilidad del header
  const stickyTop = useMemo(() => {
    if (isMobile) {
      return 0; // En mobile el header está oculto
    }
    return isVisible ? 64 : 0; // 64px = altura del header desktop
  }, [isMobile, isVisible]);
  const categoryRefs = useRef<Map<string, CategorySectionRef>>(new Map());
  const filterRef = useRef<HTMLDivElement>(null);

  // Set active category when categories load
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);
  const getCartQuantity = useCallback((id: string) => {
    const cartItem = items.find(item => item.id === id);
    return cartItem?.quantity || 0;
  }, [items]);
  const canAddMore = useCallback((item: EquipmentWithStock) => {
    const inCart = getCartQuantity(item.id);
    const stock = item.stock_quantity ?? 1;
    return inCart < stock;
  }, [getCartQuantity]);
  const fuzzyMatch = (text: string, search: string): boolean => {
    if (!search) return true;
    text = text.toLowerCase();
    search = search.toLowerCase();
    if (text.includes(search)) return true;
    let searchIdx = 0;
    for (let i = 0; i < text.length && searchIdx < search.length; i++) {
      if (text[i] === search[searchIdx]) {
        searchIdx++;
      }
    }
    if (searchIdx === search.length) return true;
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
        matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
      }
    }
    return matrix[len1][len2];
  };

  // When searching, search across ALL categories
  const isSearching = searchTerm.length > 0;
  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      // Solo mostrar equipos disponibles en la página de rental
      if (item.status !== 'available') return false;
      const matchesSearch = fuzzyMatch(item.name, searchTerm) || fuzzyMatch(item.brand || "", searchTerm) || fuzzyMatch(item.model || "", searchTerm);

      // When searching, ignore category filter - search across all
      if (isSearching) {
        const matchesSubcategory = selectedSubcategories.length === 0 || item.subcategory_id && selectedSubcategories.includes(item.subcategory_id);
        return matchesSearch && matchesSubcategory;
      }
      const matchesSubcategory = selectedSubcategories.length === 0 || item.subcategory_id && selectedSubcategories.includes(item.subcategory_id);
      return matchesSearch && matchesSubcategory;
    });
  }, [equipment, searchTerm, selectedSubcategories, isSearching]);

  // Get subcategories that have matching equipment when searching
  const subcategoriesWithResults = useMemo(() => {
    if (!isSearching) return new Set<string>();
    const subcatIds = new Set<string>();
    filteredEquipment.forEach(item => {
      if (item.subcategory_id) {
        subcatIds.add(item.subcategory_id);
      }
    });
    return subcatIds;
  }, [filteredEquipment, isSearching]);

  // Get categories that have matching equipment when searching
  const categoriesWithResults = useMemo(() => {
    if (!isSearching) return new Set<string>();
    const catIds = new Set<string>();
    filteredEquipment.forEach(item => {
      if (item.category_id) {
        catIds.add(item.category_id);
      }
    });
    return catIds;
  }, [filteredEquipment, isSearching]);

  // Sort equipment based on selected option - ALWAYS respects subcategory grouping first
  const sortedEquipment = useMemo(() => {
    const sorted = [...filteredEquipment];
    sorted.sort((a, b) => {
      // Always sort by subcategory order_index first
      const subA = subcategories.find(s => s.id === a.subcategory_id);
      const subB = subcategories.find(s => s.id === b.subcategory_id);
      const orderA = subA?.order_index ?? 999;
      const orderB = subB?.order_index ?? 999;
      if (orderA !== orderB) return orderA - orderB;

      // Then apply secondary sort based on sortOption
      switch (sortOption) {
        case "alphabetic":
          return a.name.localeCompare(b.name);
        case "price-asc":
          return (a.price_per_day || 0) - (b.price_per_day || 0);
        case "price-desc":
          return (b.price_per_day || 0) - (a.price_per_day || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return sorted;
  }, [filteredEquipment, sortOption, subcategories]);
  const equipmentByCategory = useMemo(() => {
    const grouped: Record<string, EquipmentWithStock[]> = {};
    categories.forEach(cat => {
      grouped[cat.id] = sortedEquipment.filter(e => e.category_id === cat.id);
    });
    return grouped;
  }, [sortedEquipment, categories]);
  const orderedCategories = useMemo(() => {
    if (!activeCategory) return categories;
    const active = categories.find(c => c.id === activeCategory);
    const rest = categories.filter(c => c.id !== activeCategory);
    return active ? [active, ...rest] : categories;
  }, [categories, activeCategory]);
  const equipmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach(cat => {
      counts[cat.id] = equipmentByCategory[cat.id]?.length || 0;
    });
    return counts;
  }, [equipmentByCategory, categories]);

  // Subcategories filtered by active category
  const filteredSubcategories = useMemo(() => {
    return activeCategory ? subcategories.filter(sub => sub.category_id === activeCategory) : subcategories;
  }, [subcategories, activeCategory]);
  const toggleSubcategory = (id: string) => {
    if (selectedSubcategories.includes(id)) {
      setSelectedSubcategories(selectedSubcategories.filter(s => s !== id));
    } else {
      setSelectedSubcategories([...selectedSubcategories, id]);
    }
  };
  const handleAddToCart = (item: EquipmentWithStock) => {
    if (!canAddMore(item)) {
      toast({
        title: "Stock máximo alcanzado",
        description: `Solo hay ${item.stock_quantity} unidades disponibles de ${item.name}`,
        variant: "destructive"
      });
      return;
    }
    addItem({
      id: item.id,
      name: item.name,
      brand: item.brand || undefined,
      pricePerDay: item.price_per_day,
      imageUrl: item.image_url || undefined,
      stockQuantity: item.stock_quantity
    }, 1);
    toast({
      title: "Agregado a cotización",
      description: `${item.name} agregado`
    });
  };
  const handleViewDetails = (item: EquipmentWithStock) => {
    setSelectedEquipment(item);
    setModalOpen(true);
  };
  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    // Clear subcategory filters and search when changing category
    setSelectedSubcategories([]);
    setSearchTerm("");
    setIsSearchOpen(false);
    categoryRefs.current.forEach((ref, id) => {
      if (id === categoryId) {
        ref.expand();
      } else {
        ref.collapse();
      }
    });
  };
  const handleCategoryActivate = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSelectedSubcategories([]);
    setSearchTerm("");
    setIsSearchOpen(false);
    categoryRefs.current.forEach((ref, id) => {
      if (id !== categoryId) {
        ref.collapse();
      }
    });
  };
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSubcategories([]);
    setIsSearchOpen(false);
  };
  const hasActiveFilters = searchTerm.length > 0 || selectedSubcategories.length > 0;

  // Sticky top for category headers
  const categoryTitleTop = isMobile ? 0 : 0;
  const cartStickyTop = 80;
  return <div className="min-h-screen bg-background">
      {/* Hero Carousel - Now simplified, only shows slides */}
      <HeroCarouselRental categories={categories} onCategoryChange={handleCategoryClick} activeCategory={activeCategory} />

      {/* Sticky navigation bar - Below Hero */}
      <div className="sticky z-[50] bg-background/95 backdrop-blur-sm border-b border-foreground/10 transition-all duration-300" style={{
      top: `${stickyTop}px`
    }}>
        <div className="container mx-auto py-0 items-center px-0">
          {/* Row 1: Category chips */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex w-screen items-center flex-wrap gap-2 flex-1 pt-4">
              {categories.map(category => {
              const count = equipmentCounts[category.id] || 0;
              const isActive = activeCategory === category.id;
              return <button key={category.id} onClick={() => handleCategoryClick(category.id)} className={cn("flex-shrink-0 px-3 py-1.5 font-heading text-xs uppercase transition-all whitespace-nowrap border", isActive ? "bg-primary text-primary-foreground shadow-brutal-sm border-primary" : "bg-background text-foreground hover:bg-muted border-foreground/20")}>
                    <span>{category.name}</span>
                    {count > 0 && <span className={cn("ml-1.5 text-[10px]", isActive ? "text-primary-background/80" : "text-background")}>
                        ({count})
                      </span>}
                  </button>;
            })}
            </div>
          </div>

          {/* Subcategory filters - visible by default */}
          <div ref={filterRef}>
            <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <div className="pb-2">
                <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-1 font-heading text-xs uppercase text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  {isFilterOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  Subcategorías
                  {selectedSubcategories.length > 0 && <span className="ml-1 text-[10px] bg-primary text-primary-foreground px-1.5 rounded-sm">
                      {selectedSubcategories.length}
                    </span>}
                </button>
              </div>
              <CollapsibleContent>
                <div className="pb-4">
                  {filteredSubcategories.length === 0 ? <p className="text-xs text-muted-foreground items-center justify-between px-2 mb:px-2 lg:px-4">No hay subcategorías para esta categoría</p> : <div className="flex flex-wrap gap-2">
                      {filteredSubcategories.map(sub => <button key={sub.id} onClick={() => toggleSubcategory(sub.id)} className={cn("px-2 py-1 text-xs font-heading uppercase transition-all border", selectedSubcategories.includes(sub.id) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground hover:bg-muted border-foreground/20")}>
                          {sub.name}
                        </button>)}
                    </div>}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Row 2: Filter toggle + Equipment count + Sort + View toggle + Search button */}
          <div className="flex items-center mb-2 flex-wrap gap-2 flex-1">
            {/* Filter button - to HIDE subcategories */}
            <Button variant="ghost" size="sm" onClick={() => {
            setIsFilterOpen(!isFilterOpen);
            if (isSearchOpen) setIsSearchOpen(false);
          }} className={cn("h-8 px-2 flex-shrink-0", !isFilterOpen && "bg-primary text-primary-foreground")}>
              <Filter className="h-4 w-4" />
              {selectedSubcategories.length > 0 && <Badge variant="secondary" className="ml-1 text-[9px] h-4 px-1">
                  {selectedSubcategories.length}
                </Badge>}
            </Button>

            <p className="text-xs text-foreground font-heading uppercase mx-[44px] ml-0 mr-[6px]">
              Mostrando {filteredEquipment.length} equipos
            </p>

            {/* Sort dropdown */}
            <Select value={sortOption} onValueChange={val => setSortOption(val as SortOption)}>
              <SelectTrigger className="w-[140px] sm:w-[160px] h-8 text-xs font-heading">
                <ArrowUpDown className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="alphabetic" className="font-heading text-xs">
                  Alfabético
                </SelectItem>
                <SelectItem value="price-asc" className="font-heading text-xs">
                  Precio: menor a mayor
                </SelectItem>
                <SelectItem value="price-desc" className="font-heading text-xs">
                  Precio: mayor a menor
                </SelectItem>
              </SelectContent>
            </Select>

            {/* View mode toggle */}
            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />

            <Button variant="ghost" size="sm" onClick={() => {
            setIsSearchOpen(!isSearchOpen);
            if (isFilterOpen) setIsFilterOpen(false);
          }} className={cn("h-8 px-2 flex-shrink-0 text-foreground", isSearchOpen && "bg-primary text-primary-foreground")}>
              <Search className="h-4 w-4" />
              <span className="ml-1 text-xs hidden sm:inline">Buscar</span>
            </Button>
          </div>

          {/* Expandable search bar */}
          <Collapsible open={isSearchOpen}>
            <CollapsibleContent>
              <div className="pb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="text" placeholder="Buscar equipos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 font-heading uppercase text-sm" autoFocus />
                  {searchTerm && <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      <div className="container w-screen mx-auto px-4 pb-4 sm:pb-6 bg-background">
        <div className="grid lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Main Content - Category Sections */}
          <main className="lg:col-span-3 bg-background">
            {loading ? <div className="text-center py-12 sm:py-16 border border-foreground p-8 sm:p-12">
                <p className="text-xl sm:text-2xl font-heading">CARGANDO...</p>
              </div> : <div className="space-y-4 sm:space-y-6 bg-background">
                {orderedCategories.filter(category => !isSearching || categoriesWithResults.has(category.id)).map((category, index) => <CategorySection key={category.id} ref={ref => {
              if (ref) {
                categoryRefs.current.set(category.id, ref);
              } else {
                categoryRefs.current.delete(category.id);
              }
            }} category={category} equipment={equipmentByCategory[category.id] || []} subcategories={subcategories.filter(s => s.category_id === category.id)} onAddToCart={handleAddToCart} onViewDetails={handleViewDetails} getCartQuantity={getCartQuantity} canAddMore={canAddMore} stickyTop={categoryTitleTop} defaultExpanded={isSearching ? categoriesWithResults.has(category.id) : index === 0} onCategoryActivate={handleCategoryActivate} viewMode={viewMode} sortOption={sortOption} onSubcategorySelect={toggleSubcategory} selectedSubcategories={selectedSubcategories} forceExpandSubcategories={isSearching ? subcategoriesWithResults : undefined} />)}
              </div>}
          </main>

          {/* Cart Sidebar - Sticky on desktop, drawer on mobile */}
          <aside className="hidden lg:block lg:col-span-1 shadow-none bg-background">
            <CartSidebar items={items} calculateSubtotal={calculateSubtotal} updateQuantity={updateQuantity} removeItem={removeItem} stickyTop={cartStickyTop} />
          </aside>

          {/* Mobile cart button/drawer */}
          <div className="lg:hidden">
            <CartSidebar items={items} calculateSubtotal={calculateSubtotal} updateQuantity={updateQuantity} removeItem={removeItem} />
          </div>
        </div>
      </div>

      {/* Equipment Modal */}
      <EquipmentModal equipment={selectedEquipment} open={modalOpen} onOpenChange={handleModalClose} onAddToCart={handleAddToCart} getCartQuantity={getCartQuantity} canAddMore={canAddMore} onViewDetails={item => {
      setSelectedEquipment(item);
    }} />
    </div>;
};
export default Equipos;