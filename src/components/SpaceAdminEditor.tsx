import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Space } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageUploader } from "@/components/ImageUploader";
import { GalleryMediaManager } from "@/components/GalleryMediaManager";
import { useToast } from "@/hooks/use-toast";
import { Save, Edit, X, Calendar as CalendarIcon, MapPin, Clock, DollarSign, Ruler, List, Settings, GalleryHorizontal } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SpaceUnavailabilityPeriod {
  id: string;
  space_id: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export const SpaceAdminEditor = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unavailabilityPeriods, setUnavailabilityPeriods] = useState<SpaceUnavailabilityPeriod[]>([]);
  const [newPeriod, setNewPeriod] = useState({ start_date: "", end_date: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('spaces').select('*').order('order_index');
    if (!error && data) {
      const transformed = data.map((item: any) => ({
        ...item,
        images: Array.isArray(item.images) ? item.images : [],
        amenities: Array.isArray(item.amenities) ? item.amenities : [],
        features: Array.isArray(item.features) ? item.features : [],
        included_items: Array.isArray(item.included_items) ? item.included_items : [],
        optional_services: Array.isArray(item.optional_services) ? item.optional_services : [],
        specs: item.specs || {}
      }));
      setSpaces(transformed);
    }
    setLoading(false);
  };

  const fetchUnavailability = async (spaceId: string) => {
    const { data } = await supabase
      .from('space_unavailability')
      .select('*')
      .eq('space_id', spaceId)
      .order('start_date');
    if (data) setUnavailabilityPeriods(data);
  };

  const handleEdit = async (space: Space) => {
    setEditingSpace({ ...space });
    await fetchUnavailability(space.id);
  };

  const handleSave = async () => {
    if (!editingSpace) return;
    setSaving(true);

    const { error } = await supabase.from('spaces').update({
      name: editingSpace.name,
      slug: editingSpace.slug,
      description: editingSpace.description,
      detailed_description: editingSpace.detailed_description,
      price: editingSpace.price,
      promotion: editingSpace.promotion,
      images: editingSpace.images,
      amenities: editingSpace.amenities,
      specs: editingSpace.specs,
      hero_title: editingSpace.hero_title,
      hero_subtitle: editingSpace.hero_subtitle,
      block_price: editingSpace.block_price,
      block_hours: editingSpace.block_hours,
      schedule_weekday: editingSpace.schedule_weekday,
      schedule_weekend: editingSpace.schedule_weekend,
      discount_text: editingSpace.discount_text,
      surface_area: editingSpace.surface_area,
      features: editingSpace.features,
      included_items: editingSpace.included_items,
      optional_services: editingSpace.optional_services,
      layout_description: editingSpace.layout_description,
      location: editingSpace.location,
      featured_image: editingSpace.featured_image,
      tour_360_url: editingSpace.tour_360_url,
      cta_text: editingSpace.cta_text,
      video_url: editingSpace.video_url
    }).eq('id', editingSpace.id);

    setSaving(false);

    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✓ GUARDADO", description: "Espacio actualizado correctamente" });
      setEditingSpace(null);
      fetchSpaces();
    }
  };

  const handleAddUnavailability = async () => {
    if (!editingSpace || !newPeriod.start_date || !newPeriod.end_date) {
      toast({ title: "ERROR", description: "Ambas fechas son requeridas", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('space_unavailability').insert({
      space_id: editingSpace.id,
      start_date: newPeriod.start_date,
      end_date: newPeriod.end_date
    });

    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "AGREGADO", description: "Periodo agregado" });
      setNewPeriod({ start_date: "", end_date: "" });
      fetchUnavailability(editingSpace.id);
    }
  };

  const handleDeleteUnavailability = async (periodId: string) => {
    if (!confirm("¿Eliminar este periodo?")) return;
    await supabase.from('space_unavailability').delete().eq('id', periodId);
    if (editingSpace) fetchUnavailability(editingSpace.id);
  };

  const updateEditingField = (field: keyof Space, value: any) => {
    if (editingSpace) {
      setEditingSpace({ ...editingSpace, [field]: value });
    }
  };

  const updateArrayField = (field: keyof Space, text: string) => {
    if (editingSpace) {
      const arr = text.split('\n').filter(line => line.trim());
      setEditingSpace({ ...editingSpace, [field]: arr });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando espacios...</div>;
  }

  if (editingSpace) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold">Editar: {editingSpace.name}</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditingSpace(null)}>
              <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
            <Button variant="hero" onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" /> {saving ? "Guardando..." : "Guardar Todo"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="hero" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="pricing">Precios</TabsTrigger>
            <TabsTrigger value="features">Características</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="images">Imágenes</TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-1">
              <GalleryHorizontal className="h-3 w-3" />
              Media
            </TabsTrigger>
            <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
          </TabsList>

          {/* Hero Tab */}
          <TabsContent value="hero" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" /> Configuración del Hero
                </CardTitle>
                <CardDescription>Título, subtítulo y texto destacado del hero</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título del Hero</Label>
                    <Input 
                      value={editingSpace.hero_title || ''} 
                      onChange={(e) => updateEditingField('hero_title', e.target.value)}
                      placeholder="ESTUDIO GALERÍA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtítulo del Hero</Label>
                    <Input 
                      value={editingSpace.hero_subtitle || ''} 
                      onChange={(e) => updateEditingField('hero_subtitle', e.target.value)}
                      placeholder="BLOQUES DE 4HS PARA TU PRODUCCIÓN"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ubicación</Label>
                    <Input 
                      value={editingSpace.location || ''} 
                      onChange={(e) => updateEditingField('location', e.target.value)}
                      placeholder="Florida, Vicente López"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Texto del Botón CTA</Label>
                    <Input 
                      value={editingSpace.cta_text || ''} 
                      onChange={(e) => updateEditingField('cta_text', e.target.value)}
                      placeholder="RESERVAR BLOQUE"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descripción corta</Label>
                  <Textarea 
                    value={editingSpace.description || ''} 
                    onChange={(e) => updateEditingField('description', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descripción detallada</Label>
                  <Textarea 
                    value={editingSpace.detailed_description || ''} 
                    onChange={(e) => updateEditingField('detailed_description', e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" /> Precios y Horarios
                </CardTitle>
                <CardDescription>Configuración de bloques, precios y horarios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Precio por Bloque ($)</Label>
                    <Input 
                      type="number"
                      value={editingSpace.block_price || 0} 
                      onChange={(e) => updateEditingField('block_price', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Horas por Bloque</Label>
                    <Input 
                      type="number"
                      value={editingSpace.block_hours || 4} 
                      onChange={(e) => updateEditingField('block_hours', parseInt(e.target.value) || 4)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Superficie</Label>
                    <Input 
                      value={editingSpace.surface_area || ''} 
                      onChange={(e) => updateEditingField('surface_area', e.target.value)}
                      placeholder="150 m²"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Horario entre semana</Label>
                    <Input 
                      value={editingSpace.schedule_weekday || ''} 
                      onChange={(e) => updateEditingField('schedule_weekday', e.target.value)}
                      placeholder="Lunes a viernes de 9 a 18 hs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fines de semana / Fuera de horario</Label>
                    <Input 
                      value={editingSpace.schedule_weekend || ''} 
                      onChange={(e) => updateEditingField('schedule_weekend', e.target.value)}
                      placeholder="A consultar"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Texto de descuento / Promoción</Label>
                  <Input 
                    value={editingSpace.discount_text || ''} 
                    onChange={(e) => updateEditingField('discount_text', e.target.value)}
                    placeholder="20% de descuento en equipamiento adicional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Promoción destacada (opcional)</Label>
                  <Textarea 
                    value={editingSpace.promotion || ''} 
                    onChange={(e) => updateEditingField('promotion', e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Ruler className="h-4 w-4" /> Características del Espacio
                  </CardTitle>
                  <CardDescription>Una por línea</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    value={(editingSpace.features || []).join('\n')}
                    onChange={(e) => updateArrayField('features', e.target.value)}
                    rows={8}
                    placeholder="Infinito blanco 6 m x 3 m&#10;Tiro de cámara 11 m&#10;Altura 3 m"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <List className="h-4 w-4" /> Items Incluidos
                  </CardTitle>
                  <CardDescription>Una por línea</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    value={(editingSpace.included_items || []).join('\n')}
                    onChange={(e) => updateArrayField('included_items', e.target.value)}
                    rows={8}
                    placeholder="3 fresneles 1K dimerizables&#10;16 tubos frontal/cenital&#10;Infinito blanco"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="h-4 w-4" /> Servicios Opcionales
                  </CardTitle>
                  <CardDescription>Una por línea</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    value={(editingSpace.optional_services || []).join('\n')}
                    onChange={(e) => updateArrayField('optional_services', e.target.value)}
                    rows={8}
                    placeholder="Tablero trifásico&#10;Streaming&#10;Podcast"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> Layout y Tour 360°
                </CardTitle>
                <CardDescription>Descripción del espacio físico y configuración del tour</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Descripción del Layout</Label>
                  <Textarea 
                    value={editingSpace.layout_description || ''} 
                    onChange={(e) => updateEditingField('layout_description', e.target.value)}
                    rows={4}
                    placeholder="El estudio cuenta con depósitos, montacargas, sala de locución..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL del Tour 360°</Label>
                  <Input 
                    value={editingSpace.tour_360_url || ''} 
                    onChange={(e) => updateEditingField('tour_360_url', e.target.value)}
                    placeholder="/images/360-studio.jpg"
                  />
                  <p className="text-xs text-muted-foreground">Ruta a la imagen 360° o URL externa del tour</p>
                </div>
                <div className="space-y-2">
                  <Label>URL del Video Vertical (Hero Galería)</Label>
                  <Input 
                    value={editingSpace.video_url || ''} 
                    onChange={(e) => updateEditingField('video_url', e.target.value)}
                    placeholder="https://ejemplo.com/video.mp4"
                  />
                  <p className="text-xs text-muted-foreground">URL del video vertical para el hero de la galería (formato 9:16)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Imagen Destacada</CardTitle>
                <CardDescription>La imagen del cuerpo de la página se obtiene del primer item en el panel Media</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Imagen Destacada (Featured)</Label>
                  <Input 
                    value={editingSpace.featured_image || ''} 
                    onChange={(e) => updateEditingField('featured_image', e.target.value)}
                    placeholder="URL de la imagen destacada"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nota: Si deseas cambiar la imagen que aparece en el cuerpo de la página, usa el panel "Media" y reordena las imágenes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab - Gallery Management */}
          <TabsContent value="media" className="space-y-4">
            <GalleryMediaManager 
              spaceSlug={editingSpace.slug === 'galeria' ? 'galeria' : 'sala-grabacion'}
              spaceName={editingSpace.name}
              spaceId={editingSpace.id}
            />
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" /> Periodos de No Disponibilidad
                </CardTitle>
                <CardDescription>Bloquea fechas cuando el espacio no esté disponible</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha Inicio</Label>
                    <Input 
                      type="date"
                      value={newPeriod.start_date}
                      onChange={(e) => setNewPeriod({ ...newPeriod, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha Fin</Label>
                    <Input 
                      type="date"
                      value={newPeriod.end_date}
                      onChange={(e) => setNewPeriod({ ...newPeriod, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <Button variant="outline" onClick={handleAddUnavailability}>
                  <CalendarIcon className="mr-2 h-4 w-4" /> Agregar Periodo
                </Button>

                {unavailabilityPeriods.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <Label>Periodos Bloqueados:</Label>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {unavailabilityPeriods.map((period) => (
                        <div 
                          key={period.id} 
                          className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                        >
                          <span>
                            Del {format(new Date(period.start_date), 'dd/MM/yyyy', { locale: es })} al{' '}
                            {format(new Date(period.end_date), 'dd/MM/yyyy', { locale: es })}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteUnavailability(period.id)}
                            className="h-6 w-6"
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-heading font-bold">Espacios de Alquiler</h2>
      <p className="text-muted-foreground">Administra Galería y Sala de Grabación con todo su contenido</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {spaces.map((space) => (
          <Card key={space.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{space.name}</CardTitle>
              <CardDescription>{space.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-primary" />
                  ${(space.block_price || space.price)?.toLocaleString()} / bloque
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {space.block_hours || 4} hs
                </span>
              </div>
              {space.surface_area && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Ruler className="h-4 w-4" />
                  {space.surface_area}
                </div>
              )}
              <Button onClick={() => handleEdit(space)} className="w-full">
                <Edit className="mr-2 h-4 w-4" /> Editar Contenido
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
