import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export const ImageUploader = ({ images, onChange, maxImages = 4 }: ImageUploaderProps) => {
  const [newImageUrl, setNewImageUrl] = useState('');

  const addImage = () => {
    if (newImageUrl && images.length < maxImages) {
      onChange([...images, newImageUrl]);
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="url"
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          placeholder="URL de la imagen"
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
        />
        <Button
          type="button"
          onClick={addImage}
          disabled={images.length >= maxImages || !newImageUrl}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Agregar
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative group">
            <img
              src={url}
              alt={`Imagen ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeImage(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      
      <p className="text-sm text-muted-foreground">
        {images.length} / {maxImages} imágenes
      </p>
    </div>
  );
};
