/**
 * Hook for gallery images - fetches from DB with 24h localStorage cache.
 * Falls back to static data if fetch fails.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCache, setCache, CACHE_KEYS } from '@/lib/cache';
import { STATIC_GALLERY_IMAGES, getStaticByPageType, type StaticGalleryImage } from '@/data/galleryData';

export type GalleryImage = StaticGalleryImage;

interface UseGalleryImagesResult {
  images: GalleryImage[];
  loading: boolean;
  getByPageType: (pageType: string) => GalleryImage[];
}

export function useGalleryImages(): UseGalleryImagesResult {
  const [images, setImages] = useState<GalleryImage[]>(() => {
    // Try cache first for instant render
    const cached = getCache<GalleryImage[]>(CACHE_KEYS.GALLERY_IMAGES);
    return cached || STATIC_GALLERY_IMAGES;
  });
  const [loading, setLoading] = useState(() => {
    return !getCache<GalleryImage[]>(CACHE_KEYS.GALLERY_IMAGES);
  });
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    
    // If cache is valid, skip fetch
    const cached = getCache<GalleryImage[]>(CACHE_KEYS.GALLERY_IMAGES);
    if (cached) {
      fetchedRef.current = true;
      return;
    }

    fetchedRef.current = true;
    setLoading(true);

    supabase
      .from('gallery_images')
      .select('*')
      .order('order_index')
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped: GalleryImage[] = data.map((item) => ({
            id: item.id,
            page_type: item.page_type,
            image_url: item.image_url,
            media_type: item.media_type || null,
            vertical_video_url: item.vertical_video_url || null,
            title: item.title || null,
            description: item.description || null,
            order_index: item.order_index ?? null,
          }));
          setImages(mapped);
          setCache(CACHE_KEYS.GALLERY_IMAGES, mapped);
        }
        // If error or empty, keep static fallback
        setLoading(false);
      });
  }, []);

  const getByPageType = useCallback(
    (pageType: string): GalleryImage[] => {
      return images
        .filter((img) => img.page_type === pageType)
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    },
    [images]
  );

  return { images, loading, getByPageType };
}

/** @deprecated Use invalidateCache('GALLERY_IMAGES') instead */
export function preloadGalleryImages(): void {
  // No-op
}
