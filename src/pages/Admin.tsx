import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Equipment, EquipmentWithCategory, EquipmentStatus, Category, Subcategory, Space } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Percent } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";

const Admin = () => {
  const [equipment, setEquipment] = useState<EquipmentWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Equipment form state
  const [newEquipment, setNewEquipment] = useState({
    name: "", name_en: "", category_id: "", subcategory_id: "", brand: "", model: "",
    description: "", price_per_day: "", price_per_week: "", image_url: "", images: [] as string[]
  });
  
  // Space form state
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  
  const { toast } = useToast();

  useEffect(() => { 
    fetchAll(); 
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchEquipment(), fetchCategories(), fetchSubcategories(), fetchSpaces()]);
    setLoading(false);
  };

  const fetchEquipment = async () => {
    const { data } = await supabase.from('equipment').select(`*, categories (*), subcategories (*)`).order('name');
    if (data) {
      const transformed = data.map((item: any) => ({
        ...item,
        images: Array.isArray(item.images) ? item.images : []
      }));
      setEquipment(transformed);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('order_index');
    if (data) setCategories(data);
  };

  const fetchSubcategories = async () => {
    const { data } = await supabase.from('subcategories').select('*').order('order_index');
    if (data) setSubcategories(data);
  };

  const fetchSpaces = async () => {
    const { data } = await supabase.from('spaces').select('*').order('order_index');
    if (data) {
      const transformed = data.map((item: any) => ({
        ...item,
        images: Array.isArray(item.images) ? item.images : [],
        amenities: Array.isArray(item.amenities) ? item.amenities : [],
        specs: item.specs || {}
      }));
      setSpaces(transformed);
    }
  };

  const handleCreateEquipment = async () => {
    if (!newEquipment.name || !newEquipment.price_per_day) {
      toast({ title: "ERROR", description: "Nombre y precio son requeridos", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('equipment').insert({
      name: newEquipment.name,
      name_en: newEquipment.name_en || null,
      category_id: newEquipment.category_id || null,
      subcategory_id: newEquipment.subcategory_id || null,
      brand: newEquipment.brand || null,
      model: newEquipment.model || null,
      description: newEquipment.description || null,
      price_per_day: parseInt(newEquipment.price_per_day),
      price_per_week: newEquipment.price_per_week ? parseInt(newEquipment.price_per_week) : null,
      image_url: newEquipment.image_url || null,
      images: newEquipment.images,
      status: 'available'
    });

    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "CREADO", description: "Equipo creado correctamente" });
      setNewEquipment({
        name: "", name_en: "", category_id: "", subcategory_id: "", brand: "", model: "",
        description: "", price_per_day: "", price_per_week: "", image_url: "", images: []
      });
      fetchEquipment();
    }
  };

  const handleDeleteEquipment = async (id: string) => {
    if (!confirm("¿Eliminar este equipo?")) return;
    const { error } = await supabase.from('equipment').delete().eq('id', id);
    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "ELIMINADO", description: "Equipo eliminado" });
      fetchEquipment();
    }
  };

  const handleUpdateSpace = async (space: Space) => {
    const { error } = await supabase.from('spaces').update({
      name: space.name,
      description: space.description,
      price: space.price,
      promotion: space.promotion
    }).eq('id', space.id);

    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "ACTUALIZADO", description: "Espacio actualizado" });
      setEditingSpace(null);
      fetchSpaces();
    }
  };

  const filteredSubcategories = newEquipment.category_id 
    ? subcategories.filter(s => s.category_id === newEquipment.category_id)
    : [];

  return (
    <div className="min-h-screen pt-16 bg-muted/30">
      <section className="gradient-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-heading font-bold mb-2">Panel de Administración</h1>
          <p className="text-lg">Gestiona equipos, espacios y configuraciones</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="equipment" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto">
              <TabsTrigger value="equipment">Equipos</TabsTrigger>
              <TabsTrigger value="prices">Precios</TabsTrigger>
              <TabsTrigger value="spaces">Espacios</TabsTrigger>
              <TabsTrigger value="config">Config</TabsTrigger>
            </TabsList>

            {/* Equipment Tab */}
            <TabsContent value="equipment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agregar Nuevo Equipo</CardTitle>
                  <CardDescription>Completa el formulario para agregar un equipo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre *</Label>
                      <Input value={newEquipment.name} onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Nombre EN</Label>
                      <Input value={newEquipment.name_en} onChange={(e) => setNewEquipment({...newEquipment, name_en: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoría</Label>
                      <Select value={newEquipment.category_id} onValueChange={(v) => setNewEquipment({...newEquipment, category_id: v, subcategory_id: ""})}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Subcategoría</Label>
                      <Select value={newEquipment.subcategory_id} onValueChange={(v) => setNewEquipment({...newEquipment, subcategory_id: v})}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                          {filteredSubcategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Marca</Label>
                      <Input value={newEquipment.brand} onChange={(e) => setNewEquipment({...newEquipment, brand: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Modelo</Label>
                      <Input value={newEquipment.model} onChange={(e) => setNewEquipment({...newEquipment, model: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Precio por día *</Label>
                      <Input type="number" value={newEquipment.price_per_day} onChange={(e) => setNewEquipment({...newEquipment, price_per_day: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Precio por semana</Label>
                      <Input type="number" value={newEquipment.price_per_week} onChange={(e) => setNewEquipment({...newEquipment, price_per_week: e.target.value})} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Descripción</Label>
                      <Textarea value={newEquipment.description} onChange={(e) => setNewEquipment({...newEquipment, description: e.target.value})} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Imagen Principal (URL)</Label>
                      <Input value={newEquipment.image_url} onChange={(e) => setNewEquipment({...newEquipment, image_url: e.target.value})} placeholder="https://..." />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Imágenes Adicionales</Label>
                      <ImageUploader 
                        images={newEquipment.images}
                        onChange={(images) => setNewEquipment({...newEquipment, images})}
                        maxImages={10}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateEquipment} className="mt-4" variant="hero">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Equipo
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lista de Equipos</CardTitle>
                  <CardDescription>{equipment.length} equipos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {equipment.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-4">
                          <img src={item.image_url || "/placeholder.svg"} alt={item.name} className="w-12 h-12 rounded object-cover" />
                          <div>
                            <p className="font-heading">{item.name}</p>
                            <div className="flex gap-2 mt-1">
                              {item.subcategories && <Badge variant="outline" className="text-xs">{item.subcategories.name}</Badge>}
                              <Badge variant={item.status === 'available' ? 'success' : 'destructive'} className="text-xs">{item.status}</Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEquipment(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Prices Tab */}
            <TabsContent value="prices" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Actualización Masiva de Precios</CardTitle>
                  <CardDescription>Aplica porcentaje a todos los equipos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Porcentaje</Label>
                      <Input type="number" placeholder="10" step="0.1" />
                    </div>
                    <Button variant="hero">
                      <Percent className="mr-2 h-4 w-4" />
                      Aplicar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">10 = +10%, -5 = -5%</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Editar Precios Individuales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {equipment.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 border rounded">
                        <p className="flex-1 font-heading">{item.name}</p>
                        <Input type="number" defaultValue={item.price_per_day} className="w-32" />
                        <Button size="sm">Actualizar</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Spaces Tab */}
            <TabsContent value="spaces">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Espacios</CardTitle>
                  <CardDescription>Edita precios, descripciones y promociones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {spaces.map((space) => (
                    <div key={space.id} className="border p-4 rounded">
                      <h4 className="font-heading text-lg mb-4">{space.name}</h4>
                      {editingSpace?.id === space.id ? (
                        <div className="space-y-3">
                          <div>
                            <Label>Precio</Label>
                            <Input 
                              type="number"
                              value={editingSpace.price} 
                              onChange={(e) => setEditingSpace({...editingSpace, price: parseInt(e.target.value)})}
                            />
                          </div>
                          <div>
                            <Label>Descripción</Label>
                            <Textarea 
                              value={editingSpace.description || ''} 
                              onChange={(e) => setEditingSpace({...editingSpace, description: e.target.value})}
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label>Promoción</Label>
                            <Input 
                              value={editingSpace.promotion || ''} 
                              onChange={(e) => setEditingSpace({...editingSpace, promotion: e.target.value})}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handleUpdateSpace(editingSpace)}>Guardar</Button>
                            <Button variant="outline" onClick={() => setEditingSpace(null)}>Cancelar</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">${space.price.toLocaleString()}</p>
                          <p className="text-sm">{space.description}</p>
                          {space.promotion && <p className="text-sm text-primary">{space.promotion}</p>}
                          <Button size="sm" onClick={() => setEditingSpace(space)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Config Tab */}
            <TabsContent value="config">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración General</CardTitle>
                  <CardDescription>Datos de contacto y mensajes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <Input placeholder="+54 11 1234-5678" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="info@alanorte.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Mensaje adicional</Label>
                    <Textarea placeholder="Mensaje para cotizaciones..." rows={4} />
                  </div>
                  <Button variant="hero">Guardar Configuración</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Admin;
