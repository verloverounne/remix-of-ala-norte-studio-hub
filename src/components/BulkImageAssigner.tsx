import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Check, Image as ImageIcon, Save, RefreshCw, Trash2, Upload, Loader2, Filter, X, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category, Subcategory } from "@/types/supabase";
import { EquipmentImageManager } from "@/components/EquipmentImageManager";
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
  name_en: string | null;
  image_url: string | null;
  images: string[];
  brand: string | null;
  model: string | null;
  description: string | null;
  price_per_day: number;
  price_per_week: number | null;
  category_id: string | null;
  subcategory_id: string | null;
  featured: boolean;
  featured_copy: string | null;
  categories: Category | null;
  subcategories: Subcategory | null;
}

interface StorageFile {
  name: string;
  url: string;
}

type ImageFilter = "all" | "with" | "without";

export const BulkImageAssigner = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [storageFiles, setStorageFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEquipment, setSearchEquipment] = useState("");
  const [searchImage, setSearchImage] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageFilter, setImageFilter] = useState<ImageFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [savingEquipment, setSavingEquipment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchEquipment(), fetchCategories(), fetchSubcategories(), fetchStorageFiles()]);
    setLoading(false);
  };

  const fetchEquipment = async () => {
    const { data } = await supabase
      .from('equipment')
      .select('id, name, name_en, image_url, images, brand, model, description, price_per_day, price_per_week, category_id, subcategory_id, featured, featured_copy, categories (*), subcategories (*)')
      .order('name');
    if (data) {
      const transformed = data.map((item: any) => ({
        ...item,
        images: Array.isArray(item.images) ? item.images : []
      }));
      setEquipment(transformed);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('order_index');
    if (data) setCategories(data);
  };

  const fetchSubcategories = async () => {
    const { data } = await supabase
      .from('subcategories')
      .select('*')
      .order('order_index');
    if (data) setSubcategories(data);
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

  const sanitizeFileName = (name: string): string => {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_")
      .toLowerCase();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Solo se permiten imágenes", variant: "destructive" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "El tamaño máximo es 10MB", variant: "destructive" });
      return;
    }

    setUploading(true);

    try {
      const sanitizedName = sanitizeFileName(file.name);
      const timestamp = Date.now();
      const fileName = `${timestamp}_${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from("equipment-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const url = `https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/${fileName}`;
      
      toast({ title: "Imagen subida correctamente" });
      
      // Add to files list
      setStorageFiles(prev => [{ name: fileName, url }, ...prev]);
      
      // If equipment is selected, assign the image
      if (selectedEquipment) {
        handleSelectImage(url);
      }
    } catch (error: any) {
      toast({ title: "Error al subir", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getEffectiveImageUrl = (eq: Equipment | null) => {
    if (!eq) return null;
    return pendingChanges[eq.id] || eq.image_url;
  };

  const hasImage = (eq: Equipment) => {
    const url = getEffectiveImageUrl(eq);
    return url && url.includes('equipment-images');
  };

  // Búsqueda flexible: busca en nombre, marca, modelo
  const matchesSearch = (eq: Equipment): boolean => {
    if (!searchEquipment.trim()) return true;
    
    const searchTerm = searchEquipment.toLowerCase().trim();
    const searchFields = [
      eq.name?.toLowerCase() || '',
      eq.brand?.toLowerCase() || '',
      eq.model?.toLowerCase() || '',
      eq.categories?.name?.toLowerCase() || ''
    ];
    
    // Búsqueda por palabras individuales
    const searchWords = searchTerm.split(/\s+/).filter(w => w.length > 0);
    
    // Si hay múltiples palabras, todas deben aparecer en algún campo
    if (searchWords.length > 1) {
      return searchWords.every(word => 
        searchFields.some(field => field.includes(word))
      );
    }
    
    // Búsqueda simple: cualquier campo contiene el término
    return searchFields.some(field => field.includes(searchTerm));
  };

  // Filtro por imagen
  const matchesImageFilter = (eq: Equipment): boolean => {
    const url = getEffectiveImageUrl(eq);
    const hasImageUrl = url && url.includes('equipment-images');
    
    if (imageFilter === "with") return !!hasImageUrl;
    if (imageFilter === "without") return !hasImageUrl;
    return true; // "all"
  };

  // Filtro por categoría
  const matchesCategoryFilter = (eq: Equipment): boolean => {
    if (categoryFilter === "all") return true;
    return eq.category_id === categoryFilter;
  };

  const filteredEquipment = equipment.filter(e => 
    matchesSearch(e) && matchesImageFilter(e) && matchesCategoryFilter(e)
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

  const handleEditEquipment = async (eq: Equipment) => {
    // Cargar datos completos del equipo
    const { data, error } = await supabase
      .from('equipment')
      .select('*, categories (*), subcategories (*)')
      .eq('id', eq.id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar los datos del equipo",
        variant: "destructive"
      });
      return;
    }

    if (data) {
      const transformed = {
        ...data,
        images: Array.isArray(data.images) ? data.images : []
      };
      setEditingEquipment(transformed);
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateEquipment = async () => {
    if (!editingEquipment || !editingEquipment.name || !editingEquipment.price_per_day) {
      toast({
        title: "Error",
        description: "Nombre y precio son requeridos",
        variant: "destructive"
      });
      return;
    }

    setSavingEquipment(true);

    const { error } = await supabase
      .from('equipment')
      .update({
        name: editingEquipment.name,
        name_en: editingEquipment.name_en || null,
        category_id: editingEquipment.category_id || null,
        subcategory_id: editingEquipment.subcategory_id || null,
        brand: editingEquipment.brand || null,
        model: editingEquipment.model || null,
        description: editingEquipment.description || null,
        price_per_day: editingEquipment.price_per_day,
        price_per_week: editingEquipment.price_per_week || null,
        image_url: editingEquipment.image_url || null,
        images: editingEquipment.images || [],
        featured: editingEquipment.featured || false,
        featured_copy: editingEquipment.featured_copy || null
      })
      .eq('id', editingEquipment.id);

    setSavingEquipment(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Actualizado",
        description: "Equipo actualizado correctamente"
      });
      setIsEditModalOpen(false);
      setEditingEquipment(null);
      fetchEquipment();
    }
  };

  const editFilteredSubcategories = editingEquipment?.category_id
    ? subcategories.filter(s => s.category_id === editingEquipment.category_id)
    : [];

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg sm:text-xl">Asignar Imágenes a Equipos</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Selecciona un equipo a la izquierda, luego haz clic en una imagen a la derecha para asignarla
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {Object.keys(pendingChanges).length > 0 && (
                <Badge variant="secondary" className="w-full sm:w-auto justify-center">{Object.keys(pendingChanges).length} cambios pendientes</Badge>
              )}
              <Button 
                onClick={handleSaveChanges} 
                disabled={Object.keys(pendingChanges).length === 0 || saving}
                variant="hero"
                className="w-full sm:w-auto"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Equipos Column */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg">Equipos</h3>
                <Badge variant="secondary">
                  {filteredEquipment.length} de {equipment.length}
                </Badge>
              </div>
              
              {/* Búsqueda flexible */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, marca, modelo o categoría..."
                  value={searchEquipment}
                  onChange={(e) => setSearchEquipment(e.target.value)}
                  className="pl-10"
                />
                {searchEquipment && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchEquipment("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Filtros */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Filter className="h-3 w-3" />
                    Imagen
                  </Label>
                  <Select value={imageFilter} onValueChange={(v) => setImageFilter(v as ImageFilter)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="with">Con imagen</SelectItem>
                      <SelectItem value="without">Sin imagen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Filter className="h-3 w-3" />
                    Categoría
                  </Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Mostrar filtros activos */}
              {(imageFilter !== "all" || categoryFilter !== "all" || searchEquipment) && (
                <div className="flex flex-wrap gap-1">
                  {imageFilter !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      {imageFilter === "with" ? "Con imagen" : "Sin imagen"}
                      <button
                        onClick={() => setImageFilter("all")}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {categoryFilter !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      {categories.find(c => c.id === categoryFilter)?.name || "Categoría"}
                      <button
                        onClick={() => setCategoryFilter("all")}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {searchEquipment && (
                    <Badge variant="secondary" className="text-xs">
                      Búsqueda: "{searchEquipment}"
                      <button
                        onClick={() => setSearchEquipment("")}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
              <ScrollArea className="h-[400px] sm:h-[500px] border rounded-md">
                <div className="p-2 space-y-1">
                  {filteredEquipment.map((eq) => (
                    <div
                      key={eq.id}
                      className={cn(
                        "w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-md transition-colors group",
                        selectedEquipment?.id === eq.id 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted",
                        pendingChanges[eq.id] && "ring-2 ring-primary"
                      )}
                    >
                      <button
                        onClick={() => setSelectedEquipment(eq)}
                        className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 text-left pr-2"
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-muted overflow-hidden shrink-0 border-2">
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
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {eq.categories && (
                              <Badge variant="outline" className="text-xs">
                                {eq.categories.name}
                              </Badge>
                            )}
                            {hasImage(eq) ? (
                              <Badge variant="default" className="text-xs bg-green-600">Con imagen</Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">Sin imagen</Badge>
                            )}
                            {pendingChanges[eq.id] && (
                              <Badge variant="secondary" className="text-xs">Modificado</Badge>
                            )}
                          </div>
                          {(eq.brand || eq.model) && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {eq.brand && eq.model ? `${eq.brand} ${eq.model}` : eq.brand || eq.model}
                            </p>
                          )}
                        </div>
                      </button>
                      <div className="flex gap-2 shrink-0">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEquipment(eq);
                          }}
                          title="Editar equipo"
                          className="h-8 w-8 sm:h-10 sm:w-10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              disabled={deleting === eq.id}
                              title="Eliminar equipo"
                              className="h-8 w-8 sm:h-10 sm:w-10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {deleting === eq.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin text-destructive" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-destructive" />
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
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {filteredEquipment.filter(e => hasImage(e)).length} de {filteredEquipment.length} con imagen
                </span>
                {(imageFilter !== "all" || categoryFilter !== "all" || searchEquipment) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setImageFilter("all");
                      setCategoryFilter("all");
                      setSearchEquipment("");
                    }}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>

            {/* Imágenes Column */}
            <div className="space-y-2">
              <h3 className="font-heading font-bold text-lg">
                Imágenes del Storage 
                {selectedEquipment && (
                  <span className="text-primary ml-2">→ {selectedEquipment.name}</span>
                )}
              </h3>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar imagen..."
                    value={searchImage}
                    onChange={(e) => setSearchImage(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="hero"
                  size="default"
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
              <ScrollArea className="h-[400px] sm:h-[500px] border rounded-md">
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 p-2">
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

      {/* Equipment Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Editar Equipo</DialogTitle>
          </DialogHeader>
          {editingEquipment && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={editingEquipment.name}
                  onChange={(e) => setEditingEquipment({...editingEquipment, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Nombre EN</Label>
                <Input
                  value={editingEquipment.name_en || ''}
                  onChange={(e) => setEditingEquipment({...editingEquipment, name_en: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={editingEquipment.category_id || ''}
                  onValueChange={(v) => setEditingEquipment({...editingEquipment, category_id: v, subcategory_id: null})}
                >
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
                <Select
                  value={editingEquipment.subcategory_id || ''}
                  onValueChange={(v) => setEditingEquipment({...editingEquipment, subcategory_id: v})}
                  disabled={!editingEquipment.category_id}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {editFilteredSubcategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Marca</Label>
                <Input
                  value={editingEquipment.brand || ''}
                  onChange={(e) => setEditingEquipment({...editingEquipment, brand: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Input
                  value={editingEquipment.model || ''}
                  onChange={(e) => setEditingEquipment({...editingEquipment, model: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Precio por día *</Label>
                <Input
                  type="number"
                  value={editingEquipment.price_per_day}
                  onChange={(e) => setEditingEquipment({...editingEquipment, price_per_day: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Precio por semana</Label>
                <Input
                  type="number"
                  value={editingEquipment.price_per_week || ''}
                  onChange={(e) => setEditingEquipment({...editingEquipment, price_per_week: e.target.value ? parseInt(e.target.value) : null})}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Descripción</Label>
                <Textarea
                  value={editingEquipment.description || ''}
                  onChange={(e) => setEditingEquipment({...editingEquipment, description: e.target.value})}
                  rows={4}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <EquipmentImageManager
                  imageUrl={editingEquipment.image_url || null}
                  images={editingEquipment.images || []}
                  onImageUrlChange={(url) => setEditingEquipment({...editingEquipment, image_url: url})}
                  onImagesChange={(images) => setEditingEquipment({...editingEquipment, images})}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label>Equipo Destacado</Label>
                  <Switch
                    checked={editingEquipment.featured || false}
                    onCheckedChange={(checked) => setEditingEquipment({...editingEquipment, featured: checked})}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Los equipos destacados aparecerán en la página principal</p>
              </div>
              {editingEquipment.featured && (
                <div className="space-y-2 md:col-span-2">
                  <Label>Descripción para Destacados</Label>
                  <Textarea
                    value={editingEquipment.featured_copy || ''}
                    onChange={(e) => setEditingEquipment({...editingEquipment, featured_copy: e.target.value})}
                    placeholder="Texto breve que aparecerá en la home para este equipo destacado"
                    rows={2}
                  />
                </div>
              )}

              <div className="md:col-span-2 flex flex-col sm:flex-row gap-2 mt-4">
                <Button
                  onClick={handleUpdateEquipment}
                  variant="hero"
                  disabled={savingEquipment}
                  className="w-full sm:flex-1"
                >
                  {savingEquipment ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingEquipment(null);
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
