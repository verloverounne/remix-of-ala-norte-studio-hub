import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { EquipmentWithCategory } from "@/types/supabase";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { EquipmentModal } from "@/components/EquipmentModal";
import { HeroCarouselRental } from "@/components/rental/HeroCarouselRental";
import { CategorySection, CategorySectionRef } from "@/components/rental/CategorySection";
import { CartSidebar } from "@/components/rental/CartSidebar";

type EquipmentWithStock = EquipmentWithCategory;

interface Category {
  id: string;
  name: string;
  slug: string;
  order_index?: number;
}

const Equipos = () => {
  const [equipment, setEquipment] = useState<EquipmentWithStock[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentWithStock | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [navBarHeight, setNavBarHeight] = useState(0);
  const { addItem, items, calculateSubtotal, updateQuantity, removeItem } = useCart();
  const { toast } = useToast();
  
  const categoryRefs = useRef<Map<string, CategorySectionRef>>(new Map());
  const navBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Set active category when categories load
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  // Calculate nav bar height for sticky positioning
  useEffect(() => {
    const updateNavBarHeight = () => {
      if (navBarRef.current) {
        setNavBarHeight(navBarRef.current.getBoundingClientRect().height);
      }
    };

    updateNavBarHeight();
    window.addEventListener('resize', updateNavBarHeight);
    
    // Also update after a small delay to ensure content has rendered
    const timeout = setTimeout(updateNavBarHeight, 500);
    
    return () => {
      window.removeEventListener('resize', updateNavBarHeight);
      clearTimeout(timeout);
    };
  }, [loading]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch categories and equipment in parallel
    const [categoriesResult, equipmentResult] = await Promise.all([
      supabase.from('categories').select('*').order('order_index'),
      supabase.from('equipment').select(`*, categories (*), subcategories (*)`).order('order_index')
    ]);
    
    if (!categoriesResult.error && categoriesResult.data) {
      setCategories(categoriesResult.data);
    }
    
    if (!equipmentResult.error && equipmentResult.data) {
      const transformedData = equipmentResult.data.map((item: any) => ({
        ...item,
        images: Array.isArray(item.images) ? item.images : [],
        stock_quantity: item.stock_quantity ?? 1
      }));
      setEquipment(transformedData);
    }
    
    setLoading(false);
  };

  // Get quantity of item already in cart
  const getCartQuantity = useCallback((id: string) => {
    const cartItem = items.find(item => item.id === id);
    return cartItem?.quantity || 0;
  }, [items]);

  // Check if can add more items
  const canAddMore = useCallback((item: EquipmentWithStock) => {
    const inCart = getCartQuantity(item.id);
    const stock = item.stock_quantity ?? 1;
    return inCart < stock;
  }, [getCartQuantity]);

  // Fuzzy search helper
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
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[len1][len2];
  };

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const matchesSearch = fuzzyMatch(item.name, searchTerm) ||
                           fuzzyMatch(item.brand || '', searchTerm) ||
                           fuzzyMatch(item.model || '', searchTerm);
      
      const matchesSubcategory = selectedSubcategories.length === 0 || 
                                  (item.subcategory_id && selectedSubcategories.includes(item.subcategory_id));
      
      return matchesSearch && matchesSubcategory;
    });
  }, [equipment, searchTerm, selectedSubcategories]);

  // Group equipment by category
  const equipmentByCategory = useMemo(() => {
    const grouped: Record<string, EquipmentWithStock[]> = {};
    categories.forEach(cat => {
      grouped[cat.id] = filteredEquipment.filter(e => e.category_id === cat.id);
    });
    return grouped;
  }, [filteredEquipment, categories]);

  // Reorder categories so the active one is first
  const orderedCategories = useMemo(() => {
    if (!activeCategory) return categories;
    const active = categories.find(c => c.id === activeCategory);
    const rest = categories.filter(c => c.id !== activeCategory);
    return active ? [active, ...rest] : categories;
  }, [categories, activeCategory]);

  // Equipment counts by category
  const equipmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach(cat => {
      counts[cat.id] = equipmentByCategory[cat.id]?.length || 0;
    });
    return counts;
  }, [equipmentByCategory, categories]);

  const handleAddToCart = (item: EquipmentWithStock) => {
    if (!canAddMore(item)) {
      toast({
        title: "Stock máximo alcanzado",
        description: `Solo hay ${item.stock_quantity} unidades disponibles de ${item.name}`,
        variant: "destructive",
      });
      return;
    }
    
    addItem({
      id: item.id,
      name: item.name,
      brand: item.brand || undefined,
      pricePerDay: item.price_per_day,
      imageUrl: item.image_url || undefined,
      stockQuantity: item.stock_quantity,
    }, 1);
    
    toast({
      title: "Agregado a cotización",
      description: `${item.name} agregado`,
    });
  };

  const handleViewDetails = (item: EquipmentWithStock) => {
    setSelectedEquipment(item);
    setModalOpen(true);
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    
    // Expand selected category and collapse others
    categoryRefs.current.forEach((ref, id) => {
      if (id === categoryId) {
        ref.expand();
      } else {
        ref.collapse();
      }
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSubcategories([]);
  };

  const hasActiveFilters = searchTerm.length > 0 || selectedSubcategories.length > 0;

  // Calculate sticky top for category headers (below nav bar)
  const categoryTitleTop = navBarHeight;
  const cartStickyTop = navBarHeight + 16;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Carousel with integrated sticky nav bar */}
      <HeroCarouselRental 
        categories={categories}
        onCategoryChange={handleCategoryClick}
        activeCategory={activeCategory}
        equipmentCounts={equipmentCounts}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedSubcategories={selectedSubcategories}
        onSubcategoriesChange={setSelectedSubcategories}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        navBarRef={navBarRef}
      />

      <div className="container mx-auto px-4 py-4 sm:py-6">
        {/* Results count */}
        <div className="mb-4 text-sm text-muted-foreground font-heading">
          Mostrando {filteredEquipment.length} equipo{filteredEquipment.length !== 1 ? 's' : ''}
          {hasActiveFilters && ' (filtrados)'}
        </div>

        <div className="grid lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Main Content - Category Sections */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12 sm:py-16 border border-foreground p-8 sm:p-12">
                <p className="text-xl sm:text-2xl font-heading">CARGANDO...</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {orderedCategories.map((category, index) => (
                  <CategorySection
                    key={category.id}
                    ref={(ref) => {
                      if (ref) {
                        categoryRefs.current.set(category.id, ref);
                      } else {
                        categoryRefs.current.delete(category.id);
                      }
                    }}
                    category={category}
                    equipment={equipmentByCategory[category.id] || []}
                    onAddToCart={handleAddToCart}
                    onViewDetails={handleViewDetails}
                    getCartQuantity={getCartQuantity}
                    canAddMore={canAddMore}
                    stickyTop={categoryTitleTop}
                    defaultExpanded={index === 0}
                  />
                ))}
              </div>
            )}
          </main>

          {/* Cart Sidebar - Sticky on desktop, drawer on mobile */}
          <aside className="hidden lg:block lg:col-span-1">
            <CartSidebar 
              items={items}
              calculateSubtotal={calculateSubtotal}
              updateQuantity={updateQuantity}
              removeItem={removeItem}
              stickyTop={cartStickyTop}
            />
          </aside>
          
          {/* Mobile cart button/drawer */}
          <div className="lg:hidden">
            <CartSidebar 
              items={items}
              calculateSubtotal={calculateSubtotal}
              updateQuantity={updateQuantity}
              removeItem={removeItem}
            />
          </div>
        </div>
      </div>
      
      {/* Equipment Modal */}
      <EquipmentModal 
        equipment={selectedEquipment}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAddToCart={handleAddToCart}
        getCartQuantity={getCartQuantity}
        canAddMore={canAddMore}
      />
    </div>
  );
};

export default Equipos;
