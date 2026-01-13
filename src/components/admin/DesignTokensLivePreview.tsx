import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, ShoppingCart, Search, Star, Heart, Bell, Check, AlertCircle, Info } from "lucide-react";

interface DesignToken {
  id: string;
  name: string;
  type: string;
  value: string;
  description: string | null;
  category: string;
}

interface DesignTokensLivePreviewProps {
  tokens?: DesignToken[];
}

const DesignTokensLivePreview = ({ tokens = [] }: DesignTokensLivePreviewProps) => {
  const [tokenValues, setTokenValues] = useState<Record<string, string>>({});

  useEffect(() => {
    // Create a map of token names to values
    const values: Record<string, string> = {};
    tokens.forEach(token => {
      values[token.name] = token.value;
    });
    setTokenValues(values);
  }, [tokens]);

  // Listen for CSS variable changes to update preview in real-time
  useEffect(() => {
    const observer = new MutationObserver(() => {
      // Force re-render when CSS variables change
      setTokenValues(prev => ({ ...prev }));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => observer.disconnect();
  }, []);

  // Helper to get token value or fallback
  const getTokenValue = (name: string, fallback: string = "") => {
    return tokenValues[name] || fallback;
  };

  // Helper to get CSS variable value
  const getCSSVar = (varName: string, fallback: string = "") => {
    if (typeof window !== "undefined") {
      const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      return value || fallback;
    }
    return fallback;
  };

  // Get color values from CSS variables
  const getColorValue = (tokenName: string) => {
    const cssVarMap: Record<string, string> = {
      "color.primary": "--primary",
      "color.secondary": "--secondary",
      "color.accent": "--accent",
      "color.muted": "--muted",
      "color.destructive": "--destructive",
      "color.background": "--background",
      "color.foreground": "--foreground",
      "color.card": "--card",
      "color.popover": "--popover",
      "color.border": "--border",
      "color.ring": "--ring",
    };
    
    const cssVar = cssVarMap[tokenName];
    if (cssVar) {
      const hsl = getCSSVar(cssVar);
      if (hsl) {
        return `hsl(${hsl})`;
      }
    }
    return getTokenValue(tokenName);
  };
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Vista Previa en Tiempo Real
        </CardTitle>
        <CardDescription>
          Los cambios se reflejan instantáneamente al editar tokens
        </CardDescription>
        {tokens.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            {tokens.length} tokens cargados • Edita cualquier token para ver los cambios aquí
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Buttons Section */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Botones
          </Label>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Default</Button>
            <Button size="sm" variant="secondary">Secondary</Button>
            <Button size="sm" variant="outline">Outline</Button>
            <Button size="sm" variant="destructive">Destructive</Button>
            <Button size="sm" variant="ghost">Ghost</Button>
            <Button size="sm" variant="link">Link</Button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Agregar
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Heart className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </div>
        </div>

        {/* Card Section */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Card
          </Label>
          <Card className="p-0">
            <div className="h-20 bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-xs">Imagen</span>
            </div>
            <CardContent className="p-3">
              <h4 className="font-bold text-sm">Título de Card</h4>
              <p className="text-xs text-muted-foreground mt-1">Descripción corta del contenido de esta tarjeta de ejemplo.</p>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                ))}
                <span className="text-xs text-muted-foreground ml-1">(4.8)</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inputs Section */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Formularios
          </Label>
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Buscar..." className="h-8 pl-8 text-sm" />
            </div>
            <Input placeholder="Email" type="email" className="h-8 text-sm" />
            <Textarea placeholder="Mensaje..." className="text-sm resize-none h-16" />
          </div>
        </div>

        {/* Badges Section */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Badges
          </Label>
          <div className="flex flex-wrap gap-1.5">
            <Badge>Nuevo</Badge>
            <Badge variant="secondary">En stock</Badge>
            <Badge variant="outline">Destacado</Badge>
            <Badge variant="destructive">Agotado</Badge>
          </div>
        </div>

        {/* Typography Section */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Tipografía
            {tokenValues["font.family.sans"] && (
              <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                ({getTokenValue("font.family.sans").split(",")[0]})
              </span>
            )}
          </Label>
          <div className="space-y-1">
            <h1 
              className="text-2xl font-heading font-bold"
              style={{ 
                fontFamily: getTokenValue("font.family.heading", "inherit"),
                fontSize: getTokenValue("font.size.2xl", "1.5rem"),
                fontWeight: getTokenValue("font.weight.bold", "700"),
              }}
            >
              Heading H1
            </h1>
            <h2 
              className="text-xl font-heading font-semibold"
              style={{ 
                fontFamily: getTokenValue("font.family.heading", "inherit"),
                fontSize: getTokenValue("font.size.xl", "1.25rem"),
                fontWeight: getTokenValue("font.weight.semibold", "600"),
              }}
            >
              Heading H2
            </h2>
            <h3 
              className="text-lg font-heading font-medium"
              style={{ 
                fontFamily: getTokenValue("font.family.heading", "inherit"),
                fontSize: getTokenValue("font.size.lg", "1.125rem"),
                fontWeight: getTokenValue("font.weight.medium", "500"),
              }}
            >
              Heading H3
            </h3>
            <p 
              className="text-sm text-foreground"
              style={{ 
                fontFamily: getTokenValue("font.family.sans", "inherit"),
                fontSize: getTokenValue("font.size.sm", "0.875rem"),
                lineHeight: getTokenValue("line.height.normal", "1.5"),
              }}
            >
              Párrafo de texto normal con estilo de cuerpo.
            </p>
            <p 
              className="text-xs text-muted-foreground"
              style={{ 
                fontFamily: getTokenValue("font.family.sans", "inherit"),
                fontSize: getTokenValue("font.size.xs", "0.75rem"),
              }}
            >
              Texto secundario más pequeño y atenuado.
            </p>
            <a href="#" className="text-sm text-primary hover:underline">Enlace de ejemplo</a>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Alertas
          </Label>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded-md bg-green-500/10 border border-green-500/20">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-700">Operación exitosa</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-xs text-destructive">Error al procesar</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md bg-blue-500/10 border border-blue-500/20">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-700">Información importante</span>
            </div>
          </div>
        </div>

        {/* Colors Section */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Paleta de Colores
            {tokens.length > 0 && (
              <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                (Valores actuales)
              </span>
            )}
          </Label>
          <div className="grid grid-cols-5 gap-1.5">
            <div className="flex flex-col items-center gap-1">
              <div 
                className="w-8 h-8 rounded-md border border-border shadow-sm" 
                style={{ backgroundColor: getColorValue("color.primary") }}
              />
              <span className="text-[9px] text-muted-foreground">Primary</span>
              {tokenValues["color.primary"] && (
                <span className="text-[8px] text-muted-foreground font-mono">
                  {getTokenValue("color.primary").substring(0, 10)}
                </span>
              )}
            </div>
            <div className="flex flex-col items-center gap-1">
              <div 
                className="w-8 h-8 rounded-md border border-border shadow-sm" 
                style={{ backgroundColor: getColorValue("color.secondary") }}
              />
              <span className="text-[9px] text-muted-foreground">Secondary</span>
              {tokenValues["color.secondary"] && (
                <span className="text-[8px] text-muted-foreground font-mono">
                  {getTokenValue("color.secondary").substring(0, 10)}
                </span>
              )}
            </div>
            <div className="flex flex-col items-center gap-1">
              <div 
                className="w-8 h-8 rounded-md border border-border shadow-sm" 
                style={{ backgroundColor: getColorValue("color.accent") }}
              />
              <span className="text-[9px] text-muted-foreground">Accent</span>
              {tokenValues["color.accent"] && (
                <span className="text-[8px] text-muted-foreground font-mono">
                  {getTokenValue("color.accent").substring(0, 10)}
                </span>
              )}
            </div>
            <div className="flex flex-col items-center gap-1">
              <div 
                className="w-8 h-8 rounded-md border border-border shadow-sm" 
                style={{ backgroundColor: getColorValue("color.muted") }}
              />
              <span className="text-[9px] text-muted-foreground">Muted</span>
              {tokenValues["color.muted"] && (
                <span className="text-[8px] text-muted-foreground font-mono">
                  {getTokenValue("color.muted").substring(0, 10)}
                </span>
              )}
            </div>
            <div className="flex flex-col items-center gap-1">
              <div 
                className="w-8 h-8 rounded-md border border-border shadow-sm" 
                style={{ backgroundColor: getColorValue("color.destructive") }}
              />
              <span className="text-[9px] text-muted-foreground">Destruct</span>
              {tokenValues["color.destructive"] && (
                <span className="text-[8px] text-muted-foreground font-mono">
                  {getTokenValue("color.destructive").substring(0, 10)}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            <div className="flex flex-col items-center gap-1">
              <div 
                className="w-8 h-8 rounded-md border border-border shadow-sm" 
                style={{ backgroundColor: getColorValue("color.background") }}
              />
              <span className="text-[9px] text-muted-foreground">BG</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div 
                className="w-8 h-8 rounded-md border border-border shadow-sm" 
                style={{ backgroundColor: getColorValue("color.foreground") }}
              />
              <span className="text-[9px] text-muted-foreground">FG</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div 
                className="w-8 h-8 rounded-md border border-border shadow-sm" 
                style={{ backgroundColor: getColorValue("color.card") }}
              />
              <span className="text-[9px] text-muted-foreground">Card</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div 
                className="w-8 h-8 rounded-md border border-border shadow-sm" 
                style={{ backgroundColor: getColorValue("color.popover") }}
              />
              <span className="text-[9px] text-muted-foreground">Popover</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div 
                className="w-8 h-8 rounded-md border-2" 
                style={{ borderColor: getColorValue("color.ring") }}
              />
              <span className="text-[9px] text-muted-foreground">Ring</span>
            </div>
          </div>
        </div>

        {/* Spacing Preview */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Espaciado
            {tokenValues["spacing.4"] && (
              <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                (base: {getTokenValue("spacing.4")})
              </span>
            )}
          </Label>
          <div className="flex items-end gap-1">
            {[1, 2, 3, 4, 6, 8].map((size) => {
              const spacingValue = getTokenValue(`spacing.${size}`, `${size * 0.25}rem`);
              return (
                <div key={size} className="flex flex-col items-center">
                  <div
                    className="bg-primary/80 rounded-sm"
                    style={{ 
                      width: spacingValue,
                      height: spacingValue,
                    }}
                  />
                  <span className="text-[8px] text-muted-foreground mt-1">{size}</span>
                  {tokenValues[`spacing.${size}`] && (
                    <span className="text-[7px] text-muted-foreground font-mono mt-0.5">
                      {spacingValue}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Border Radius Preview */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Border Radius
            {tokenValues["radius.default"] && (
              <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                (default: {getTokenValue("radius.default")})
              </span>
            )}
          </Label>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: "none", token: "radius.none", value: "0rem" },
              { key: "sm", token: "radius.sm", value: "0.125rem" },
              { key: "md", token: "radius.md", value: "0.375rem" },
              { key: "lg", token: "radius.lg", value: "0.5rem" },
              { key: "xl", token: "radius.xl", value: "0.75rem" },
              { key: "full", token: "radius.full", value: "9999px" },
            ].map(({ key, token, value }) => {
              const radiusValue = getTokenValue(token, value);
              return (
                <div key={key} className="flex flex-col items-center gap-1">
                  <div 
                    className="w-8 h-8 bg-muted border border-border" 
                    style={{ borderRadius: radiusValue }}
                    title={key}
                  />
                  <span className="text-[8px] text-muted-foreground">{key}</span>
                  {tokenValues[token] && (
                    <span className="text-[7px] text-muted-foreground font-mono">
                      {radiusValue}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Shadow Preview */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Sombras
            {tokenValues["shadow.brutal"] && (
              <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                (brutal aplicada)
              </span>
            )}
          </Label>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: "brutal", token: "shadow.brutal" },
              { key: "brutal-sm", token: "shadow.brutal-sm" },
              { key: "brutal-lg", token: "shadow.brutal-lg" },
              { key: "sm", token: "shadow.sm" },
              { key: "md", token: "shadow.md" },
              { key: "lg", token: "shadow.lg" },
            ].map(({ key, token }) => {
              const shadowValue = getTokenValue(token);
              const hasShadow = tokenValues[token];
              return (
                <div key={key} className="flex flex-col items-center gap-1">
                  <div 
                    className="w-10 h-10 bg-card border border-border rounded-md flex items-center justify-center"
                    style={hasShadow ? { boxShadow: shadowValue } : {}}
                  >
                    <span className="text-[8px] text-muted-foreground">{key}</span>
                  </div>
                  {hasShadow && (
                    <span className="text-[7px] text-muted-foreground font-mono max-w-[60px] truncate">
                      {shadowValue.substring(0, 15)}...
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Token Values Summary */}
        {tokens.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Valores Actuales de Tokens Clave
            </Label>
            <div className="space-y-2 text-xs">
              {[
                { name: "color.primary", label: "Primary" },
                { name: "color.secondary", label: "Secondary" },
                { name: "font.family.sans", label: "Font Sans" },
                { name: "font.size.base", label: "Font Size Base" },
                { name: "radius.default", label: "Radius Default" },
                { name: "spacing.4", label: "Spacing Base" },
              ].map(({ name, label }) => {
                const value = getTokenValue(name);
                if (!value) return null;
                return (
                  <div key={name} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="font-medium text-muted-foreground">{label}:</span>
                    <span className="font-mono text-foreground">{value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DesignTokensLivePreview;
