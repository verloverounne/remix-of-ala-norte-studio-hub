/**
 * Consolidated hook for fetching gallery_images with caching
 * Reduces multiple database queries to a single consolidated query
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCache, setCache, CACHE_KEYS } from '@/lib/cache';

export interface GalleryImage {
  id: string;
  page_type: string;
  image_url: string;
  media_type: string | null;
  vertical_video_url: string | null;
  title: string | null;
  description: string | null;
  order_index: number | null;
}

interface UseGalleryImagesResult {
  images: GalleryImage[];
  loading: boolean;
  getByPageType: (pageType: string) => GalleryImage[];
}

// Singleton to prevent multiple fetches
let fetchPromise: Promise<GalleryImage[]> | null = null;
let cachedImages: GalleryImage[] | null = null;

async function fetchAllGalleryImages(): Promise<GalleryImage[]> {
  // Check localStorage cache first
  const cached = getCache<GalleryImage[]>(CACHE_KEYS.GALLERY_IMAGES);
  if (cached) {
    cachedImages = cached;
    return cached;
  }

  // Fetch all gallery images in a single query
  const { data, error } = await supabase
    .from('gallery_images')
    .select('id, page_type, image_url, media_type, vertical_video_url, title, description, order_index')
    .order('order_index');

  if (error) {
    console.error('[useGalleryImages] Error fetching:', error);
    return [];
  }

  const images = data || [];
  
  // Cache in localStorage
  setCache(CACHE_KEYS.GALLERY_IMAGES, images);
  cachedImages = images;
  
  return images;
}

export function useGalleryImages(): UseGalleryImagesResult {
  const [images, setImages] = useState<GalleryImage[]>(cachedImages || []);
  const [loading, setLoading] = useState(!cachedImages);

  useEffect(() => {
    const load = async () => {
      // Use singleton promise to prevent duplicate fetches
      if (!fetchPromise) {
        fetchPromise = fetchAllGalleryImages();
      }
      
      const result = await fetchPromise;
      setImages(result);
      setLoading(false);
    };

    if (!cachedImages) {
      load();
    } else {
      setImages(cachedImages);
      setLoading(false);
    }
  }, []);

  const getByPageType = (pageType: string): GalleryImage[] => {
    return images
      .filter((img) => img.page_type === pageType)
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  };

  return { images, loading, getByPageType };
}

// Preload function to call early in app lifecycle
export function preloadGalleryImages(): void {
  if (!fetchPromise && !cachedImages) {
    fetchPromise = fetchAllGalleryImages();
  }
}
