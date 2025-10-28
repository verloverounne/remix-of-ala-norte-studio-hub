import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Equipment, EquipmentWithCategory, EquipmentStatus } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Package } from "lucide-react";

const Admin = () => {
  const [equipment, setEquipment] = useState<EquipmentWithCategory[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<EquipmentWithCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; equipmentId: string; currentStatus: EquipmentStatus; newStatus: EquipmentStatus; } | null>(null);
  const { toast } = useToast();

  useEffect(() => { fetchEquipment(); }, []);
  useEffect(() => {
    const filtered = equipment.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.brand?.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredEquipment(filtered);
  }, [searchTerm, equipment]);

  const fetchEquipment = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('equipment').select(`*, categories (*)`).order('name');
    if (!error && data) { setEquipment(data); setFilteredEquipment(data); }
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
            <TabsList className="grid w-full grid-cols-4 lg:w-auto">
              <TabsTrigger value="equipment">Equipos</TabsTrigger>
              <TabsTrigger value="prices">Precios</TabsTrigger>
              <TabsTrigger value="backup">Backup</TabsTrigger>
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
                          {Object.entries(categoryNames).map(([key, name]) => (
                            <SelectItem key={key} value={key}>
                              {name}
                            </SelectItem>
                          ))}
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
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-16 h-16 rounded object-cover"
                          />
                          <div>
                            <h4 className="font-semibold">{item.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">
                                {categoryNames[item.category]}
                              </Badge>
                              <Badge className={statusColors[item.status]}>
                                {statusNames[item.status]}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
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
            <TabsContent value="prices">
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
            </TabsContent>

            {/* Backup Tab */}
            <TabsContent value="backup" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Descargar Backup</CardTitle>
                  <CardDescription>
                    Descarga todos los datos en formato JSON
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="hero" onClick={handleDownloadBackup}>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Backup
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Restaurar desde Backup</CardTitle>
                  <CardDescription>
                    Sube un archivo de backup para restaurar los datos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Archivo
                  </Button>
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
    </div>
  );
};

export default Admin;
