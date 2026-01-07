import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Plus, GripVertical, Save, ImageIcon } from "lucide-react";
import { ImageUploadButton } from "@/components/ImageUploadButton";

interface HomeService {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  button_text: string | null;
  button_link: string | null;
  order_index: number;
  is_active: boolean;
}

export const HomeServicesPanel = () => {
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
      setServices(data);
    } else {
      toast.error("Error al cargar servicios");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddService = async () => {
    const newService = {
      title: "Nuevo Servicio",
      description: "",
      order_index: services.length,
      is_active: true,
    };

    const { data, error } = await supabase
      .from("home_services")
      .insert(newService)
      .select()
      .single();

    if (!error && data) {
      setServices([...services, data]);
      toast.success("Servicio agregado");
    } else {
      toast.error("Error al agregar servicio");
    }
  };

  const handleUpdateService = async (id: string, updates: Partial<HomeService>) => {
    const { error } = await supabase
      .from("home_services")
      .update(updates)
      .eq("id", id);

    if (!error) {
      setServices(services.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    } else {
      toast.error("Error al actualizar");
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

    // Update order_index for both
    const updates = updated.map((s, i) => ({ ...s, order_index: i }));
    setServices(updates);

    // Save to DB
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
          button_text: service.button_text,
          button_link: service.button_link,
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

  const handleImageUpload = (serviceId: string, imageUrl: string) => {
    handleUpdateService(serviceId, { image_url: imageUrl });
    toast.success("Imagen actualizada");
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
        <h3 className="font-heading text-xl sm:text-2xl uppercase">
          Servicios del Home
        </h3>
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
                        setServices(
                          services.map((s) =>
                            s.id === service.id ? { ...s, is_active: checked } : s
                          )
                        )
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-heading">Título</Label>
                    <Input
                      value={service.title}
                      onChange={(e) =>
                        setServices(
                          services.map((s) =>
                            s.id === service.id ? { ...s, title: e.target.value } : s
                          )
                        )
                      }
                      className="border-2 border-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-heading">Descripción</Label>
                    <Textarea
                      value={service.description || ""}
                      onChange={(e) =>
                        setServices(
                          services.map((s) =>
                            s.id === service.id
                              ? { ...s, description: e.target.value }
                              : s
                          )
                        )
                      }
                      className="border-2 border-foreground min-h-[100px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs font-heading">Texto Botón</Label>
                      <Input
                        value={service.button_text || ""}
                        onChange={(e) =>
                          setServices(
                            services.map((s) =>
                              s.id === service.id
                                ? { ...s, button_text: e.target.value }
                                : s
                            )
                          )
                        }
                        placeholder="Ej: Ver más"
                        className="border-2 border-foreground"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-heading">Link Botón</Label>
                      <Input
                        value={service.button_link || ""}
                        onChange={(e) =>
                          setServices(
                            services.map((s) =>
                              s.id === service.id
                                ? { ...s, button_link: e.target.value }
                                : s
                            )
                          )
                        }
                        placeholder="Ej: /equipos"
                        className="border-2 border-foreground"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-heading">Imagen</Label>
                  <div className="border-2 border-dashed border-foreground/50 rounded-lg p-4 aspect-video flex items-center justify-center bg-muted/30 overflow-hidden">
                    {service.image_url ? (
                      <img
                        src={service.image_url}
                        alt={service.title}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">Sin imagen</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={service.image_url || ""}
                      onChange={(e) =>
                        setServices(
                          services.map((s) =>
                            s.id === service.id
                              ? { ...s, image_url: e.target.value }
                              : s
                          )
                        )
                      }
                      placeholder="URL de imagen"
                      className="border-2 border-foreground text-xs"
                    />
                    <ImageUploadButton
                      onUploadComplete={(url) => handleImageUpload(service.id, url)}
                      size="sm"
                    />
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

export default HomeServicesPanel;
