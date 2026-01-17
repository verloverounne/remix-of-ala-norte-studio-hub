import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, GripVertical, Upload, Loader2, Video, Image as ImageIcon } from "lucide-react";
import { StorageImageSelector } from "@/components/StorageImageSelector";

interface GalleryImage {
  id: string;
  page_type: string;
  image_url: string;
  media_type: 'image' | 'video';
  title: string | null;
  description: string | null;
  order_index: number;
  vertical_video_url: string | null;
}

interface GalleryMediaManagerProps {
  spaceSlug: 'galeria' | 'sala-grabacion';
  spaceName: string;
}

export const GalleryMediaManager = ({ spaceSlug, spaceName }: GalleryMediaManagerProps) => {
  const [heroMedia, setHeroMedia] = useState<GalleryImage[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingVertical, setUploadingVertical] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const verticalFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Determine page_type based on spaceSlug
  const heroPageType = spaceSlug === 'galeria' ? 'galeria_hero' : 'sala_grabacion_hero';
  const galleryPageType = spaceSlug === 'galeria' ? 'galeria' : 'sala_grabacion';

  const [newHeroMedia, setNewHeroMedia] = useState({
    image_url: "",
    media_type: "video" as 'image' | 'video',
    title: "",
    description: "",
    vertical_video_url: "",
  });

  const [newGalleryImage, setNewGalleryImage] = useState({
    image_url: "",
    media_type: "image" as 'image' | 'video',
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchAllMedia();
  }, [spaceSlug]);

  const fetchAllMedia = async () => {
    setLoading(true);
    
    // Fetch hero media
    const { data: heroData } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('page_type', heroPageType)
      .order('order_index');
    
    if (heroData) {
      setHeroMedia(heroData.map(item => ({
        ...item,
        vertical_video_url: (item as any).vertical_video_url || null,
      })) as GalleryImage[]);
    }

    // Fetch gallery images
    const { data: galleryData } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('page_type', galleryPageType)
      .order('order_index');
    
    if (galleryData) {
      setGalleryImages(galleryData.map(item => ({
        ...item,
        vertical_video_url: (item as any).vertical_video_url || null,
      })) as GalleryImage[]);
    }

    setLoading(false);
  };

  const sanitizeFileName = (name: string): string => {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_")
      .toLowerCase();
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    isVertical: boolean = false,
    target: 'hero' | 'gallery'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    
    if (!isImage && !isVideo) {
      toast({ title: "Solo se permiten imágenes o videos", variant: "destructive" });
      return;
    }

    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
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
      
      toast({ title: isVideo ? "Video subido correctamente" : "Imagen subida correctamente" });
      
      if (target === 'hero') {
        if (isVertical) {
          setNewHeroMedia(prev => ({ ...prev, vertical_video_url: url }));
        } else {
          setNewHeroMedia(prev => ({ 
            ...prev, 
            image_url: url,
            media_type: isVideo ? 'video' : 'image'
          }));
        }
      } else {
        setNewGalleryImage(prev => ({ 
          ...prev, 
          image_url: url,
          media_type: isVideo ? 'video' : 'image'
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

  const handleAddHeroMedia = async () => {
    if (!newHeroMedia.image_url) {
      toast({ title: "ERROR", description: "Selecciona un video o imagen", variant: "destructive" });
      return;
    }

    const maxOrder = heroMedia.length > 0 ? Math.max(...heroMedia.map(i => i.order_index)) + 1 : 0;

    const { error } = await supabase
      .from('gallery_images')
      .insert({
        page_type: heroPageType,
        image_url: newHeroMedia.image_url,
        media_type: newHeroMedia.media_type,
        title: newHeroMedia.title || null,
        description: newHeroMedia.description || null,
        order_index: maxOrder,
        vertical_video_url: newHeroMedia.vertical_video_url || null,
      });

    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✓ MEDIA DEL HERO AGREGADO" });
      setNewHeroMedia({ image_url: "", media_type: "video", title: "", description: "", vertical_video_url: "" });
      fetchAllMedia();
    }
  };

  const handleAddGalleryImage = async () => {
    if (!newGalleryImage.image_url) {
      toast({ title: "ERROR", description: "Selecciona una imagen", variant: "destructive" });
      return;
    }

    const maxOrder = galleryImages.length > 0 ? Math.max(...galleryImages.map(i => i.order_index)) + 1 : 0;

    const { error } = await supabase
      .from('gallery_images')
      .insert({
        page_type: galleryPageType,
        image_url: newGalleryImage.image_url,
        media_type: newGalleryImage.media_type,
        title: newGalleryImage.title || null,
        description: newGalleryImage.description || null,
        order_index: maxOrder,
      });

    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✓ IMAGEN DE GALERÍA AGREGADA" });
      setNewGalleryImage({ image_url: "", media_type: "image", title: "", description: "" });
      fetchAllMedia();
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este media?")) return;

    const { error } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✓ ELIMINADO" });
      fetchAllMedia();
    }
  };

  const handleUpdateOrder = async (id: string, newOrder: number) => {
    const { error } = await supabase
      .from('gallery_images')
      .update({ order_index: newOrder })
      .eq('id', id);

    if (!error) {
      fetchAllMedia();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando media...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Hero Videos/Images Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Hero Videos/Imágenes - {spaceName}
          </CardTitle>
          <CardDescription>
            Videos o imágenes para el slider hero de la página. El orden 0 es el primero.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Hero Media Form */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <h4 className="font-heading font-semibold mb-4">Agregar Nuevo Media al Hero</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Tipo de Media *</Label>
                <Select 
                  value={newHeroMedia.media_type} 
                  onValueChange={(v) => setNewHeroMedia({ ...newHeroMedia, media_type: v as 'image' | 'video' })}
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
                <Label>{newHeroMedia.media_type === 'video' ? 'Video URL (Desktop) *' : 'Imagen *'}</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    {newHeroMedia.media_type === 'image' ? (
                      <StorageImageSelector 
                        value={newHeroMedia.image_url} 
                        onChange={(url) => setNewHeroMedia({ ...newHeroMedia, image_url: url })}
                        placeholder="Seleccionar imagen del storage..."
                      />
                    ) : (
                      <Input
                        value={newHeroMedia.image_url}
                        onChange={(e) => setNewHeroMedia({ ...newHeroMedia, image_url: e.target.value })}
                        placeholder="URL del video MP4 horizontal (desktop) o sube uno nuevo..."
                      />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={newHeroMedia.media_type === 'video' ? "video/mp4,video/webm,video/mov" : "image/*"}
                    onChange={(e) => handleFileUpload(e, false, 'hero')}
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

              {/* Vertical Video for Mobile */}
              {newHeroMedia.media_type === 'video' && (
                <div className="space-y-2 md:col-span-2">
                  <Label>Video Vertical (Mobile/Tablet) - Opcional</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Sube una versión vertical del video para dispositivos móviles.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={newHeroMedia.vertical_video_url}
                      onChange={(e) => setNewHeroMedia({ ...newHeroMedia, vertical_video_url: e.target.value })}
                      placeholder="URL del video MP4 vertical..."
                      className="flex-1"
                    />
                    <input
                      ref={verticalFileInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/mov"
                      onChange={(e) => handleFileUpload(e, true, 'hero')}
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
                  value={newHeroMedia.title}
                  onChange={(e) => setNewHeroMedia({ ...newHeroMedia, title: e.target.value })}
                  placeholder="Título del slide"
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción (opcional)</Label>
                <Input 
                  value={newHeroMedia.description}
                  onChange={(e) => setNewHeroMedia({ ...newHeroMedia, description: e.target.value })}
                  placeholder="Descripción breve"
                />
              </div>
            </div>
            <Button onClick={handleAddHeroMedia} className="mt-4" variant="hero">
              <Plus className="mr-2 h-4 w-4" />
              Agregar al Hero
            </Button>
          </div>

          {/* Hero Media List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {heroMedia.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No hay media en el hero todavía</p>
            ) : (
              heroMedia.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 border rounded bg-background">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <div className="w-16 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                    {item.media_type === 'video' ? (
                      <video src={item.image_url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-sm truncate">{item.title || 'Sin título'}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {item.media_type === 'video' ? (
                        <Video className="h-3 w-3" />
                      ) : (
                        <ImageIcon className="h-3 w-3" />
                      )}
                      <span>Orden: {item.order_index}</span>
                    </div>
                  </div>
                  <Input
                    type="number"
                    value={item.order_index}
                    onChange={(e) => handleUpdateOrder(item.id, parseInt(e.target.value) || 0)}
                    className="w-16"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteMedia(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gallery Images Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Imágenes de la Galería - {spaceName}
          </CardTitle>
          <CardDescription>
            Imágenes destacadas que se muestran en la página del espacio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Gallery Image Form */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <h4 className="font-heading font-semibold mb-4">Agregar Nueva Imagen</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Tipo de Media</Label>
                <Select 
                  value={newGalleryImage.media_type} 
                  onValueChange={(v) => setNewGalleryImage({ ...newGalleryImage, media_type: v as 'image' | 'video' })}
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
                <Label>Imagen o Video *</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    {newGalleryImage.media_type === 'image' ? (
                      <StorageImageSelector 
                        value={newGalleryImage.image_url} 
                        onChange={(url) => setNewGalleryImage({ ...newGalleryImage, image_url: url })}
                        placeholder="Seleccionar imagen del storage..."
                      />
                    ) : (
                      <Input
                        value={newGalleryImage.image_url}
                        onChange={(e) => setNewGalleryImage({ ...newGalleryImage, image_url: e.target.value })}
                        placeholder="URL del video..."
                      />
                    )}
                  </div>
                  <input
                    type="file"
                    accept={newGalleryImage.media_type === 'video' ? "video/mp4,video/webm,video/mov" : "image/*"}
                    onChange={(e) => handleFileUpload(e, false, 'gallery')}
                    className="hidden"
                    id="gallery-file-input"
                  />
                  <Button
                    type="button"
                    variant="hero"
                    onClick={() => document.getElementById('gallery-file-input')?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Subir
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Título (opcional)</Label>
                <Input 
                  value={newGalleryImage.title}
                  onChange={(e) => setNewGalleryImage({ ...newGalleryImage, title: e.target.value })}
                  placeholder="Título"
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción (opcional)</Label>
                <Input 
                  value={newGalleryImage.description}
                  onChange={(e) => setNewGalleryImage({ ...newGalleryImage, description: e.target.value })}
                  placeholder="Descripción"
                />
              </div>
            </div>
            <Button onClick={handleAddGalleryImage} className="mt-4" variant="hero">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Imagen
            </Button>
          </div>

          {/* Gallery Images Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {galleryImages.length === 0 ? (
              <p className="col-span-full text-muted-foreground text-center py-4">No hay imágenes todavía</p>
            ) : (
              galleryImages.map((item) => (
                <div key={item.id} className="relative group aspect-square bg-muted rounded overflow-hidden">
                  {item.media_type === 'video' ? (
                    <video src={item.image_url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={item.image_url} alt={item.title || ''} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Input
                      type="number"
                      value={item.order_index}
                      onChange={(e) => handleUpdateOrder(item.id, parseInt(e.target.value) || 0)}
                      className="w-16 h-8 text-center"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteMedia(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {item.title && (
                    <p className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                      {item.title}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
