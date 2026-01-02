import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Upload, Palette, Type, Maximize2, Circle, Layers, Grid3X3, MoreHorizontal, ArrowLeft, Pencil, Check, X, Zap, Search, RotateCcw, Package, FileCode, FolderDown } from "lucide-react";
import { Link } from "react-router-dom";
import { applyTokenToCSS } from "@/hooks/useDesignTokensApply";
import DesignTokensLivePreview from "@/components/admin/DesignTokensLivePreview";
import ComponentsDownloadPanel from "@/components/admin/ComponentsDownloadPanel";

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

interface EditingState {
  id: string;
  field: "value" | "description";
  value: string;
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

const TYPE_BADGES: Record<string, { label: string; className: string }> = {
  color: { label: "COLOR", className: "bg-pink-500/20 text-pink-600 border-pink-500/30" },
  "font-family": { label: "FONT", className: "bg-blue-500/20 text-blue-600 border-blue-500/30" },
  "font-size": { label: "SIZE", className: "bg-cyan-500/20 text-cyan-600 border-cyan-500/30" },
  "font-weight": { label: "WEIGHT", className: "bg-indigo-500/20 text-indigo-600 border-indigo-500/30" },
  "line-height": { label: "LINE-H", className: "bg-violet-500/20 text-violet-600 border-violet-500/30" },
  "letter-spacing": { label: "LETTER", className: "bg-purple-500/20 text-purple-600 border-purple-500/30" },
  spacing: { label: "SPACE", className: "bg-green-500/20 text-green-600 border-green-500/30" },
  size: { label: "SIZE", className: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30" },
  radius: { label: "RADIUS", className: "bg-orange-500/20 text-orange-600 border-orange-500/30" },
  border: { label: "BORDER", className: "bg-amber-500/20 text-amber-600 border-amber-500/30" },
  shadow: { label: "SHADOW", className: "bg-gray-500/20 text-gray-600 border-gray-500/30" },
  transition: { label: "MOTION", className: "bg-rose-500/20 text-rose-600 border-rose-500/30" },
  animation: { label: "ANIM", className: "bg-red-500/20 text-red-600 border-red-500/30" },
  breakpoint: { label: "BREAK", className: "bg-teal-500/20 text-teal-600 border-teal-500/30" },
  grid: { label: "GRID", className: "bg-lime-500/20 text-lime-600 border-lime-500/30" },
  container: { label: "CONTAINER", className: "bg-sky-500/20 text-sky-600 border-sky-500/30" },
  "z-index": { label: "Z-INDEX", className: "bg-fuchsia-500/20 text-fuchsia-600 border-fuchsia-500/30" },
  "aspect-ratio": { label: "ASPECT", className: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30" },
  component: { label: "COMP", className: "bg-slate-500/20 text-slate-600 border-slate-500/30" },
  reference: { label: "REF", className: "bg-zinc-500/20 text-zinc-600 border-zinc-500/30" },
};

const AdminDesignTokens = () => {
  const [tokens, setTokens] = useState<DesignToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("colors");
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return tokens;
    const query = searchQuery.toLowerCase();
    return tokens.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.value.toLowerCase().includes(query) ||
        t.type.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query))
    );
  }, [tokens, searchQuery]);

  const getTokensByCategory = (category: string) => {
    return filteredTokens.filter((t) => t.category === category);
  };

  const getCategoryCount = (category: string) => {
    return filteredTokens.filter((t) => t.category === category).length;
  };

  const generateExportJson = () => {
    const exportData: Record<string, any> = {
      color: {},
      button: {},
      typography: {
        font: { family: {}, size: {}, weight: {} },
        lineHeight: {},
        letterSpacing: {},
      },
      spacing: {},
      component: {},
      radius: {},
      border: {},
      shadow: {},
      transition: {},
      animation: {},
      layout: {
        breakpoint: {},
        grid: { desktop: {}, tablet: {}, mobile: {} },
        container: { desktop: {}, tablet: {}, mobile: {} },
        column: {},
        zIndex: {},
        aspectRatio: {},
      },
      navbar: {},
      hero: {},
      card: {},
      input: {},
      modal: {},
      toast: {},
      loader: {},
      badge: {},
    };

    tokens.forEach((token) => {
      const parts = token.name.split(".");

      // Colors
      if (token.category === "colors") {
        if (parts[0] === "color") {
          exportData.color[parts.slice(1).join(".")] = token.value;
        } else if (parts[0] === "button") {
          const path = parts.slice(1).join(".");
          exportData.button[path] = token.value;
        }
      }

      // Typography
      if (token.category === "typography") {
        if (parts[0] === "font") {
          if (parts[1] === "family") {
            exportData.typography.font.family[parts[2]] = token.value;
          } else if (parts[1] === "size") {
            exportData.typography.font.size[parts[2]] = token.value;
          } else if (parts[1] === "weight") {
            exportData.typography.font.weight[parts[2]] = token.value;
          }
        } else if (parts[0] === "lineHeight" || parts[0] === "line") {
          const key = parts[0] === "line" ? parts.slice(2).join(".") : parts[1];
          exportData.typography.lineHeight[key] = token.value;
        } else if (parts[0] === "letterSpacing" || parts[0] === "letter") {
          const key = parts[0] === "letter" ? parts.slice(2).join(".") : parts[1];
          exportData.typography.letterSpacing[key] = token.value;
        }
      }

      // Spacing
      if (token.category === "spacing") {
        if (parts[0] === "space" || parts[0] === "spacing") {
          exportData.spacing[parts[1]] = token.value;
        } else if (parts[0] === "component") {
          const path = parts.slice(1).join(".");
          exportData.component[path] = token.value;
        } else if (parts[0] === "button") {
          const path = parts.slice(1).join(".");
          exportData.component[`button.${path}`] = token.value;
        }
      }

      // Radius
      if (token.category === "radius") {
        if (parts[0] === "radius") {
          exportData.radius[parts[1]] = token.value;
        } else if (parts[0] === "border") {
          const path = parts.slice(1).join(".");
          exportData.border[path] = token.value;
        }
      }

      // Shadows
      if (token.category === "shadows") {
        if (parts[0] === "shadow") {
          exportData.shadow[parts[1]] = token.value;
        } else if (parts[0] === "transition") {
          exportData.transition[parts[1]] = token.value;
        } else if (parts[0] === "animation") {
          exportData.animation[parts[1]] = token.value;
        }
      }

      // Layout
      if (token.category === "layout") {
        if (parts[0] === "layout" || parts[0] === "breakpoint") {
          if (parts[1] === "breakpoint" || parts[0] === "breakpoint") {
            const key = parts[0] === "breakpoint" ? parts[1] : parts[2];
            exportData.layout.breakpoint[key] = token.value;
          } else if (parts[1] === "grid") {
            const device = parts[2];
            const prop = parts[3];
            if (device && prop) {
              exportData.layout.grid[device][prop] = token.value;
            }
          } else if (parts[1] === "container") {
            const device = parts[2];
            const prop = parts[3];
            if (device && prop) {
              exportData.layout.container[device][prop] = token.value;
            }
          } else if (parts[1] === "column") {
            exportData.layout.column[parts[2]] = token.value;
          }
        } else if (parts[0] === "zIndex" || parts[0] === "z") {
          const key = parts[0] === "z" ? parts.slice(2).join(".") : parts[1];
          exportData.layout.zIndex[key] = token.value;
        } else if (parts[0] === "aspectRatio" || parts[0] === "aspect") {
          const key = parts[0] === "aspect" ? parts.slice(2).join(".") : parts[1];
          exportData.layout.aspectRatio[key] = token.value;
        }
      }

      // Other (Components)
      if (token.category === "other") {
        if (parts[0] === "navbar") {
          const path = parts.slice(1).join(".");
          exportData.navbar[path] = token.value;
        } else if (parts[0] === "hero") {
          const path = parts.slice(1).join(".");
          exportData.hero[path] = token.value;
        } else if (parts[0] === "card") {
          const path = parts.slice(1).join(".");
          exportData.card[path] = token.value;
        } else if (parts[0] === "input") {
          const path = parts.slice(1).join(".");
          exportData.input[path] = token.value;
        } else if (parts[0] === "modal") {
          const path = parts.slice(1).join(".");
          exportData.modal[path] = token.value;
        } else if (parts[0] === "toast") {
          const path = parts.slice(1).join(".");
          exportData.toast[path] = token.value;
        } else if (parts[0] === "loader") {
          const path = parts.slice(1).join(".");
          exportData.loader[path] = token.value;
        } else if (parts[0] === "badge") {
          const path = parts.slice(1).join(".");
          exportData.badge[path] = token.value;
        }
      }
    });

    // Clean empty objects
    const cleanEmptyObjects = (obj: any): any => {
      if (typeof obj !== "object" || obj === null) return obj;
      const cleaned: any = {};
      for (const key of Object.keys(obj)) {
        const val = cleanEmptyObjects(obj[key]);
        if (typeof val === "object" && val !== null && Object.keys(val).length === 0) continue;
        cleaned[key] = val;
      }
      return cleaned;
    };

    return JSON.stringify(cleanEmptyObjects(exportData), null, 2);
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

      // Helper to add token
      const addToken = (name: string, type: string, value: string, category: string) => {
        newTokens.push({ name, type, value: String(value), description: null, category });
      };

      // Parse colors
      if (parsed.color) {
        Object.entries(parsed.color).forEach(([key, value]) => {
          addToken(`color.${key}`, "color", String(value), "colors");
        });
      }

      // Parse button colors
      if (parsed.button) {
        Object.entries(parsed.button).forEach(([key, value]) => {
          addToken(`button.${key}`, "color", String(value), "colors");
        });
      }

      // Parse typography
      if (parsed.typography) {
        if (parsed.typography.font?.family) {
          Object.entries(parsed.typography.font.family).forEach(([key, value]) => {
            addToken(`font.family.${key}`, "font-family", String(value), "typography");
          });
        }
        if (parsed.typography.font?.size) {
          Object.entries(parsed.typography.font.size).forEach(([key, value]) => {
            addToken(`font.size.${key}`, "font-size", String(value), "typography");
          });
        }
        if (parsed.typography.font?.weight) {
          Object.entries(parsed.typography.font.weight).forEach(([key, value]) => {
            addToken(`font.weight.${key}`, "font-weight", String(value), "typography");
          });
        }
        if (parsed.typography.lineHeight) {
          Object.entries(parsed.typography.lineHeight).forEach(([key, value]) => {
            addToken(`line.height.${key}`, "line-height", String(value), "typography");
          });
        }
        if (parsed.typography.letterSpacing) {
          Object.entries(parsed.typography.letterSpacing).forEach(([key, value]) => {
            addToken(`letter.spacing.${key}`, "letter-spacing", String(value), "typography");
          });
        }
      }

      // Parse spacing
      if (parsed.spacing) {
        Object.entries(parsed.spacing).forEach(([key, value]) => {
          addToken(`spacing.${key}`, "spacing", String(value), "spacing");
        });
      }

      // Parse component sizes
      if (parsed.component) {
        Object.entries(parsed.component).forEach(([key, value]) => {
          addToken(`component.${key}`, "size", String(value), "spacing");
        });
      }

      // Parse radius
      if (parsed.radius) {
        Object.entries(parsed.radius).forEach(([key, value]) => {
          addToken(`radius.${key}`, "radius", String(value), "radius");
        });
      }

      // Parse border
      if (parsed.border) {
        Object.entries(parsed.border).forEach(([key, value]) => {
          addToken(`border.${key}`, "border", String(value), "radius");
        });
      }

      // Parse shadows
      if (parsed.shadow) {
        Object.entries(parsed.shadow).forEach(([key, value]) => {
          addToken(`shadow.${key}`, "shadow", String(value), "shadows");
        });
      }

      // Parse transitions
      if (parsed.transition) {
        Object.entries(parsed.transition).forEach(([key, value]) => {
          addToken(`transition.${key}`, "transition", String(value), "shadows");
        });
      }

      // Parse animations
      if (parsed.animation) {
        Object.entries(parsed.animation).forEach(([key, value]) => {
          addToken(`animation.${key}`, "animation", String(value), "shadows");
        });
      }

      // Parse layout
      if (parsed.layout) {
        if (parsed.layout.breakpoint) {
          Object.entries(parsed.layout.breakpoint).forEach(([key, value]) => {
            addToken(`breakpoint.${key}`, "breakpoint", String(value), "layout");
          });
        }
        if (parsed.layout.grid) {
          Object.entries(parsed.layout.grid).forEach(([device, props]) => {
            Object.entries(props as Record<string, any>).forEach(([prop, value]) => {
              addToken(`grid.${device}.${prop}`, "grid", String(value), "layout");
            });
          });
        }
        if (parsed.layout.container) {
          Object.entries(parsed.layout.container).forEach(([device, props]) => {
            Object.entries(props as Record<string, any>).forEach(([prop, value]) => {
              addToken(`container.${device}.${prop}`, "container", String(value), "layout");
            });
          });
        }
        if (parsed.layout.zIndex) {
          Object.entries(parsed.layout.zIndex).forEach(([key, value]) => {
            addToken(`z.index.${key}`, "z-index", String(value), "layout");
          });
        }
        if (parsed.layout.aspectRatio) {
          Object.entries(parsed.layout.aspectRatio).forEach(([key, value]) => {
            addToken(`aspect.ratio.${key}`, "aspect-ratio", String(value), "layout");
          });
        }
      }

      // Parse component-specific tokens (other category)
      const componentCategories = ["navbar", "hero", "card", "input", "modal", "toast", "loader", "badge"];
      componentCategories.forEach((comp) => {
        if (parsed[comp]) {
          Object.entries(parsed[comp]).forEach(([key, value]) => {
            addToken(`${comp}.${key}`, "component", String(value), "other");
          });
        }
      });

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

  const isColorValue = (value: string) => {
    return value.startsWith("#") || value.startsWith("rgb") || value.startsWith("hsl");
  };

  const renderColorPreview = (value: string) => {
    if (isColorValue(value)) {
      return (
        <span
          className="inline-block w-5 h-5 rounded border border-border mr-2 flex-shrink-0"
          style={{ backgroundColor: value }}
        />
      );
    }
    return null;
  };

  const startEditing = (token: DesignToken, field: "value" | "description") => {
    setEditing({
      id: token.id,
      field,
      value: field === "value" ? token.value : (token.description || ""),
    });
  };

  const cancelEditing = () => {
    setEditing(null);
  };

  const saveEditing = async () => {
    if (!editing) return;

    setSaving(true);
    const updateData = editing.field === "value"
      ? { value: editing.value }
      : { description: editing.value || null };

    const { error } = await supabase
      .from("design_tokens")
      .update(updateData)
      .eq("id", editing.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      const token = tokens.find(t => t.id === editing.id);
      if (token && editing.field === "value") {
        applyTokenToCSS({
          name: token.name,
          value: editing.value,
          type: token.type,
          category: token.category,
        });
      }

      toast({ title: "Guardado", description: "Token actualizado y aplicado" });
      setTokens(tokens.map(t =>
        t.id === editing.id
          ? { ...t, [editing.field]: editing.value || (editing.field === "description" ? null : t[editing.field]) }
          : t
      ));
      setEditing(null);
    }
    setSaving(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveEditing();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  const getTypeBadge = (type: string) => {
    const config = TYPE_BADGES[type] || { label: type.toUpperCase(), className: "bg-gray-500/20 text-gray-600 border-gray-500/30" };
    return (
      <Badge variant="outline" className={`text-[10px] font-bold ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  const renderTokenTable = (category: string) => {
    const categoryTokens = getTokensByCategory(category);

    if (categoryTokens.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? `No hay tokens que coincidan con "${searchQuery}"` : "No hay tokens en esta categoría"}
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[280px]">Nombre</TableHead>
            <TableHead className="w-[80px]">Tipo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead className="w-[200px]">Descripción</TableHead>
            <TableHead className="w-[80px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categoryTokens.map((token) => {
            const isEditingValue = editing?.id === token.id && editing?.field === "value";
            const isEditingDescription = editing?.id === token.id && editing?.field === "description";
            const isEditingThis = isEditingValue || isEditingDescription;
            const tokenIsColor = token.type === "color" || isColorValue(token.value);

            return (
              <TableRow key={token.id}>
                <TableCell className="font-mono text-sm">{token.name}</TableCell>
                <TableCell>{getTypeBadge(token.type)}</TableCell>
                <TableCell className="font-mono text-sm">
                  {isEditingValue ? (
                    <div className="flex items-center gap-2">
                      {tokenIsColor && (
                        <input
                          type="color"
                          value={editing.value.startsWith("#") ? editing.value : "#DC143C"}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          className="w-8 h-8 rounded border border-border cursor-pointer flex-shrink-0"
                          disabled={saving}
                        />
                      )}
                      <Input
                        value={editing.value}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        onKeyDown={handleKeyDown}
                        className="h-8 text-sm font-mono flex-1"
                        autoFocus={!tokenIsColor}
                        disabled={saving}
                      />
                    </div>
                  ) : (
                    <div
                      className="flex items-center cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 py-0.5 group"
                      onClick={() => startEditing(token, "value")}
                    >
                      {renderColorPreview(token.value)}
                      <span className="truncate max-w-[250px]">{token.value}</span>
                      <Pencil className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-50 flex-shrink-0" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {isEditingDescription ? (
                    <Input
                      value={editing.value}
                      onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                      onKeyDown={handleKeyDown}
                      className="h-8 text-sm"
                      autoFocus
                      disabled={saving}
                      placeholder="Descripción..."
                    />
                  ) : (
                    <div
                      className="cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 py-0.5 group flex items-center"
                      onClick={() => startEditing(token, "description")}
                    >
                      <span className="truncate">{token.description || "-"}</span>
                      <Pencil className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-50 flex-shrink-0" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {isEditingThis ? (
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                        onClick={saveEditing}
                        disabled={saving}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={cancelEditing}
                        disabled={saving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 opacity-50 hover:opacity-100"
                      onClick={() => startEditing(token, "value")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
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
    <div className="min-h-screen pt-20 sm:pt-24 pb-8 sm:pb-12 px-3 sm:px-4 bg-background">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-3 sm:mb-4 transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4 flex-shrink-0" />
              <span>Volver al Admin</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground break-words">
              Design Tokens
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              Sistema de diseño completo.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
            <Badge variant="outline" className="text-xs whitespace-nowrap">
              {tokens.length} tokens
            </Badge>
            <Badge className="text-xs bg-green-500/20 text-green-600 border-green-500/30 flex items-center gap-1 whitespace-nowrap">
              <Zap className="h-3 w-3 flex-shrink-0" />
              Tiempo real
            </Badge>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tokens por nombre, valor o tipo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] gap-4 lg:gap-6">
          {/* Main Content - Tokens Tables */}
          <div className="order-2 lg:order-1">
            <Card className="overflow-hidden">
              <CardContent className="pt-6 overflow-x-auto">
                <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                  <TabsList className="flex flex-wrap h-auto gap-1 mb-6 w-full justify-start">
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                      const Icon = config.icon;
                      const count = getCategoryCount(key);
                      return (
                        <TabsTrigger
                          key={key}
                          value={key}
                          className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3"
                        >
                          <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="hidden sm:inline">{config.label}</span>
                          <Badge variant="secondary" className="text-[9px] sm:text-[10px] h-4 sm:h-5 px-1 sm:px-1.5">
                            {count}
                          </Badge>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {Object.keys(CATEGORY_CONFIG).map((category) => (
                    <TabsContent key={category} value={category} className="overflow-x-auto">
                      {renderTokenTable(category)}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="order-1 lg:order-2 lg:sticky lg:top-6 lg:h-fit lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto space-y-4 lg:space-y-6">
            {/* Live Preview */}
            <DesignTokensLivePreview />

            {/* Export Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Exportar Tokens
                </CardTitle>
                <CardDescription>
                  Copia o descarga los tokens en formato JSON.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={handleCopyJson} variant="outline" className="flex-1 min-w-0" size="sm">
                    <Copy className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Copiar</span>
                  </Button>
                  <Button onClick={handleDownloadJson} variant="outline" className="flex-1 min-w-0" size="sm">
                    <Download className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Descargar</span>
                  </Button>
                </div>
                <Textarea
                  readOnly
                  value={generateExportJson()}
                  className="font-mono text-xs h-40 resize-none"
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
                  Pega un JSON para actualizar o agregar tokens.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder='{"color": {"primary": "#DC143C"}, ...}'
                  value={importJson}
                  onChange={(e) => {
                    setImportJson(e.target.value);
                    setImportError(null);
                  }}
                  className="font-mono text-xs h-28 resize-none"
                />
                {importError && (
                  <p className="text-destructive text-sm break-words">{importError}</p>
                )}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleValidateImport}
                    variant="outline"
                    className="flex-1 min-w-0"
                    disabled={!importJson.trim()}
                    size="sm"
                  >
                    Validar
                  </Button>
                  <Button
                    onClick={handleImportTokens}
                    className="flex-1 min-w-0"
                    disabled={!importJson.trim()}
                    size="sm"
                  >
                    Importar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Atomic Design Components Download */}
            <ComponentsDownloadPanel />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Acciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={fetchTokens}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Recargar tokens
                </Button>
              </CardContent>
            </Card>

            {/* Help Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Guía de Tipos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(TYPE_BADGES).slice(0, 10).map(([type, config]) => (
                    <div key={type} className="flex items-center gap-1">
                      <Badge variant="outline" className={`text-[9px] ${config.className}`}>
                        {config.label}
                      </Badge>
                      <span className="text-muted-foreground truncate">{type}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AdminDesignTokens;
