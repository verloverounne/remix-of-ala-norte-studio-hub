import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, ShoppingCart, Search, Star, Heart, Bell, Check, AlertCircle, Info } from "lucide-react";

const DesignTokensLivePreview = () => {
  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Vista Previa
        </CardTitle>
        <CardDescription>
          Los cambios se reflejan en tiempo real
        </CardDescription>
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
          </Label>
          <div className="space-y-1">
            <h1 className="text-2xl font-heading font-bold">Heading H1</h1>
            <h2 className="text-xl font-heading font-semibold">Heading H2</h2>
            <h3 className="text-lg font-heading font-medium">Heading H3</h3>
            <p className="text-sm text-foreground">Párrafo de texto normal con estilo de cuerpo.</p>
            <p className="text-xs text-muted-foreground">Texto secundario más pequeño y atenuado.</p>
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
          </Label>
          <div className="grid grid-cols-5 gap-1.5">
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-md bg-primary border border-border shadow-sm" />
              <span className="text-[9px] text-muted-foreground">Primary</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-md bg-secondary border border-border shadow-sm" />
              <span className="text-[9px] text-muted-foreground">Secondary</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-md bg-accent border border-border shadow-sm" />
              <span className="text-[9px] text-muted-foreground">Accent</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-md bg-muted border border-border shadow-sm" />
              <span className="text-[9px] text-muted-foreground">Muted</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-md bg-destructive border border-border shadow-sm" />
              <span className="text-[9px] text-muted-foreground">Destruct</span>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-md bg-background border border-border shadow-sm" />
              <span className="text-[9px] text-muted-foreground">BG</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-md bg-foreground border border-border shadow-sm" />
              <span className="text-[9px] text-muted-foreground">FG</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-md bg-card border border-border shadow-sm" />
              <span className="text-[9px] text-muted-foreground">Card</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-md bg-popover border border-border shadow-sm" />
              <span className="text-[9px] text-muted-foreground">Popover</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-md border-2 border-ring" />
              <span className="text-[9px] text-muted-foreground">Ring</span>
            </div>
          </div>
        </div>

        {/* Spacing Preview */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Espaciado
          </Label>
          <div className="flex items-end gap-1">
            {[1, 2, 3, 4, 6, 8].map((size) => (
              <div key={size} className="flex flex-col items-center">
                <div
                  className="bg-primary/80 rounded-sm"
                  style={{ width: size * 4, height: size * 4 }}
                />
                <span className="text-[8px] text-muted-foreground mt-1">{size}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Border Radius Preview */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Border Radius
          </Label>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-muted border border-border rounded-none" title="none" />
            <div className="w-8 h-8 bg-muted border border-border rounded-sm" title="sm" />
            <div className="w-8 h-8 bg-muted border border-border rounded-md" title="md" />
            <div className="w-8 h-8 bg-muted border border-border rounded-lg" title="lg" />
            <div className="w-8 h-8 bg-muted border border-border rounded-xl" title="xl" />
            <div className="w-8 h-8 bg-muted border border-border rounded-full" title="full" />
          </div>
        </div>

        {/* Shadow Preview */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Sombras
          </Label>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-card border border-border rounded-md shadow-sm flex items-center justify-center">
              <span className="text-[8px] text-muted-foreground">sm</span>
            </div>
            <div className="w-10 h-10 bg-card border border-border rounded-md shadow-md flex items-center justify-center">
              <span className="text-[8px] text-muted-foreground">md</span>
            </div>
            <div className="w-10 h-10 bg-card border border-border rounded-md shadow-lg flex items-center justify-center">
              <span className="text-[8px] text-muted-foreground">lg</span>
            </div>
            <div className="w-10 h-10 bg-card border border-border rounded-md shadow-xl flex items-center justify-center">
              <span className="text-[8px] text-muted-foreground">xl</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DesignTokensLivePreview;
