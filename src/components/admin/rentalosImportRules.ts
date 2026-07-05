// Reglas 100% determinísticas para la importación CSV Rentalos.
// - normalización mínima (case + colapso de espacios)
// - mapeo directo por categoría CSV
// - reglas por keywords sobre el nombre normalizado (primera coincidencia gana)
// - fallback por categoría (solo si CSV trae una categoría familiar)

export function normalizeImportName(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

// CSV category (ya normalizada) → nombre de subcategoría destino (mapeo directo).
export const CATEGORY_MAP: Record<string, string> = {
  "accesorios de camara": "Accesorios Cámara",
  "accesorios de iluminación": "Accesorios Iluminación",
  "accesorios de iluminacion": "Accesorios Iluminación",
  "accesorios de monitoreo": "Monitoreo/EVF/Transmisores",
  "baterías y cargadores de cámara": "Baterías",
  "baterias y cargadores de camara": "Baterías",
  "cabezales - trípodes - monopies": "Trípodes Cámara",
  "cabezales - tripodes - monopies": "Trípodes Cámara",
  camaras: "Cuerpos de Cámara",
  "energía y distribución": "Distribución Eléctrica",
  "energia y distribucion": "Distribución Eléctrica",
  "estabilizadores / gimbals / sliders / pluma": "Estabilizadores/Gimbals",
  filtros: "Filtros",
  "flashes / fotómetro / proyector": "Flashes/Fotómetro",
  "flashes / fotometro / proyector": "Flashes/Fotómetro",
  "grabadores externos": "Grabadores Externos",
  grip: "Grip General",
  "grip de cámara": "Grip General",
  "grip de camara": "Grip General",
  lentes: "Lentes",
  luces: "LED",
  "monitoreo / evf / transmisores wireless": "Monitoreo/EVF/Transmisores",
  sonido: "Accesorios Sonido",
  "tripodes (iluminación)": "Trípodes Iluminación",
  "tripodes (iluminacion)": "Trípodes Iluminación",
  insumos: "Grip General",
};

// CSV category (ya normalizada) → subcategoría fallback.
export const CATEGORY_FALLBACK: Record<string, string> = {
  "accesorios de camara": "Accesorios Cámara",
  "accesorios de iluminación": "Accesorios Iluminación",
  "accesorios de iluminacion": "Accesorios Iluminación",
  luces: "LED",
  lentes: "Lentes",
  camaras: "Cuerpos de Cámara",
  grip: "Grip General",
  "grip de cámara": "Grip General",
  "grip de camara": "Grip General",
  sonido: "Accesorios Sonido",
  filtros: "Filtros",
  "grabadores externos": "Grabadores Externos",
  "estabilizadores / gimbals / sliders / pluma": "Estabilizadores/Gimbals",
  "monitoreo / evf / transmisores wireless": "Monitoreo/EVF/Transmisores",
  "flashes / fotómetro / proyector": "Flashes/Fotómetro",
  "flashes / fotometro / proyector": "Flashes/Fotómetro",
  "energía y distribución": "Distribución Eléctrica",
  "energia y distribucion": "Distribución Eléctrica",
  insumos: "Grip General",
};

export const KEYWORD_RULES: { keyword: string; subcategory: string }[] = [
  // Cámaras
  { keyword: "amaran", subcategory: "LED" },
  { keyword: "arri", subcategory: "LED" },
  { keyword: "blackmagic", subcategory: "Cuerpos de Cámara" },
  { keyword: "bmpcc", subcategory: "Cuerpos de Cámara" },
  { keyword: "sony", subcategory: "Cuerpos de Cámara" },
  { keyword: "canon", subcategory: "Cuerpos de Cámara" },
  { keyword: "nikon", subcategory: "Cuerpos de Cámara" },
  { keyword: "fuji", subcategory: "Cuerpos de Cámara" },
  { keyword: "lumix", subcategory: "Cuerpos de Cámara" },
  // Lentes
  { keyword: "sigma", subcategory: "Lentes" },
  { keyword: "zeiss", subcategory: "Lentes" },
  { keyword: "rokinon", subcategory: "Lentes" },
  { keyword: "samyang", subcategory: "Lentes" },
  { keyword: "tamron", subcategory: "Lentes" },
  { keyword: "tokina", subcategory: "Lentes" },
  { keyword: "leica", subcategory: "Lentes" },
  { keyword: "voigtlander", subcategory: "Lentes" },
  { keyword: "lente", subcategory: "Lentes" },
  { keyword: "objetivo", subcategory: "Lentes" },
  { keyword: "prime", subcategory: "Lentes" },
  { keyword: "zoom lens", subcategory: "Lentes" },
  // Iluminación LED
  { keyword: "godox", subcategory: "LED" },
  { keyword: "nanlite", subcategory: "LED" },
  { keyword: "nanlux", subcategory: "LED" },
  { keyword: "aputure", subcategory: "LED" },
  { keyword: "aperture", subcategory: "LED" },
  { keyword: "litepanels", subcategory: "LED" },
  { keyword: "came-tv", subcategory: "LED" },
  { keyword: "came tv", subcategory: "LED" },
  { keyword: "luxli", subcategory: "LED" },
  { keyword: "quasar", subcategory: "LED" },
  { keyword: "kino flo", subcategory: "LED" },
  { keyword: "kinoflo", subcategory: "LED" },
  { keyword: "kino", subcategory: "LED" },
  { keyword: "tube led", subcategory: "LED" },
  { keyword: "tubo led", subcategory: "LED" },
  { keyword: "panel led", subcategory: "LED" },
  { keyword: "bola china", subcategory: "LED" },
  { keyword: "softbox", subcategory: "LED" },
  { keyword: "octobox", subcategory: "Accesorios Iluminación" },
  { keyword: "fresnel", subcategory: "LED" },
  { keyword: "bi-color", subcategory: "LED" },
  { keyword: "bicolor", subcategory: "LED" },
  { keyword: "rgbww", subcategory: "LED" },
  { keyword: "rgb led", subcategory: "LED" },
  { keyword: "cob led", subcategory: "LED" },
  { keyword: "cob light", subcategory: "LED" },
  { keyword: "hmi", subcategory: "LED" },
  { keyword: "par led", subcategory: "LED" },
  { keyword: "flood", subcategory: "LED" },
  { keyword: "spot led", subcategory: "LED" },
  { keyword: "fairy light", subcategory: "LED" },
  { keyword: "tiras led", subcategory: "LED" },
  { keyword: "tubos godox", subcategory: "LED" },
  { keyword: "godox tl", subcategory: "LED" },
  // Iluminación - accesorios varios
  { keyword: "dimmer", subcategory: "Accesorios Iluminación" },
  { keyword: "chimera", subcategory: "Accesorios Iluminación" },
  { keyword: "snoot", subcategory: "Accesorios Iluminación" },
  // Energía
  { keyword: "chicote", subcategory: "Distribución Eléctrica" },
  { keyword: "ups", subcategory: "Distribución Eléctrica" },
  // Grip - travelling
  { keyword: "vias tramo", subcategory: "Carros Travelling" },
  { keyword: "carro travelling", subcategory: "Carros Travelling" },
  // Grip general
  { keyword: "bolsa de arena", subcategory: "Grip General" },
  { keyword: "perno", subcategory: "Grip General" },
  { keyword: "flag kit", subcategory: "Grip General" },
  { keyword: "manta aislante", subcategory: "Grip General" },
  { keyword: "sin fin", subcategory: "Grip General" },
  { keyword: "mesa de producto", subcategory: "Grip General" },
  { keyword: "base giratoria", subcategory: "Grip General" },
  { keyword: "practicable", subcategory: "Grip General" },
  { keyword: "tres medidas", subcategory: "Grip General" },
  { keyword: "cuña", subcategory: "Grip General" },
  { keyword: "cuñas", subcategory: "Grip General" },
  { keyword: "pintura piso", subcategory: "Grip General" },
  // Cámara - accesorios trípode específicos
  { keyword: "ruedas tripode", subcategory: "Accesorios Cámara" },
  { keyword: "ruedas trípode", subcategory: "Accesorios Cámara" },
  { keyword: "barra extension", subcategory: "Accesorios Cámara" },
  { keyword: "galera", subcategory: "Accesorios Cámara" },
  // Cámara - tripode con acento
  { keyword: "trípode", subcategory: "Trípodes Cámara" },
  // Cámara adicionales
  { keyword: "cenital", subcategory: "Accesorios Cámara" },
  { keyword: "kit de camara cenital", subcategory: "Accesorios Cámara" },
];

export function matchKeyword(normalizedName: string): string | null {
  for (const rule of KEYWORD_RULES) {
    if (normalizedName.includes(rule.keyword)) return rule.subcategory;
  }
  return null;
}
