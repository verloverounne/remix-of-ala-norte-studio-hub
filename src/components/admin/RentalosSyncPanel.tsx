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
  errors: string[];
  details: string[];
}

function normalizeName(name: string): string {
  let n = name.toLowerCase().trim().replace(/\s+/g, " ");
  // Unificación: "200w" ↔ "2k", "1000w" ↔ "1k", "5000w" ↔ "5k", etc.
  // Regla: 1k = 1000w, 2k = 2000w pero por convención de iluminación 2k ≈ 200w (LED equiv tungsteno)
  // Implementación: normalizar variantes de potencia equivalentes
  const powerEquivalents: Array<[RegExp, string]> = [
    [/\b200\s?w\b/g, "2k"],
    [/\b300\s?w\b/g, "3k"],
    [/\b500\s?w\b/g, "5k"],
    [/\b1000\s?w\b/g, "1k"],
    [/\b1200\s?w\b/g, "1.2k"],
    [/\b2000\s?w\b/g, "2k"],
  ];
  for (const [re, rep] of powerEquivalents) n = n.replace(re, rep);
  // Eliminar variaciones menores de puntuación
  n = n.replace(/[\/\-_,.]/g, " ").replace(/\s+/g, " ").trim();
  return n;
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

      // Fetch all existing equipment (incluyendo description para append de anexos)
      addLog("Cargando equipos existentes...");
      const { data: existingEquipment, error: eqError } = await supabase
        .from("equipment")
        .select("id, name, status, description")
        .limit(10000);
      if (eqError) throw eqError;

      const existingMap = new Map<string, { id: string; name: string; description: string | null }>();
      for (const eq of existingEquipment || []) {
        existingMap.set(normalizeName(eq.name), { id: eq.id, name: eq.name, description: eq.description });
      }
      addLog(`✓ ${existingMap.size} equipos existentes en la base de datos`);

      const syncResult: SyncResult = { updated: 0, created: 0, deactivated: 0, errors: [], details: [] };
      const matchedIds = new Set<string>();

      // Process each grouped CSV item
      addLog("Iniciando sincronización...");
      for (const [normalizedName, csvItem] of grouped) {
        const existing = existingMap.get(normalizedName);

        // Resolve subcategory
        const csvCatNorm = csvItem.categoria.toLowerCase().trim();
        const subcatName = CATEGORY_MAP[csvCatNorm];
        const subcatInfo = subcatName ? subMap.get(subcatName) : null;

        // Mapear tipo → status + order_index priority
        const { status, priority } = mapTipo(csvItem.tipo);

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
            if (t === "externo") return "Externo";
            if (raw) {
              syncResult.errors.push(`Tipo no válido "${raw}" en "${csvItem.nombre}" → usando 'Propio'`);
            }
            return "Propio";
          })(),
          serial_number: csvItem.serialNumbers.join(" | ") || null,
        };
        if (mergedDescription !== undefined) updateFields.description = mergedDescription;

        if (subcatInfo) {
          updateFields.subcategory_id = subcatInfo.id;
          updateFields.category_id = subcatInfo.category_id;
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
      addLog(`   Desactivados: ${syncResult.deactivated}`);
      if (syncResult.errors.length > 0) {
        addLog(`   ⚠️ Errores: ${syncResult.errors.length}`);
        syncResult.errors.forEach((e) => addLog(`   ❌ ${e}`));
      }

      setResult(syncResult);
      toast({
        title: "✓ Sincronización Rentalos completada",
        description: `${syncResult.updated} actualizados, ${syncResult.created} nuevos, ${syncResult.deactivated} desactivados`,
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
            <li>Suma <strong>cantidades</strong> de las filas agrupadas para calcular el <code>stock_quantity</code>. Las filas con tipo <strong>Estacionado</strong> no suman stock.</li>
            <li>Para cada equipo agrupado actualiza en la base: <strong>precio (price_per_day)</strong>, <strong>stock_quantity</strong>, <strong>status</strong>, <strong>order_index</strong> (según prioridad de tipo), <strong>functional_status</strong>, <strong>ownership_type</strong> y <strong>serial_number</strong> (concatenando todos los números de serie con " | ").</li>
            <li>Mapea la categoría del CSV a una <strong>subcategoría</strong> existente y, si encuentra match, actualiza <code>subcategory_id</code> y <code>category_id</code>.</li>
            <li>El <strong>tipo dominante</strong> se decide por prioridad: Propio &gt; Compartido &gt; Externo &gt; Estacionado. Tipos no reconocidos se guardan como "Propio" y se reportan como error.</li>
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
