/**
 * Hook for gallery images - now uses static data instead of DB queries.
 * Maintains the same interface for backward compatibility.
 */

import { useCallback } from 'react';
import { STATIC_GALLERY_IMAGES, getStaticByPageType, type StaticGalleryImage } from '@/data/galleryData';

export type GalleryImage = StaticGalleryImage;

interface UseGalleryImagesResult {
  images: GalleryImage[];
  loading: boolean;
  getByPageType: (pageType: string) => GalleryImage[];
}

export function useGalleryImages(): UseGalleryImagesResult {
  // Stable reference since the underlying data never changes
  const getByPageType = useCallback(getStaticByPageType, []);

  return {
    images: STATIC_GALLERY_IMAGES,
    loading: false,
    getByPageType,
  };
}

/** @deprecated No longer needed - data is static */
export function preloadGalleryImages(): void {
  // No-op: data is now static
}
