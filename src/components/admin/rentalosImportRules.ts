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
  "camaras": "Cuerpos de Cámara",
  "energía y distribución": "Distribución Eléctrica",
  "energia y distribucion": "Distribución Eléctrica",
  "estabilizadores / gimbals / sliders / pluma": "Estabilizadores/Gimbals",
  "filtros": "Filtros",
  "flashes / fotómetro / proyector": "Flashes/Fotómetro",
  "flashes / fotometro / proyector": "Flashes/Fotómetro",
  "grabadores externos": "Grabadores Externos",
  "grip": "Grip General",
  "grip de cámara": "Grip General",
  "grip de camara": "Grip General",
  "lentes": "Lentes",
  "luces": "LED",
  "monitoreo / evf / transmisores wireless": "Monitoreo/EVF/Transmisores",
  "sonido": "Accesorios Sonido",
  "tripodes (iluminación)": "Trípodes Iluminación",
  "tripodes (iluminacion)": "Trípodes Iluminación",
  "insumos": "Grip General",
};

// CSV category (ya normalizada) → subcategoría fallback si el mapeo directo no
// resolvió y las keywords tampoco. Sirve para items nuevos con categoría CSV
// reconocible pero sin match más específico.
export const CATEGORY_FAMILY_FALLBACK: Record<string, string> = {
  "accesorios de camara": "Accesorios Cámara",
  "accesorios de iluminación": "Accesorios Iluminación",
  "accesorios de iluminacion": "Accesorios Iluminación",
  "accesorios de monitoreo": "Accesorios Cámara",
  "baterías y cargadores de cámara": "Baterías",
  "baterias y cargadores de camara": "Baterías",
  "cabezales - trípodes - monopies": "Trípodes Cámara",
  "cabezales - tripodes - monopies": "Trípodes Cámara",
  "camaras": "Accesorios Cámara",
  "energía y distribución": "Energía Varios",
  "energia y distribucion": "Energía Varios",
  "estabilizadores / gimbals / sliders / pluma": "Accesorios Cámara",
  "filtros": "Accesorios Cámara",
  "flashes / fotómetro / proyector": "Accesorios Iluminación",
  "flashes / fotometro / proyector": "Accesorios Iluminación",
  "grabadores externos": "Accesorios Cámara",
  "grip": "Grip General",
  "grip de cámara": "Grip General",
  "grip de camara": "Grip General",
  "lentes": "Accesorios Cámara",
  "luces": "Accesorios Iluminación",
  "monitoreo / evf / transmisores wireless": "Accesorios Cámara",
  "sonido": "Accesorios Sonido",
  "tripodes (iluminación)": "Accesorios Iluminación",
  "tripodes (iluminacion)": "Accesorios Iluminación",
  "insumos": "Grip General",
};

// Reglas por keyword sobre normalizeImportName(nombre). Orden importa:
// la PRIMERA coincidencia gana. Usa `includes` estricto (case ya lower,
// espacios ya colapsados; sin quitar tildes ni signos).
export const KEYWORD_RULES: Array<{ keyword: string; subcategory: string }> = [
  // Cámara / accesorios
  { keyword: "mattebox", subcategory: "Accesorios Cámara" },
  { keyword: "follow focus", subcategory: "Accesorios Cámara" },
  { keyword: "cfexpress", subcategory: "Accesorios Cámara" },
  { keyword: "gopro", subcategory: "Cuerpos de Cámara" },
  { keyword: "timecode", subcategory: "Accesorios Cámara" },
  { keyword: "tentacle", subcategory: "Accesorios Cámara" },
  { keyword: "atomos", subcategory: "Grabadores Externos" },
  { keyword: "metabone", subcategory: "Accesorios Cámara" },
  { keyword: "adaptador", subcategory: "Accesorios Cámara" },
  { keyword: "filtro", subcategory: "Filtros" },
  { keyword: "lente", subcategory: "Lentes" },
  { keyword: "gimbal", subcategory: "Estabilizadores/Gimbals" },
  { keyword: "ronin", subcategory: "Estabilizadores/Gimbals" },
  { keyword: "transmisor", subcategory: "Monitoreo/EVF/Transmisores" },
  { keyword: "monitor", subcategory: "Monitoreo/EVF/Transmisores" },
  { keyword: "grabador", subcategory: "Grabadores Externos" },
  // Iluminación
  { keyword: "softbox", subcategory: "Accesorios Iluminación" },
  { keyword: "eggcrate", subcategory: "Accesorios Iluminación" },
  { keyword: "hmi", subcategory: "Accesorios Iluminación" },
  { keyword: "flash", subcategory: "Flashes/Fotómetro" },
  { keyword: "fotometro", subcategory: "Flashes/Fotómetro" },
  { keyword: "led", subcategory: "LED" },
  // Sonido
  { keyword: "lavalier", subcategory: "Accesorios Sonido" },
  { keyword: "inalambrico", subcategory: "Accesorios Sonido" },
  { keyword: "wireless", subcategory: "Accesorios Sonido" },
  { keyword: "microfono", subcategory: "Accesorios Sonido" },
  { keyword: "boom", subcategory: "Accesorios Sonido" },
  // Grip
  { keyword: "travelling", subcategory: "Grip General" },
  { keyword: "dolly", subcategory: "Grip General" },
  { keyword: "bandera", subcategory: "Grip General" },
  { keyword: "marco", subcategory: "Grip General" },
  // Trípodes (default cámara; iluminación cae por mapeo directo de la categoría CSV)
  { keyword: "tripode", subcategory: "Trípodes Cámara" },
  // Energía
  { keyword: "v-mount", subcategory: "Baterías" },
  { keyword: "bateria", subcategory: "Baterías" },
  { keyword: "cargador", subcategory: "Baterías" },
  { keyword: "generador", subcategory: "Distribución Eléctrica" },
  { keyword: "alargue", subcategory: "Distribución Eléctrica" },
  { keyword: "zapatilla", subcategory: "Distribución Eléctrica" },
  { keyword: "distribuidor", subcategory: "Distribución Eléctrica" },
];

export function matchKeyword(normalizedName: string): string | null {
  for (const rule of KEYWORD_RULES) {
    if (normalizedName.includes(rule.keyword)) return rule.subcategory;
  }
  return null;
}
