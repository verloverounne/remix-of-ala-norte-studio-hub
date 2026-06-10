import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Upload, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// CSV category → subcategory name mapping
const CATEGORY_MAP: Record<string, string> = {
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
  "sonido": "Boom/Micrófonos",
  "tripodes (iluminación)": "Trípodes Iluminación",
  "tripodes (iluminacion)": "Trípodes Iluminación",
  "insumos": "Grip General",
};

// ID fijo de la categoría Sonido (antes "Audio"). Se usa como fallback para
// que cualquier fila CSV con categoría "sonido" termine bajo Sonido aunque
// la subcategoría no exista.
const SONIDO_CATEGORY_ID = "bdaa1e73-8532-4b85-8495-6ef8bba5be31";

interface CSVRow {
  nombre: string;
  categoria: string;
  precioDiario: number;
  numeroSerie: string;
  anexos: string;
  cantidad: number;
  funcional: string;
  tipo: string;
}

interface SyncResult {
  updated: number;
  created: number;
  deactivated: number;
  deleted: number;
  errors: string[];
  details: string[];
}



// Mapea "Tipo" de Rentalos a status + prioridad de orden.
// Propio = disponible y aparece primero.
// Estacionado = compartido que duerme en Ala Norte → disponible, segundo lugar.
// Compartido = disponible, tercer lugar.
// Externo = NO disponible (maintenance), último.
function mapTipo(tipo: string): { status: "available" | "maintenance"; priority: number } {
  const t = tipo.toLowerCase().trim();
  if (t === "propio") return { status: "available", priority: 1 };
  if (t === "estacionado") return { status: "available", priority: 2 };
  if (t === "compartido") return { status: "available", priority: 3 };
  if (t === "externo") return { status: "maintenance", priority: 4 };
  return { status: "available", priority: 5 };
}

// Parsea el campo "Funcional" del CSV y devuelve la cantidad efectivamente
// disponible para el cotizador a partir de la cantidad declarada en la fila.
// - "Funcional" / "Si" / vacío → toda la cantidad disponible.
// - "Parcial (n/m)" → solo n unidades cuentan como disponibles.
// - "No" u otro valor → 0 disponibles.
function parseFuncional(funcional: string, cantidad: number): number {
  const f = (funcional || "").toLowerCase().trim();
  if (!f || f === "funcional" || f === "si" || f === "sí") return cantidad;
  const parcial = f.match(/parcial\s*\(\s*(\d+)\s*\/\s*\d+\s*\)/);
  if (parcial) return Math.max(0, parseInt(parcial[1], 10) || 0);
  if (f === "no") return 0;
  // valores desconocidos: conservador, usar cantidad declarada
  return cantidad;
}

function parseCSVRows(text: string): CSVRow[] {
  const lines = text.split("\n");
  if (lines.length < 2) return [];

  const header = lines[0];
  const sep = header.includes(";") ? ";" : ",";

  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(sep).map((v) => v.trim().replace(/^"|"$/g, ""));
    if (values.length < 8) continue;

    const nombre = values[0]?.replace(/^\uFEFF/, "");
    if (!nombre) continue;

    rows.push({
      nombre,
      categoria: values[1] || "",
      precioDiario: parseInt(values[2]) || 0,
      numeroSerie: values[3] || "",
      anexos: values[4] || "",
      cantidad: parseInt(values[5]) || 1,
      funcional: values[6] || "",
      tipo: values[7] || "",
    });
  }
  return rows;
}

function normalizeName(name: string): string {
  let n = name.toLowerCase().trim().replace(/\s+/g, " ");
  const powerEquivalents: Array<[RegExp, string]> = [
    [/\b200\s?w\b/g, "2k"],
    [/\b300\s?w\b/g, "3k"],
    [/\b500\s?w\b/g, "5k"],
    [/\b1000\s?w\b/g, "1k"],
    [/\b1200\s?w\b/g, "1.2k"],
    [/\b2000\s?w\b/g, "2k"],
  ];
  for (const [re, rep] of powerEquivalents) n = n.replace(re, rep);
  n = n.replace(/[\/\-_,.]/g, " ").replace(/\s+/g, " ").trim();
  return n;
}

// Group CSV rows by normalized name, summing quantities and collecting serial numbers
function groupCSVRows(rows: CSVRow[]) {
  const groups = new Map<
    string,
    {
      nombre: string;
      categoria: string;
      precioDiario: number;
      totalCantidad: number;
      serialNumbers: string[];
      anexos: string[];
      funcional: string;
      tipo: string;
    }
  >();

  for (const row of rows) {
    const key = normalizeName(row.nombre);
    // Cantidad efectiva: Externo no suma stock; el resto suma según el campo Funcional.
    const isExterno = row.tipo.toLowerCase().trim() === "externo";
    const effectiveQty = isExterno ? 0 : parseFuncional(row.funcional, row.cantidad);

    const existing = groups.get(key);
    if (existing) {
      const newTipoP = mapTipo(row.tipo).priority;
      const oldTipoP = mapTipo(existing.tipo).priority;
      existing.totalCantidad += effectiveQty;
      if (row.numeroSerie) existing.serialNumbers.push(row.numeroSerie);
      if (row.anexos) existing.anexos.push(row.anexos);
      if (!existing.funcional && row.funcional) existing.funcional = row.funcional;
      // Tipo dominante = el de mayor prioridad (menor número)
      if (newTipoP < oldTipoP) existing.tipo = row.tipo;
      if (!existing.precioDiario && row.precioDiario) existing.precioDiario = row.precioDiario;
    } else {
      groups.set(key, {
        nombre: row.nombre,
        categoria: row.categoria,
        precioDiario: row.precioDiario,
        totalCantidad: effectiveQty,
        serialNumbers: row.numeroSerie ? [row.numeroSerie] : [],
        anexos: row.anexos ? [row.anexos] : [],
        funcional: row.funcional,
        tipo: row.tipo,
      });
    }
  }
  return groups;
}

export function RentalosSyncPanel({ onSyncComplete }: { onSyncComplete?: () => void }) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const { toast } = useToast();

  const addLog = (msg: string) => setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleSync = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSyncing(true);
    setResult(null);
    setLog([]);

    try {
      addLog("Leyendo archivo CSV...");
      const text = await file.text();
      const csvRows = parseCSVRows(text);
      addLog(`✓ ${csvRows.length} filas leídas del CSV`);

      const grouped = groupCSVRows(csvRows);
      addLog(`✓ ${grouped.size} equipos únicos agrupados`);

      // Fetch subcategories for mapping
      addLog("Cargando subcategorías...");
      const { data: subcategories } = await supabase.from("subcategories").select("id, name, category_id");
      const subMap = new Map((subcategories || []).map((s) => [s.name, { id: s.id, category_id: s.category_id }]));
      const subNameById = new Map((subcategories || []).map((s) => [s.id, s.name]));

      // Fetch all existing equipment (incluyendo description para append de anexos)
      addLog("Cargando equipos existentes...");
      const { data: existingEquipment, error: eqError } = await supabase
        .from("equipment")
        .select("id, name, status, description, brand, model, subcategory_id, category_id")
        .limit(10000);
      if (eqError) throw eqError;

      const existingMap = new Map<string, { id: string; name: string; description: string | null }>();
      for (const eq of existingEquipment || []) {
        existingMap.set(normalizeName(eq.name), { id: eq.id, name: eq.name, description: eq.description });
      }
      addLog(`✓ ${existingMap.size} equipos existentes en la base de datos`);

      // ── Índices para inferencia de subcategoría por similitud ──
      const STOPWORDS = new Set(["de","del","la","el","los","las","para","con","kit","set","pack","tipo","modelo","y","a","en","por"]);
      const tokenize = (s: string): string[] => normalizeName(s)
        .split(/\s+/)
        .filter((t) => t.length >= 3 && !STOPWORDS.has(t) && !/^\d+$/.test(t));

      type SimEntry = { tokens: string[]; subcategory_id: string; category_id: string | null };
      const simEntries: SimEntry[] = [];
      const brandModelMap = new Map<string, { subcategory_id: string; category_id: string | null }>();
      const brandModelPrefixMap = new Map<string, { subcategory_id: string; category_id: string | null }>();
      for (const eq of (existingEquipment || []) as any[]) {
        if (!eq.subcategory_id) continue;
        simEntries.push({
          tokens: tokenize(eq.name),
          subcategory_id: eq.subcategory_id,
          category_id: eq.category_id,
        });
        if (eq.brand && eq.model) {
          const bm = `${normalizeName(eq.brand)}|${normalizeName(eq.model)}`;
          if (!brandModelMap.has(bm)) brandModelMap.set(bm, { subcategory_id: eq.subcategory_id, category_id: eq.category_id });
          const prefix = normalizeName(eq.model).split(/\s+/)[0];
          if (prefix) {
            const bmp = `${normalizeName(eq.brand)}|${prefix}`;
            if (!brandModelPrefixMap.has(bmp)) brandModelPrefixMap.set(bmp, { subcategory_id: eq.subcategory_id, category_id: eq.category_id });
          }
        }
      }

      const inferSubcategory = (name: string): { subcategory_id: string; category_id: string | null } | null => {
        const tokens = tokenize(name);
        if (tokens.length === 0) return null;
        const rawTokens = normalizeName(name).split(/\s+/).filter(Boolean);
        const guessedBrand = rawTokens[0];
        const guessedModel = rawTokens[1];
        if (guessedBrand && guessedModel) {
          const hit = brandModelMap.get(`${guessedBrand}|${guessedModel}`);
          if (hit) return hit;
          const hit2 = brandModelPrefixMap.get(`${guessedBrand}|${guessedModel}`);
          if (hit2) return hit2;
        }
        const tokenSet = new Set(tokens);
        const counts = new Map<string, { score: number; category_id: string | null }>();
        let bestScore = 0;
        for (const entry of simEntries) {
          let shared = 0;
          for (const t of entry.tokens) if (tokenSet.has(t)) shared++;
          if (shared < 2) continue;
          if (shared > bestScore) bestScore = shared;
          const prev = counts.get(entry.subcategory_id);
          if (prev) prev.score += shared;
          else counts.set(entry.subcategory_id, { score: shared, category_id: entry.category_id });
        }
        if (bestScore < 2 || counts.size === 0) return null;
        let bestSub: string | null = null;
        let bestSubScore = -1;
        let bestCat: string | null = null;
        for (const [sid, v] of counts) {
          if (v.score > bestSubScore) { bestSubScore = v.score; bestSub = sid; bestCat = v.category_id; }
        }
        return bestSub ? { subcategory_id: bestSub, category_id: bestCat } : null;
      };

      const syncResult: SyncResult = { updated: 0, created: 0, deactivated: 0, deleted: 0, errors: [], details: [] };
      const matchedIds = new Set<string>();
      let inferredCount = 0;
      let unresolvedCount = 0;

      // Process each grouped CSV item
      addLog("Iniciando sincronización...");
      for (const [normalizedName, csvItem] of grouped) {
        const existing = existingMap.get(normalizedName);

        // Si el tipo dominante es Externo → eliminar de la base (no crear si no existe)
        const isExterno = csvItem.tipo.toLowerCase().trim() === "externo";
        if (isExterno) {
          if (existing) {
            const { error } = await supabase.from("equipment").delete().eq("id", existing.id);
            if (error) {
              syncResult.errors.push(`Error eliminando "${existing.name}" (Externo): ${error.message}`);
            } else {
              syncResult.deleted++;
              matchedIds.add(existing.id); // evitar que el bloque de desactivación lo toque
              syncResult.details.push(`🗑 Eliminado (Externo): ${existing.name}`);
            }
          }
          continue;
        }

        // Resolve subcategory
        const csvCatNorm = csvItem.categoria.toLowerCase().trim();
        const subcatName = CATEGORY_MAP[csvCatNorm];
        const subcatInfo = subcatName ? subMap.get(subcatName) : null;

        // Mapear tipo → status + order_index priority
        let { status, priority } = mapTipo(csvItem.tipo);

        // Si no es funcional (o stock efectivo 0) → marcar como no disponible
        const funcNorm = (csvItem.funcional || "").toLowerCase().trim();
        const isNotFunctional = funcNorm === "no" || csvItem.totalCantidad <= 0;
        if (isNotFunctional) {
          status = "maintenance";
        }


        // Append anexos a la description existente sin duplicar
        const anexosText = csvItem.anexos.filter(Boolean).join(" • ").trim();
        let mergedDescription: string | null | undefined = undefined; // undefined = no tocar
        if (anexosText) {
          const existingDesc = (existing?.description || "").trim();
          const anexoBlock = `Anexos: ${anexosText}`;
          if (!existingDesc) {
            mergedDescription = anexoBlock;
          } else if (!existingDesc.includes(anexoBlock)) {
            // Reemplazar bloque "Anexos:" anterior si existe, sino agregar
            const cleaned = existingDesc.replace(/\n?Anexos:.*$/s, "").trim();
            mergedDescription = `${cleaned}\n\n${anexoBlock}`;
          }
        }

        const updateFields: Record<string, unknown> = {
          price_per_day: csvItem.precioDiario,
          stock_quantity: csvItem.totalCantidad,
          status,
          order_index: priority,
          functional_status: csvItem.funcional || null,
          ownership_type: (() => {
            const raw = (csvItem.tipo || "").trim();
            const t = raw.toLowerCase();
            if (t === "propio") return "Propio";
            if (t === "estacionado") return "Estacionado";
            if (t === "compartido") return "Compartido";
            if (t === "externo") return "Externo";
            if (raw) {
              syncResult.errors.push(`Tipo no válido "${raw}" en "${csvItem.nombre}" → usando 'Propio'`);
            }
            return "Propio";
          })(),
          serial_number: csvItem.serialNumbers.join(" | ") || null,
        };
        if (mergedDescription !== undefined) updateFields.description = mergedDescription;

        // Regla de prevalencia de subcategoría:
        // - CSV con categoría mapeada → prevalece sobre la asignación manual/inferida previa.
        // - CSV con categoría vacía o no mapeada → NO tocar subcategoría existente.
        //   Solo inferir por similitud si el equipo es nuevo o no tiene subcategoría aún.
        const existingFull = existing
          ? ((existingEquipment || []).find((e) => e.id === existing.id) as any)
          : null;
        const existingHasSubcat = !!existingFull?.subcategory_id;

        if (subcatInfo) {
          updateFields.subcategory_id = subcatInfo.id;
          updateFields.category_id = subcatInfo.category_id;
        } else if (csvCatNorm && csvCatNorm !== "sonido") {
          // CSV trae categoría no vacía pero no mapeada: no tocar subcategoría existente.
          if (!existingHasSubcat) {
            const inferred = inferSubcategory(csvItem.nombre);
            if (inferred) {
              updateFields.subcategory_id = inferred.subcategory_id;
              if (inferred.category_id) updateFields.category_id = inferred.category_id;
              inferredCount++;
              const subName = subNameById.get(inferred.subcategory_id) || inferred.subcategory_id;
              syncResult.details.push(`↪ Inferido por similitud: ${csvItem.nombre} → ${subName}`);
            } else {
              unresolvedCount++;
            }
          }
        } else if (csvCatNorm === "sonido") {
          // Sonido: si no hay subcat previa, intentar inferir; si no, forzar categoría Sonido.
          if (!existingHasSubcat) {
            const inferred = inferSubcategory(csvItem.nombre);
            if (inferred) {
              updateFields.subcategory_id = inferred.subcategory_id;
              if (inferred.category_id) updateFields.category_id = inferred.category_id;
              inferredCount++;
              const subName = subNameById.get(inferred.subcategory_id) || inferred.subcategory_id;
              syncResult.details.push(`↪ Inferido por similitud: ${csvItem.nombre} → ${subName}`);
            } else {
              updateFields.category_id = SONIDO_CATEGORY_ID;
            }
          }
        } else {
          // CSV con categoría vacía → preservar subcat existente. Inferir solo si no hay.
          if (!existingHasSubcat) {
            const inferred = inferSubcategory(csvItem.nombre);
            if (inferred) {
              updateFields.subcategory_id = inferred.subcategory_id;
              if (inferred.category_id) updateFields.category_id = inferred.category_id;
              inferredCount++;
              const subName = subNameById.get(inferred.subcategory_id) || inferred.subcategory_id;
              syncResult.details.push(`↪ Inferido por similitud: ${csvItem.nombre} → ${subName}`);
            } else {
              unresolvedCount++;
            }
          }
        }

        if (existing) {
          // UPDATE existing — preserve image_url, images, featured, specs
          const { error } = await supabase
            .from("equipment")
            .update(updateFields)
            .eq("id", existing.id);

          if (error) {
            syncResult.errors.push(`Error actualizando "${existing.name}": ${error.message}`);
          } else {
            syncResult.updated++;
            matchedIds.add(existing.id);
          }
        } else {
          // CREATE new equipment
          const { error } = await supabase.from("equipment").insert({
            name: csvItem.nombre,
            ...updateFields,
          } as any);

          if (error) {
            syncResult.errors.push(`Error creando "${csvItem.nombre}": ${error.message}`);
          } else {
            syncResult.created++;
            syncResult.details.push(`+ Nuevo: ${csvItem.nombre}`);
          }
        }
      }

      // Deactivate equipment NOT in CSV
      addLog("Marcando equipos ausentes como no disponibles...");
      const idsToDeactivate = (existingEquipment || [])
        .filter((eq) => !matchedIds.has(eq.id) && eq.status !== "maintenance")
        .map((eq) => eq.id);

      if (idsToDeactivate.length > 0) {
        // Batch deactivate in chunks
        const chunkSize = 50;
        for (let i = 0; i < idsToDeactivate.length; i += chunkSize) {
          const chunk = idsToDeactivate.slice(i, i + chunkSize);
          const { error } = await supabase
            .from("equipment")
            .update({ status: "maintenance" as const })
            .in("id", chunk);
          if (error) {
            syncResult.errors.push(`Error desactivando lote: ${error.message}`);
          }
        }
        syncResult.deactivated = idsToDeactivate.length;
      }

      addLog(`✅ Sincronización completada:`);
      addLog(`   Actualizados: ${syncResult.updated}`);
      addLog(`   Nuevos: ${syncResult.created}`);
      addLog(`   Eliminados (Externo): ${syncResult.deleted}`);
      addLog(`   Desactivados: ${syncResult.deactivated}`);
      addLog(`   ↪ Subcategoría inferida por similitud: ${inferredCount}`);
      if (unresolvedCount > 0) addLog(`   ⚠ Sin subcategoría inferible: ${unresolvedCount}`);
      if (syncResult.errors.length > 0) {
        addLog(`   ⚠️ Errores: ${syncResult.errors.length}`);
        syncResult.errors.forEach((e) => addLog(`   ❌ ${e}`));
      }

      setResult(syncResult);
      toast({
        title: "✓ Sincronización Rentalos completada",
        description: `${syncResult.updated} actualizados · ${syncResult.created} nuevos · ${syncResult.deleted} eliminados · ${syncResult.deactivated} desactivados`,
      });

      onSyncComplete?.();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error desconocido";
      addLog(`❌ ERROR: ${msg}`);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSyncing(false);
      event.target.value = "";
    }
  };

  return (
    <Card className="border-2 border-primary">
      <CardHeader className="bg-primary/5">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-xl">Sincronizar desde Rentalos</CardTitle>
            <CardDescription>
              Actualiza precios, stock, estado y tipo desde el CSV exportado de Rentalos.
              Preserva imágenes, descripciones y equipos destacados.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
          <p className="font-semibold">¿Qué hace exactamente esta sincronización?</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Lee el CSV de Rentalos y agrupa filas por <strong>nombre normalizado</strong> (mismo equipo en varias filas se unifica en un solo registro).</li>
            <li><strong>Eliminación por Externo:</strong> los equipos cuyo tipo dominante en el CSV es <em>Externo</em> se <strong>eliminan de la base</strong> (no se crean si no existen).</li>
            <li><strong>No funcional</strong>: si el campo <em>Funcional</em> es <code>No</code> (o el stock efectivo queda en 0), el equipo se marca como <code>maintenance</code> (no disponible).</li>
            <li><strong>Disponibilidad por tipo:</strong> <em>Propio</em>, <em>Estacionado</em> y <em>Compartido</em> quedan <code>available</code>.</li>

            <li><strong>Orden de aparición</strong> (<code>order_index</code>): 1 = Propio, 2 = Estacionado, 3 = Compartido, 4 = Externo. Así los Propios aparecen primero y los Estacionados en segundo lugar.</li>
            <li><strong>Stock disponible</strong> (<code>stock_quantity</code>): suma de cantidades por nombre, descontando las filas <em>Externo</em>. El campo <strong>Funcional</strong> ajusta la cantidad de cada fila: <code>Funcional</code> / <code>Si</code> / vacío usa la cantidad declarada; <code>Parcial (n/m)</code> cuenta solo <code>n</code> unidades (ej. 2/4 = 2 disponibles en el cotizador); <code>No</code> cuenta 0.</li>
            <li>Actualiza también: <strong>price_per_day</strong>, <strong>functional_status</strong>, <strong>ownership_type</strong> (Propio/Estacionado/Compartido/Externo) y <strong>serial_number</strong> (concatenando todos los números de serie con " | ").</li>
            <li>Mapea la categoría del CSV a una <strong>subcategoría</strong> existente. El tipo <strong>"sonido"</strong> del CSV cae bajo la categoría <strong>Sonido</strong> (antes "Audio") — si no hay subcategoría mapeada, igual fuerza la categoría Sonido.</li>
            <li>El <strong>tipo dominante</strong> de un grupo se decide por prioridad: Propio &gt; Estacionado &gt; Compartido &gt; Externo. Tipos no reconocidos se guardan como "Propio" y se reportan como error.</li>
            <li>Los <strong>Anexos</strong> del CSV se unen con " • " y se agregan a la descripción existente como bloque <code>Anexos: ...</code>. Si ya había un bloque previo lo reemplaza; el resto de la descripción se conserva.</li>
            <li>Si el equipo <strong>no existe</strong> en la base, lo <strong>crea</strong> con todos esos campos.</li>
            <li>Los equipos existentes que <strong>no aparecen en el CSV</strong> se marcan en <code>status = maintenance</code> (no se borran). Los que ya estaban en maintenance no se tocan.</li>
            <li><strong>No modifica</strong>: <code>image_url</code>, <code>images</code>, <code>specs</code>, <code>detailed_specs</code> ni <code>featured</code>.</li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Input
            type="file"
            accept=".csv"
            onChange={handleSync}
            className="w-full sm:max-w-xs"
            disabled={syncing}
          />
          {syncing && (
            <span className="text-sm text-muted-foreground animate-pulse flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Sincronizando...
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Formato: CSV con columnas Nombre;Categoria;PrecioDiario;NumeroSerie;Anexos;Cantidad;Funcional;Tipo (separado por ;)
        </p>

        {result && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="gap-1">
              <CheckCircle className="h-3 w-3" /> {result.updated} actualizados
            </Badge>
            <Badge variant="secondary" className="gap-1">+ {result.created} nuevos</Badge>
            <Badge variant="destructive" className="gap-1">🗑 {result.deleted} eliminados</Badge>
            <Badge variant="outline" className="gap-1">{result.deactivated} desactivados</Badge>

            {result.errors.length > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" /> {result.errors.length} errores
              </Badge>
            )}
          </div>
        )}

        {log.length > 0 && (
          <ScrollArea className="h-[250px] w-full rounded-md border p-3">
            <pre className="text-xs font-mono whitespace-pre-wrap">{log.join("\n")}</pre>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
