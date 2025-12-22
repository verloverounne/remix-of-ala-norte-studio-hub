import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2, Check, AlertCircle, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UploadedFile {
  name: string;
  url: string;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

interface StorageFile {
  name: string;
  url: string;
  created_at: string;
}

export const EquipmentImageUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [storageFiles, setStorageFiles] = useState<StorageFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const { toast } = useToast();

  const BUCKET_NAME = 'equipment-images';
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

  // Fetch existing files from storage
  const fetchStorageFiles = useCallback(async () => {
    setLoadingFiles(true);
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      const files: StorageFile[] = (data || [])
        .filter(file => !file.name.startsWith('.'))
        .map(file => ({
          name: file.name,
          url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${file.name}`,
          created_at: file.created_at || ''
        }));

      setStorageFiles(files);
    } catch (error: any) {
      toast({
        title: 'Error al cargar imágenes',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoadingFiles(false);
    }
  }, [toast, SUPABASE_URL]);

  // Upload multiple files
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const fileArray = Array.from(files);
    const totalFiles = fileArray.length;
    let completedFiles = 0;

    const newUploadedFiles: UploadedFile[] = fileArray.map(file => ({
      name: file.name,
      url: '',
      status: 'uploading' as const
    }));

    setUploadedFiles(prev => [...newUploadedFiles, ...prev]);

    for (const file of fileArray) {
      try {
        // Sanitize filename - remove special characters
        const sanitizedName = file.name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove accents
          .replace(/[^a-zA-Z0-9.-]/g, '_'); // Replace special chars with underscore

        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(sanitizedName, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) throw error;

        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${data.path}`;

        setUploadedFiles(prev =>
          prev.map(f =>
            f.name === file.name
              ? { ...f, status: 'success' as const, url: publicUrl }
              : f
          )
        );
      } catch (error: any) {
        setUploadedFiles(prev =>
          prev.map(f =>
            f.name === file.name
              ? { ...f, status: 'error' as const, error: error.message }
              : f
          )
        );
      }

      completedFiles++;
      setUploadProgress(Math.round((completedFiles / totalFiles) * 100));
    }

    setUploading(false);
    toast({
      title: 'Carga completada',
      description: `${completedFiles} de ${totalFiles} archivos procesados`
    });

    // Refresh the file list
    fetchStorageFiles();
    
    // Reset input
    event.target.value = '';
  };

  // Delete a file from storage
  const handleDeleteFile = async (fileName: string) => {
    if (!confirm(`¿Eliminar la imagen "${fileName}"?`)) return;

    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([fileName]);

      if (error) throw error;

      setStorageFiles(prev => prev.filter(f => f.name !== fileName));
      toast({
        title: 'Imagen eliminada',
        description: fileName
      });
    } catch (error: any) {
      toast({
        title: 'Error al eliminar',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'URL copiada',
      description: 'La URL ha sido copiada al portapapeles'
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Cargar Imágenes de Equipos
          </CardTitle>
          <CardDescription>
            Sube múltiples imágenes a la vez. Formatos permitidos: JPG, PNG, WebP, GIF. Máximo 10MB por archivo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileUpload}
              className="hidden"
              id="equipment-image-upload"
              disabled={uploading}
            />
            <label 
              htmlFor="equipment-image-upload" 
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              <div className="p-4 bg-primary/10 rounded-full">
                <ImageIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-heading text-lg">
                  {uploading ? 'Subiendo imágenes...' : 'Click para seleccionar imágenes'}
                </p>
                <p className="text-sm text-muted-foreground">
                  O arrastra y suelta archivos aquí
                </p>
              </div>
            </label>
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                {uploadProgress}% completado
              </p>
            </div>
          )}

          {/* Recent uploads status */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-heading text-sm font-semibold">Últimas cargas:</h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {uploadedFiles.slice(0, 10).map((file, index) => (
                  <div 
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-2 p-2 rounded bg-muted text-sm"
                  >
                    {file.status === 'uploading' && (
                      <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                    )}
                    {file.status === 'success' && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    <span className="truncate flex-1">{file.name}</span>
                    {file.status === 'error' && (
                      <span className="text-destructive text-xs">{file.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Files List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Imágenes Almacenadas</CardTitle>
              <CardDescription>
                {storageFiles.length} imágenes en el almacenamiento
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchStorageFiles}
              disabled={loadingFiles}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingFiles ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {storageFiles.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                No hay imágenes cargadas aún.
              </p>
              <Button 
                variant="link" 
                onClick={fetchStorageFiles}
                className="mt-2"
              >
                Cargar lista de imágenes
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {storageFiles.map((file) => (
                  <div 
                    key={file.name} 
                    className="group relative border rounded-lg overflow-hidden bg-muted"
                  >
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full aspect-square object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full text-xs"
                        onClick={() => copyToClipboard(file.url)}
                      >
                        Copiar URL
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full text-xs"
                        onClick={() => handleDeleteFile(file.name)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1">
                      <p className="text-white text-xs truncate">{file.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
