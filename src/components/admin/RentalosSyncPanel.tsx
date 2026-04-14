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
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

function parseCSVRows(text: string): CSVRow[] {
  const lines = text.split("\n");
  if (lines.length < 2) return [];

  // Detect separator
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
    const existing = groups.get(key);
    if (existing) {
      existing.totalCantidad += row.cantidad;
      if (row.numeroSerie) existing.serialNumbers.push(row.numeroSerie);
      if (row.anexos) existing.anexos.push(row.anexos);
      // Keep the first non-empty values
      if (!existing.funcional && row.funcional) existing.funcional = row.funcional;
      if (!existing.tipo && row.tipo) existing.tipo = row.tipo;
      if (!existing.precioDiario && row.precioDiario) existing.precioDiario = row.precioDiario;
    } else {
      groups.set(key, {
        nombre: row.nombre,
        categoria: row.categoria,
        precioDiario: row.precioDiario,
        totalCantidad: row.cantidad,
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

      // Fetch all existing equipment
      addLog("Cargando equipos existentes...");
      const { data: existingEquipment, error: eqError } = await supabase
        .from("equipment")
        .select("id, name, status")
        .limit(10000);
      if (eqError) throw eqError;

      const existingMap = new Map<string, { id: string; name: string }>();
      for (const eq of existingEquipment || []) {
        existingMap.set(normalizeName(eq.name), { id: eq.id, name: eq.name });
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

        const updateFields: Record<string, unknown> = {
          price_per_day: csvItem.precioDiario,
          stock_quantity: csvItem.totalCantidad,
          status: "available" as const,
          functional_status: csvItem.funcional || null,
          ownership_type: csvItem.tipo || null,
          serial_number: csvItem.serialNumbers.join(" | ") || null,
        };

        if (subcatInfo) {
          updateFields.subcategory_id = subcatInfo.id;
          updateFields.category_id = subcatInfo.category_id;
        }

        if (existing) {
          // UPDATE existing — preserve image_url, images, featured, description, specs
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
          <p className="font-semibold">¿Qué hace esta sincronización?</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Actualiza <strong>precio, stock, subcategoría, nro serie, estado funcional y tipo</strong></li>
            <li>Equipos que <strong>no están en el CSV</strong> se marcan como <strong>no disponibles</strong> (no se borran)</li>
            <li>Equipos que <strong>vuelven a aparecer</strong> se reactivan automáticamente</li>
            <li><strong>NO toca</strong>: imágenes, descripciones, specs ni destacados</li>
          </ul>
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
