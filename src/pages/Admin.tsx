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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Percent, Download, Upload, Calendar as CalendarIcon, X, Image as ImageIcon, GalleryHorizontal } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { StorageImageSelector } from "@/components/StorageImageSelector";
import { EquipmentImageUploader } from "@/components/EquipmentImageUploader";
import { BulkImageAssigner } from "@/components/BulkImageAssigner";
import { GalleryManager } from "@/components/GalleryManager";
import { SpaceAdminEditor } from "@/components/SpaceAdminEditor";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface UnavailabilityPeriod {
  id: string;
  equipment_id: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface SpaceUnavailabilityPeriod {
  id: string;
  space_id: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

const Admin = () => {
  const [equipment, setEquipment] = useState<EquipmentWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Equipment form state
  const [newEquipment, setNewEquipment] = useState({
    name: "", name_en: "", category_id: "", subcategory_id: "", brand: "", model: "",
    description: "", price_per_day: "", price_per_week: "", image_url: "", images: [] as string[],
    featured: false, featured_copy: ""
  });
  
  // Space form state
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  
  // Equipment edit modal state
  const [editingEquipment, setEditingEquipment] = useState<EquipmentWithCategory | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Unavailability periods state
  const [unavailabilityPeriods, setUnavailabilityPeriods] = useState<UnavailabilityPeriod[]>([]);
  const [newPeriod, setNewPeriod] = useState({ start_date: "", end_date: "" });
  
  // Space unavailability periods state
  const [spaceUnavailabilityPeriods, setSpaceUnavailabilityPeriods] = useState<SpaceUnavailabilityPeriod[]>([]);
  const [newSpacePeriod, setNewSpacePeriod] = useState({ start_date: "", end_date: "" });
  
  // Price update state
  const [massPercentage, setMassPercentage] = useState<string>("");
  const [individualPrices, setIndividualPrices] = useState<Record<string, number>>({});
  
  // Config state
  const [contactInfo, setContactInfo] = useState({
    whatsapp: "",
    email: "",
    quote_message: "",
    instagram: "",
    instagram_token: ""
  });
  
  const { toast } = useToast();

  useEffect(() => { 
    fetchAll(); 
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchEquipment(), 
      fetchCategories(), 
      fetchSubcategories(), 
      fetchSpaces(),
      fetchContactInfo()
    ]);
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

  const fetchContactInfo = async () => {
    const { data } = await supabase.from('contact_info').select('*').limit(1).single();
    if (data) {
      setContactInfo({
        whatsapp: data.whatsapp || "",
        email: data.email || "",
        quote_message: data.quote_message || "",
        instagram: data.instagram || "",
        instagram_token: data.instagram_token || ""
      });
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
      status: 'available',
      featured: newEquipment.featured,
      featured_copy: newEquipment.featured_copy || null
    });

    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "CREADO", description: "Equipo creado correctamente" });
      setNewEquipment({
        name: "", name_en: "", category_id: "", subcategory_id: "", brand: "", model: "",
        description: "", price_per_day: "", price_per_week: "", image_url: "", images: [],
        featured: false, featured_copy: ""
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

  const handleEditEquipment = async (equipment: EquipmentWithCategory) => {
    setEditingEquipment(equipment);
    setIsEditModalOpen(true);
    await fetchUnavailabilityPeriods(equipment.id);
  };

  const fetchUnavailabilityPeriods = async (equipmentId: string) => {
    const { data, error } = await supabase
      .from('equipment_unavailability')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('start_date', { ascending: true });

    if (!error && data) {
      setUnavailabilityPeriods(data);
    }
  };

  const handleAddUnavailabilityPeriod = async () => {
    if (!editingEquipment || !newPeriod.start_date || !newPeriod.end_date) {
      toast({ 
        title: "ERROR", 
        description: "Ambas fechas son requeridas", 
        variant: "destructive" 
      });
      return;
    }

    if (new Date(newPeriod.start_date) > new Date(newPeriod.end_date)) {
      toast({ 
        title: "ERROR", 
        description: "La fecha de inicio debe ser anterior a la fecha de fin", 
        variant: "destructive" 
      });
      return;
    }

    const { error } = await supabase.from('equipment_unavailability').insert({
      equipment_id: editingEquipment.id,
      start_date: newPeriod.start_date,
      end_date: newPeriod.end_date
    });

    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "AGREGADO", description: "Periodo de no disponibilidad agregado" });
      setNewPeriod({ start_date: "", end_date: "" });
      fetchUnavailabilityPeriods(editingEquipment.id);
    }
  };

  const handleDeleteUnavailabilityPeriod = async (periodId: string) => {
    if (!confirm("¿Eliminar este periodo?")) return;
    
    const { error } = await supabase
      .from('equipment_unavailability')
      .delete()
      .eq('id', periodId);

    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "ELIMINADO", description: "Periodo eliminado" });
      if (editingEquipment) {
        fetchUnavailabilityPeriods(editingEquipment.id);
      }
    }
  };

  const handleUpdateEquipment = async () => {
    if (!editingEquipment || !editingEquipment.name || !editingEquipment.price_per_day) {
      toast({ title: "ERROR", description: "Nombre y precio son requeridos", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('equipment').update({
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
    }).eq('id', editingEquipment.id);

    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "ACTUALIZADO", description: "Equipo actualizado correctamente" });
      setIsEditModalOpen(false);
      setEditingEquipment(null);
      fetchEquipment();
    }
  };

  const handleEditSpace = async (space: Space) => {
    setEditingSpace(space);
    await fetchSpaceUnavailabilityPeriods(space.id);
  };

  const fetchSpaceUnavailabilityPeriods = async (spaceId: string) => {
    const { data, error } = await supabase
      .from('space_unavailability')
      .select('*')
      .eq('space_id', spaceId)
      .order('start_date', { ascending: true });

    if (!error && data) {
      setSpaceUnavailabilityPeriods(data);
    }
  };

  const handleAddSpaceUnavailabilityPeriod = async () => {
    if (!editingSpace || !newSpacePeriod.start_date || !newSpacePeriod.end_date) {
      toast({ 
        title: "ERROR", 
        description: "Ambas fechas son requeridas", 
        variant: "destructive" 
      });
      return;
    }

    if (new Date(newSpacePeriod.start_date) > new Date(newSpacePeriod.end_date)) {
      toast({ 
        title: "ERROR", 
        description: "La fecha de inicio debe ser anterior a la fecha de fin", 
        variant: "destructive" 
      });
      return;
    }

    const { error } = await supabase.from('space_unavailability').insert({
      space_id: editingSpace.id,
      start_date: newSpacePeriod.start_date,
      end_date: newSpacePeriod.end_date
    });

    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "AGREGADO", description: "Periodo de no disponibilidad agregado" });
      setNewSpacePeriod({ start_date: "", end_date: "" });
      fetchSpaceUnavailabilityPeriods(editingSpace.id);
    }
  };

  const handleDeleteSpaceUnavailabilityPeriod = async (periodId: string) => {
    if (!confirm("¿Eliminar este periodo?")) return;
    
    const { error } = await supabase
      .from('space_unavailability')
      .delete()
      .eq('id', periodId);

    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "ELIMINADO", description: "Periodo eliminado" });
      if (editingSpace) {
        fetchSpaceUnavailabilityPeriods(editingSpace.id);
      }
    }
  };

  const handleUpdateSpace = async (space: Space) => {
    const { error } = await supabase.from('spaces').update({
      name: space.name,
      description: space.description,
      price: space.price,
      promotion: space.promotion,
      images: space.images,
      amenities: space.amenities,
      specs: space.specs
    }).eq('id', space.id);

    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "ACTUALIZADO", description: "Espacio actualizado" });
      setEditingSpace(null);
      fetchSpaces();
    }
  };

  const handleMassPriceUpdate = async () => {
    const percentage = parseFloat(massPercentage);
    if (isNaN(percentage)) {
      toast({ title: "ERROR", description: "Porcentaje inválido", variant: "destructive" });
      return;
    }

    const updates = equipment.map(item => {
      const newPrice = Math.round(item.price_per_day * (1 + percentage / 100));
      return supabase.from('equipment')
        .update({ price_per_day: newPrice })
        .eq('id', item.id);
    });

    const results = await Promise.all(updates);
    const hasError = results.some(r => r.error);

    if (hasError) {
      toast({ title: "ERROR", description: "Error al actualizar algunos precios", variant: "destructive" });
    } else {
      toast({ title: "ACTUALIZADO", description: `Precios actualizados ${percentage > 0 ? '+' : ''}${percentage}%` });
      setMassPercentage("");
      fetchEquipment();
    }
  };

  const handleIndividualPriceUpdate = async (equipmentId: string) => {
    const newPrice = individualPrices[equipmentId];
    if (!newPrice || newPrice <= 0) {
      toast({ title: "ERROR", description: "Precio inválido", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('equipment')
      .update({ price_per_day: newPrice })
      .eq('id', equipmentId);

    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "ACTUALIZADO", description: "Precio actualizado" });
      fetchEquipment();
    }
  };

  const handleUpdateContactInfo = async () => {
    // First check if a record exists
    const { data: existing } = await supabase.from('contact_info').select('id').limit(1).single();
    
    let error;
    if (existing) {
      // Update existing record
      ({ error } = await supabase.from('contact_info')
        .update(contactInfo)
        .eq('id', existing.id));
    } else {
      // Insert new record
      ({ error } = await supabase.from('contact_info').insert(contactInfo));
    }

    if (error) {
      toast({ title: "ERROR", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "GUARDADO", description: "Configuración actualizada correctamente" });
    }
  };

  const filteredSubcategories = newEquipment.category_id 
    ? subcategories.filter(s => s.category_id === newEquipment.category_id)
    : [];

  const editFilteredSubcategories = editingEquipment?.category_id 
    ? subcategories.filter(s => s.category_id === editingEquipment.category_id)
    : [];

  const handleExportBackup = async () => {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        version: "1.0",
        data: {
          equipment,
          categories,
          subcategories,
          spaces
        }
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `alanorte-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: "✓ BACKUP CREADO", description: "Datos exportados correctamente" });
    } catch (error) {
      toast({ title: "ERROR", description: "Error al exportar datos", variant: "destructive" });
    }
  };

  const [isImporting, setIsImporting] = useState(false);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  // Normalize name for matching (same logic as MergeEquipment)
  const normalizeName = (name: string): string => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "")
      .trim();
  };

  const handleUpdateStockFromCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUpdatingStock(true);
      const text = await file.text();
      
      // Parse CSV (semicolon separated)
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        toast({ title: "ERROR", description: "El archivo CSV está vacío", variant: "destructive" });
        return;
      }

      // Parse header
      const header = lines[0].split(';').map(h => h.replace(/"/g, '').trim());
      const nombreIdx = header.findIndex(h => h.toLowerCase() === 'nombre');
      const cantidadIdx = header.findIndex(h => h.toLowerCase() === 'cantidad');

      if (nombreIdx === -1 || cantidadIdx === -1) {
        toast({ title: "ERROR", description: "El CSV debe tener columnas 'Nombre' y 'Cantidad'", variant: "destructive" });
        return;
      }

      // Build CSV map with quantities
      const csvStockMap = new Map<string, number>();
      
      for (let i = 1; i < lines.length; i++) {
        // Handle quoted fields with semicolons inside
        const row = lines[i].match(/("([^"]|"")*"|[^;]*)(;("([^"]|"")*"|[^;]*))*/)
          ? lines[i].split(/;(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(f => f.replace(/^"|"$/g, '').trim())
          : lines[i].split(';').map(f => f.replace(/"/g, '').trim());
        
        if (row.length > Math.max(nombreIdx, cantidadIdx)) {
          const nombre = row[nombreIdx];
          const cantidad = parseInt(row[cantidadIdx]) || 1;
          const normalizedName = normalizeName(nombre);
          
          // Sum quantities if same normalized name appears multiple times
          const existing = csvStockMap.get(normalizedName) || 0;
          csvStockMap.set(normalizedName, existing + cantidad);
        }
      }

      toast({ title: "PROCESANDO", description: `Analizando ${csvStockMap.size} productos del CSV...` });

      // Match with equipment and update
      let updated = 0;
      let notFound = 0;
      const updates: { id: string; stock_quantity: number; name: string }[] = [];

      for (const eq of equipment) {
        const normalizedName = normalizeName(eq.name);
        const stock = csvStockMap.get(normalizedName);
        
        if (stock !== undefined) {
          updates.push({ id: eq.id, stock_quantity: stock, name: eq.name });
        }
      }

      // Update in batches
      const batchSize = 50;
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        
        for (const item of batch) {
          const { error } = await supabase
            .from('equipment')
            .update({ stock_quantity: item.stock_quantity })
            .eq('id', item.id);
          
          if (!error) {
            updated++;
          } else {
            console.error(`Error updating ${item.name}:`, error);
          }
        }
        
        toast({ 
          title: "ACTUALIZANDO STOCK", 
          description: `${updated} de ${updates.length} equipos actualizados...` 
        });
      }

      toast({ 
        title: "✓ STOCK ACTUALIZADO", 
        description: `Se actualizó el stock de ${updated} equipos` 
      });

      await fetchEquipment();

    } catch (error: any) {
      console.error('Stock update error:', error);
      toast({ title: "ERROR", description: error.message || "Error al actualizar stock", variant: "destructive" });
    } finally {
      setIsUpdatingStock(false);
      event.target.value = '';
    }
  };

  const handleImportEquipment = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      
      if (!backup.data?.equipment || !Array.isArray(backup.data.equipment)) {
        toast({ title: "ERROR", description: "El archivo no contiene datos de equipos válidos", variant: "destructive" });
        return;
      }

      const confirmed = window.confirm(
        `¿Estás seguro de que deseas reemplazar TODOS los equipos existentes?\n\n` +
        `Se eliminarán ${equipment.length} equipos actuales y se importarán ${backup.data.equipment.length} equipos del archivo.\n\n` +
        `Esta acción no se puede deshacer.`
      );

      if (!confirmed) return;

      setIsImporting(true);
      
      // Step 1: Delete all existing equipment
      toast({ title: "PROCESANDO", description: "Eliminando equipos existentes..." });
      
      const { error: deleteError } = await supabase
        .from('equipment')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
      
      if (deleteError) {
        throw new Error(`Error al eliminar equipos: ${deleteError.message}`);
      }
      
      // Step 2: Prepare equipment data for insert (remove nested objects)
      const equipmentToInsert = backup.data.equipment.map((item: any) => {
        // Remove nested category and subcategory objects
        const { categories, subcategories, ...cleanItem } = item;
        
        return {
          id: cleanItem.id,
          name: cleanItem.name,
          name_en: cleanItem.name_en || null,
          category_id: cleanItem.category_id || null,
          subcategory_id: cleanItem.subcategory_id || null,
          brand: cleanItem.brand || null,
          model: cleanItem.model || null,
          description: cleanItem.description || null,
          detailed_description: cleanItem.detailed_description || null,
          specs: cleanItem.specs || [],
          detailed_specs: cleanItem.detailed_specs || [],
          price_per_day: cleanItem.price_per_day || 0,
          price_per_week: cleanItem.price_per_week || null,
          status: cleanItem.status || 'available',
          image_url: cleanItem.image_url || null,
          images: cleanItem.images || [],
          tags: cleanItem.tags || [],
          featured: cleanItem.featured || false,
          featured_copy: cleanItem.featured_copy || null,
          order_index: cleanItem.order_index || 0,
          sku_rentalos: cleanItem.sku_rentalos || null,
          descripcion_corta_es: cleanItem.descripcion_corta_es || null,
          descripcion_corta_en: cleanItem.descripcion_corta_en || null,
          tamano: cleanItem.tamano || null,
          tipo_equipo: cleanItem.tipo_equipo || null,
          observaciones_internas: cleanItem.observaciones_internas || null,
          id_original: cleanItem.id_original || null
        };
      });
      
      // Step 3: Insert equipment in batches of 50
      const batchSize = 50;
      let inserted = 0;
      
      for (let i = 0; i < equipmentToInsert.length; i += batchSize) {
        const batch = equipmentToInsert.slice(i, i + batchSize);
        
        const { error: insertError } = await supabase
          .from('equipment')
          .insert(batch);
        
        if (insertError) {
          throw new Error(`Error al insertar lote ${Math.floor(i/batchSize) + 1}: ${insertError.message}`);
        }
        
        inserted += batch.length;
        toast({ 
          title: "IMPORTANDO", 
          description: `${inserted} de ${equipmentToInsert.length} equipos importados...` 
        });
      }
      
      toast({ 
        title: "✓ IMPORTACIÓN COMPLETA", 
        description: `Se importaron ${inserted} equipos exitosamente` 
      });
      
      // Refresh equipment list
      await fetchEquipment();
      
    } catch (error: any) {
      console.error('Import error:', error);
      toast({ 
        title: "ERROR", 
        description: error.message || "Error al importar datos", 
        variant: "destructive" 
      });
    } finally {
      setIsImporting(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-muted/30">
      <section className="gradient-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-heading font-bold mb-2">Panel de Administración</h1>
              <p className="text-lg">Gestiona equipos, espacios y configuraciones</p>
            </div>
            <Button asChild variant="secondary" size="lg" className="font-heading">
              <a href="/admin/blog">Gestionar Blog</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="equipment" className="space-y-6">
            <TabsList className="grid w-full grid-cols-8 lg:w-auto">
              <TabsTrigger value="equipment">Equipos</TabsTrigger>
              <TabsTrigger value="prices">Precios</TabsTrigger>
              <TabsTrigger value="assign-images">
                <ImageIcon className="h-4 w-4 mr-1" />
                Asignar
              </TabsTrigger>
              <TabsTrigger value="images">Subir</TabsTrigger>
              <TabsTrigger value="galleries">
                <GalleryHorizontal className="h-4 w-4 mr-1" />
                Galerías
              </TabsTrigger>
              <TabsTrigger value="spaces">Espacios</TabsTrigger>
              <TabsTrigger value="config">Config</TabsTrigger>
              <TabsTrigger value="backup">Backup</TabsTrigger>
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
                      <Label>Imagen Principal</Label>
                      <StorageImageSelector 
                        value={newEquipment.image_url} 
                        onChange={(url) => setNewEquipment({...newEquipment, image_url: url})}
                        placeholder="Seleccionar imagen del storage..."
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Imágenes Adicionales</Label>
                      <ImageUploader 
                        images={newEquipment.images}
                        onChange={(images) => setNewEquipment({...newEquipment, images})}
                        maxImages={10}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center justify-between">
                        <Label>Equipo Destacado</Label>
                        <Switch 
                          checked={newEquipment.featured}
                          onCheckedChange={(checked) => setNewEquipment({...newEquipment, featured: checked})}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Los equipos destacados aparecerán en la página principal</p>
                    </div>
                    {newEquipment.featured && (
                      <div className="space-y-2 md:col-span-2">
                        <Label>Descripción para Destacados</Label>
                        <Textarea 
                          value={newEquipment.featured_copy} 
                          onChange={(e) => setNewEquipment({...newEquipment, featured_copy: e.target.value})}
                          placeholder="Texto breve que aparecerá en la home para este equipo destacado"
                        />
                      </div>
                    )}
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
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditEquipment(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteEquipment(item.id)}>
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
                  <CardDescription>Aplica porcentaje a todos los equipos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Porcentaje</Label>
                      <Input 
                        type="number" 
                        placeholder="10" 
                        step="0.1" 
                        value={massPercentage}
                        onChange={(e) => setMassPercentage(e.target.value)}
                      />
                    </div>
                    <Button variant="hero" onClick={handleMassPriceUpdate}>
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
                        <Input 
                          type="number" 
                          defaultValue={item.price_per_day}
                          onChange={(e) => setIndividualPrices({
                            ...individualPrices, 
                            [item.id]: parseInt(e.target.value)
                          })}
                          className="w-32" 
                        />
                        <Button size="sm" onClick={() => handleIndividualPriceUpdate(item.id)}>
                          Actualizar
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assign Images Tab */}
            <TabsContent value="assign-images">
              <BulkImageAssigner />
            </TabsContent>

            {/* Upload Images Tab */}
            <TabsContent value="images">
              <EquipmentImageUploader />
            </TabsContent>

            {/* Galleries Tab */}
            <TabsContent value="galleries">
              <GalleryManager />
            </TabsContent>

            {/* Spaces Tab */}
            <TabsContent value="spaces">
              <SpaceAdminEditor />
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
                    <Input 
                      placeholder="+54 11 1234-5678"
                      value={contactInfo.whatsapp}
                      onChange={(e) => setContactInfo({...contactInfo, whatsapp: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email" 
                      placeholder="info@alanorte.com"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mensaje adicional para cotizaciones</Label>
                    <Textarea 
                      placeholder="Mensaje para cotizaciones..."
                      rows={4}
                      value={contactInfo.quote_message}
                      onChange={(e) => setContactInfo({...contactInfo, quote_message: e.target.value})}
                    />
                  </div>
                  
                  <div className="border-t-2 border-foreground pt-4 mt-6">
                    <h3 className="font-heading font-bold text-lg mb-4">Configuración de Instagram</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Usuario de Instagram</Label>
                        <Input 
                          placeholder="@alanortecinedigital"
                          value={contactInfo.instagram}
                          onChange={(e) => setContactInfo({...contactInfo, instagram: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Token de Acceso (opcional)</Label>
                        <Input 
                          type="password"
                          placeholder="Token de Instagram API"
                          value={contactInfo.instagram_token}
                          onChange={(e) => setContactInfo({...contactInfo, instagram_token: e.target.value})}
                        />
                        <p className="text-xs text-muted-foreground">
                          Para mostrar historias reales de Instagram, necesitas un token de acceso de la API de Instagram.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="hero" onClick={handleUpdateContactInfo}>
                    Guardar Configuración
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Backup Tab */}
            <TabsContent value="backup">
              <Card>
                <CardHeader>
                  <CardTitle>Backup y Restauración</CardTitle>
                  <CardDescription>Gestiona copias de seguridad de la base de datos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="border-l-4 border-primary pl-4 py-2">
                      <h3 className="font-heading font-bold text-lg mb-2">Exportar Base de Datos</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Descarga un archivo JSON con todos los datos de equipos, categorías, subcategorías y espacios.
                      </p>
                      <Button onClick={handleExportBackup} variant="hero">
                        <Download className="mr-2 h-4 w-4" />
                        Descargar Backup JSON
                      </Button>
                    </div>

                    <div className="border-l-4 border-secondary pl-4 py-2">
                      <h3 className="font-heading font-bold text-lg mb-2">Importar / Reemplazar Equipos</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Reemplaza TODOS los equipos de la base de datos con los del archivo JSON.
                        <span className="block mt-2 text-destructive font-semibold">
                          ⚠️ ATENCIÓN: Esta acción eliminará todos los equipos existentes y los reemplazará con los del archivo.
                        </span>
                      </p>
                      <div className="flex items-center gap-4">
                        <Input 
                          type="file" 
                          accept=".json"
                          onChange={handleImportEquipment}
                          className="max-w-xs"
                          disabled={isImporting}
                        />
                        {isImporting && (
                          <span className="text-sm text-muted-foreground animate-pulse">
                            Importando...
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Formato esperado: archivo JSON con estructura {`{ data: { equipment: [...] } }`}
                      </p>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4 py-2">
                      <h3 className="font-heading font-bold text-lg mb-2">Actualizar Stock desde CSV</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Actualiza la cantidad de stock de cada equipo usando el archivo CSV de EquipoEmpresa.
                        Hace match por nombre normalizado y suma las cantidades de registros duplicados.
                      </p>
                      <div className="flex items-center gap-4">
                        <Input 
                          type="file" 
                          accept=".csv"
                          onChange={handleUpdateStockFromCSV}
                          className="max-w-xs"
                          disabled={isUpdatingStock}
                        />
                        {isUpdatingStock && (
                          <span className="text-sm text-muted-foreground animate-pulse">
                            Actualizando stock...
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Formato esperado: CSV con columnas "Nombre" y "Cantidad" separadas por punto y coma (;)
                      </p>
                    </div>

                    <div className="border-l-4 border-muted pl-4 py-2 bg-muted/20">
                      <h3 className="font-heading font-bold text-lg mb-2">Código Fuente del Sitio</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Para obtener una copia completa del código fuente del sitio web, puedes:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-2 mb-4 list-disc list-inside">
                        <li>Conectar el proyecto a GitHub desde la interfaz de Lovable</li>
                        <li>Usar el modo Dev para ver y descargar archivos individuales</li>
                        <li>Exportar el proyecto completo desde la configuración</li>
                      </ul>
                      <p className="text-xs text-muted-foreground italic">
                        El código fuente se gestiona mejor mediante control de versiones (Git) en lugar de backups manuales.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Equipment Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Equipo</DialogTitle>
          </DialogHeader>
          {editingEquipment && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  onChange={(e) => setEditingEquipment({...editingEquipment, price_per_day: parseInt(e.target.value)})} 
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
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Imagen Principal</Label>
                <StorageImageSelector 
                  value={editingEquipment.image_url || ''} 
                  onChange={(url) => setEditingEquipment({...editingEquipment, image_url: url})}
                  placeholder="Seleccionar imagen del storage..."
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Imágenes Adicionales</Label>
                <ImageUploader 
                  images={editingEquipment.images || []}
                  onChange={(images) => setEditingEquipment({...editingEquipment, images})}
                  maxImages={10}
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
                  />
                </div>
              )}

              {/* Unavailability Periods Section */}
              <div className="md:col-span-2 border-t-2 border-foreground pt-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarIcon className="h-5 w-5" />
                  <h3 className="font-heading text-lg font-bold">PERIODOS DE NO DISPONIBILIDAD</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Define rangos de fechas en los que este equipo no estará disponible (mantenimiento, reparaciones, etc.)
                </p>

                {/* Add new period */}
                <Card className="mb-4 border-2">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Fecha inicio</Label>
                        <Input
                          type="date"
                          value={newPeriod.start_date}
                          onChange={(e) => setNewPeriod({...newPeriod, start_date: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fecha fin</Label>
                        <Input
                          type="date"
                          value={newPeriod.end_date}
                          onChange={(e) => setNewPeriod({...newPeriod, end_date: e.target.value})}
                          min={newPeriod.start_date}
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleAddUnavailabilityPeriod} 
                      className="mt-3 w-full"
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Periodo
                    </Button>
                  </CardContent>
                </Card>

                {/* List of periods */}
                <div className="space-y-2">
                  {unavailabilityPeriods.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded">
                      No hay periodos de no disponibilidad configurados
                    </p>
                  ) : (
                    unavailabilityPeriods.map((period) => (
                      <div 
                        key={period.id} 
                        className="flex items-center justify-between p-3 border-2 rounded bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-heading text-sm">
                              {format(new Date(period.start_date), "d 'de' MMMM, yyyy", { locale: es })}
                              {" → "}
                              {format(new Date(period.end_date), "d 'de' MMMM, yyyy", { locale: es })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {Math.ceil((new Date(period.end_date).getTime() - new Date(period.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} días
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUnavailabilityPeriod(period.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="md:col-span-2 flex gap-2 mt-6">
                <Button onClick={handleUpdateEquipment} variant="hero">
                  Actualizar Equipo
                </Button>
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
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

export default Admin;
