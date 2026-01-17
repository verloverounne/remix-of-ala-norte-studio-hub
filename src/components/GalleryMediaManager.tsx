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
  media_type: "image" | "video";
  title: string | null;
  description: string | null;
  order_index: number;
  vertical_video_url: string | null;
}

interface GalleryMediaManagerProps {
  spaceSlug: "galeria" | "sala-grabacion";
  spaceName: string;
  spaceId: string;
}

export const GalleryMediaManager = ({ spaceSlug, spaceName, spaceId }: GalleryMediaManagerProps) => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [heroVideoUrl, setHeroVideoUrl] = useState("");
  const [savingHero, setSavingHero] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Determine page_type based on spaceSlug
  const galleryPageType = spaceSlug === "galeria" ? "galeria" : "sala_grabacion";

  const [newGalleryImage, setNewGalleryImage] = useState({
    image_url: "",
    media_type: "image" as "image" | "video",
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchAllMedia();
  }, [spaceSlug, spaceId]);

  const fetchAllMedia = async () => {
    setLoading(true);

    // Fetch space video_url
    const { data: spaceData } = await supabase.from("spaces").select("video_url").eq("id", spaceId).single();

    if (spaceData) {
      setHeroVideoUrl(spaceData.video_url || "");
    }

    // Fetch gallery images
    const { data: galleryData } = await supabase
      .from("gallery_images")
      .select("*")
      .eq("page_type", galleryPageType)
      .order("order_index");

    if (galleryData) {
      setGalleryImages(
        galleryData.map((item) => ({
          ...item,
          vertical_video_url: (item as any).vertical_video_url || null,
        })) as GalleryImage[],
      );
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

  const handleHeroVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    if (!isVideo) {
      toast({ title: "Solo se permiten videos", variant: "destructive" });
      return;
    }

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: "El tamaño máximo es 100MB", variant: "destructive" });
      return;
    }

    setUploadingHero(true);

    try {
      const sanitizedName = sanitizeFileName(file.name);
      const timestamp = Date.now();
      const fileName = `hero_${spaceSlug}_${timestamp}_${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from("equipment-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const url = `https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/${fileName}`;

      setHeroVideoUrl(url);
      toast({ title: "Video subido correctamente" });
    } catch (error: any) {
      toast({ title: "Error al subir", description: error.message, variant: "destructive" });
    } finally {
      setUploadingHero(false);
      if (heroFileInputRef.current) heroFileInputRef.current.value = "";
    }
  };

  const handleSaveHeroVideo = async () => {
    setSavingHero(true);

    const { error } = await supabase
      .from("spaces")
      .update({ video_url: heroVideoUrl || null })
      .eq("id", spaceId);

    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✓ VIDEO DEL HERO GUARDADO" });
    }

    setSavingHero(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      toast({ title: `El tamaño máximo es ${isVideo ? "100MB" : "10MB"}`, variant: "destructive" });
      return;
    }

    setUploading(true);

    try {
      const sanitizedName = sanitizeFileName(file.name);
      const timestamp = Date.now();
      const fileName = `gallery_${timestamp}_${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from("equipment-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const url = `https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/${fileName}`;

      toast({ title: isVideo ? "Video subido correctamente" : "Imagen subida correctamente" });

      setNewGalleryImage((prev) => ({
        ...prev,
        image_url: url,
        media_type: isVideo ? "video" : "image",
      }));
    } catch (error: any) {
      toast({ title: "Error al subir", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddGalleryImage = async () => {
    if (!newGalleryImage.image_url) {
      toast({ title: "ERROR", description: "Selecciona una imagen", variant: "destructive" });
      return;
    }

    const maxOrder = galleryImages.length > 0 ? Math.max(...galleryImages.map((i) => i.order_index)) + 1 : 0;

    const { error } = await supabase.from("gallery_images").insert({
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

    const { error } = await supabase.from("gallery_images").delete().eq("id", id);

    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✓ ELIMINADO" });
      fetchAllMedia();
    }
  };

  const handleUpdateOrder = async (id: string, newOrder: number) => {
    const { error } = await supabase.from("gallery_images").update({ order_index: newOrder }).eq("id", id);

    if (!error) {
      fetchAllMedia();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando media...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Hero Video Section - Now saves to spaces.video_url */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video del Hero - {spaceName}
          </CardTitle>
          <CardDescription>
            Video principal que se muestra en el hero de la página. Se guarda directamente en el espacio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>URL del Video (MP4)</Label>
                <div className="flex gap-2">
                  <Input
                    value={heroVideoUrl}
                    onChange={(e) => setHeroVideoUrl(e.target.value)}
                    placeholder="URL del video MP4 para el hero..."
                    className="flex-1"
                  />
                  <input
                    ref={heroFileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/mov"
                    onChange={handleHeroVideoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => heroFileInputRef.current?.click()}
                    disabled={uploadingHero}
                  >
                    {uploadingHero ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {uploadingHero ? "Subiendo..." : "Subir"}
                  </Button>
                </div>
              </div>

              {/* Preview */}
              {heroVideoUrl && (
                <div className="space-y-2">
                  <Label>Vista previa</Label>
                  <div className="w-full max-w-md aspect-video bg-muted rounded overflow-hidden">
                    <video src={heroVideoUrl} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                  </div>
                </div>
              )}

              <Button onClick={handleSaveHeroVideo} variant="hero" disabled={savingHero}>
                {savingHero ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {savingHero ? "Guardando..." : "Guardar Video del Hero"}
              </Button>
            </div>
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
          <CardDescription>Imágenes destacadas que se muestran en la página del espacio</CardDescription>
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
                  onValueChange={(v) => setNewGalleryImage({ ...newGalleryImage, media_type: v as "image" | "video" })}
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
                    {newGalleryImage.media_type === "image" ? (
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
                    ref={fileInputRef}
                    type="file"
                    accept={newGalleryImage.media_type === "video" ? "video/mp4,video/webm,video/mov" : "image/*"}
                    onChange={handleFileUpload}
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
                  {item.media_type === "video" ? (
                    <video src={item.image_url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={item.image_url} alt={item.title || ""} className="w-full h-full object-cover" />
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
