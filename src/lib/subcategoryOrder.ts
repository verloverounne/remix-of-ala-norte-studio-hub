// Shared subcategory ordering.
// - "Cámara" category uses a fixed manual order (business decision).
// - All other categories sort by max equipment price (desc), ignoring "unpriced" items.

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

// Manual order for subcategories inside the "Cámara" category.
// Match by normalized name (accent/case-insensitive).
const CAMARA_MANUAL_ORDER: string[] = [
  "camaras",
  "lentes",
  "estabilizadores / gimbals / sliders / pluma",
  "filtros",
  "accesorios de camara",
  "monitoreo / evf / transmisores wireless",
  "grabadores externos",
  "tripodes de camara - monopies - shoulders",
  "adaptadores para lentes / monturas metabones",
  "switcher",
  "video transmision inalambrica",
  "comunicacion",
  "computadoras / laptops de descarga",
  "cables bnc",
  "cables hdmi",
];

const isCamaraCategory = (category?: CatLike | null) =>
  !!category && norm(category.name) === "camara";

const camaraManualIndex = (subName: string) => {
  const n = norm(subName);
  const idx = CAMARA_MANUAL_ORDER.indexOf(n);
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
};

// Kept for backward-compat with existing imports.
export function isPinnedFirst(sub: SubLike, category?: CatLike | null): boolean {
  if (!isCamaraCategory(category)) return false;
  return norm(sub.name) === "camaras";
}

export function subcategoryPriceStats(items: readonly PriceItem[]) {
  const priced = items.map((i) => i.price_per_day || 0).filter(isPriced);
  const max = priced.length ? Math.max(...priced) : -1;
  const avg = priced.length ? priced.reduce((a, b) => a + b, 0) / priced.length : -1;
  return { max, avg };
}

/**
 * Sort subcategories:
 * - "Cámara": fixed manual order (unknown names fall back to price desc at the end).
 * - Other categories: max price desc, avg price desc, order_index asc.
 */
export function sortSubcategoriesByPrice<T extends SubLike>(
  subs: readonly T[],
  itemsBySubId: (id: string) => readonly PriceItem[],
  category?: CatLike | null,
): T[] {
  if (isCamaraCategory(category)) {
    return [...subs].sort((a, b) => {
      const ia = camaraManualIndex(a.name);
      const ib = camaraManualIndex(b.name);
      if (ia !== ib) return ia - ib;
      // Fallback for names not in the manual list: price desc, then order_index.
      const sa = subcategoryPriceStats(itemsBySubId(a.id));
      const sb = subcategoryPriceStats(itemsBySubId(b.id));
      if (sb.max !== sa.max) return sb.max - sa.max;
      if (sb.avg !== sa.avg) return sb.avg - sa.avg;
      return (a.order_index ?? 0) - (b.order_index ?? 0);
    });
  }
  return [...subs].sort((a, b) => {
    const sa = subcategoryPriceStats(itemsBySubId(a.id));
    const sb = subcategoryPriceStats(itemsBySubId(b.id));
    if (sb.max !== sa.max) return sb.max - sa.max;
    if (sb.avg !== sa.avg) return sb.avg - sa.avg;
    return (a.order_index ?? 0) - (b.order_index ?? 0);
  });
}
