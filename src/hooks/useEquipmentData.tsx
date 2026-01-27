import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCache, setCache, CACHE_KEYS } from '@/lib/cache';
import type { EquipmentWithCategory } from '@/types/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  order_index?: number;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  order_index?: number;
}

type EquipmentWithStock = EquipmentWithCategory;

interface UseEquipmentDataReturn {
  equipment: EquipmentWithStock[];
  categories: Category[];
  subcategories: Subcategory[];
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useEquipmentData(): UseEquipmentDataReturn {
  const [equipment, setEquipment] = useState<EquipmentWithStock[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    // Check cache first
    const cachedCategories = getCache<Category[]>(CACHE_KEYS.CATEGORIES);
    const cachedSubcategories = getCache<Subcategory[]>(CACHE_KEYS.SUBCATEGORIES);
    const cachedEquipment = getCache<EquipmentWithStock[]>(CACHE_KEYS.EQUIPMENT);

    // If all cached, use cache
    if (cachedCategories && cachedSubcategories && cachedEquipment) {
      setCategories(cachedCategories);
      setSubcategories(cachedSubcategories);
      setEquipment(cachedEquipment);
      setLoading(false);
      return;
    }

    // Fetch all data in parallel
    const [categoriesResult, subcategoriesResult, equipmentResult] = await Promise.all([
      cachedCategories 
        ? Promise.resolve({ data: cachedCategories, error: null })
        : supabase.from('categories').select('*').order('order_index'),
      cachedSubcategories
        ? Promise.resolve({ data: cachedSubcategories, error: null })
        : supabase.from('subcategories').select('*').order('order_index'),
      cachedEquipment
        ? Promise.resolve({ data: cachedEquipment, error: null })
        : supabase.from('equipment').select(`*, categories (*), subcategories (*)`).order('order_index'),
    ]);

    // Process categories
    if (!categoriesResult.error && categoriesResult.data) {
      setCategories(categoriesResult.data);
      if (!cachedCategories) {
        setCache(CACHE_KEYS.CATEGORIES, categoriesResult.data);
      }
    }

    // Process subcategories
    if (!subcategoriesResult.error && subcategoriesResult.data) {
      setSubcategories(subcategoriesResult.data);
      if (!cachedSubcategories) {
        setCache(CACHE_KEYS.SUBCATEGORIES, subcategoriesResult.data);
      }
    }

    // Process equipment
    if (!equipmentResult.error && equipmentResult.data) {
      const transformedData = equipmentResult.data.map((item: any) => ({
        ...item,
        images: Array.isArray(item.images) ? item.images : [],
        stock_quantity: item.stock_quantity ?? 1,
      }));
      setEquipment(transformedData);
      if (!cachedEquipment) {
        setCache(CACHE_KEYS.EQUIPMENT, transformedData);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    equipment,
    categories,
    subcategories,
    loading,
    refetch: fetchData,
  };
}
