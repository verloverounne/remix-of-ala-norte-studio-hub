// Shared subcategory ordering: by max equipment price (desc), ignoring "unpriced" items.
// Exception: within the "Cámaras" category, the subcategory literally named "Cámaras"
// is always pinned first regardless of price.

interface PriceItem {
  price_per_day?: number | null;
}
interface SubLike {
  id: string;
  name: string;
  category_id?: string | null;
  order_index?: number | null;
}
interface CatLike {
  id: string;
  name: string;
}

const isPriced = (p: number) => p > 0 && p !== 1000;

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export function isPinnedFirst(sub: SubLike, category?: CatLike | null): boolean {
  if (!category) return false;
  return norm(category.name) === "camaras" && norm(sub.name) === "camaras";
}

export function subcategoryPriceStats(items: readonly PriceItem[]) {
  const priced = items.map((i) => i.price_per_day || 0).filter(isPriced);
  const max = priced.length ? Math.max(...priced) : -1;
  const avg = priced.length ? priced.reduce((a, b) => a + b, 0) / priced.length : -1;
  return { max, avg };
}

/**
 * Sort subcategories in-place-safe (returns new array) by:
 *  1. pinned first (Cámaras > Cámaras)
 *  2. max price desc
 *  3. avg price desc
 *  4. order_index asc
 */
export function sortSubcategoriesByPrice<T extends SubLike>(
  subs: readonly T[],
  itemsBySubId: (id: string) => readonly PriceItem[],
  category?: CatLike | null,
): T[] {
  return [...subs].sort((a, b) => {
    const pa = isPinnedFirst(a, category);
    const pb = isPinnedFirst(b, category);
    if (pa && !pb) return -1;
    if (pb && !pa) return 1;
    const sa = subcategoryPriceStats(itemsBySubId(a.id));
    const sb = subcategoryPriceStats(itemsBySubId(b.id));
    if (sb.max !== sa.max) return sb.max - sa.max;
    if (sb.avg !== sa.avg) return sb.avg - sa.avg;
    return (a.order_index ?? 0) - (b.order_index ?? 0);
  });
}
