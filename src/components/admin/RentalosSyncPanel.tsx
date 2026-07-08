import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  CATEGORY_MAP,
  CATEGORY_FAMILY_FALLBACK,
  matchKeyword,
  normalizeImportName,
} from "./rentalosImportRules";

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
  deleted: number;
  skipped: number;
  errors: string[];
  details: string[];
  counters: {
    updated_existing_preserved_subcategory: number;
    updated_existing_assigned_missing_subcategory: number;
    inserted_with_direct_mapping: number;
    inserted_with_keyword_assignment: number;
    inserted_with_category_fallback: number;
    skipped_unrecognized_category: number;
  };
}

// Mapea "Tipo" de Rentalos a status + prioridad de orden.
function mapTipo(tipo: string): { status: "available" | "maintenance"; priority: number } {
  const t = tipo.toLowerCase().trim();
  if (t === "propio") return { status: "available", priority: 1 };
  if (t === "estacionado") return { status: "available", priority: 2 };
  if (t === "compartido") return { status: "available", priority: 3 };
  if (t === "externo") return { status: "maintenance", priority: 4 };
  return { status: "available", priority: 5 };
}

function parseFuncional(funcional: string, cantidad: number): number {
  const f = (funcional || "").toLowerCase().trim();
  if (!f || f === "funcional" || f === "si" || f === "sí") return cantidad;
  const parcial = f.match(/parcial\s*\(\s*(\d+)\s*\/\s*\d+\s*\)/);
  if (parcial) return Math.max(0, parseInt(parcial[1], 10) || 0);
  if (f === "no") return 0;
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
    const key = normalizeImportName(row.nombre);
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

  const addLog = (msg: string) =>
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

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
      addLog(`✓ ${grouped.size} equipos únicos agrupados (por nombre normalizado)`);

      addLog("Cargando subcategorías...");
      const { data: subcategories } = await supabase
        .from("subcategories")
        .select("id, name, category_id");
      const subMap = new Map(
        (subcategories || []).map((s) => [s.name, { id: s.id, category_id: s.category_id }]),
      );
      const subNameById = new Map((subcategories || []).map((s) => [s.id, s.name]));

      addLog("Cargando equipos existentes...");
      const { data: existingEquipment, error: eqError } = await supabase
        .from("equipment")
        .select("id, name, status, description, subcategory_id, category_id, category_manually_edited, manual_category_id")
        .limit(10000);
      if (eqError) throw eqError;

      // Índice por nombre normalizado. Detecta colisiones históricas.
      const existingMap = new Map<
        string,
        { id: string; name: string; description: string | null; subcategory_id: string | null; category_manually_edited: boolean; manual_category_id: string | null }
      >();
      let collisions = 0;
      for (const eq of (existingEquipment || []) as Array<{
        id: string;
        name: string;
        description: string | null;
        subcategory_id: string | null;
        category_manually_edited: boolean | null;
        manual_category_id: string | null;
      }>) {
        const key = normalizeImportName(eq.name);
        const prev = existingMap.get(key);
        if (prev) {
          collisions++;
          addLog(
            `⚠ Colisión de nombre normalizado en DB: "${prev.name}" (${prev.id}) vs "${eq.name}" (${eq.id}) → clave "${key}". Se conserva el primero.`,
          );
          continue;
        }
        existingMap.set(key, {
          id: eq.id,
          name: eq.name,
          description: eq.description,
          subcategory_id: eq.subcategory_id,
          category_manually_edited: !!eq.category_manually_edited,
          manual_category_id: eq.manual_category_id,
        });
      }
      addLog(`✓ ${existingMap.size} equipos existentes indexados`);
      if (collisions > 0) addLog(`⚠ ${collisions} colisiones históricas detectadas`);

      const syncResult: SyncResult = {
        updated: 0,
        created: 0,
        deleted: 0,
        skipped: 0,
        errors: [],
        details: [],
        counters: {
          updated_existing_preserved_subcategory: 0,
          updated_existing_assigned_missing_subcategory: 0,
          inserted_with_direct_mapping: 0,
          inserted_with_keyword_assignment: 0,
          inserted_with_category_fallback: 0,
          skipped_unrecognized_category: 0,
        },
      };
      const matchedIds = new Set<string>();

      // Resuelve subcategoría por reglas determinísticas.
      // Devuelve el origen para logging + flag auto.
      type Resolution =
        | { source: "direct_mapping" | "keyword_assignment" | "category_fallback"; sub: { id: string; category_id: string }; subName: string }
        | { source: "unresolved" };

      const resolveSubcategory = (csvCatNorm: string, nombre: string): Resolution => {
        // 1) mapeo directo
        const directName = CATEGORY_MAP[csvCatNorm];
        if (directName) {
          const info = subMap.get(directName);
          if (info) return { source: "direct_mapping", sub: info, subName: directName };
        }
        // 2) keyword
        const kwName = matchKeyword(normalizeImportName(nombre));
        if (kwName) {
          const info = subMap.get(kwName);
          if (info) return { source: "keyword_assignment", sub: info, subName: kwName };
        }
        // 3) fallback por familia
        const fbName = CATEGORY_FAMILY_FALLBACK[csvCatNorm];
        if (fbName) {
          const info = subMap.get(fbName);
          if (info) return { source: "category_fallback", sub: info, subName: fbName };
        }
        return { source: "unresolved" };
      };

      addLog("Iniciando sincronización...");
      for (const [normalizedName, csvItem] of grouped) {
        const existing = existingMap.get(normalizedName);

        // Externo → eliminar; no crear si no existía
        const isExterno = csvItem.tipo.toLowerCase().trim() === "externo";
        if (isExterno) {
          if (existing) {
            const { error } = await supabase.from("equipment").delete().eq("id", existing.id);
            if (error) {
              syncResult.errors.push(`Error eliminando "${existing.name}" (Externo): ${error.message}`);
            } else {
              syncResult.deleted++;
              matchedIds.add(existing.id);
              syncResult.details.push(`🗑 Eliminado (Externo): ${existing.name}`);
            }
          }
          continue;
        }

        const csvCatNorm = csvItem.categoria.toLowerCase().trim();
        const { status: mappedStatus, priority } = mapTipo(csvItem.tipo);
        const funcNorm = (csvItem.funcional || "").toLowerCase().trim();
        const isNotFunctional = funcNorm === "no" || csvItem.totalCantidad <= 0;
        const status = isNotFunctional ? "maintenance" : mappedStatus;

        // Merge de anexos en description
        const anexosText = csvItem.anexos.filter(Boolean).join(" • ").trim();
        let mergedDescription: string | null | undefined = undefined;
        if (anexosText) {
          const existingDesc = (existing?.description || "").trim();
          const anexoBlock = `Anexos: ${anexosText}`;
          if (!existingDesc) {
            mergedDescription = anexoBlock;
          } else if (!existingDesc.includes(anexoBlock)) {
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

        if (existing) {
          // UPDATE — preservar subcategoría si ya existía; jamás pisar category_id automáticamente.
          // Si la categoría fue editada manualmente en admin, NO tocar category_id ni subcategory_id.
          if (existing.category_manually_edited) {
            syncResult.counters.updated_existing_preserved_subcategory++;
            syncResult.details.push(`= Categoría manual preservada: ${existing.name}`);
          } else if (existing.subcategory_id) {
            syncResult.counters.updated_existing_preserved_subcategory++;
            syncResult.details.push(`= Preservada subcategoría: ${existing.name}`);
          } else {
            const resolution = resolveSubcategory(csvCatNorm, csvItem.nombre);
            if (resolution.source !== "unresolved") {
              updateFields.subcategory_id = resolution.sub.id;
              updateFields.category_id = resolution.sub.category_id;
              updateFields.subcategory_auto_assigned = resolution.source !== "direct_mapping";
              syncResult.counters.updated_existing_assigned_missing_subcategory++;
              syncResult.details.push(
                `↪ Subcategoría asignada a existente sin subcat: ${existing.name} → ${resolution.subName} (${resolution.source})`,
              );
            }
            // si unresolved: no se toca subcategoría; el resto del update sí se aplica.
          }

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
          // INSERT — obligatorio tener subcategoría válida; si no, skip.
          const resolution = resolveSubcategory(csvCatNorm, csvItem.nombre);
          if (resolution.source === "unresolved") {
            syncResult.skipped++;
            syncResult.counters.skipped_unrecognized_category++;
            syncResult.details.push(
              `⤳ Skip nuevo sin categoría reconocible: "${csvItem.nombre}" (categoría CSV: "${csvItem.categoria}")`,
            );
            continue;
          }

          updateFields.subcategory_id = resolution.sub.id;
          updateFields.category_id = resolution.sub.category_id;
          updateFields.subcategory_auto_assigned = resolution.source !== "direct_mapping";

          const { error } = await supabase.from("equipment").insert({
            name: csvItem.nombre,
            ...updateFields,
          } as never);
          if (error) {
            syncResult.errors.push(`Error creando "${csvItem.nombre}": ${error.message}`);
          } else {
            syncResult.created++;
            if (resolution.source === "direct_mapping") {
              syncResult.counters.inserted_with_direct_mapping++;
            } else if (resolution.source === "keyword_assignment") {
              syncResult.counters.inserted_with_keyword_assignment++;
            } else {
              syncResult.counters.inserted_with_category_fallback++;
            }
            syncResult.details.push(
              `+ Nuevo: ${csvItem.nombre} → ${resolution.subName} (${resolution.source})`,
            );
          }
        }
      }

      // Delete equipment NOT in CSV
      addLog("Eliminando equipos ausentes del CSV...");
      const idsToDelete = (existingEquipment || [])
        .filter((eq) => !matchedIds.has(eq.id))
        .map((eq) => eq.id);
      if (idsToDelete.length > 0) {
        const chunkSize = 50;
        for (let i = 0; i < idsToDelete.length; i += chunkSize) {
          const chunk = idsToDelete.slice(i, i + chunkSize);
          const { error } = await supabase.from("equipment").delete().in("id", chunk);
          if (error) {
            syncResult.errors.push(`Error eliminando lote: ${error.message}`);
          } else {
            syncResult.deleted += chunk.length;
          }
        }
      }

      addLog(`✅ Sincronización completada`);
      addLog(`   Actualizados: ${syncResult.updated}`);
      addLog(`   Nuevos: ${syncResult.created}`);
      addLog(`   Eliminados (Externo + ausentes): ${syncResult.deleted}`);
      addLog(`   Skipped: ${syncResult.skipped}`);
      addLog(`   ── Contadores por origen ──`);
      addLog(`   updated_existing_preserved_subcategory: ${syncResult.counters.updated_existing_preserved_subcategory}`);
      addLog(`   updated_existing_assigned_missing_subcategory: ${syncResult.counters.updated_existing_assigned_missing_subcategory}`);
      addLog(`   inserted_with_direct_mapping: ${syncResult.counters.inserted_with_direct_mapping}`);
      addLog(`   inserted_with_keyword_assignment: ${syncResult.counters.inserted_with_keyword_assignment}`);
      addLog(`   inserted_with_category_fallback: ${syncResult.counters.inserted_with_category_fallback}`);
      addLog(`   skipped_unrecognized_category: ${syncResult.counters.skipped_unrecognized_category}`);
      if (syncResult.errors.length > 0) {
        addLog(`   ⚠️ Errores: ${syncResult.errors.length}`);
        syncResult.errors.forEach((e) => addLog(`   ❌ ${e}`));
      }
      // Detalle expandido al final
      syncResult.details.forEach((d) => addLog(`   ${d}`));

      setResult(syncResult);
      toast({
        title: "✓ Sincronización Rentalos completada",
        description: `${syncResult.updated} actualizados · ${syncResult.created} nuevos · ${syncResult.deleted} eliminados · ${syncResult.skipped} skip`,
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
              Matching exacto por nombre normalizado. Subcategoría asignada por mapeo directo → keywords → fallback por categoría.
              Preserva imágenes, descripciones y subcategorías ya definidas manualmente.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
          <p className="font-semibold">¿Qué hace exactamente esta sincronización?</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li><strong>Matching exacto:</strong> agrupa por <code>toLowerCase().trim().replace(/\s+/g, " ")</code>. Sin fuzzy, sin similitud, sin quitar tildes, sin borrar signos.</li>
            <li><strong>Colisiones en DB:</strong> si dos equipos existentes colapsan al mismo nombre normalizado, se loguea un warning y se conserva el primero.</li>
            <li><strong>Externo:</strong> los equipos con tipo dominante <em>Externo</em> se <strong>eliminan</strong> de la base.</li>
            <li><strong>No funcional:</strong> si <em>Funcional = No</em> o el stock efectivo queda en 0, se marca como <code>maintenance</code>.</li>
            <li><strong>Preservación de subcategoría:</strong> si un equipo existente ya tiene <code>subcategory_id</code>, la importación <strong>nunca</strong> la pisa, y tampoco toca su <code>category_id</code>.</li>
            <li><strong>Asignación determinística</strong> (solo para equipos sin subcategoría, y siempre para nuevos): (1) mapeo directo <code>CATEGORY_MAP</code> → (2) reglas por keyword → (3) fallback por categoría familiar. Si nada resuelve y es un item nuevo, se hace <strong>skip</strong>.</li>
            <li><strong>Flag <code>subcategory_auto_assigned</code>:</strong> se enciende cuando la subcategoría vino por keyword o fallback. Aparecen en el panel "Revisión de subcategorías autoasignadas".</li>
            <li><strong>Ausentes del CSV:</strong> los equipos existentes que no aparecen en el CSV se <strong>eliminan</strong>.</li>
            <li><strong>No modifica:</strong> <code>image_url</code>, <code>images</code>, <code>specs</code>, <code>detailed_specs</code>, <code>featured</code>.</li>
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
            <Badge variant="outline" className="gap-1">⤳ {result.skipped} skip</Badge>
            {result.errors.length > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" /> {result.errors.length} errores
              </Badge>
            )}
          </div>
        )}

        {log.length > 0 && (
          <ScrollArea className="h-[300px] w-full rounded-md border p-3">
            <pre className="text-xs font-mono whitespace-pre-wrap">{log.join("\n")}</pre>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
