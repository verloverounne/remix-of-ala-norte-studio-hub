import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { X, Plus, Star, StarOff, GripVertical, Image as ImageIcon } from 'lucide-react';
import { StorageImageSelector } from '@/components/StorageImageSelector';
import { cn } from '@/lib/utils';

interface EquipmentImageManagerProps {
  imageUrl: string | null; // Imagen principal
  images: string[]; // Array de imágenes adicionales
  onImageUrlChange: (url: string | null) => void;
  onImagesChange: (images: string[]) => void;
}

export const EquipmentImageManager = ({
  imageUrl,
  images,
  onImageUrlChange,
  onImagesChange
}: EquipmentImageManagerProps) => {
  const [newImageUrl, setNewImageUrl] = useState('');

  // Combinar todas las imágenes: principal primero, luego las adicionales
  const allImages = [
    ...(imageUrl ? [imageUrl] : []),
    ...images.filter(img => img !== imageUrl) // Evitar duplicados
  ];

  const addImage = () => {
    if (newImageUrl && !allImages.includes(newImageUrl)) {
      if (!imageUrl) {
        // Si no hay imagen principal, esta será la principal
        onImageUrlChange(newImageUrl);
      } else {
        // Agregar a imágenes adicionales
        onImagesChange([...images, newImageUrl]);
      }
      setNewImageUrl('');
    }
  };

  const removeImage = (urlToRemove: string) => {
    if (urlToRemove === imageUrl) {
      // Si es la imagen principal, eliminarla y usar la primera adicional si existe
      onImageUrlChange(images.length > 0 ? images[0] : null);
      onImagesChange(images.filter(img => img !== images[0]));
    } else {
      // Eliminar de imágenes adicionales
      onImagesChange(images.filter(img => img !== urlToRemove));
    }
  };

  const setAsMain = (url: string) => {
    if (url === imageUrl) return; // Ya es la principal
    
    // Si la URL está en imágenes adicionales, moverla a principal
    const newAdditionalImages = images.filter(img => img !== url);
    if (imageUrl) {
      // Mover la actual principal a adicionales
      newAdditionalImages.push(imageUrl);
    }
    
    onImageUrlChange(url);
    onImagesChange(newAdditionalImages);
  };

  const removeAsMain = () => {
    if (imageUrl) {
      // Mover la principal a adicionales
      onImagesChange([...images, imageUrl]);
      onImageUrlChange(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Gestionar Imágenes del Equipo</Label>
        <p className="text-xs text-muted-foreground">
          La imagen principal se mostrará en las cards de la página de rental. 
          Todas las imágenes se mostrarán en el detalle del equipo como carrusel.
        </p>
      </div>

      {/* Agregar nueva imagen */}
      <Card className="border-2">
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <StorageImageSelector
                value={newImageUrl}
                onChange={setNewImageUrl}
                placeholder="Seleccionar imagen del storage..."
              />
            </div>
            <Button
              type="button"
              onClick={addImage}
              disabled={!newImageUrl || allImages.includes(newImageUrl)}
              size="sm"
              variant="hero"
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de imágenes */}
      {allImages.length > 0 ? (
        <div className="space-y-3">
          <Label className="text-sm font-semibold">
            Imágenes del Equipo ({allImages.length})
          </Label>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {allImages.map((url, index) => {
              const isMain = url === imageUrl;
              
              return (
                <Card 
                  key={url} 
                  className={cn(
                    "relative group overflow-hidden border-2 transition-all",
                    isMain ? "border-primary ring-2 ring-primary" : "border-muted"
                  )}
                >
                  <div className="aspect-square relative">
                    <img
                      src={url}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Badge de imagen principal */}
                    {isMain && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-heading flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          PRINCIPAL
                        </div>
                      </div>
                    )}

                    {/* Overlay con acciones */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                      {!isMain ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="w-full text-xs"
                          onClick={() => setAsMain(url)}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Hacer Principal
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="w-full text-xs"
                          onClick={removeAsMain}
                        >
                          <StarOff className="h-3 w-3 mr-1" />
                          Quitar Principal
                        </Button>
                      )}
                      
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => removeImage(url)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                  
                  {/* Indicador de posición */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1">
                    <p className="text-white text-xs text-center font-mono">
                      #{index + 1} {isMain && '• Principal'}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="py-8 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No hay imágenes asignadas. Agrega una imagen para comenzar.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Información adicional */}
      {allImages.length > 0 && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• La imagen marcada como <strong>PRINCIPAL</strong> se mostrará en las cards de la página de rental.</p>
          <p>• Todas las imágenes se mostrarán en el detalle del equipo como carrusel.</p>
          <p>• Puedes cambiar la imagen principal en cualquier momento haciendo clic en "Hacer Principal".</p>
        </div>
      )}
    </div>
  );
};
