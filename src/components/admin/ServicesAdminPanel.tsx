import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Plus, GripVertical, Save, ImageIcon, X, Video, Upload } from "lucide-react";
import { ImageUploadButton } from "@/components/ImageUploadButton";
import type { Json } from "@/integrations/supabase/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HomeService {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  hero_image_url: string | null;
  hero_media_type: string | null;
  hero_video_url: string | null;
  bullets: string[];
  cta_label: string | null;
  cta_url: string | null;
  slug: string | null;
  order_index: number;
  is_active: boolean;
}

const parseBullets = (bullets: Json | null): string[] => {
  if (!bullets) return [];
  if (Array.isArray(bullets)) {
    return bullets.filter((b): b is string => typeof b === 'string');
  }
  return [];
};

export const ServicesAdminPanel = () => {
  const [services, setServices] = useState<HomeService[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("home_services")
      .select("*")
      .order("order_index");

    if (!error && data) {
      const parsedServices: HomeService[] = data.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description,
        image_url: s.image_url,
        hero_image_url: s.hero_image_url,
        hero_media_type: s.hero_media_type,
        hero_video_url: s.hero_video_url,
        bullets: parseBullets(s.bullets),
        cta_label: s.cta_label,
        cta_url: s.cta_url,
        slug: s.slug,
        order_index: s.order_index ?? 0,
        is_active: s.is_active ?? true,
      }));
      setServices(parsedServices);
    } else {
      toast.error("Error al cargar servicios");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-");
  };

  const handleAddService = async () => {
    const newService = {
      title: "Nuevo Servicio",
      description: "",
      order_index: services.length,
      is_active: true,
      bullets: [],
      slug: generateSlug("nuevo-servicio-" + Date.now()),
    };

    const { data, error } = await supabase
      .from("home_services")
      .insert(newService)
      .select()
      .single();

    if (!error && data) {
      const newService: HomeService = {
        id: data.id,
        title: data.title,
        description: data.description,
        image_url: data.image_url,
        hero_image_url: data.hero_image_url,
        hero_media_type: data.hero_media_type,
        hero_video_url: data.hero_video_url,
        bullets: parseBullets(data.bullets),
        cta_label: data.cta_label,
        cta_url: data.cta_url,
        slug: data.slug,
        order_index: data.order_index ?? 0,
        is_active: data.is_active ?? true,
      };
      setServices([...services, newService]);
      toast.success("Servicio agregado");
    } else {
      toast.error("Error al agregar servicio");
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("¿Eliminar este servicio?")) return;

    const { error } = await supabase
      .from("home_services")
      .delete()
      .eq("id", id);

    if (!error) {
      setServices(services.filter((s) => s.id !== id));
      toast.success("Servicio eliminado");
    } else {
      toast.error("Error al eliminar");
    }
  };

  const handleMoveService = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= services.length) return;

    const updated = [...services];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    const updates = updated.map((s, i) => ({ ...s, order_index: i }));
    setServices(updates);

    for (const s of updates) {
      await supabase
        .from("home_services")
        .update({ order_index: s.order_index })
        .eq("id", s.id);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    let hasError = false;

    for (const service of services) {
      const { error } = await supabase
        .from("home_services")
        .update({
          title: service.title,
          description: service.description,
          image_url: service.image_url,
          hero_image_url: service.hero_image_url,
          hero_media_type: service.hero_media_type,
          hero_video_url: service.hero_video_url,
          bullets: service.bullets,
          cta_label: service.cta_label,
          cta_url: service.cta_url,
          slug: service.slug || generateSlug(service.title),
          is_active: service.is_active,
          order_index: service.order_index,
        })
        .eq("id", service.id);

      if (error) hasError = true;
    }

    if (!hasError) {
      toast.success("Cambios guardados");
    } else {
      toast.error("Error al guardar algunos cambios");
    }
    setSaving(false);
  };

  const updateService = (id: string, updates: Partial<HomeService>) => {
    setServices(services.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const addBullet = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service && service.bullets.length < 6) {
      updateService(serviceId, { bullets: [...service.bullets, ""] });
    }
  };

  const updateBullet = (serviceId: string, index: number, value: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      const newBullets = [...service.bullets];
      newBullets[index] = value;
      updateService(serviceId, { bullets: newBullets });
    }
  };

  const removeBullet = (serviceId: string, index: number) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      const newBullets = service.bullets.filter((_, i) => i !== index);
      updateService(serviceId, { bullets: newBullets });
    }
  };

  const handleMediaUpload = async (serviceId: string, file: File, field: 'hero' | 'section') => {
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    
    if (file.size > maxSize) {
      toast.error(`Archivo muy grande. Máximo: ${isVideo ? '100MB' : '10MB'}`);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de archivo no soportado. Use JPG, PNG, WebP o MP4.');
      return;
    }

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedName}`;

    toast.info('Subiendo archivo...');

    const { data, error } = await supabase.storage
      .from('equipment-images')
      .upload(fileName, file, { 
        cacheControl: '3600',
        contentType: file.type 
      });

    if (error) {
      console.error('Upload error:', error);
      toast.error('Error al subir archivo');
      return;
    }

    const { data: urlData } = supabase.storage
      .from('equipment-images')
      .getPublicUrl(data.path);

    if (field === 'hero') {
      if (isVideo) {
        updateService(serviceId, { 
          hero_media_type: 'video', 
          hero_video_url: urlData.publicUrl,
          hero_image_url: null 
        });
      } else {
        updateService(serviceId, { 
          hero_media_type: 'image', 
          hero_image_url: urlData.publicUrl,
          hero_video_url: null 
        });
      }
    } else {
      updateService(serviceId, { image_url: urlData.publicUrl });
    }

    toast.success('Archivo subido correctamente');
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse font-heading">Cargando servicios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-heading text-xl sm:text-2xl uppercase">
            Gestión de Servicios
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Estos servicios se muestran en el slider de la Home y en la página /servicios
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddService} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
          <Button onClick={handleSaveAll} disabled={saving} size="sm">
            <Save className="h-4 w-4 mr-1" />
            {saving ? "Guardando..." : "Guardar Todo"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {services.map((service, index) => (
          <Card key={service.id} className="border-2 border-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <span className="font-heading text-sm text-muted-foreground">
                    #{index + 1}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveService(index, "up")}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveService(index, "down")}
                    disabled={index === services.length - 1}
                  >
                    ↓
                  </Button>
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`active-${service.id}`}
                      checked={service.is_active}
                      onCheckedChange={(checked) =>
                        updateService(service.id, { is_active: checked })
                      }
                    />
                    <Label htmlFor={`active-${service.id}`} className="text-xs">
                      Activo
                    </Label>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column: Basic info */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-heading">Título</Label>
                    <Input
                      value={service.title}
                      onChange={(e) =>
                        updateService(service.id, { 
                          title: e.target.value,
                          slug: generateSlug(e.target.value)
                        })
                      }
                      className="border-2 border-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-heading">Descripción</Label>
                    <Textarea
                      value={service.description || ""}
                      onChange={(e) =>
                        updateService(service.id, { description: e.target.value })
                      }
                      className="border-2 border-foreground min-h-[80px]"
                    />
                  </div>

                  {/* Bullets */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-heading">Bullets (máx. 6)</Label>
                      {service.bullets.length < 6 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addBullet(service.id)}
                          className="h-6 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Agregar
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {service.bullets.map((bullet, bulletIndex) => (
                        <div key={bulletIndex} className="flex gap-2">
                          <Input
                            value={bullet}
                            onChange={(e) => updateBullet(service.id, bulletIndex, e.target.value)}
                            placeholder={`Bullet ${bulletIndex + 1}`}
                            className="border-2 border-foreground text-sm"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBullet(service.id, bulletIndex)}
                            className="h-10 w-10 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs font-heading">Texto CTA</Label>
                      <Input
                        value={service.cta_label || ""}
                        onChange={(e) =>
                          updateService(service.id, { cta_label: e.target.value })
                        }
                        placeholder="Ej: Ver más"
                        className="border-2 border-foreground"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-heading">URL CTA</Label>
                      <Input
                        value={service.cta_url || ""}
                        onChange={(e) =>
                          updateService(service.id, { cta_url: e.target.value })
                        }
                        placeholder="Ej: /equipos"
                        className="border-2 border-foreground"
                      />
                    </div>
                  </div>
                </div>

                {/* Right column: Media */}
                <div className="space-y-4">
                  {/* Hero Media */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-heading">Media Hero (Slider)</Label>
                      <Select
                        value={service.hero_media_type || "image"}
                        onValueChange={(value) => updateService(service.id, { hero_media_type: value })}
                      >
                        <SelectTrigger className="w-28 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image">Imagen</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="border-2 border-dashed border-foreground/50 rounded-lg p-2 aspect-video flex items-center justify-center bg-muted/30 overflow-hidden">
                      {service.hero_media_type === 'video' && service.hero_video_url ? (
                        <video
                          src={service.hero_video_url}
                          className="w-full h-full object-cover rounded"
                          controls
                          muted
                        />
                      ) : service.hero_image_url ? (
                        <img
                          src={service.hero_image_url}
                          alt={`Hero - ${service.title}`}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="text-center text-muted-foreground">
                          {service.hero_media_type === 'video' ? (
                            <Video className="h-6 w-6 mx-auto mb-1 opacity-50" />
                          ) : (
                            <ImageIcon className="h-6 w-6 mx-auto mb-1 opacity-50" />
                          )}
                          <p className="text-xs">
                            {service.hero_media_type === 'video' ? 'Video del slider' : 'Imagen del slider'}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={(service.hero_media_type === 'video' ? service.hero_video_url : service.hero_image_url) || ""}
                        onChange={(e) => {
                          if (service.hero_media_type === 'video') {
                            updateService(service.id, { hero_video_url: e.target.value });
                          } else {
                            updateService(service.id, { hero_image_url: e.target.value });
                          }
                        }}
                        placeholder={service.hero_media_type === 'video' ? "URL video MP4" : "URL imagen hero"}
                        className="border-2 border-foreground text-xs"
                      />
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept={service.hero_media_type === 'video' ? "video/mp4" : "image/*"}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleMediaUpload(service.id, file, 'hero');
                          }}
                        />
                        <Button variant="outline" size="sm" asChild>
                          <span>
                            <Upload className="h-4 w-4" />
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>

                  {/* Section Image */}
                  <div>
                    <Label className="text-xs font-heading">Imagen Sección</Label>
                    <div className="border-2 border-dashed border-foreground/50 rounded-lg p-2 aspect-video flex items-center justify-center bg-muted/30 overflow-hidden">
                      {service.image_url ? (
                        <img
                          src={service.image_url}
                          alt={service.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="text-center text-muted-foreground">
                          <ImageIcon className="h-6 w-6 mx-auto mb-1 opacity-50" />
                          <p className="text-xs">Imagen de la sección</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={service.image_url || ""}
                        onChange={(e) =>
                          updateService(service.id, { image_url: e.target.value })
                        }
                        placeholder="URL imagen sección"
                        className="border-2 border-foreground text-xs"
                      />
                      <ImageUploadButton
                        onUploadComplete={(url) => updateService(service.id, { image_url: url })}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-foreground/30 rounded-lg">
          <p className="text-muted-foreground mb-4">No hay servicios configurados</p>
          <Button onClick={handleAddService}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar primer servicio
          </Button>
        </div>
      )}
    </div>
  );
};

export default ServicesAdminPanel;
