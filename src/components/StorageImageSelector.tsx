import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image as ImageIcon, Search, Check, X, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface StorageImageSelectorProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

interface StorageFile {
  name: string;
  url: string;
}

export const StorageImageSelector = ({ 
  value, 
  onChange, 
  placeholder = "Seleccionar imagen del storage..." 
}: StorageImageSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchStorageFiles();
    }
  }, [open]);

  const fetchStorageFiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('equipment-images')
        .list('', {
          limit: 500,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) throw error;

      const imageFiles = (data || [])
        .filter(file => file.name && /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name))
        .map(file => ({
          name: file.name,
          url: `https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/${file.name}`
        }));

      setFiles(imageFiles);
    } catch (error) {
      console.error('Error fetching storage files:', error);
    } finally {
      setLoading(false);
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
      
      // Add to files list and select it
      setFiles(prev => [{ name: fileName, url }, ...prev]);
      onChange(url);
      setOpen(false);
    } catch (error: any) {
      toast({ title: "Error al subir", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (url: string) => {
    onChange(url);
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1 justify-start text-left font-normal">
              <ImageIcon className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">
                {value ? value.split('/').pop() : placeholder}
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Seleccionar Imagen del Storage</DialogTitle>
            </DialogHeader>
            
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar imagen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <Button type="button" variant="hero" disabled={uploading} asChild>
                  <span>
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {uploading ? "Subiendo..." : "Subir nueva"}
                  </span>
                </Button>
              </label>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchTerm ? "No se encontraron imágenes" : "No hay imágenes en el storage"}
              </div>
            ) : (
              <ScrollArea className="h-[50vh]">
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 pr-4">
                  {filteredFiles.map((file) => (
                    <button
                      key={file.name}
                      onClick={() => handleSelect(file.url)}
                      className={cn(
                        "relative aspect-square rounded-md overflow-hidden border-2 transition-all hover:border-primary",
                        value === file.url ? "border-primary ring-2 ring-primary" : "border-transparent"
                      )}
                    >
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {value === file.url && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1">
                        <p className="text-[10px] text-white truncate">{file.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}

            <div className="text-sm text-muted-foreground">
              {filteredFiles.length} imágenes disponibles
            </div>
          </DialogContent>
        </Dialog>
        
        {value && (
          <Button variant="ghost" size="icon" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {value && (
        <div className="relative w-24 h-24 rounded border overflow-hidden">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
};
