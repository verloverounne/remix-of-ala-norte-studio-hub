import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, GripVertical, Image as ImageIcon, Upload, Loader2, Video } from "lucide-react";
import { StorageImageSelector } from "@/components/StorageImageSelector";

interface GalleryImage {
  id: string;
  page_type: 'home' | 'servicios' | 'hero_rental' | 'producciones' | 'home_hero' | 'cartoni_home' | 'contacto';
  image_url: string;
  media_type: 'image' | 'video';
  title: string | null;
  description: string | null;
  order_index: number;
  category_id: string | null;
  vertical_video_url: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface GalleryManagerProps {
  onRefresh?: () => void;
}

export const GalleryManager = ({ onRefresh }: GalleryManagerProps) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPageType, setSelectedPageType] = useState<'home' | 'servicios' | 'hero_rental' | 'producciones' | 'home_hero' | 'cartoni_home' | 'contacto'>('home_hero');
  const [newImage, setNewImage] = useState({
    image_url: "",
    media_type: "image" as 'image' | 'video',
    title: "",
    description: "",
    category_id: null as string | null,
    vertical_video_url: "",
  });
  const [uploadingVertical, setUploadingVertical] = useState(false);
  const verticalFileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch categories for hero_rental linking
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('order_index');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const sanitizeFileName = (name: string): string => {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_")
      .toLowerCase();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isVertical: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    
    if (!isImage && !isVideo) {
      toast({ title: "Solo se permiten imágenes o videos", variant: "destructive" });
      return;
    }

    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for video, 10MB for images
    if (file.size > maxSize) {
      toast({ title: `El tamaño máximo es ${isVideo ? '100MB' : '10MB'}`, variant: "destructive" });
      return;
    }

    if (isVertical) {
      setUploadingVertical(true);
    } else {
      setUploading(true);
    }

    try {
      const sanitizedName = sanitizeFileName(file.name);
      const timestamp = Date.now();
      const prefix = isVertical ? "vertical_" : "";
      const fileName = `${prefix}${timestamp}_${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from("equipment-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const url = `https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/${fileName}`;
      
      toast({ title: file.type.startsWith("video/") ? "Video subido correctamente" : "Imagen subida correctamente" });
      
      if (isVertical) {
        setNewImage(prev => ({ ...prev, vertical_video_url: url }));
      } else {
        setNewImage(prev => ({ 
          ...prev, 
          image_url: url,
          media_type: file.type.startsWith("video/") ? 'video' : 'image'
        }));
      }
    } catch (error: any) {
      toast({ title: "Error al subir", description: error.message, variant: "destructive" });
    } finally {
      if (isVertical) {
        setUploadingVertical(false);
        if (verticalFileInputRef.current) verticalFileInputRef.current.value = "";
      } else {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

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
      setImages(data.map(item => ({
        ...item,
        vertical_video_url: (item as any).vertical_video_url || null,
      })) as GalleryImage[]);
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
        media_type: newImage.media_type,
        title: newImage.title || null,
        description: newImage.description || null,
        order_index: maxOrder,
        category_id: selectedPageType === 'hero_rental' ? newImage.category_id : null,
        vertical_video_url: newImage.vertical_video_url || null,
      });

    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✓ MEDIA AGREGADO" });
      setNewImage({ image_url: "", media_type: "image", title: "", description: "", category_id: null, vertical_video_url: "" });
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
    home: 'Home - Slider Institucional',
    servicios: 'Servicios - Slider',
    hero_rental: 'Hero Rental - Equipos',
    producciones: 'Producciones en Ala Norte',
    home_hero: 'Home - Hero Principal (3 Slides)',
    cartoni_home: 'Home - Sección Cartoni (Fondo)',
    contacto: 'Contacto - Video Vertical',
  };

  const pageTypeDescriptions: Record<string, string> = {
    home_hero: '⚡ Cada slide usa: Título = título grande, Descripción = subtítulo. El orden debe ser 0, 1, 2 para las 3 slides (Rental, Galería, Sala). Soporta imágenes y videos MP4.',
    cartoni_home: '🎬 Sube un video MP4 que se mostrará como fondo de la sección Cartoni en el Home. Se reproduce en loop, sin audio, 100% ancho.',
    contacto: '📱 Sube un video vertical (9:16) que se mostrará en la columna de información de contacto. Se reproduce en loop, sin audio.',
  };

  return (
    <div className="space-y-6">
      {/* Page Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Gestión de Galerías y Sliders
          </CardTitle>
          <CardDescription>Administra las imágenes de las páginas Galería, Sala de Grabación, Home y Servicios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Página / Slider</Label>
              <Select value={selectedPageType} onValueChange={(v) => setSelectedPageType(v as typeof selectedPageType)}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home_hero">Home - Hero Videos</SelectItem>
                  <SelectItem value="cartoni_home">Home - Sección Cartoni</SelectItem>
                  <SelectItem value="producciones">Producciones en Ala Norte</SelectItem>
                  <SelectItem value="hero_rental">Hero Rental - Equipos</SelectItem>
                  <SelectItem value="home">Home - Slider Institucional</SelectItem>
                  <SelectItem value="servicios">Servicios - Slider</SelectItem>
                  <SelectItem value="contacto">Contacto - Video Vertical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Mostrando {images.length} imágenes de <strong>{pageTypeLabels[selectedPageType]}</strong>
            </div>
            {pageTypeDescriptions[selectedPageType] && (
              <div className="md:col-span-2 mt-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                {pageTypeDescriptions[selectedPageType]}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add New Media */}
      <Card>
        <CardHeader>
          <CardTitle>Agregar Nuevo Media</CardTitle>
          <CardDescription>Agrega imágenes o videos al carrusel de {pageTypeLabels[selectedPageType]}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Media Type Selector */}
            <div className="space-y-2 md:col-span-2">
              <Label>Tipo de Media *</Label>
              <Select 
                value={newImage.media_type} 
                onValueChange={(v) => setNewImage({ ...newImage, media_type: v as 'image' | 'video' })}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">🖼️ Imagen</SelectItem>
                  <SelectItem value="video">🎬 Video MP4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label>{newImage.media_type === 'video' ? 'Video URL (Desktop) *' : 'Imagen *'}</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  {newImage.media_type === 'image' ? (
                    <StorageImageSelector 
                      value={newImage.image_url} 
                      onChange={(url) => setNewImage({ ...newImage, image_url: url })}
                      placeholder="Seleccionar imagen del storage..."
                    />
                  ) : (
                    <Input
                      value={newImage.image_url}
                      onChange={(e) => setNewImage({ ...newImage, image_url: e.target.value })}
                      placeholder="URL del video MP4 horizontal (desktop) o sube uno nuevo..."
                    />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={newImage.media_type === 'video' ? "video/mp4,video/webm,video/mov" : "image/*"}
                  onChange={(e) => handleFileUpload(e, false)}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="hero"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {uploading ? "Subiendo..." : "Subir"}
                </Button>
              </div>
            </div>
            
            {/* Video Vertical - Solo para videos en sliders hero */}
            {newImage.media_type === 'video' && selectedPageType === 'home_hero' && (
              <div className="space-y-2 md:col-span-2">
                <Label>Video Vertical (Mobile/Tablet) - Opcional</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Sube una versión vertical del video para dispositivos móviles y tablets. Si no se sube, se usará el video horizontal.
                </p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={newImage.vertical_video_url}
                      onChange={(e) => setNewImage({ ...newImage, vertical_video_url: e.target.value })}
                      placeholder="URL del video MP4 vertical (mobile/tablet) o sube uno nuevo..."
                    />
                  </div>
                  <input
                    ref={verticalFileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/mov"
                    onChange={(e) => handleFileUpload(e, true)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => verticalFileInputRef.current?.click()}
                    disabled={uploadingVertical}
                  >
                    {uploadingVertical ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {uploadingVertical ? "Subiendo..." : "Subir Vertical"}
                  </Button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Título (opcional)</Label>
              <Input 
                value={newImage.title}
                onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                placeholder="Título"
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
            
            {/* Category selector - only for hero_rental */}
            {selectedPageType === 'hero_rental' && (
              <div className="space-y-2 md:col-span-2">
                <Label>Categoría de Equipos *</Label>
                <Select 
                  value={newImage.category_id || ""} 
                  onValueChange={(v) => setNewImage({ ...newImage, category_id: v || null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la categoría para este fondo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Este fondo se mostrará cuando el usuario seleccione esta categoría en el hero de Rental
                </p>
              </div>
            )}
          </div>
          <Button onClick={handleAddImage} className="mt-4" variant="hero">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Media
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
                  
                  {/* Media Preview */}
                  <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded border relative">
                    {img.media_type === 'video' ? (
                      <>
                        <video 
                          src={img.image_url} 
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
                          <Video className="h-6 w-6 text-background" />
                        </div>
                      </>
                    ) : (
                      <img 
                        src={img.image_url} 
                        alt={img.title || "Imagen"} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                    {/* Media Type Selector */}
                    <Select 
                      value={img.media_type || 'image'} 
                      onValueChange={(v) => handleUpdateImage(img.id, { media_type: v as 'image' | 'video' })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">🖼️ Imagen</SelectItem>
                        <SelectItem value="video">🎬 Video</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <div className="flex items-center gap-2 md:col-span-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">URL:</Label>
                      <Input 
                        className="flex-1 text-xs"
                        value={img.image_url}
                        onChange={(e) => handleUpdateImage(img.id, { image_url: e.target.value })}
                      />
                    </div>
                    {/* Video Vertical - Solo para videos en sliders hero */}
                    {img.media_type === 'video' && selectedPageType === 'home_hero' && (
                      <div className="flex items-center gap-2 md:col-span-3">
                        <Label className="text-xs text-muted-foreground whitespace-nowrap">Video Vertical (Mobile/Tablet):</Label>
                        <Input 
                          className="flex-1 text-xs"
                          value={img.vertical_video_url || ""}
                          onChange={(e) => handleUpdateImage(img.id, { vertical_video_url: e.target.value || null })}
                          placeholder="URL del video vertical (opcional)"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">Orden:</Label>
                      <Input 
                        type="number"
                        className="w-20"
                        value={img.order_index}
                        onChange={(e) => handleUpdateOrder(img.id, parseInt(e.target.value) || 0)}
                      />
                    </div>
                    
                    {/* Category selector for hero_rental items */}
                    {selectedPageType === 'hero_rental' && (
                      <div className="flex items-center gap-2 md:col-span-3">
                        <Label className="text-xs text-muted-foreground whitespace-nowrap">Categoría:</Label>
                        <Select 
                          value={img.category_id || "none"} 
                          onValueChange={(v) => handleUpdateImage(img.id, { category_id: v === "none" ? null : v })}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Sin categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sin categoría</SelectItem>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
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
