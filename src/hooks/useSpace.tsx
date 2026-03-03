/**
 * Hook to fetch a space by slug with 24h localStorage cache.
 * Falls back to static data from spaces.ts if fetch fails.
 */

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCache, setCache, clearCache } from '@/lib/cache';
import { getSpaceBySlug } from '@/data/spaces';
import type { Space } from '@/types/supabase';

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

function spaceCacheKey(slug: string) {
  return `space_${slug}`;
}

export function useSpace(slug: string) {
  const fallback = getSpaceBySlug(slug);

  const [space, setSpace] = useState<Space | null>(() => {
    const cached = getCache<Space>(spaceCacheKey(slug));
    return cached || fallback;
  });
  const [loading, setLoading] = useState(() => {
    return !getCache<Space>(spaceCacheKey(slug));
  });
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;

    const cached = getCache<Space>(spaceCacheKey(slug));
    if (cached) {
      fetchedRef.current = true;
      return;
    }

    fetchedRef.current = true;
    setLoading(true);

    supabase
      .from('spaces')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) {
          const spaceData = data as unknown as Space;
          setSpace(spaceData);
          setCache(spaceCacheKey(slug), spaceData, CACHE_TTL);
        }
        setLoading(false);
      });
  }, [slug]);

  return { space, loading };
}

/** Clear space cache for a specific slug */
export function clearSpaceCache(slug: string) {
  clearCache(spaceCacheKey(slug));
}
