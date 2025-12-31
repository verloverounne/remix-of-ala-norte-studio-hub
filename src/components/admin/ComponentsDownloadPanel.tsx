import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Package, FileCode, FolderDown, Download, Copy, ChevronDown, ChevronUp } from "lucide-react";
import JSZip from "jszip";

// Atomic Design Component Registry
const ATOMIC_COMPONENTS = {
  molecules: {
    label: "Moléculas",
    description: "Componentes simples formados por átomos",
    components: [
      { name: "SearchBar", path: "src/components/SearchBar.tsx", description: "Barra de búsqueda con filtros" },
      { name: "SubcategoryFilter", path: "src/components/SubcategoryFilter.tsx", description: "Filtro de subcategorías" },
      { name: "LazyImage", path: "src/components/LazyImage.tsx", description: "Imagen con carga diferida y skeleton" },
      { name: "ImageUploadButton", path: "src/components/ImageUploadButton.tsx", description: "Botón de subida de imágenes" },
      { name: "WhatsAppButton", path: "src/components/WhatsAppButton.tsx", description: "Botón de contacto WhatsApp" },
      { name: "ScrollIndicator", path: "src/components/ui/ScrollIndicator.tsx", description: "Indicador de scroll" },
      { name: "Viewer360", path: "src/components/Viewer360.tsx", description: "Visor de imágenes 360°" },
    ],
  },
  organisms: {
    label: "Organismos",
    description: "Componentes complejos que combinan moléculas",
    components: [
      { name: "Header", path: "src/components/layout/Header.tsx", description: "Navegación principal del sitio" },
      { name: "Footer", path: "src/components/layout/Footer.tsx", description: "Pie de página del sitio" },
      { name: "MainContent", path: "src/components/layout/MainContent.tsx", description: "Contenedor principal de contenido" },
      { name: "HeroCarouselRental", path: "src/components/rental/HeroCarouselRental.tsx", description: "Carrusel hero de equipos de renta" },
      { name: "CartSidebar", path: "src/components/rental/CartSidebar.tsx", description: "Sidebar del carrito de cotización" },
      { name: "QuoteSidebar", path: "src/components/rental/QuoteSidebar.tsx", description: "Panel lateral de cotización" },
      { name: "CategorySection", path: "src/components/rental/CategorySection.tsx", description: "Sección de categoría con equipos" },
      { name: "EquipmentModal", path: "src/components/EquipmentModal.tsx", description: "Modal de detalle de equipo" },
      { name: "SpaceModal", path: "src/components/SpaceModal.tsx", description: "Modal de detalle de espacio" },
      { name: "GalleryManager", path: "src/components/GalleryManager.tsx", description: "Administrador de galerías" },
      { name: "InstitutionalSlider", path: "src/components/InstitutionalSlider.tsx", description: "Slider institucional" },
      { name: "AvailabilityCalendar", path: "src/components/AvailabilityCalendar.tsx", description: "Calendario de disponibilidad" },
      { name: "SpaceAvailabilityCalendar", path: "src/components/SpaceAvailabilityCalendar.tsx", description: "Calendario de disponibilidad de espacios" },
      { name: "RelatedEquipment", path: "src/components/RelatedEquipment.tsx", description: "Equipos relacionados" },
      { name: "Map", path: "src/components/Map.tsx", description: "Mapa de ubicación" },
      { name: "BulkImageAssigner", path: "src/components/BulkImageAssigner.tsx", description: "Asignador masivo de imágenes" },
      { name: "SpaceAdminEditor", path: "src/components/SpaceAdminEditor.tsx", description: "Editor de espacios para admin" },
      { name: "StorageImageSelector", path: "src/components/StorageImageSelector.tsx", description: "Selector de imágenes de storage" },
      { name: "DesignTokensLivePreview", path: "src/components/admin/DesignTokensLivePreview.tsx", description: "Preview en vivo de design tokens" },
    ],
  },
};

const ComponentsDownloadPanel = () => {
  const [selectedComponents, setSelectedComponents] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["molecules", "organisms"]));
  const [isDownloading, setIsDownloading] = useState(false);
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

  const selectAll = (section: keyof typeof ATOMIC_COMPONENTS) => {
    const newSelected = new Set(selectedComponents);
    ATOMIC_COMPONENTS[section].components.forEach((c) => newSelected.add(c.path));
    setSelectedComponents(newSelected);
  };

  const deselectAll = (section: keyof typeof ATOMIC_COMPONENTS) => {
    const newSelected = new Set(selectedComponents);
    ATOMIC_COMPONENTS[section].components.forEach((c) => newSelected.delete(c.path));
    setSelectedComponents(newSelected);
  };

  const fetchFileContent = async (path: string): Promise<string> => {
    try {
      // Fetch from the raw file in the public directory or use a workaround
      const response = await fetch(`/${path}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${path}`);
      }
      return await response.text();
    } catch {
      // Return a placeholder if file cannot be fetched
      return `// File: ${path}\n// Content could not be fetched. Please export manually from your codebase.`;
    }
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
      
      // Add manifest
      const manifest = {
        name: "ala-norte-atomic-components",
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        components: Array.from(selectedComponents).map((path) => {
          const allComponents = [...ATOMIC_COMPONENTS.molecules.components, ...ATOMIC_COMPONENTS.organisms.components];
          const component = allComponents.find((c) => c.path === path);
          return { path, name: component?.name, description: component?.description };
        }),
      };
      zip.file("manifest.json", JSON.stringify(manifest, null, 2));

      // Add README
      const readme = `# Ala Norte - Atomic Design Components

## Exported: ${new Date().toLocaleDateString()}

### Components Included:
${Array.from(selectedComponents)
  .map((path) => {
    const allComponents = [...ATOMIC_COMPONENTS.molecules.components, ...ATOMIC_COMPONENTS.organisms.components];
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

      // Add component paths as a reference (since we can't fetch actual file contents)
      const componentsList = Array.from(selectedComponents)
        .map((path) => {
          const allComponents = [...ATOMIC_COMPONENTS.molecules.components, ...ATOMIC_COMPONENTS.organisms.components];
          const component = allComponents.find((c) => c.path === path);
          return `// ${component?.name}\n// Path: ${path}\n// Description: ${component?.description}\n// Export this file from your Lovable project\n`;
        })
        .join("\n---\n\n");
      
      componentsFolder?.file("component-paths.txt", componentsList);

      // Generate and download ZIP
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
  const totalMolecules = ATOMIC_COMPONENTS.molecules.components.filter((c) => selectedComponents.has(c.path)).length;
  const totalOrganisms = ATOMIC_COMPONENTS.organisms.components.filter((c) => selectedComponents.has(c.path)).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5" />
          Componentes Atomic Design
        </CardTitle>
        <CardDescription>
          Descarga moléculas y organismos del sistema de diseño.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selection Summary */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {totalSelected} seleccionados
          </Badge>
          {totalMolecules > 0 && (
            <Badge className="text-xs bg-blue-500/20 text-blue-600 border-blue-500/30">
              {totalMolecules} moléculas
            </Badge>
          )}
          {totalOrganisms > 0 && (
            <Badge className="text-xs bg-purple-500/20 text-purple-600 border-purple-500/30">
              {totalOrganisms} organismos
            </Badge>
          )}
        </div>

        {/* Component Sections */}
        <ScrollArea className="h-64 border rounded-md">
          <div className="p-3 space-y-4">
            {(Object.entries(ATOMIC_COMPONENTS) as [keyof typeof ATOMIC_COMPONENTS, typeof ATOMIC_COMPONENTS.molecules][]).map(
              ([key, section]) => (
                <div key={key} className="space-y-2">
                  {/* Section Header */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleSection(key)}
                      className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                    >
                      {expandedSections.has(key) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      <FileCode className="h-4 w-4" />
                      {section.label}
                      <Badge variant="secondary" className="text-[10px]">
                        {section.components.length}
                      </Badge>
                    </button>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => selectAll(key)}
                      >
                        Todos
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => deselectAll(key)}
                      >
                        Ninguno
                      </Button>
                    </div>
                  </div>

                  {/* Components List */}
                  {expandedSections.has(key) && (
                    <div className="pl-6 space-y-1">
                      {section.components.map((component) => (
                        <label
                          key={component.path}
                          className="flex items-start gap-2 p-1.5 rounded hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <Checkbox
                            checked={selectedComponents.has(component.path)}
                            onCheckedChange={() => toggleComponent(component.path)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {component.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {component.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleCopyPaths}
              disabled={totalSelected === 0}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copiar rutas
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleDownloadManifest}
              disabled={totalSelected === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              Manifest
            </Button>
          </div>
          <Button
            className="w-full"
            onClick={handleDownloadZip}
            disabled={totalSelected === 0 || isDownloading}
          >
            <FolderDown className="h-4 w-4 mr-2" />
            {isDownloading ? "Generando..." : "Descargar ZIP"}
          </Button>
        </div>

        {/* Help text */}
        <p className="text-[10px] text-muted-foreground text-center">
          El ZIP incluye manifest, README y referencias de rutas.
        </p>
      </CardContent>
    </Card>
  );
};

export default ComponentsDownloadPanel;
