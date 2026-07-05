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

  // === Ampliación para recategorización masiva (equipos NULL / auto-asignados) ===
  // Orden importante: específicos antes que genéricos.

  // Sonido - inalámbricos (modelos)
  { keyword: "sennheiser ew", subcategory: "Micrófonos Inalámbricos" },
  { keyword: "sennheiser g3", subcategory: "Micrófonos Inalámbricos" },
  { keyword: "sennheiser g4", subcategory: "Micrófonos Inalámbricos" },
  { keyword: "ew 100", subcategory: "Micrófonos Inalámbricos" },
  { keyword: "ew500", subcategory: "Micrófonos Inalámbricos" },
  { keyword: "plug on", subcategory: "Micrófonos Inalámbricos" },
  { keyword: "shure pcm", subcategory: "Micrófonos Inalámbricos" },

  // Sonido - micrófonos (Boom/Micrófonos) - específicos antes de "microfono"
  { keyword: "sm 58", subcategory: "Boom/Micrófonos" },
  { keyword: "md46", subcategory: "Boom/Micrófonos" },
  { keyword: "md 46", subcategory: "Boom/Micrófonos" },
  { keyword: "me66", subcategory: "Boom/Micrófonos" },
  { keyword: "sennheiser k6", subcategory: "Boom/Micrófonos" },
  { keyword: "rode video", subcategory: "Boom/Micrófonos" },
  { keyword: "microfofono", subcategory: "Boom/Micrófonos" },
  { keyword: "micrófono", subcategory: "Boom/Micrófonos" },

  // Sonido - accesorios
  { keyword: "rycote", subcategory: "Accesorios Sonido" },
  { keyword: "zepellin", subcategory: "Accesorios Sonido" },
  { keyword: "zeppelin", subcategory: "Accesorios Sonido" },
  { keyword: "pistol grip", subcategory: "Accesorios Sonido" },
  { keyword: "vincha mic", subcategory: "Accesorios Sonido" },
  { keyword: "pie de micrófono", subcategory: "Accesorios Sonido" },
  { keyword: "pie de microfono", subcategory: "Accesorios Sonido" },
  { keyword: "deneke", subcategory: "Accesorios Sonido" },
  { keyword: "beachtek", subcategory: "Accesorios Sonido" },
  { keyword: "phanton", subcategory: "Accesorios Sonido" },
  { keyword: "phantom 48", subcategory: "Accesorios Sonido" },
  { keyword: "megafono", subcategory: "Accesorios Sonido" },
  { keyword: "megáfono", subcategory: "Accesorios Sonido" },
  { keyword: "placa de sonido", subcategory: "Accesorios Sonido" },
  { keyword: "microphone arm", subcategory: "Accesorios Sonido" },
  { keyword: "maono", subcategory: "Accesorios Sonido" },

  // Sonido - mixers
  { keyword: "mixer", subcategory: "Mixers" },
  { keyword: "mackie", subcategory: "Mixers" },
  { keyword: "wharfedale", subcategory: "Mixers" },
  { keyword: "presonus", subcategory: "Mixers" },
  { keyword: "samson", subcategory: "Mixers" },
  { keyword: "wendt", subcategory: "Mixers" },

  // Sonido - grabadoras
  { keyword: "zoom f", subcategory: "Grabadoras" },
  { keyword: "tascam", subcategory: "Grabadoras" },

  // Iluminación - máquinas de humo
  { keyword: "maquina de humo", subcategory: "Máquinas de Humo" },
  { keyword: "máquina de humo", subcategory: "Máquinas de Humo" },
  { keyword: "maquina de niebla", subcategory: "Máquinas de Humo" },
  { keyword: "máquina de niebla", subcategory: "Máquinas de Humo" },
  { keyword: "fazer", subcategory: "Máquinas de Humo" },
  { keyword: "crackera", subcategory: "Máquinas de Humo" },
  { keyword: "glicerina", subcategory: "Máquinas de Humo" },
  { keyword: "crack oil", subcategory: "Máquinas de Humo" },
  { keyword: "carga 1 litro", subcategory: "Máquinas de Humo" },
  { keyword: "haze", subcategory: "Máquinas de Humo" },
  { keyword: "antari", subcategory: "Máquinas de Humo" },

  // Iluminación - kino (antes que LED genérico)
  { keyword: "kino flo", subcategory: "Kino/Fluorescente" },
  { keyword: "kino", subcategory: "Kino/Fluorescente" },

  // Iluminación - LED por marca/modelo
  { keyword: "dracast", subcategory: "LED" },
  { keyword: "amaran", subcategory: "LED" },
  { keyword: "nanlink", subcategory: "LED" },
  { keyword: "evoke", subcategory: "LED" },
  { keyword: "bola china", subcategory: "LED" },
  { keyword: "lantern", subcategory: "LED" },
  { keyword: "tubo godox", subcategory: "LED" },
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
  { keyword: "vías tramo", subcategory: "Carros Travelling" },
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

  // Cámara - accesorios trípode específicos (antes que "tripode" genérico ya definido arriba)
  { keyword: "ruedas trípode", subcategory: "Accesorios Cámara" },
  { keyword: "ruedas tripode", subcategory: "Accesorios Cámara" },
  { keyword: "barra extension", subcategory: "Accesorios Cámara" },
  { keyword: "galera", subcategory: "Accesorios Cámara" },

  // Cámara - trípode con acento (existente "tripode" sin acento)
  { keyword: "trípode", subcategory: 
      // Accesorios Sonido adicionales
  { keyword: "maono", subcategory: "Accesorios Sonido" },
  { keyword: "megafono", subcategory: "Accesorios Sonido" },
  // Cámara adicionales
  { keyword: "cenital", subcategory: "Accesorios Cámara" },
  { keyword: "kit de camara cenital", subcategory: "Accesorios Cámara" },"Trípodes Cámara" },
];


export function matchKeyword(normalizedName: string): string | null {
  for (const rule of KEYWORD_RULES) {
    if (normalizedName.includes(rule.keyword)) return rule.subcategory;
  }
  return null;
}
