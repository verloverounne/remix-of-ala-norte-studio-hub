import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Check, Image as ImageIcon, Save, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Equipment {
  id: string;
  name: string;
  image_url: string | null;
}

interface StorageFile {
  name: string;
  url: string;
}

export const BulkImageAssigner = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [storageFiles, setStorageFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEquipment, setSearchEquipment] = useState("");
  const [searchImage, setSearchImage] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchEquipment(), fetchStorageFiles()]);
    setLoading(false);
  };

  const fetchEquipment = async () => {
    const { data } = await supabase
      .from('equipment')
      .select('id, name, image_url')
      .order('name');
    if (data) setEquipment(data);
  };

  const fetchStorageFiles = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('equipment-images')
        .list('', { limit: 500, sortBy: { column: 'name', order: 'asc' } });

      if (error) throw error;

      const imageFiles = (data || [])
        .filter(file => file.name && /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name))
        .map(file => ({
          name: file.name,
          url: `https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/${file.name}`
        }));

      setStorageFiles(imageFiles);
    } catch (error) {
      console.error('Error fetching storage files:', error);
    }
  };

  const filteredEquipment = equipment.filter(e => 
    e.name.toLowerCase().includes(searchEquipment.toLowerCase())
  );

  const filteredImages = storageFiles.filter(f => 
    f.name.toLowerCase().includes(searchImage.toLowerCase())
  );

  const handleSelectImage = (imageUrl: string) => {
    if (!selectedEquipment) {
      toast({ title: "Selecciona un equipo primero", variant: "destructive" });
      return;
    }
    
    setPendingChanges(prev => ({
      ...prev,
      [selectedEquipment.id]: imageUrl
    }));
    
    // Actualizar en la lista local para ver el preview
    setEquipment(prev => prev.map(e => 
      e.id === selectedEquipment.id ? { ...e, image_url: imageUrl } : e
    ));
    
    toast({ 
      title: "Imagen seleccionada", 
      description: `Imagen asignada a ${selectedEquipment.name}. Guarda los cambios cuando termines.` 
    });
  };

  const handleSaveChanges = async () => {
    const changes = Object.entries(pendingChanges);
    if (changes.length === 0) {
      toast({ title: "No hay cambios pendientes", variant: "destructive" });
      return;
    }

    setSaving(true);
    let successCount = 0;
    let errorCount = 0;

    for (const [equipmentId, imageUrl] of changes) {
      const { error } = await supabase
        .from('equipment')
        .update({ image_url: imageUrl })
        .eq('id', equipmentId);

      if (error) {
        errorCount++;
      } else {
        successCount++;
      }
    }

    setSaving(false);
    setPendingChanges({});

    if (errorCount === 0) {
      toast({ 
        title: "Cambios guardados", 
        description: `${successCount} equipos actualizados correctamente` 
      });
    } else {
      toast({ 
        title: "Algunos errores", 
        description: `${successCount} exitosos, ${errorCount} errores`,
        variant: "destructive"
      });
    }

    fetchEquipment();
  };

  const handleDeleteEquipment = async (eq: Equipment) => {
    setDeleting(eq.id);
    
    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', eq.id);

    setDeleting(null);

    if (error) {
      toast({ 
        title: "Error al eliminar", 
        description: error.message,
        variant: "destructive" 
      });
      return;
    }

    // Remover de la lista local
    setEquipment(prev => prev.filter(e => e.id !== eq.id));
    
    // Si estaba seleccionado, deseleccionar
    if (selectedEquipment?.id === eq.id) {
      setSelectedEquipment(null);
    }

    // Remover cambios pendientes si existían
    if (pendingChanges[eq.id]) {
      const { [eq.id]: _, ...rest } = pendingChanges;
      setPendingChanges(rest);
    }

    toast({ 
      title: "Equipo eliminado", 
      description: `${eq.name} ha sido eliminado correctamente` 
    });
  };

  const getEffectiveImageUrl = (eq: Equipment | null) => {
    if (!eq) return null;
    return pendingChanges[eq.id] || eq.image_url;
  };

  const hasImage = (eq: Equipment) => {
    const url = getEffectiveImageUrl(eq);
    return url && url.includes('equipment-images');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p>Cargando datos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Asignar Imágenes a Equipos</CardTitle>
              <CardDescription>
                Selecciona un equipo a la izquierda, luego haz clic en una imagen a la derecha para asignarla
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {Object.keys(pendingChanges).length > 0 && (
                <Badge variant="secondary">{Object.keys(pendingChanges).length} cambios pendientes</Badge>
              )}
              <Button 
                onClick={handleSaveChanges} 
                disabled={Object.keys(pendingChanges).length === 0 || saving}
                variant="hero"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Equipos Column */}
            <div className="space-y-2">
              <h3 className="font-heading font-bold text-lg">Equipos</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar equipo..."
                  value={searchEquipment}
                  onChange={(e) => setSearchEquipment(e.target.value)}
                  className="pl-10"
                />
              </div>
              <ScrollArea className="h-[500px] border rounded-md">
                <div className="p-2 space-y-1">
                  {filteredEquipment.map((eq) => (
                    <div
                      key={eq.id}
                      className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-md transition-colors",
                        selectedEquipment?.id === eq.id 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted",
                        pendingChanges[eq.id] && "ring-2 ring-primary"
                      )}
                    >
                      <button
                        onClick={() => setSelectedEquipment(eq)}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left"
                      >
                        <div className="w-12 h-12 rounded bg-muted overflow-hidden shrink-0">
                          {getEffectiveImageUrl(eq) ? (
                            <img 
                              src={getEffectiveImageUrl(eq)!} 
                              alt={eq.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{eq.name}</p>
                          <div className="flex gap-1 mt-1">
                            {hasImage(eq) ? (
                              <Badge variant="success" className="text-xs">Con imagen</Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">Sin imagen</Badge>
                            )}
                            {pendingChanges[eq.id] && (
                              <Badge variant="outline" className="text-xs">Modificado</Badge>
                            )}
                          </div>
                        </div>
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "shrink-0 h-8 w-8",
                              selectedEquipment?.id === eq.id 
                                ? "text-primary-foreground hover:bg-primary-foreground/20" 
                                : "text-destructive hover:text-destructive hover:bg-destructive/10"
                            )}
                            disabled={deleting === eq.id}
                          >
                            {deleting === eq.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar equipo?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente <strong>"{eq.name}"</strong> de la base de datos. Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteEquipment(eq)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <p className="text-sm text-muted-foreground">
                {filteredEquipment.filter(e => hasImage(e)).length} de {filteredEquipment.length} con imagen
              </p>
            </div>

            {/* Imágenes Column */}
            <div className="space-y-2">
              <h3 className="font-heading font-bold text-lg">
                Imágenes del Storage 
                {selectedEquipment && (
                  <span className="text-primary ml-2">→ {selectedEquipment.name}</span>
                )}
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar imagen..."
                  value={searchImage}
                  onChange={(e) => setSearchImage(e.target.value)}
                  className="pl-10"
                />
              </div>
              <ScrollArea className="h-[500px] border rounded-md">
                <div className="grid grid-cols-4 gap-2 p-2">
                  {filteredImages.map((file) => (
                    <button
                      key={file.name}
                      onClick={() => handleSelectImage(file.url)}
                      disabled={!selectedEquipment}
                      className={cn(
                        "relative aspect-square rounded-md overflow-hidden border-2 transition-all",
                        selectedEquipment ? "hover:border-primary cursor-pointer" : "opacity-50 cursor-not-allowed",
                        selectedEquipment && getEffectiveImageUrl(selectedEquipment) === file.url ? "border-primary ring-2 ring-primary" : "border-transparent"
                      )}
                    >
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {selectedEquipment && getEffectiveImageUrl(selectedEquipment) === file.url && (
                        <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                          <Check className="h-6 w-6 text-primary-foreground" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1">
                        <p className="text-[8px] text-white truncate">{file.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
              <p className="text-sm text-muted-foreground">
                {storageFiles.length} imágenes disponibles
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
