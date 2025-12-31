import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Upload, Palette, Type, Maximize2, Circle, Layers, Grid3X3, MoreHorizontal, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface DesignToken {
  id: string;
  name: string;
  type: string;
  value: string;
  description: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

const CATEGORY_CONFIG = {
  colors: { label: "Colores", icon: Palette },
  typography: { label: "Tipografía", icon: Type },
  spacing: { label: "Espaciado & Tamaños", icon: Maximize2 },
  radius: { label: "Radius & Bordes", icon: Circle },
  shadows: { label: "Sombras & Motion", icon: Layers },
  layout: { label: "Layout & Grid", icon: Grid3X3 },
  other: { label: "Otros", icon: MoreHorizontal },
};

const AdminDesignTokens = () => {
  const [tokens, setTokens] = useState<DesignToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("colors");
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("design_tokens")
      .select("*")
      .order("name");

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setTokens(data || []);
    }
    setLoading(false);
  };

  const getTokensByCategory = (category: string) => {
    return tokens.filter((t) => t.category === category);
  };

  const generateExportJson = () => {
    const exportData: Record<string, any> = {
      color: {},
      typography: {},
      spacing: {},
      radius: {},
      shadow: {},
      layout: {
        breakpoint: {},
        grid: {
          desktop: {},
          tablet: {},
          mobile: {},
        },
        container: {
          desktop: {},
          tablet: {},
          mobile: {},
        },
      },
    };

    tokens.forEach((token) => {
      const parts = token.name.split(".");

      if (token.category === "colors" && parts[0] === "color") {
        exportData.color[parts.slice(1).join(".")] = token.value;
      } else if (token.category === "typography") {
        if (parts[0] === "font") {
          if (!exportData.typography.font) exportData.typography.font = {};
          if (parts[1] === "family") {
            if (!exportData.typography.font.family) exportData.typography.font.family = {};
            exportData.typography.font.family[parts[2]] = token.value;
          } else if (parts[1] === "size") {
            if (!exportData.typography.font.size) exportData.typography.font.size = {};
            exportData.typography.font.size[parts[2]] = token.value;
          }
        } else if (parts[0] === "lineHeight") {
          if (!exportData.typography.lineHeight) exportData.typography.lineHeight = {};
          exportData.typography.lineHeight[parts[1]] = token.value;
        }
      } else if (token.category === "spacing" && parts[0] === "space") {
        exportData.spacing[parts[1]] = token.value;
      } else if (token.category === "radius" && parts[0] === "radius") {
        exportData.radius[parts[1]] = token.value;
      } else if (token.category === "shadows") {
        if (parts[0] === "shadow") {
          exportData.shadow[parts[1]] = token.value;
        } else if (parts[0] === "transition") {
          if (!exportData.shadow.transition) exportData.shadow.transition = {};
          exportData.shadow.transition[parts[1]] = token.value;
        }
      } else if (token.category === "layout") {
        if (parts[0] === "breakpoint") {
          exportData.layout.breakpoint[parts[1]] = parseInt(token.value) || token.value;
        } else if (parts[0] === "grid") {
          const device = parts[1];
          const prop = parts[2];
          if (!exportData.layout.grid[device]) exportData.layout.grid[device] = {};
          exportData.layout.grid[device][prop] = parseInt(token.value) || token.value;
        } else if (parts[0] === "container") {
          const device = parts[1];
          const prop = parts[2];
          if (!exportData.layout.container[device]) exportData.layout.container[device] = {};
          exportData.layout.container[device][prop] = parseInt(token.value) || token.value;
        }
      }
    });

    return JSON.stringify(exportData, null, 2);
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(generateExportJson());
      toast({ title: "Copiado", description: "JSON copiado al portapapeles" });
    } catch {
      toast({ title: "Error", description: "No se pudo copiar", variant: "destructive" });
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([generateExportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ala-norte-design-tokens-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Descargado", description: "Archivo JSON descargado" });
  };

  const handleValidateImport = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importJson);
      if (typeof parsed !== "object" || parsed === null) {
        setImportError("El JSON debe ser un objeto válido");
        return false;
      }
      toast({ title: "Válido", description: "El JSON tiene un formato correcto" });
      return true;
    } catch (e) {
      setImportError("JSON inválido: " + (e as Error).message);
      return false;
    }
  };

  const handleImportTokens = async () => {
    if (!handleValidateImport()) return;

    try {
      const parsed = JSON.parse(importJson);
      const newTokens: Omit<DesignToken, "id" | "created_at" | "updated_at">[] = [];

      // Parse colors
      if (parsed.color) {
        Object.entries(parsed.color).forEach(([key, value]) => {
          newTokens.push({
            name: `color.${key}`,
            type: "color",
            value: String(value),
            description: null,
            category: "colors",
          });
        });
      }

      // Parse typography
      if (parsed.typography) {
        if (parsed.typography.font?.family) {
          Object.entries(parsed.typography.font.family).forEach(([key, value]) => {
            newTokens.push({
              name: `font.family.${key}`,
              type: "font-family",
              value: String(value),
              description: null,
              category: "typography",
            });
          });
        }
        if (parsed.typography.font?.size) {
          Object.entries(parsed.typography.font.size).forEach(([key, value]) => {
            newTokens.push({
              name: `font.size.${key}`,
              type: "font-size",
              value: String(value),
              description: null,
              category: "typography",
            });
          });
        }
        if (parsed.typography.lineHeight) {
          Object.entries(parsed.typography.lineHeight).forEach(([key, value]) => {
            newTokens.push({
              name: `lineHeight.${key}`,
              type: "line-height",
              value: String(value),
              description: null,
              category: "typography",
            });
          });
        }
      }

      // Parse spacing
      if (parsed.spacing) {
        Object.entries(parsed.spacing).forEach(([key, value]) => {
          newTokens.push({
            name: `space.${key}`,
            type: "spacing",
            value: String(value),
            description: null,
            category: "spacing",
          });
        });
      }

      // Parse radius
      if (parsed.radius) {
        Object.entries(parsed.radius).forEach(([key, value]) => {
          newTokens.push({
            name: `radius.${key}`,
            type: "radius",
            value: String(value),
            description: null,
            category: "radius",
          });
        });
      }

      // Parse shadows
      if (parsed.shadow) {
        Object.entries(parsed.shadow).forEach(([key, value]) => {
          if (key === "transition" && typeof value === "object") {
            Object.entries(value as Record<string, string>).forEach(([tKey, tValue]) => {
              newTokens.push({
                name: `transition.${tKey}`,
                type: "transition",
                value: String(tValue),
                description: null,
                category: "shadows",
              });
            });
          } else {
            newTokens.push({
              name: `shadow.${key}`,
              type: "shadow",
              value: String(value),
              description: null,
              category: "shadows",
            });
          }
        });
      }

      // Parse layout
      if (parsed.layout) {
        if (parsed.layout.breakpoint) {
          Object.entries(parsed.layout.breakpoint).forEach(([key, value]) => {
            newTokens.push({
              name: `breakpoint.${key}`,
              type: "breakpoint",
              value: String(value),
              description: null,
              category: "layout",
            });
          });
        }
        if (parsed.layout.grid) {
          Object.entries(parsed.layout.grid).forEach(([device, props]) => {
            Object.entries(props as Record<string, any>).forEach(([prop, value]) => {
              newTokens.push({
                name: `grid.${device}.${prop}`,
                type: "grid",
                value: String(value),
                description: null,
                category: "layout",
              });
            });
          });
        }
        if (parsed.layout.container) {
          Object.entries(parsed.layout.container).forEach(([device, props]) => {
            Object.entries(props as Record<string, any>).forEach(([prop, value]) => {
              newTokens.push({
                name: `container.${device}.${prop}`,
                type: "container",
                value: String(value),
                description: null,
                category: "layout",
              });
            });
          });
        }
      }

      // Upsert tokens
      for (const token of newTokens) {
        const existing = tokens.find((t) => t.name === token.name);
        if (existing) {
          await supabase
            .from("design_tokens")
            .update({ value: token.value, type: token.type })
            .eq("id", existing.id);
        } else {
          await supabase.from("design_tokens").insert(token);
        }
      }

      toast({ title: "Importado", description: `${newTokens.length} tokens procesados` });
      setImportJson("");
      fetchTokens();
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    }
  };

  const renderColorPreview = (value: string) => {
    if (value.startsWith("#") || value.startsWith("rgb") || value.startsWith("hsl")) {
      return (
        <span
          className="inline-block w-5 h-5 rounded border border-border mr-2"
          style={{ backgroundColor: value }}
        />
      );
    }
    return null;
  };

  const renderTokenTable = (category: string) => {
    const categoryTokens = getTokensByCategory(category);

    if (categoryTokens.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No hay tokens en esta categoría
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Descripción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categoryTokens.map((token) => (
            <TableRow key={token.id}>
              <TableCell className="font-mono text-sm">{token.name}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {token.type}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-sm">
                <div className="flex items-center">
                  {renderColorPreview(token.value)}
                  <span className="truncate max-w-[200px]">{token.value}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {token.description || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 bg-background">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Admin
            </Link>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Design Tokens de Ala Norte
            </h1>
            <p className="text-muted-foreground mt-2">
              Panel interno de tokens del sistema de diseño. Gestiona colores, tipografía,
              espaciado y más.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {tokens.length} tokens
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Tokens Tables */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                  <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <TabsTrigger
                          key={key}
                          value={key}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Icon className="h-4 w-4" />
                          {config.label}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {Object.keys(CATEGORY_CONFIG).map((category) => (
                    <TabsContent key={category} value={category}>
                      {renderTokenTable(category)}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Import/Export */}
          <div className="space-y-6">
            {/* Export Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Exportar Tokens
                </CardTitle>
                <CardDescription>
                  Copia o descarga los tokens en formato JSON para usar en Figma o código.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={handleCopyJson} variant="outline" className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar JSON
                  </Button>
                  <Button onClick={handleDownloadJson} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </div>
                <Textarea
                  readOnly
                  value={generateExportJson()}
                  className="font-mono text-xs h-48 resize-none"
                />
              </CardContent>
            </Card>

            {/* Import Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Importar Tokens
                </CardTitle>
                <CardDescription>
                  Pega un JSON de tokens para actualizar o agregar nuevos valores.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder='{"color": {"primary": "#FF6600"}, ...}'
                  value={importJson}
                  onChange={(e) => {
                    setImportJson(e.target.value);
                    setImportError(null);
                  }}
                  className="font-mono text-xs h-32 resize-none"
                />
                {importError && (
                  <p className="text-destructive text-sm">{importError}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={handleValidateImport}
                    variant="outline"
                    className="flex-1"
                    disabled={!importJson.trim()}
                  >
                    Validar
                  </Button>
                  <Button
                    onClick={handleImportTokens}
                    className="flex-1"
                    disabled={!importJson.trim()}
                  >
                    Importar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Help Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notas</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  Esta página es la <strong>fuente de verdad</strong> manual de tokens para
                  Ala Norte.
                </p>
                <p>El JSON exportado puede usarse para:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Configurar variables en Figma</li>
                  <li>Configurar theme/tokens en frontend (CSS, Tailwind, etc.)</li>
                </ul>
                <p>
                  En el futuro se podría conectar a integraciones (Figma, GitHub), pero por
                  ahora el flujo es copiar/pegar.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDesignTokens;
