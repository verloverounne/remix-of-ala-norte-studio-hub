import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Play, FileJson, FileSpreadsheet } from "lucide-react";

interface EquipmentItem {
  id: string;
  name: string;
  name_en: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  brand: string | null;
  model: string | null;
  description: string | null;
  specs: unknown[];
  price_per_day: number;
  price_per_week: number | null;
  status: string;
  image_url: string | null;
  tags: string[];
  featured: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  images: unknown[];
  detailed_description: string | null;
  detailed_specs: unknown[];
  featured_copy: string | null;
  sku_rentalos: string | null;
  descripcion_corta_es: string | null;
  descripcion_corta_en: string | null;
  tamano: string | null;
  tipo_equipo: string | null;
  observaciones_internas: string | null;
  id_original: number | null;
  categories?: unknown;
  subcategories?: unknown;
}

interface CSVRow {
  Nombre: string;
  precioDiario: string;
  fechaAgregado: string;
  numeroSerie: string;
  anexos: string;
  Cantidad: string;
}

interface ReportRow {
  name: string;
  price_per_day: number;
  has_image: boolean;
  matched_from_csv: boolean;
}

// Función de normalización de nombres
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*\(\d+\)\s*$/, '')
    .replace(/\s*#\d+\s*$/, '');
}

// Parse CSV con separador ;
function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(';').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: CSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(';').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row as unknown as CSVRow);
  }
  
  return rows;
}

// Construir mapa de CSV por nombre normalizado
function buildCSVMap(csvRows: CSVRow[]): Map<string, CSVRow[]> {
  const map = new Map<string, CSVRow[]>();
  
  for (const row of csvRows) {
    if (!row.Nombre) continue;
    const normalizedName = normalizeName(row.Nombre);
    
    if (!map.has(normalizedName)) {
      map.set(normalizedName, []);
    }
    map.get(normalizedName)!.push(row);
  }
  
  return map;
}

// Parsear precio del CSV
function parsePrice(priceStr: string): number | null {
  if (!priceStr) return null;
  const cleaned = priceStr.replace(/[^0-9.,]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// Concatenar anexos de múltiples filas
function buildAnexosText(csvRows: CSVRow[]): string {
  const anexosList = csvRows
    .map(row => row.anexos?.trim())
    .filter(a => a && a.length > 0);
  
  if (anexosList.length === 0) return '';
  if (anexosList.length === 1) return anexosList[0];
  return anexosList.join('\n');
}

export default function MergeEquipment() {
  const [log, setLog] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [mergedData, setMergedData] = useState<unknown | null>(null);
  const [reportData, setReportData] = useState<ReportRow[]>([]);

  const addLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const processData = async () => {
    setProcessing(true);
    setLog([]);
    setMergedData(null);
    setReportData([]);

    try {
      // 1. Cargar archivos
      addLog("Cargando archivo JSON de backup...");
      const jsonResponse = await fetch('/data/alanorte-backup-2025-12-30.json');
      const backupData = await jsonResponse.json();
      const equipment: EquipmentItem[] = backupData.data.equipment;
      addLog(`✓ JSON cargado: ${equipment.length} equipos encontrados`);

      addLog("Cargando archivo CSV de empresa...");
      const csvResponse = await fetch('/data/EquipoEmpresa-2.csv');
      const csvText = await csvResponse.text();
      const csvRows = parseCSV(csvText);
      addLog(`✓ CSV cargado: ${csvRows.length} filas encontradas`);

      // 2. Construir mapa CSV
      addLog("Construyendo mapa de nombres normalizados del CSV...");
      const csvMap = buildCSVMap(csvRows);
      addLog(`✓ Mapa CSV creado: ${csvMap.size} nombres únicos`);

      // 3. Agrupar equipos del JSON por nombre normalizado
      addLog("Agrupando equipos del JSON por nombre normalizado...");
      const equipmentGroups = new Map<string, EquipmentItem[]>();
      
      for (const item of equipment) {
        const normalizedName = normalizeName(item.name);
        if (!equipmentGroups.has(normalizedName)) {
          equipmentGroups.set(normalizedName, []);
        }
        equipmentGroups.get(normalizedName)!.push(item);
      }
      addLog(`✓ Equipos agrupados: ${equipmentGroups.size} grupos únicos`);

      // 4. Procesar cada grupo y seleccionar el mejor registro
      addLog("Procesando grupos y eliminando duplicados...");
      const mergedEquipment: EquipmentItem[] = [];
      const report: ReportRow[] = [];
      let duplicatesRemoved = 0;
      let pricesUpdated = 0;
      let anexosAdded = 0;

      for (const [normalizedName, group] of equipmentGroups) {
        // Seleccionar el mejor registro del grupo
        let selectedItem: EquipmentItem;
        
        // Priorizar el que tenga imagen
        const withImage = group.filter(item => item.image_url && item.image_url.length > 0);
        if (withImage.length > 0) {
          selectedItem = { ...withImage[0] };
        } else {
          selectedItem = { ...group[0] };
        }

        // Contar duplicados eliminados
        if (group.length > 1) {
          duplicatesRemoved += group.length - 1;
        }

        // Buscar match en CSV
        const csvMatches = csvMap.get(normalizedName);
        const matchedFromCsv = !!csvMatches && csvMatches.length > 0;

        if (matchedFromCsv) {
          // Actualizar precio desde CSV (usar la primera fila)
          const firstMatch = csvMatches[0];
          const csvPrice = parsePrice(firstMatch.precioDiario);
          
          if (csvPrice !== null) {
            selectedItem.price_per_day = csvPrice;
            pricesUpdated++;
          }

          // Agregar anexos a la descripción
          const anexosText = buildAnexosText(csvMatches);
          if (anexosText) {
            const anexosBlock = `\n\nAnexos: ${anexosText}`;
            
            if (selectedItem.description && selectedItem.description.trim()) {
              selectedItem.description = selectedItem.description + anexosBlock;
            } else if (selectedItem.detailed_description && selectedItem.detailed_description.trim()) {
              selectedItem.detailed_description = selectedItem.detailed_description + anexosBlock;
            } else {
              selectedItem.description = `Anexos: ${anexosText}`;
            }
            anexosAdded++;
          }
        }

        mergedEquipment.push(selectedItem);
        
        report.push({
          name: selectedItem.name,
          price_per_day: selectedItem.price_per_day,
          has_image: !!(selectedItem.image_url && selectedItem.image_url.length > 0),
          matched_from_csv: matchedFromCsv
        });
      }

      addLog(`✓ Duplicados eliminados: ${duplicatesRemoved}`);
      addLog(`✓ Precios actualizados desde CSV: ${pricesUpdated}`);
      addLog(`✓ Anexos agregados: ${anexosAdded}`);
      addLog(`✓ Total equipos en resultado final: ${mergedEquipment.length}`);

      // 5. Crear estructura final
      const finalData = {
        ...backupData,
        timestamp: new Date().toISOString(),
        merge_info: {
          original_count: equipment.length,
          final_count: mergedEquipment.length,
          duplicates_removed: duplicatesRemoved,
          prices_updated: pricesUpdated,
          anexos_added: anexosAdded,
          merged_at: new Date().toISOString()
        },
        data: {
          ...backupData.data,
          equipment: mergedEquipment
        }
      };

      setMergedData(finalData);
      setReportData(report);
      addLog("✅ PROCESO COMPLETADO. Puedes descargar los archivos.");

    } catch (error) {
      addLog(`❌ ERROR: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const downloadJSON = () => {
    if (!mergedData) return;
    const blob = new Blob([JSON.stringify(mergedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alanorte-merged-equipment-2025-12-30.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadReport = () => {
    if (reportData.length === 0) return;
    
    const headers = ['name', 'price_per_day', 'has_image', 'matched_from_csv'];
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => 
        `"${row.name.replace(/"/g, '""')}",${row.price_per_day},${row.has_image},${row.matched_from_csv}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alanorte-merge-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-6 w-6" />
              Fusión de Datos de Equipos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Esta herramienta fusiona el backup de la base de datos con el CSV maestro de equipos.
              Elimina duplicados, actualiza precios y agrega información de anexos.
            </p>
            
            <div className="flex gap-4 flex-wrap">
              <Button 
                onClick={processData} 
                disabled={processing}
                size="lg"
              >
                <Play className="mr-2 h-4 w-4" />
                {processing ? 'Procesando...' : 'Iniciar Fusión'}
              </Button>

              {mergedData && (
                <>
                  <Button onClick={downloadJSON} variant="outline" size="lg">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar JSON Fusionado
                  </Button>
                  <Button onClick={downloadReport} variant="outline" size="lg">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Descargar Reporte CSV
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {log.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Log de Proceso</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <pre className="text-sm font-mono">
                  {log.join('\n')}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {reportData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                Vista Previa del Reporte ({reportData.length} equipos)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left p-2">Nombre</th>
                      <th className="text-right p-2">Precio/Día</th>
                      <th className="text-center p-2">Imagen</th>
                      <th className="text-center p-2">Match CSV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.slice(0, 50).map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="p-2">{row.name}</td>
                        <td className="text-right p-2">${row.price_per_day.toLocaleString()}</td>
                        <td className="text-center p-2">{row.has_image ? '✓' : '-'}</td>
                        <td className="text-center p-2">{row.matched_from_csv ? '✓' : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reportData.length > 50 && (
                  <p className="text-center text-muted-foreground py-4">
                    Mostrando 50 de {reportData.length} equipos...
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
