import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, GripVertical, Image as ImageIcon } from "lucide-react";
import { StorageImageSelector } from "@/components/StorageImageSelector";

interface GalleryImage {
  id: string;
  page_type: 'galeria' | 'sala_grabacion';
  image_url: string;
  title: string | null;
  description: string | null;
  order_index: number;
}

interface GalleryManagerProps {
  onRefresh?: () => void;
}

export const GalleryManager = ({ onRefresh }: GalleryManagerProps) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPageType, setSelectedPageType] = useState<'galeria' | 'sala_grabacion'>('galeria');
  const [newImage, setNewImage] = useState({
    image_url: "",
    title: "",
    description: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, [selectedPageType]);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('page_type', selectedPageType)
      .order('order_index');
    
    if (!error && data) {
      setImages(data as GalleryImage[]);
    }
    setLoading(false);
  };

  const handleAddImage = async () => {
    if (!newImage.image_url) {
      toast({ title: "ERROR", description: "Selecciona una imagen", variant: "destructive" });
      return;
    }

    const maxOrder = images.length > 0 ? Math.max(...images.map(i => i.order_index)) + 1 : 0;

    const { error } = await supabase
      .from('gallery_images')
      .insert({
        page_type: selectedPageType,
        image_url: newImage.image_url,
        title: newImage.title || null,
        description: newImage.description || null,
        order_index: maxOrder,
      });

    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✓ IMAGEN AGREGADA" });
      setNewImage({ image_url: "", title: "", description: "" });
      fetchImages();
      onRefresh?.();
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta imagen?")) return;

    const { error } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✓ IMAGEN ELIMINADA" });
      fetchImages();
      onRefresh?.();
    }
  };

  const handleUpdateOrder = async (id: string, newOrder: number) => {
    const { error } = await supabase
      .from('gallery_images')
      .update({ order_index: newOrder })
      .eq('id', id);

    if (!error) {
      fetchImages();
    }
  };

  const handleUpdateImage = async (id: string, updates: Partial<GalleryImage>) => {
    const { error } = await supabase
      .from('gallery_images')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✓ ACTUALIZADO" });
      fetchImages();
    }
  };

  const pageTypeLabels = {
    galeria: 'Galería',
    sala_grabacion: 'Sala de Grabación',
  };

  return (
    <div className="space-y-6">
      {/* Page Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Gestión de Galerías
          </CardTitle>
          <CardDescription>Administra las imágenes de las páginas Galería y Sala de Grabación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Página</Label>
              <Select value={selectedPageType} onValueChange={(v) => setSelectedPageType(v as 'galeria' | 'sala_grabacion')}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="galeria">Galería</SelectItem>
                  <SelectItem value="sala_grabacion">Sala de Grabación / Postproducción</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Mostrando {images.length} imágenes de <strong>{pageTypeLabels[selectedPageType]}</strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Image */}
      <Card>
        <CardHeader>
          <CardTitle>Agregar Nueva Imagen</CardTitle>
          <CardDescription>Agrega imágenes al carrusel de {pageTypeLabels[selectedPageType]}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Imagen *</Label>
              <StorageImageSelector 
                value={newImage.image_url} 
                onChange={(url) => setNewImage({ ...newImage, image_url: url })}
                placeholder="Seleccionar imagen del storage..."
              />
            </div>
            <div className="space-y-2">
              <Label>Título (opcional)</Label>
              <Input 
                value={newImage.title} 
                onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                placeholder="Título de la imagen"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción (opcional)</Label>
              <Input 
                value={newImage.description} 
                onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                placeholder="Descripción breve"
              />
            </div>
          </div>
          <Button onClick={handleAddImage} className="mt-4" variant="hero">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Imagen
          </Button>
        </CardContent>
      </Card>

      {/* Image List */}
      <Card>
        <CardHeader>
          <CardTitle>Imágenes de {pageTypeLabels[selectedPageType]}</CardTitle>
          <CardDescription>Arrastra para reordenar o edita los detalles</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground animate-pulse">Cargando...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
              <p className="text-muted-foreground">No hay imágenes en esta galería</p>
            </div>
          ) : (
            <div className="space-y-4">
              {images.map((img, index) => (
                <div key={img.id} className="flex items-start gap-4 p-4 border rounded-lg bg-background">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="h-5 w-5" />
                    <span className="text-sm font-mono">{index + 1}</span>
                  </div>
                  
                  <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded border">
                    <img 
                      src={img.image_url} 
                      alt={img.title || "Imagen"} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input 
                      placeholder="Título"
                      value={img.title || ""}
                      onChange={(e) => handleUpdateImage(img.id, { title: e.target.value || null })}
                    />
                    <Input 
                      placeholder="Descripción"
                      value={img.description || ""}
                      onChange={(e) => handleUpdateImage(img.id, { description: e.target.value || null })}
                    />
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">Orden:</Label>
                      <Input 
                        type="number"
                        className="w-20"
                        value={img.order_index}
                        onChange={(e) => handleUpdateOrder(img.id, parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteImage(img.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GalleryManager;
