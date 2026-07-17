// Shared visibility rules for public equipment listings (subcategory filter menu, PDF export, etc.)
// Keep menu and PDF perfectly synchronized by importing from here.

export const PUBLIC_OWNERSHIP_TYPES = ["Propio", "Estacionado", "Compartido"] as const;
const PUBLIC_OWNERSHIP_SET: ReadonlySet<string> = new Set(PUBLIC_OWNERSHIP_TYPES);

export interface VisibilityCandidate {
  status?: string | null;
  ownership_type?: string | null;
}

/** True when an equipment item should be visible in the public catalog. */
export function isPubliclyVisible(item: VisibilityCandidate | null | undefined): boolean {
  if (!item) return false;
  if (item.status !== "available") return false;
  return PUBLIC_OWNERSHIP_SET.has(item.ownership_type ?? "");
}

/** Filter a list of equipment down to publicly-visible items. */
export function filterPubliclyVisible<T extends VisibilityCandidate>(items: readonly T[]): T[] {
  return items.filter(isPubliclyVisible);
}
