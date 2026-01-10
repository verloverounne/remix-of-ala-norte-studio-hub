import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Plus, GripVertical, Save, Video, ImageIcon, Upload, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EquiposHeroItem {
  id: string;
  media_type: string;
  media_url: string | null;
  description: string | null;
  order_index: number;
  is_active: boolean;
}

const AdminEquiposHero = () => {
  const [items, setItems] = useState<EquiposHeroItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("equipos_hero_config")
      .select("*")
      .order("order_index");

    if (!error && data) {
      setItems(data.map(item => ({
        id: item.id,
        media_type: item.media_type || 'image',
        media_url: item.media_url,
        title: item.title,
        description: item.description,
        order_index: item.order_index ?? 0,
        is_active: item.is_active ?? true,
      })));
    } else {
      toast.error("Error al cargar configuración del hero");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async () => {
    const newItem = {
      media_type: "image",
      media_url: null,
      description: null,
      order_index: items.length,
      is_active: true,
    };

    const { data, error } = await supabase
      .from("equipos_hero_config")
      .insert(newItem)
      .select()
      .single();

    if (!error && data) {
      setItems([...items, {
        id: data.id,
        media_type: data.media_type || 'image',
        media_url: data.media_url,
        description: data.description,
        order_index: data.order_index ?? 0,
        is_active: data.is_active ?? true,
      }]);
      toast.success("Slide agregado");
    } else {
      toast.error("Error al agregar slide");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("¿Eliminar este slide?")) return;

    const { error } = await supabase
      .from("equipos_hero_config")
      .delete()
      .eq("id", id);

    if (!error) {
      setItems(items.filter((item) => item.id !== id));
      toast.success("Slide eliminado");
    } else {
      toast.error("Error al eliminar");
    }
  };

  const handleMoveItem = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const updated = [...items];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    const updates = updated.map((item, i) => ({ ...item, order_index: i }));
    setItems(updates);

    for (const item of updates) {
      await supabase
        .from("equipos_hero_config")
        .update({ order_index: item.order_index })
        .eq("id", item.id);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    let hasError = false;

    for (const item of items) {
      const { error } = await supabase
        .from("equipos_hero_config")
        .update({
          media_type: item.media_type,
          media_url: item.media_url,
          description: item.description,
          is_active: item.is_active,
          order_index: item.order_index,
        })
        .eq("id", item.id);

      if (error) hasError = true;
    }

    if (!hasError) {
      toast.success("Cambios guardados");
    } else {
      toast.error("Error al guardar algunos cambios");
    }
    setSaving(false);
  };

  const updateItem = (id: string, updates: Partial<EquiposHeroItem>) => {
    setItems(items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const handleMediaUpload = async (itemId: string, file: File) => {
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
    const fileName = `equipos-hero/${timestamp}_${sanitizedName}`;

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

    updateItem(itemId, { 
      media_type: isVideo ? 'video' : 'image',
      media_url: urlData.publicUrl 
    });

    toast.success('Archivo subido correctamente');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="animate-pulse font-heading text-center">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Volver al Admin
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl uppercase">
                Hero Slider - Equipos
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gestión del slider principal de la página de Equipos/Rental
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Agregar Slide
              </Button>
              <Button onClick={handleSaveAll} disabled={saving} size="sm">
                <Save className="h-4 w-4 mr-1" />
                {saving ? "Guardando..." : "Guardar Todo"}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {items.length === 0 ? (
            <Card className="border-2 border-dashed border-muted-foreground/30">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No hay slides configurados</p>
                <Button onClick={handleAddItem} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar primer slide
                </Button>
              </CardContent>
            </Card>
          ) : (
            items.map((item, index) => (
              <Card key={item.id} className="border-2 border-foreground">
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
                        onClick={() => handleMoveItem(index, "up")}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveItem(index, "down")}
                        disabled={index === items.length - 1}
                      >
                        ↓
                      </Button>
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`active-${item.id}`}
                          checked={item.is_active}
                          onCheckedChange={(checked) =>
                            updateItem(item.id, { is_active: checked })
                          }
                        />
                        <Label htmlFor={`active-${item.id}`} className="text-xs">
                          Activo
                        </Label>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left column: Description */}
                    <div className="space-y-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground font-heading uppercase mb-1">Nota</p>
                        <p className="text-sm">El título del slide se toma automáticamente de la categoría correspondiente según el orden.</p>
                      </div>
                      <div>
                        <Label className="text-xs font-heading">Descripción (opcional)</Label>
                        <Textarea
                          value={item.description || ""}
                          onChange={(e) =>
                            updateItem(item.id, { description: e.target.value })
                          }
                          placeholder="Descripción breve del slide"
                          className="border-2 border-foreground min-h-[100px]"
                        />
                      </div>
                    </div>

                    {/* Right column: Media */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-heading">Tipo de Media</Label>
                        <Select
                          value={item.media_type}
                          onValueChange={(value) => updateItem(item.id, { media_type: value })}
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

                      {/* Media preview */}
                      <div className="border-2 border-dashed border-foreground/50 rounded-lg p-2 aspect-video flex items-center justify-center bg-muted/30 overflow-hidden">
                        {item.media_type === 'video' && item.media_url ? (
                          <video
                            src={item.media_url}
                            className="w-full h-full object-cover rounded"
                            controls
                            muted
                          />
                        ) : item.media_url ? (
                          <img
                            src={item.media_url}
                            alt={`Slide ${index + 1}`}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="text-center text-muted-foreground">
                            {item.media_type === 'video' ? (
                              <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            ) : (
                              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            )}
                            <p className="text-xs">Sin media</p>
                          </div>
                        )}
                      </div>

                      {/* URL input */}
                      <div>
                        <Label className="text-xs font-heading">
                          URL de {item.media_type === 'video' ? 'Video' : 'Imagen'}
                        </Label>
                        <Input
                          value={item.media_url || ""}
                          onChange={(e) =>
                            updateItem(item.id, { media_url: e.target.value })
                          }
                          placeholder={item.media_type === 'video' ? 'URL del video MP4' : 'URL de la imagen'}
                          className="border-2 border-foreground"
                        />
                      </div>

                      {/* Upload button */}
                      <div>
                        <Label className="text-xs font-heading mb-2 block">O subir archivo</Label>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept={item.media_type === 'video' ? 'video/mp4' : 'image/jpeg,image/png,image/webp'}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleMediaUpload(item.id, file);
                            }}
                          />
                          <Button variant="outline" size="sm" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Subir {item.media_type === 'video' ? 'Video' : 'Imagen'}
                            </span>
                          </Button>
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.media_type === 'video' ? 'MP4, máx. 100MB' : 'JPG, PNG, WebP, máx. 10MB'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEquiposHero;
