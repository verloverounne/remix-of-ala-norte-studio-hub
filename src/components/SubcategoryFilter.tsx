import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category, Subcategory } from '@/types/supabase';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SubcategoryFilterProps {
  selectedSubcategories: string[];
  onSubcategoriesChange: (subcategories: string[]) => void;
}

export const SubcategoryFilter = ({ selectedSubcategories, onSubcategoriesChange }: SubcategoryFilterProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCategoriesAndSubcategories();
  }, []);

  const fetchCategoriesAndSubcategories = async () => {
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .order('order_index');

    const { data: subcategoriesData } = await supabase
      .from('subcategories')
      .select('*')
      .order('order_index');

    if (categoriesData) setCategories(categoriesData);
    if (subcategoriesData) setSubcategories(subcategoriesData);
    
    // Abrir todas las categorías por defecto
    if (categoriesData) {
      setOpenCategories(new Set(categoriesData.map(c => c.id)));
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newOpen = new Set(openCategories);
    if (newOpen.has(categoryId)) {
      newOpen.delete(categoryId);
    } else {
      newOpen.add(categoryId);
    }
    setOpenCategories(newOpen);
  };

  const handleSubcategoryToggle = (subcategoryId: string) => {
    const newSelected = selectedSubcategories.includes(subcategoryId)
      ? selectedSubcategories.filter(id => id !== subcategoryId)
      : [...selectedSubcategories, subcategoryId];
    onSubcategoriesChange(newSelected);
  };

  const getSubcategoriesForCategory = (categoryId: string) => {
    return subcategories.filter(sub => sub.category_id === categoryId);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-heading font-bold text-lg uppercase">FILTROS</h3>
      
      {categories.map(category => {
        const categorySubcategories = getSubcategoriesForCategory(category.id);
        const isOpen = openCategories.has(category.id);
        
        return (
          <div key={category.id} className="border-b border-border pb-4">
            <button
              onClick={() => toggleCategory(category.id)}
              className="flex items-center justify-between w-full text-left font-semibold uppercase hover:text-primary transition-colors"
            >
              <span>{category.name}</span>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {isOpen && (
              <div className="mt-3 space-y-2 pl-4">
                {categorySubcategories.map(subcategory => (
                  <div key={subcategory.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={subcategory.id}
                      checked={selectedSubcategories.includes(subcategory.id)}
                      onCheckedChange={() => handleSubcategoryToggle(subcategory.id)}
                    />
                    <Label
                      htmlFor={subcategory.id}
                      className="text-sm cursor-pointer"
                    >
                      {subcategory.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
