import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Equipment, EquipmentWithCategory, EquipmentStatus } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Package, Plus, Edit, Trash2, Percent, Download, Upload } from "lucide-react";

const Admin = () => {
  const [equipment, setEquipment] = useState<EquipmentWithCategory[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<EquipmentWithCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; equipmentId: string; currentStatus: EquipmentStatus; newStatus: EquipmentStatus; } | null>(null);
  const [editDialog, setEditDialog] = useState<{ open: boolean; equipment: EquipmentWithCategory | null }>({ open: false, equipment: null });
  const { toast } = useToast();

  useEffect(() => { fetchEquipment(); }, []);
  useEffect(() => {
    const filtered = equipment.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.brand?.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredEquipment(filtered);
  }, [searchTerm, equipment]);

  const fetchEquipment = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('equipment').select(`*, categories (*), subcategories (*)`).order('name');
    if (!error && data) { 
      const transformedData = data.map((item: any) => ({
        ...item,
        images: Array.isArray(item.images) ? item.images : []
      }));
      setEquipment(transformedData); 
      setFilteredEquipment(transformedData); 
    }
    setLoading(false);
  };

  const handleStatusToggle = (equipmentId: string, currentStatus: EquipmentStatus) => {
    const newStatus: EquipmentStatus = currentStatus === 'available' ? 'rented' : 'available';
    setConfirmDialog({ open: true, equipmentId, currentStatus, newStatus });
  };

  const confirmStatusChange = async () => {
    if (!confirmDialog) return;
    const { equipmentId, newStatus } = confirmDialog;
    const { error } = await supabase.from('equipment').update({ status: newStatus }).eq('id', equipmentId);
    if (error) { toast({ title: "ERROR", description: "No se pudo actualizar", variant: "destructive" }); }
    else { toast({ title: "ACTUALIZADO", description: `Estado: ${newStatus === 'available' ? 'DISPONIBLE' : 'RENTADO'}` }); fetchEquipment(); }
    setConfirmDialog(null);
  };

  const getStatusBadge = (status: EquipmentStatus) => {
    const config = { available: { text: "DISPONIBLE", variant: "success" as const }, rented: { text: "RENTADO", variant: "destructive" as const }, maintenance: { text: "MANTENIMIENTO", variant: "outline" as const } };
    return config[status];
  };

  const handleEdit = (item: EquipmentWithCategory) => {
    setEditDialog({ open: true, equipment: item });
  };

  const handleDelete = async (equipmentId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este equipo?")) return;
    const { error } = await supabase.from('equipment').delete().eq('id', equipmentId);
    if (error) {
      toast({ title: "ERROR", description: "No se pudo eliminar", variant: "destructive" });
    } else {
      toast({ title: "ELIMINADO", description: "Equipo eliminado correctamente" });
      fetchEquipment();
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-muted/30">
      {/* Header */}
      <section className="gradient-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-heading font-bold mb-2">Panel de Administración</h1>
          <p className="text-lg">Gestiona equipos, precios y configuraciones</p>
        </div>
      </section>

      {/* Admin Tabs */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="equipment" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto">
              <TabsTrigger value="equipment">Equipos</TabsTrigger>
              <TabsTrigger value="prices">Precios</TabsTrigger>
              <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
              <TabsTrigger value="spaces">Espacios</TabsTrigger>
              <TabsTrigger value="config">Config</TabsTrigger>
            </TabsList>

            {/* Equipment Tab */}
            <TabsContent value="equipment" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Agregar Nuevo Equipo</CardTitle>
                      <CardDescription>
                        Completa el formulario para agregar un equipo al inventario
                      </CardDescription>
                    </div>
                    <Button variant="hero">
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre del equipo</Label>
                      <Input id="name" placeholder="Sony FX6" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoría</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cameras">Cámaras</SelectItem>
                          <SelectItem value="lenses">Lentes</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="lighting">Iluminación</SelectItem>
                          <SelectItem value="grip">Grip</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Marca</Label>
                      <Input id="brand" placeholder="Sony" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Modelo</Label>
                      <Input id="model" placeholder="FX6" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priceDay">Precio por día</Label>
                      <Input id="priceDay" type="number" placeholder="25000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priceWeek">Precio por semana</Label>
                      <Input id="priceWeek" type="number" placeholder="150000" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        placeholder="Descripción del equipo..."
                      />
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Equipment List */}
              <Card>
                <CardHeader>
                  <CardTitle>Lista de Equipos</CardTitle>
                  <CardDescription>
                    {equipment.length} equipos en el inventario
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {equipment.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                           <img
                            src={item.image_url || "/placeholder.svg"}
                            alt={item.name}
                            className="w-16 h-16 rounded object-cover border-2 border-foreground"
                          />
                          <div>
                            <h4 className="font-semibold">{item.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">
                                {item.categories?.name || "Sin categoría"}
                              </Badge>
                              <Badge variant={getStatusBadge(item.status).variant}>
                                {getStatusBadge(item.status).text}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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
                  <CardDescription>
                    Aplica un porcentaje de aumento o descuento a todos los equipos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="percentage">Porcentaje de cambio</Label>
                      <Input
                        id="percentage"
                        type="number"
                        placeholder="10"
                        step="0.1"
                      />
                    </div>
                    <Button variant="hero">
                      <Percent className="mr-2 h-4 w-4" />
                      Aplicar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ejemplo: 10 = aumento del 10%, -5 = descuento del 5%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Editar Precios Individuales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {equipment.length > 0 ? equipment.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 border rounded">
                        <p className="flex-1 font-heading">{item.name}</p>
                        <Input type="number" defaultValue={item.price_per_day} className="w-32" />
                        <Button size="sm">Actualizar</Button>
                      </div>
                    )) : <p className="text-muted-foreground">No hay equipos cargados</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Availability Tab */}
            <TabsContent value="availability">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Disponibilidad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {equipment.length > 0 ? equipment.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <p className="font-heading">{item.name}</p>
                          <Badge>{item.status}</Badge>
                        </div>
                        <Select defaultValue={item.status}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Disponible</SelectItem>
                            <SelectItem value="rented">Rentado</SelectItem>
                            <SelectItem value="maintenance">Mantenimiento</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )) : <p className="text-muted-foreground">No hay equipos cargados</p>}
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
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="border p-4 rounded">
                      <h4 className="font-heading text-lg mb-4">GALERÍA DE FILMACIÓN</h4>
                      <div className="space-y-3">
                        <Input placeholder="Precio" defaultValue="70000" />
                        <Textarea placeholder="Descripción" rows={3} />
                        <Input placeholder="Promoción" defaultValue="20% descuento en equipos" />
                        <Button>Guardar</Button>
                      </div>
                    </div>
                    <div className="border p-4 rounded">
                      <h4 className="font-heading text-lg mb-4">SALA DE SONIDO</h4>
                      <div className="space-y-3">
                        <Input placeholder="Precio" defaultValue="50000" />
                        <Textarea placeholder="Descripción" rows={3} />
                        <Button>Guardar</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Config Tab */}
            <TabsContent value="config">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración General</CardTitle>
                  <CardDescription>
                    Configura los datos de contacto y mensajes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">Número de WhatsApp</Label>
                    <Input id="whatsapp" placeholder="+54 11 1234-5678" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email de cotizaciones</Label>
                    <Input id="email" type="email" placeholder="info@alanorte.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje adicional para cotizaciones</Label>
                    <Textarea
                      id="message"
                      placeholder="Mensaje que se incluirá en las cotizaciones..."
                      rows={4}
                    />
                  </div>
                  <Button variant="hero">Guardar Configuración</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Edit Dialog */}
      <AlertDialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, equipment: null })}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Editar Equipo</AlertDialogTitle>
            <AlertDialogDescription>
              Modifica los datos del equipo: {editDialog.equipment?.name}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input 
                id="edit-name" 
                defaultValue={editDialog.equipment?.name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-brand">Marca</Label>
              <Input 
                id="edit-brand" 
                defaultValue={editDialog.equipment?.brand || ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-model">Modelo</Label>
              <Input 
                id="edit-model" 
                defaultValue={editDialog.equipment?.model || ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea 
                id="edit-description" 
                rows={3}
                defaultValue={editDialog.equipment?.description || ''}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Precio por día</Label>
                <Input 
                  id="edit-price" 
                  type="number"
                  defaultValue={editDialog.equipment?.price_per_day}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price-week">Precio por semana</Label>
                <Input 
                  id="edit-price-week" 
                  type="number"
                  defaultValue={editDialog.equipment?.price_per_week || ''}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image-url">URL de Imagen</Label>
              <Input 
                id="edit-image-url" 
                defaultValue={editDialog.equipment?.image_url || ''}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-specs">Especificaciones (JSON)</Label>
              <Textarea 
                id="edit-specs" 
                rows={4}
                defaultValue={JSON.stringify(editDialog.equipment?.specs || [], null, 2)}
                placeholder='["Especificación 1", "Especificación 2"]'
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              toast({ title: "ACTUALIZADO", description: "Equipo actualizado (demo)" });
              setEditDialog({ open: false, equipment: null });
            }}>
              Guardar Cambios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={confirmDialog?.open || false} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cambio de estado</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de cambiar el estado a {confirmDialog?.newStatus === 'available' ? 'DISPONIBLE' : 'RENTADO'}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
