/**
 * localStorage cache utility with TTL (Time To Live)
 * Used to reduce repeated database queries
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // in milliseconds
}

const CACHE_PREFIX = 'alanorte_cache_';
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function setCache<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch (e) {
    console.warn('[Cache] Error saving to localStorage:', e);
  }
}

export function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    const now = Date.now();

    // Check if cache is expired
    if (now - entry.timestamp > entry.ttl) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return entry.data;
  } catch (e) {
    console.warn('[Cache] Error reading from localStorage:', e);
    return null;
  }
}

export function clearCache(key?: string): void {
  try {
    if (key) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } else {
      // Clear all cache entries
      Object.keys(localStorage)
        .filter((k) => k.startsWith(CACHE_PREFIX))
        .forEach((k) => localStorage.removeItem(k));
    }
  } catch (e) {
    console.warn('[Cache] Error clearing localStorage:', e);
  }
}

// Cache keys constants
export const CACHE_KEYS = {
  CATEGORIES: 'categories',
  SUBCATEGORIES: 'subcategories',
  EQUIPMENT: 'equipment',
  HOME_HERO_SLIDES: 'home_hero_slides',
  HOME_SERVICES: 'home_services',
  GALLERY_IMAGES: 'gallery_images_consolidated',
} as const;

// Helper to clear specific cache when admin updates data
export function invalidateCache(key: keyof typeof CACHE_KEYS): void {
  clearCache(CACHE_KEYS[key]);
}
