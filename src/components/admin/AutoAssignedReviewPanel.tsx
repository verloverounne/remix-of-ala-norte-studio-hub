import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Row {
  id: string;
  name: string;
  category_id: string | null;
  subcategory_id: string | null;
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
  const { toast } = useToast();

  const subsById = useMemo(() => new Map(subs.map((s) => [s.id, s])), [subs]);

  const fetchAll = async () => {
    setLoading(true);
    const [eqRes, subRes, catRes] = await Promise.all([
      supabase
        .from("equipment")
        .select("id, name, category_id, subcategory_id, categories(id, name), subcategories(id, name, category_id)")
        // La columna es nueva y aún no está en los tipos generados.
        .eq("subcategory_auto_assigned" as never, true as never)
        .order("updated_at", { ascending: false })
        .limit(500),
      supabase.from("subcategories").select("id, name, category_id").order("name"),
      supabase.from("categories").select("id, name").order("order_index"),
    ]);
    setRows(((eqRes.data as unknown) as Row[]) || []);
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <ClipboardList className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Revisión de subcategorías autoasignadas</CardTitle>
            <CardDescription>
              Equipos cuya subcategoría fue asignada automáticamente por la última importación.
              Al guardar una corrección, se apaga el flag y no vuelven a aparecer acá.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="ml-auto">{rows.length}</Badge>
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
                      <p className="font-medium truncate">{row.name}</p>
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
                              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                                {c.name}
                              </div>
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
                      disabled={
                        savingId === row.id ||
                        !selection[row.id] ||
                        selection[row.id] === row.subcategory_id
                      }
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
