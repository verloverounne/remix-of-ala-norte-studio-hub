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
import { 
  Search, Check, Image as ImageIcon, Save, RefreshCw, Trash2, Upload, Loader2, 
  Filter, X, Edit, Plus, Star, StarOff 
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category, Subcategory } from "@/types/supabase";
import { StorageImageSelector } from "@/components/StorageImageSelector";
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

interface EquipmentImage {
  id: string;
  equipment_id: string;
  image_url: string;
  is_featured: boolean;
  order_index: number;
}

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
  equipment_images?: EquipmentImage[];
}

interface StorageFile {
  name: string;
  url: string;
}

type ImageFilter = "all" | "with" | "without";

export const EquipmentManager = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [storageFiles, setStorageFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEquipment, setSearchEquipment] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageFilter, setImageFilter] = useState<ImageFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [savingEquipment, setSavingEquipment] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [equipmentImages, setEquipmentImages] = useState<EquipmentImage[]>([]);
  
  // New equipment form state
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    name: "",
    name_en: "",
    category_id: "",
    subcategory_id: "",
    brand: "",
    model: "",
    description: "",
    price_per_day: "",
    price_per_week: "",
    featured: false,
    featured_copy: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedEquipment) {
      fetchEquipmentImages(selectedEquipment.id);
    } else {
      setEquipmentImages([]);
    }
  }, [selectedEquipment?.id]);

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

  const fetchEquipmentImages = async (equipmentId: string) => {
    const { data, error } = await supabase
      .from('equipment_images')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('order_index');
    
    if (data && !error) {
      setEquipmentImages(data);
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
      
      setStorageFiles(prev => [{ name: fileName, url }, ...prev]);
      
      if (selectedEquipment) {
        await handleAddImage(url);
      }
    } catch (error: any) {
      toast({ title: "Error al subir", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getMainImageUrl = (eq: Equipment) => {
    // First check equipment_images table
    const featuredImage = eq.equipment_images?.find(img => img.is_featured);
    if (featuredImage) return featuredImage.image_url;
    
    // Fallback to legacy image_url
    return eq.image_url;
  };

  const hasImage = (eq: Equipment) => {
    const url = getMainImageUrl(eq);
    return url && url.includes('equipment-images');
  };

  const matchesSearch = (eq: Equipment): boolean => {
    if (!searchEquipment.trim()) return true;
    
    const searchTerm = searchEquipment.toLowerCase().trim();
    const searchFields = [
      eq.name?.toLowerCase() || '',
      eq.brand?.toLowerCase() || '',
      eq.model?.toLowerCase() || '',
      eq.categories?.name?.toLowerCase() || ''
    ];
    
    const searchWords = searchTerm.split(/\s+/).filter(w => w.length > 0);
    
    if (searchWords.length > 1) {
      return searchWords.every(word => 
        searchFields.some(field => field.includes(word))
      );
    }
    
    return searchFields.some(field => field.includes(searchTerm));
  };

  const matchesImageFilter = (eq: Equipment): boolean => {
    const hasImg = hasImage(eq);
    if (imageFilter === "with") return hasImg;
    if (imageFilter === "without") return !hasImg;
    return true;
  };

  const matchesCategoryFilter = (eq: Equipment): boolean => {
    if (categoryFilter === "all") return true;
    return eq.category_id === categoryFilter;
  };

  const filteredEquipment = equipment.filter(e => 
    matchesSearch(e) && matchesImageFilter(e) && matchesCategoryFilter(e)
  );

  const handleAddImage = async (imageUrl: string) => {
    if (!selectedEquipment) {
      toast({ title: "Selecciona un equipo primero", variant: "destructive" });
      return;
    }
    
    // Check if image already exists
    if (equipmentImages.some(img => img.image_url === imageUrl)) {
      toast({ title: "Esta imagen ya está asignada", variant: "destructive" });
      return;
    }

    const isFeatured = equipmentImages.length === 0;
    const nextOrder = equipmentImages.length;

    const { error } = await supabase
      .from('equipment_images')
      .insert({
        equipment_id: selectedEquipment.id,
        image_url: imageUrl,
        is_featured: isFeatured,
        order_index: nextOrder
      });

    if (error) {
      toast({ title: "Error al agregar imagen", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Imagen agregada" });
      await fetchEquipmentImages(selectedEquipment.id);
      
      // Also update legacy image_url if this is the featured image
      if (isFeatured) {
        await supabase
          .from('equipment')
          .update({ image_url: imageUrl })
          .eq('id', selectedEquipment.id);
      }
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    const imageToRemove = equipmentImages.find(img => img.id === imageId);
    
    const { error } = await supabase
      .from('equipment_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      toast({ title: "Error al eliminar imagen", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Imagen eliminada" });
      
      // If it was featured, make next one featured
      if (imageToRemove?.is_featured && selectedEquipment) {
        const remaining = equipmentImages.filter(img => img.id !== imageId);
        if (remaining.length > 0) {
          await supabase
            .from('equipment_images')
            .update({ is_featured: true })
            .eq('id', remaining[0].id);
          
          // Update legacy image_url
          await supabase
            .from('equipment')
            .update({ image_url: remaining[0].image_url })
            .eq('id', selectedEquipment.id);
        } else {
          // No images left, clear legacy image_url
          await supabase
            .from('equipment')
            .update({ image_url: null })
            .eq('id', selectedEquipment.id);
        }
      }
      
      if (selectedEquipment) {
        await fetchEquipmentImages(selectedEquipment.id);
      }
    }
  };

  const handleSetFeatured = async (imageId: string) => {
    if (!selectedEquipment) return;
    
    const imageToFeature = equipmentImages.find(img => img.id === imageId);
    if (!imageToFeature) return;

    // Remove featured from all
    await supabase
      .from('equipment_images')
      .update({ is_featured: false })
      .eq('equipment_id', selectedEquipment.id);

    // Set new featured
    await supabase
      .from('equipment_images')
      .update({ is_featured: true })
      .eq('id', imageId);

    // Update legacy image_url
    await supabase
      .from('equipment')
      .update({ image_url: imageToFeature.image_url })
      .eq('id', selectedEquipment.id);

    toast({ title: "Imagen destacada actualizada" });
    await fetchEquipmentImages(selectedEquipment.id);
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

    setEquipment(prev => prev.filter(e => e.id !== eq.id));
    
    if (selectedEquipment?.id === eq.id) {
      setSelectedEquipment(null);
    }

    toast({ 
      title: "Equipo eliminado", 
      description: `${eq.name} ha sido eliminado correctamente` 
    });
  };

  const handleEditEquipment = async (eq: Equipment) => {
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
      const transformed: Equipment = {
        id: data.id,
        name: data.name,
        name_en: data.name_en,
        image_url: data.image_url,
        images: Array.isArray(data.images) ? (data.images as string[]).filter((img): img is string => typeof img === 'string') : [],
        brand: data.brand,
        model: data.model,
        description: data.description,
        price_per_day: data.price_per_day,
        price_per_week: data.price_per_week,
        category_id: data.category_id,
        subcategory_id: data.subcategory_id,
        featured: data.featured || false,
        featured_copy: data.featured_copy,
        categories: data.categories as Category | null,
        subcategories: data.subcategories as Subcategory | null
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

  const handleCreateEquipment = async () => {
    if (!newEquipment.name || !newEquipment.price_per_day) {
      toast({ title: "Error", description: "Nombre y precio son requeridos", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("equipment").insert({
      name: newEquipment.name,
      name_en: newEquipment.name_en || null,
      category_id: newEquipment.category_id || null,
      subcategory_id: newEquipment.subcategory_id || null,
      brand: newEquipment.brand || null,
      model: newEquipment.model || null,
      description: newEquipment.description || null,
      price_per_day: parseInt(newEquipment.price_per_day),
      price_per_week: newEquipment.price_per_week ? parseInt(newEquipment.price_per_week) : null,
      status: "available",
      featured: newEquipment.featured,
      featured_copy: newEquipment.featured_copy || null,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Creado", description: "Equipo creado correctamente" });
      setNewEquipment({
        name: "",
        name_en: "",
        category_id: "",
        subcategory_id: "",
        brand: "",
        model: "",
        description: "",
        price_per_day: "",
        price_per_week: "",
        featured: false,
        featured_copy: "",
      });
      setIsAddFormOpen(false);
      fetchEquipment();
    }
  };

  const editFilteredSubcategories = editingEquipment?.category_id
    ? subcategories.filter(s => s.category_id === editingEquipment.category_id)
    : [];

  const newFilteredSubcategories = newEquipment.category_id
    ? subcategories.filter(s => s.category_id === newEquipment.category_id)
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
      {/* Add Equipment Form Toggle */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Gestión de Equipos e Imágenes</CardTitle>
            <Button
              variant={isAddFormOpen ? "outline" : "hero"}
              onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            >
              {isAddFormOpen ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cerrar
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Equipo
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        {/* Collapsible Add Form */}
        {isAddFormOpen && (
          <CardContent className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={newEquipment.name}
                  onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                  placeholder="Nombre del equipo"
                />
              </div>
              <div className="space-y-2">
                <Label>Nombre EN</Label>
                <Input
                  value={newEquipment.name_en}
                  onChange={(e) => setNewEquipment({ ...newEquipment, name_en: e.target.value })}
                  placeholder="English name"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={newEquipment.category_id}
                  onValueChange={(v) => setNewEquipment({ ...newEquipment, category_id: v, subcategory_id: "" })}
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
                  value={newEquipment.subcategory_id}
                  onValueChange={(v) => setNewEquipment({ ...newEquipment, subcategory_id: v })}
                  disabled={!newEquipment.category_id}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {newFilteredSubcategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Marca</Label>
                <Input
                  value={newEquipment.brand}
                  onChange={(e) => setNewEquipment({ ...newEquipment, brand: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Input
                  value={newEquipment.model}
                  onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Precio por día *</Label>
                <Input
                  type="number"
                  value={newEquipment.price_per_day}
                  onChange={(e) => setNewEquipment({ ...newEquipment, price_per_day: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Precio por semana</Label>
                <Input
                  type="number"
                  value={newEquipment.price_per_week}
                  onChange={(e) => setNewEquipment({ ...newEquipment, price_per_week: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Descripción</Label>
                <Textarea
                  value={newEquipment.description}
                  onChange={(e) => setNewEquipment({ ...newEquipment, description: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newEquipment.featured}
                    onCheckedChange={(v) => setNewEquipment({ ...newEquipment, featured: v })}
                  />
                  <Label>Destacado</Label>
                </div>
                {newEquipment.featured && (
                  <Input
                    className="flex-1"
                    placeholder="Texto destacado"
                    value={newEquipment.featured_copy}
                    onChange={(e) => setNewEquipment({ ...newEquipment, featured_copy: e.target.value })}
                  />
                )}
              </div>
              <div className="md:col-span-2">
                <Button onClick={handleCreateEquipment} variant="hero" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Equipo
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Main Grid: Equipment + Images */}
      <Card>
        <CardHeader>
          <CardDescription>
            Selecciona un equipo para gestionar sus imágenes. Puedes agregar múltiples imágenes y marcar una como destacada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Equipment Column */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg">Equipos</h3>
                <Badge variant="secondary">
                  {filteredEquipment.length} de {equipment.length}
                </Badge>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, marca, modelo..."
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

              {/* Filters */}
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

              {/* Equipment List */}
              <ScrollArea className="h-[400px] sm:h-[500px] border rounded-md">
                <div className="p-2 space-y-1">
                  {filteredEquipment.map((eq) => (
                    <div
                      key={eq.id}
                      className={cn(
                        "w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-md transition-colors group",
                        selectedEquipment?.id === eq.id 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted"
                      )}
                    >
                      <button
                        onClick={() => setSelectedEquipment(eq)}
                        className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 text-left pr-2"
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-muted overflow-hidden shrink-0 border-2">
                          {getMainImageUrl(eq) ? (
                            <img 
                              src={getMainImageUrl(eq)!} 
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
                          </div>
                        </div>
                      </button>
                      <div className="flex gap-1 shrink-0">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEquipment(eq);
                          }}
                          title="Editar equipo"
                          className="h-8 w-8"
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
                              className="h-8 w-8"
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
                                Esta acción eliminará permanentemente <strong>"{eq.name}"</strong> de la base de datos.
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
              </div>
            </div>

            {/* Images Column */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg">
                  Imágenes 
                  {selectedEquipment && (
                    <span className="text-primary ml-2 text-sm font-normal">→ {selectedEquipment.name}</span>
                  )}
                </h3>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Upload className="h-4 w-4 mr-1" />
                    )}
                    Subir
                  </Button>
                </div>
              </div>

              {/* Equipment Images (if selected) */}
              {selectedEquipment && (
                <Card className="border-2 border-primary">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Imágenes de {selectedEquipment.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Add new image */}
                    <div className="flex gap-2 mb-3">
                      <div className="flex-1">
                        <StorageImageSelector
                          value={newImageUrl}
                          onChange={setNewImageUrl}
                          placeholder="Seleccionar imagen..."
                        />
                      </div>
                      <Button
                        onClick={() => {
                          if (newImageUrl) {
                            handleAddImage(newImageUrl);
                            setNewImageUrl("");
                          }
                        }}
                        disabled={!newImageUrl}
                        size="sm"
                        variant="hero"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Images Grid */}
                    {equipmentImages.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {equipmentImages.map((img) => (
                          <div
                            key={img.id}
                            className={cn(
                              "relative aspect-square rounded-md overflow-hidden border-2 group",
                              img.is_featured ? "border-primary ring-2 ring-primary" : "border-muted"
                            )}
                          >
                            <img
                              src={img.image_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            
                            {/* Featured Badge */}
                            {img.is_featured && (
                              <div className="absolute top-1 left-1 z-10">
                                <Badge className="bg-primary text-xs py-0 px-1">
                                  <Star className="h-3 w-3 fill-current" />
                                </Badge>
                              </div>
                            )}

                            {/* Hover Actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                              {!img.is_featured && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="w-full h-7 text-xs"
                                  onClick={() => handleSetFeatured(img.id)}
                                >
                                  <Star className="h-3 w-3 mr-1" />
                                  Destacar
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                className="w-full h-7 text-xs"
                                onClick={() => handleRemoveImage(img.id)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        Sin imágenes asignadas
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Storage Files */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Galería de imágenes disponibles ({storageFiles.length})
                </Label>
                <ScrollArea className="h-[300px] border rounded-md">
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 p-2">
                    {storageFiles.map((file) => (
                      <button
                        key={file.name}
                        onClick={() => handleAddImage(file.url)}
                        disabled={!selectedEquipment || equipmentImages.some(img => img.image_url === file.url)}
                        className={cn(
                          "relative aspect-square rounded-md overflow-hidden border-2 transition-all",
                          selectedEquipment && !equipmentImages.some(img => img.image_url === file.url)
                            ? "hover:border-primary cursor-pointer" 
                            : "opacity-50 cursor-not-allowed",
                          equipmentImages.some(img => img.image_url === file.url) && "border-primary ring-2 ring-primary"
                        )}
                      >
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {equipmentImages.some(img => img.image_url === file.url) && (
                          <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                            <Check className="h-6 w-6 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Equipment Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Equipo</DialogTitle>
          </DialogHeader>
          {editingEquipment && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  onChange={(e) => setEditingEquipment({...editingEquipment, price_per_week: parseInt(e.target.value) || null})}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Descripción</Label>
                <Textarea
                  value={editingEquipment.description || ''}
                  onChange={(e) => setEditingEquipment({...editingEquipment, description: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingEquipment.featured}
                    onCheckedChange={(v) => setEditingEquipment({...editingEquipment, featured: v})}
                  />
                  <Label>Destacado</Label>
                </div>
                {editingEquipment.featured && (
                  <Input
                    className="flex-1"
                    placeholder="Texto destacado"
                    value={editingEquipment.featured_copy || ''}
                    onChange={(e) => setEditingEquipment({...editingEquipment, featured_copy: e.target.value})}
                  />
                )}
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateEquipment} disabled={savingEquipment} variant="hero">
                  {savingEquipment ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};