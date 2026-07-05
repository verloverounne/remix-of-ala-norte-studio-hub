import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, ClipboardList, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { normalizeImportName, matchKeyword } from "./rentalosImportRules";

interface Row {
  id: string;
  name: string;
  category_id: string | null;
  subcategory_id: string | null;
  subcategory_auto_assigned: boolean | null;
  categories: { id: string; name: string } | null;
  subcategories: { id: string; name: string; category_id: string } | null;
}

interface Sub {
  id: string;
  name: string;
  category_id: string;
}

interface Cat {
  id: string;
  name: string;
}

export function AutoAssignedReviewPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [bulkRunning, setBulkRunning] = useState(false);
  const { toast } = useToast();

  const subsById = useMemo(() => new Map(subs.map((s) => [s.id, s])), [subs]);
  const subsByName = useMemo(() => new Map(subs.map((s) => [s.name, s])), [subs]);

  const fetchAll = async () => {
    setLoading(true);
    const [eqRes, subRes, catRes] = await Promise.all([
      supabase
        .from("equipment")
        .select(
          "id, name, category_id, subcategory_id, categories(id, name), subcategories(id, name, category_id), subcategory_auto_assigned",
        )
        // Incluye equipos autoasignados y equipos sin subcategoría.
        .or("subcategory_auto_assigned.eq.true,subcategory_id.is.null" as never)
        .order("updated_at", { ascending: false })
        .limit(1000),
      supabase.from("subcategories").select("id, name, category_id").order("name"),
      supabase.from("categories").select("id, name").order("order_index"),
    ]);

    setRows((eqRes.data as unknown as Row[]) || []);
    setSubs((subRes.data as Sub[]) || []);
    setCats((catRes.data as Cat[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const save = async (row: Row) => {
    const newSubId = selection[row.id];
    if (!newSubId) return;
    const sub = subsById.get(newSubId);
    if (!sub) return;
    setSavingId(row.id);
    const { error } = await supabase
      .from("equipment")
      .update({
        subcategory_id: sub.id,
        category_id: sub.category_id,
        subcategory_auto_assigned: false,
      } as never)
      .eq("id", row.id);
    setSavingId(null);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Guardado", description: `${row.name} → ${sub.name}` });
    setRows((prev) => prev.filter((r) => r.id !== row.id));
  };

  const runBulkRecategorization = async () => {
    if (bulkRunning) return;
    setBulkRunning(true);
    let resolved = 0;
    let unresolved = 0;
    const errors: string[] = [];

    // Fetch directo de TODOS los equipos sin subcategoría desde la DB (sin depender del panel paginado).
    const { data: allNullData } = await supabase
      .from("equipment")
      .select("id, name, category_id, subcategory_id, subcategory_auto_assigned")
      .or("subcategory_id.is.null,subcategory_auto_assigned.eq.true")
      .limit(5000);
    const targets = (allNullData || []).filter(
      (r) =>
        r.subcategory_id === null ||
        (r as unknown as { subcategory_auto_assigned?: boolean }).subcategory_auto_assigned === true,
    );

    for (const row of targets) {
      const matched = matchKeyword(normalizeImportName(row.name));
      if (!matched) {
        unresolved++;
        continue;
      }
      const norm = (s: string) =>
        s
          .toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .trim();
      const subsByNameNorm = new Map(subs.map((s) => [norm(s.name), s]));
      const sub = subsByName.get(matched) ?? subsByNameNorm.get(norm(matched));
      if (!sub) {
        unresolved++;
        continue;
      }
      const { error } = await supabase
        .from("equipment")
        .update({
          subcategory_id: sub.id,
          category_id: sub.category_id,
          subcategory_auto_assigned: true,
        } as never)
        .eq("id", row.id);
      if (error) {
        errors.push(`${row.name}: ${error.message}`);
      } else {
        resolved++;
      }
    }

    setBulkRunning(false);
    toast({
      title: "Recategorización comodines",
      description: `Resueltos: ${resolved} · Pendientes: ${unresolved}${errors.length ? ` · Errores: ${errors.length}` : ""}`,
      variant: errors.length ? "destructive" : "default",
    });
    await fetchAll();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <ClipboardList className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Revisión de subcategorías autoasignadas</CardTitle>
            <CardDescription>
              Equipos autoasignados o sin subcategoría. Usá "Recategorizar comodines" para aplicar reglas por keyword;
              los que no matcheen quedan para corrección manual.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {rows.length}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={runBulkRecategorization}
            disabled={bulkRunning || rows.length === 0}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            {bulkRunning ? "Procesando…" : "Recategorizar comodines"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" /> No hay equipos pendientes de revisión.
          </p>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {rows.map((row) => {
                const currentSubName = row.subcategories?.name ?? "—";
                const currentCatName = row.categories?.name ?? "—";
                return (
                  <div
                    key={row.id}
                    className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] items-center gap-3 border rounded-sm p-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="font-medium truncate">{row.name}</p>
                        {row.subcategory_id === null && (
                          <Badge variant="destructive" className="shrink-0">
                            Sin subcategoría
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        Actual: {currentCatName} · {currentSubName}
                      </p>
                    </div>

                    <Select
                      value={selection[row.id] ?? row.subcategory_id ?? ""}
                      onValueChange={(v) => setSelection((prev) => ({ ...prev, [row.id]: v }))}
                    >
                      <SelectTrigger className="w-full md:w-[320px]">
                        <SelectValue placeholder="Elegir subcategoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {cats.map((c) => {
                          const items = subs.filter((s) => s.category_id === c.id);
                          if (items.length === 0) return null;
                          return (
                            <div key={c.id}>
                              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">{c.name}</div>
                              {items.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.name}
                                </SelectItem>
                              ))}
                            </div>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      onClick={() => save(row)}
                      disabled={savingId === row.id || !selection[row.id] || selection[row.id] === row.subcategory_id}
                    >
                      Guardar
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
