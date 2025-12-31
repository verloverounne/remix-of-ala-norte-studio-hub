import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, FileCode, FolderDown, Download, Copy, ChevronDown, ChevronUp, 
  Eye, Atom, Puzzle, Layers, Search, Star, Check, X, Plus, Minus,
  AlertCircle, Info, Loader2, Mail, User, Calendar
} from "lucide-react";
import JSZip from "jszip";

// Atomic Design Component Registry with preview support
const ATOMIC_COMPONENTS = {
  atoms: {
    label: "Átomos",
    description: "Componentes base del sistema UI",
    icon: Atom,
    color: "bg-green-500/20 text-green-600 border-green-500/30",
    components: [
      { name: "Button", path: "src/components/ui/button.tsx", description: "Botón con variantes y estados", hasPreview: true },
      { name: "Badge", path: "src/components/ui/badge.tsx", description: "Etiqueta de estado o categoría", hasPreview: true },
      { name: "Input", path: "src/components/ui/input.tsx", description: "Campo de entrada de texto", hasPreview: true },
      { name: "Checkbox", path: "src/components/ui/checkbox.tsx", description: "Casilla de verificación", hasPreview: true },
      { name: "Switch", path: "src/components/ui/switch.tsx", description: "Interruptor on/off", hasPreview: true },
      { name: "Label", path: "src/components/ui/label.tsx", description: "Etiqueta para campos", hasPreview: true },
      { name: "Separator", path: "src/components/ui/separator.tsx", description: "Línea divisoria", hasPreview: true },
      { name: "Skeleton", path: "src/components/ui/skeleton.tsx", description: "Placeholder de carga", hasPreview: true },
      { name: "Avatar", path: "src/components/ui/avatar.tsx", description: "Imagen de perfil circular", hasPreview: true },
      { name: "Progress", path: "src/components/ui/progress.tsx", description: "Barra de progreso", hasPreview: true },
      { name: "Slider", path: "src/components/ui/slider.tsx", description: "Control deslizante", hasPreview: true },
      { name: "Textarea", path: "src/components/ui/textarea.tsx", description: "Área de texto multilínea", hasPreview: true },
      { name: "Toggle", path: "src/components/ui/toggle.tsx", description: "Botón de estado toggle", hasPreview: true },
      { name: "Tooltip", path: "src/components/ui/tooltip.tsx", description: "Información emergente", hasPreview: false },
    ],
  },
  molecules: {
    label: "Moléculas",
    description: "Componentes simples formados por átomos",
    icon: Puzzle,
    color: "bg-blue-500/20 text-blue-600 border-blue-500/30",
    components: [
      { name: "SearchBar", path: "src/components/SearchBar.tsx", description: "Barra de búsqueda con filtros", hasPreview: true },
      { name: "SubcategoryFilter", path: "src/components/SubcategoryFilter.tsx", description: "Filtro de subcategorías", hasPreview: false },
      { name: "LazyImage", path: "src/components/LazyImage.tsx", description: "Imagen con carga diferida y skeleton", hasPreview: true },
      { name: "ImageUploadButton", path: "src/components/ImageUploadButton.tsx", description: "Botón de subida de imágenes", hasPreview: false },
      { name: "WhatsAppButton", path: "src/components/WhatsAppButton.tsx", description: "Botón de contacto WhatsApp", hasPreview: true },
      { name: "ScrollIndicator", path: "src/components/ui/ScrollIndicator.tsx", description: "Indicador de scroll", hasPreview: false },
      { name: "Viewer360", path: "src/components/Viewer360.tsx", description: "Visor de imágenes 360°", hasPreview: false },
      { name: "Card", path: "src/components/ui/card.tsx", description: "Contenedor con sombra y bordes", hasPreview: true },
      { name: "Alert", path: "src/components/ui/alert.tsx", description: "Mensaje de alerta/notificación", hasPreview: true },
      { name: "Calendar", path: "src/components/ui/calendar.tsx", description: "Selector de fechas", hasPreview: false },
      { name: "Popover", path: "src/components/ui/popover.tsx", description: "Contenido flotante", hasPreview: false },
      { name: "Select", path: "src/components/ui/select.tsx", description: "Lista desplegable", hasPreview: false },
      { name: "Dialog", path: "src/components/ui/dialog.tsx", description: "Modal/diálogo", hasPreview: false },
      { name: "Tabs", path: "src/components/ui/tabs.tsx", description: "Navegación por pestañas", hasPreview: true },
      { name: "Accordion", path: "src/components/ui/accordion.tsx", description: "Contenido colapsable", hasPreview: false },
      { name: "DropdownMenu", path: "src/components/ui/dropdown-menu.tsx", description: "Menú desplegable", hasPreview: false },
    ],
  },
  organisms: {
    label: "Organismos",
    description: "Componentes complejos que combinan moléculas",
    icon: Layers,
    color: "bg-purple-500/20 text-purple-600 border-purple-500/30",
    components: [
      { name: "Header", path: "src/components/layout/Header.tsx", description: "Navegación principal del sitio", hasPreview: false },
      { name: "Footer", path: "src/components/layout/Footer.tsx", description: "Pie de página del sitio", hasPreview: false },
      { name: "MainContent", path: "src/components/layout/MainContent.tsx", description: "Contenedor principal de contenido", hasPreview: false },
      { name: "HeroCarouselRental", path: "src/components/rental/HeroCarouselRental.tsx", description: "Carrusel hero de equipos de renta", hasPreview: false },
      { name: "CartSidebar", path: "src/components/rental/CartSidebar.tsx", description: "Sidebar del carrito de cotización", hasPreview: false },
      { name: "QuoteSidebar", path: "src/components/rental/QuoteSidebar.tsx", description: "Panel lateral de cotización", hasPreview: false },
      { name: "CategorySection", path: "src/components/rental/CategorySection.tsx", description: "Sección de categoría con equipos", hasPreview: false },
      { name: "EquipmentModal", path: "src/components/EquipmentModal.tsx", description: "Modal de detalle de equipo", hasPreview: false },
      { name: "SpaceModal", path: "src/components/SpaceModal.tsx", description: "Modal de detalle de espacio", hasPreview: false },
      { name: "GalleryManager", path: "src/components/GalleryManager.tsx", description: "Administrador de galerías", hasPreview: false },
      { name: "InstitutionalSlider", path: "src/components/InstitutionalSlider.tsx", description: "Slider institucional", hasPreview: false },
      { name: "AvailabilityCalendar", path: "src/components/AvailabilityCalendar.tsx", description: "Calendario de disponibilidad", hasPreview: false },
      { name: "SpaceAvailabilityCalendar", path: "src/components/SpaceAvailabilityCalendar.tsx", description: "Calendario de disponibilidad de espacios", hasPreview: false },
      { name: "RelatedEquipment", path: "src/components/RelatedEquipment.tsx", description: "Equipos relacionados", hasPreview: false },
      { name: "Map", path: "src/components/Map.tsx", description: "Mapa de ubicación", hasPreview: false },
      { name: "BulkImageAssigner", path: "src/components/BulkImageAssigner.tsx", description: "Asignador masivo de imágenes", hasPreview: false },
      { name: "SpaceAdminEditor", path: "src/components/SpaceAdminEditor.tsx", description: "Editor de espacios para admin", hasPreview: false },
      { name: "StorageImageSelector", path: "src/components/StorageImageSelector.tsx", description: "Selector de imágenes de storage", hasPreview: false },
      { name: "DesignTokensLivePreview", path: "src/components/admin/DesignTokensLivePreview.tsx", description: "Preview en vivo de design tokens", hasPreview: false },
    ],
  },
};

type ComponentKey = keyof typeof ATOMIC_COMPONENTS;

// Live Preview Components
const ComponentPreviews: Record<string, React.ReactNode> = {
  "Button": (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button size="sm">Primary</Button>
        <Button size="sm" variant="secondary">Secondary</Button>
        <Button size="sm" variant="outline">Outline</Button>
        <Button size="sm" variant="ghost">Ghost</Button>
        <Button size="sm" variant="destructive">Destructive</Button>
      </div>
      <div className="flex gap-2">
        <Button size="sm" disabled>Disabled</Button>
        <Button size="sm"><Loader2 className="h-4 w-4 animate-spin mr-1" />Loading</Button>
      </div>
    </div>
  ),
  "Badge": (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge className="bg-green-500/20 text-green-600">Custom</Badge>
    </div>
  ),
  "Input": (
    <div className="space-y-2 max-w-xs">
      <Input placeholder="Texto normal..." />
      <Input type="email" placeholder="email@ejemplo.com" />
      <Input disabled placeholder="Deshabilitado" />
    </div>
  ),
  "Checkbox": (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Checkbox id="c1" />
        <label htmlFor="c1" className="text-sm">Opción 1</label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="c2" defaultChecked />
        <label htmlFor="c2" className="text-sm">Seleccionado</label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="c3" disabled />
        <label htmlFor="c3" className="text-sm text-muted-foreground">Deshabilitado</label>
      </div>
    </div>
  ),
  "Switch": (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Switch id="s1" />
        <label htmlFor="s1" className="text-sm">Notificaciones</label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="s2" defaultChecked />
        <label htmlFor="s2" className="text-sm">Modo oscuro</label>
      </div>
    </div>
  ),
  "Label": (
    <div className="space-y-1">
      <label className="text-sm font-medium">Email</label>
      <Input type="email" placeholder="tu@email.com" className="max-w-xs" />
    </div>
  ),
  "Separator": (
    <div className="space-y-2">
      <p className="text-sm">Contenido arriba</p>
      <Separator />
      <p className="text-sm">Contenido abajo</p>
      <div className="flex items-center gap-4 h-6">
        <span className="text-sm">Item 1</span>
        <Separator orientation="vertical" />
        <span className="text-sm">Item 2</span>
        <Separator orientation="vertical" />
        <span className="text-sm">Item 3</span>
      </div>
    </div>
  ),
  "Skeleton": (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
    </div>
  ),
  "Avatar": (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
        AN
      </div>
      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
        <User className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-xs">
        JD
      </div>
    </div>
  ),
  "Progress": (
    <div className="space-y-3 max-w-xs">
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary w-1/3 transition-all" />
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary w-2/3 transition-all" />
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-green-500 w-full transition-all" />
      </div>
    </div>
  ),
  "Slider": (
    <div className="space-y-4 max-w-xs">
      <div className="h-2 bg-muted rounded-full relative">
        <div className="absolute left-0 h-full bg-primary rounded-full w-1/2" />
        <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 h-5 w-5 bg-primary rounded-full border-2 border-background shadow" />
      </div>
    </div>
  ),
  "Textarea": (
    <div className="space-y-2 max-w-xs">
      <textarea 
        className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder="Escribe tu mensaje aquí..."
      />
    </div>
  ),
  "Toggle": (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
        <Star className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm">
        Bold
      </Button>
      <Button variant="outline" size="sm">
        Italic
      </Button>
    </div>
  ),
  "SearchBar": (
    <div className="relative max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Buscar equipos..." className="pl-10" />
    </div>
  ),
  "LazyImage": (
    <div className="w-24 h-24 bg-muted rounded-md overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent animate-[shimmer_1.5s_infinite] -translate-x-full" />
    </div>
  ),
  "WhatsAppButton": (
    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      </svg>
      WhatsApp
    </Button>
  ),
  "Card": (
    <Card className="max-w-xs">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Título de Card</CardTitle>
        <CardDescription>Descripción breve del contenido.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Contenido de la tarjeta con información adicional.</p>
      </CardContent>
    </Card>
  ),
  "Alert": (
    <div className="space-y-2 max-w-sm">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>Información importante para el usuario.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Ha ocurrido un error.</AlertDescription>
      </Alert>
    </div>
  ),
  "Tabs": (
    <Tabs defaultValue="tab1" className="max-w-xs">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="p-2 text-sm">Contenido del Tab 1</TabsContent>
    </Tabs>
  ),
};

const ComponentsDownloadPanel = () => {
  const [selectedComponents, setSelectedComponents] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["atoms", "molecules", "organisms"]));
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<"select" | "preview">("select");
  const [previewComponent, setPreviewComponent] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const toggleComponent = (path: string) => {
    const newSelected = new Set(selectedComponents);
    if (newSelected.has(path)) {
      newSelected.delete(path);
    } else {
      newSelected.add(path);
    }
    setSelectedComponents(newSelected);
  };

  const selectAll = (section: ComponentKey) => {
    const newSelected = new Set(selectedComponents);
    ATOMIC_COMPONENTS[section].components.forEach((c) => newSelected.add(c.path));
    setSelectedComponents(newSelected);
  };

  const deselectAll = (section: ComponentKey) => {
    const newSelected = new Set(selectedComponents);
    ATOMIC_COMPONENTS[section].components.forEach((c) => newSelected.delete(c.path));
    setSelectedComponents(newSelected);
  };

  const handleCopyPaths = async () => {
    if (selectedComponents.size === 0) {
      toast({ title: "Sin selección", description: "Selecciona al menos un componente", variant: "destructive" });
      return;
    }

    const paths = Array.from(selectedComponents).join("\n");
    await navigator.clipboard.writeText(paths);
    toast({ title: "Copiado", description: `${selectedComponents.size} rutas copiadas al portapapeles` });
  };

  const handleDownloadManifest = () => {
    if (selectedComponents.size === 0) {
      toast({ title: "Sin selección", description: "Selecciona al menos un componente", variant: "destructive" });
      return;
    }

    const manifest = {
      name: "ala-norte-atomic-components",
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      atomicDesign: {
        atoms: ATOMIC_COMPONENTS.atoms.components
          .filter((c) => selectedComponents.has(c.path))
          .map((c) => ({ name: c.name, path: c.path, description: c.description })),
        molecules: ATOMIC_COMPONENTS.molecules.components
          .filter((c) => selectedComponents.has(c.path))
          .map((c) => ({ name: c.name, path: c.path, description: c.description })),
        organisms: ATOMIC_COMPONENTS.organisms.components
          .filter((c) => selectedComponents.has(c.path))
          .map((c) => ({ name: c.name, path: c.path, description: c.description })),
      },
      dependencies: [
        "@radix-ui/react-*",
        "lucide-react",
        "class-variance-authority",
        "clsx",
        "tailwind-merge",
        "react-router-dom",
        "@supabase/supabase-js",
        "embla-carousel-react",
        "react-day-picker",
        "date-fns",
      ],
      instructions: {
        step1: "Instala las dependencias listadas",
        step2: "Copia los archivos a tu proyecto en las rutas indicadas",
        step3: "Ajusta los imports según la estructura de tu proyecto",
        step4: "Importa los design tokens del sistema de diseño",
      },
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ala-norte-components-manifest-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "Descargado", description: "Manifest de componentes descargado" });
  };

  const handleDownloadZip = async () => {
    if (selectedComponents.size === 0) {
      toast({ title: "Sin selección", description: "Selecciona al menos un componente", variant: "destructive" });
      return;
    }

    setIsDownloading(true);

    try {
      const zip = new JSZip();
      const componentsFolder = zip.folder("components");
      
      const allComponents = [
        ...ATOMIC_COMPONENTS.atoms.components,
        ...ATOMIC_COMPONENTS.molecules.components, 
        ...ATOMIC_COMPONENTS.organisms.components
      ];

      const manifest = {
        name: "ala-norte-atomic-components",
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        components: Array.from(selectedComponents).map((path) => {
          const component = allComponents.find((c) => c.path === path);
          return { path, name: component?.name, description: component?.description };
        }),
      };
      zip.file("manifest.json", JSON.stringify(manifest, null, 2));

      const readme = `# Ala Norte - Atomic Design Components

## Exported: ${new Date().toLocaleDateString()}

### Components Included:
${Array.from(selectedComponents)
  .map((path) => {
    const component = allComponents.find((c) => c.path === path);
    return `- **${component?.name}**: ${component?.description}`;
  })
  .join("\n")}

### Installation:

1. Copy the components to your project
2. Install required dependencies:
   \`\`\`bash
   npm install @radix-ui/react-dialog @radix-ui/react-tabs lucide-react class-variance-authority clsx tailwind-merge
   \`\`\`
3. Adjust import paths as needed
4. Copy the design tokens (CSS variables) from index.css

### Design System Dependencies:
- Tailwind CSS
- CSS Variables (design tokens)
- shadcn/ui components
`;
      zip.file("README.md", readme);

      const componentsList = Array.from(selectedComponents)
        .map((path) => {
          const component = allComponents.find((c) => c.path === path);
          return `// ${component?.name}\n// Path: ${path}\n// Description: ${component?.description}\n// Export this file from your Lovable project\n`;
        })
        .join("\n---\n\n");
      
      componentsFolder?.file("component-paths.txt", componentsList);

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ala-norte-components-${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: "Descargado", description: `ZIP con ${selectedComponents.size} componentes descargado` });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo generar el ZIP", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  const totalSelected = selectedComponents.size;
  const totalAtoms = ATOMIC_COMPONENTS.atoms.components.filter((c) => selectedComponents.has(c.path)).length;
  const totalMolecules = ATOMIC_COMPONENTS.molecules.components.filter((c) => selectedComponents.has(c.path)).length;
  const totalOrganisms = ATOMIC_COMPONENTS.organisms.components.filter((c) => selectedComponents.has(c.path)).length;

  const getSelectedComponentsForPreview = () => {
    const allComponents = [
      ...ATOMIC_COMPONENTS.atoms.components.map(c => ({ ...c, category: "atoms" })),
      ...ATOMIC_COMPONENTS.molecules.components.map(c => ({ ...c, category: "molecules" })),
      ...ATOMIC_COMPONENTS.organisms.components.map(c => ({ ...c, category: "organisms" })),
    ];
    return allComponents.filter(c => selectedComponents.has(c.path) && c.hasPreview);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5" />
          Componentes Atomic Design
        </CardTitle>
        <CardDescription>
          Átomos, moléculas y organismos del sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selection Summary */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className="text-[10px]">
            {totalSelected} total
          </Badge>
          {totalAtoms > 0 && (
            <Badge className="text-[10px] bg-green-500/20 text-green-600 border-green-500/30">
              {totalAtoms} átomos
            </Badge>
          )}
          {totalMolecules > 0 && (
            <Badge className="text-[10px] bg-blue-500/20 text-blue-600 border-blue-500/30">
              {totalMolecules} moléculas
            </Badge>
          )}
          {totalOrganisms > 0 && (
            <Badge className="text-[10px] bg-purple-500/20 text-purple-600 border-purple-500/30">
              {totalOrganisms} organismos
            </Badge>
          )}
        </div>

        {/* Tabs for Select / Preview */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "select" | "preview")}>
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="select" className="text-xs gap-1">
              <FileCode className="h-3 w-3" />
              Seleccionar
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs gap-1">
              <Eye className="h-3 w-3" />
              Preview
            </TabsTrigger>
          </TabsList>

          {/* Select Tab */}
          <TabsContent value="select" className="mt-3">
            <ScrollArea className="h-72 border rounded-md">
              <div className="p-2 space-y-3">
                {(Object.entries(ATOMIC_COMPONENTS) as [ComponentKey, typeof ATOMIC_COMPONENTS.atoms][]).map(
                  ([key, section]) => {
                    const Icon = section.icon;
                    return (
                      <div key={key} className="space-y-1.5">
                        {/* Section Header */}
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => toggleSection(key)}
                            className="flex items-center gap-1.5 text-xs font-medium hover:text-primary transition-colors"
                          >
                            {expandedSections.has(key) ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                            <Icon className="h-3 w-3" />
                            {section.label}
                            <Badge variant="secondary" className="text-[9px] h-4 px-1">
                              {section.components.length}
                            </Badge>
                          </button>
                          <div className="flex gap-0.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 text-[10px] px-1.5"
                              onClick={() => selectAll(key)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 text-[10px] px-1.5"
                              onClick={() => deselectAll(key)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Components List */}
                        {expandedSections.has(key) && (
                          <div className="pl-4 space-y-0.5">
                            {section.components.map((component) => (
                              <label
                                key={component.path}
                                className="flex items-center gap-1.5 p-1 rounded hover:bg-muted/50 cursor-pointer transition-colors group"
                              >
                                <Checkbox
                                  checked={selectedComponents.has(component.path)}
                                  onCheckedChange={() => toggleComponent(component.path)}
                                  className="h-3 w-3"
                                />
                                <span className="text-xs font-medium flex-1 truncate">
                                  {component.name}
                                </span>
                                {component.hasPreview && (
                                  <Eye className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="mt-3">
            <ScrollArea className="h-72 border rounded-md">
              <div className="p-3 space-y-4">
                {getSelectedComponentsForPreview().length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Selecciona componentes con preview disponible</p>
                  </div>
                ) : (
                  getSelectedComponentsForPreview().map((component) => (
                    <div key={component.path} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[9px] ${ATOMIC_COMPONENTS[component.category as ComponentKey].color}`}>
                          {component.category === "atoms" ? "Átomo" : component.category === "molecules" ? "Molécula" : "Organismo"}
                        </Badge>
                        <span className="text-xs font-medium">{component.name}</span>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-md border">
                        {ComponentPreviews[component.name] || (
                          <p className="text-xs text-muted-foreground italic">Preview no disponible</p>
                        )}
                      </div>
                      <Separator className="mt-3" />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-8"
              onClick={handleCopyPaths}
              disabled={totalSelected === 0}
            >
              <Copy className="h-3 w-3 mr-1" />
              Rutas
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-8"
              onClick={handleDownloadManifest}
              disabled={totalSelected === 0}
            >
              <Download className="h-3 w-3 mr-1" />
              JSON
            </Button>
          </div>
          <Button
            className="w-full h-8 text-xs"
            onClick={handleDownloadZip}
            disabled={totalSelected === 0 || isDownloading}
          >
            <FolderDown className="h-3 w-3 mr-1" />
            {isDownloading ? "Generando..." : "Descargar ZIP"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComponentsDownloadPanel;
