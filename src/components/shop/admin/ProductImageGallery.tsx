import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductImage {
  id?: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
  width?: number;
  height?: number;
  object_fit?: string;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  newImageUrl: string;
  isUploading: boolean;
  onAddImage: () => void;
  onRemoveImage: (index: number) => void;
  onSetPrimary: (index: number) => void;
  onMoveImage: (index: number, direction: 'up' | 'down') => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewImageUrlChange: (value: string) => void;
  onReplaceImage: (index: number, file: File) => void;
  onUpdateImageDimensions: (index: number, width: number | undefined, height: number | undefined, objectFit: string) => void;
}

const ProductImageGallery = ({
  images,
  newImageUrl,
  isUploading,
  onAddImage,
  onRemoveImage,
  onSetPrimary,
  onMoveImage,
  onFileUpload,
  onNewImageUrlChange,
  onReplaceImage,
  onUpdateImageDimensions
}: ProductImageGalleryProps) => {
  const handleReplaceClick = (index: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onReplaceImage(index, file);
      }
    };
    input.click();
  };

  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };
  return (
    <div>
      <Label className="text-sm">Галерея изображений (до 10 фото) *</Label>
      <div className="space-y-2 sm:space-y-3 mt-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input 
            type="url"
            value={newImageUrl}
            onChange={(e) => onNewImageUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddImage())}
            className="text-sm flex-1"
          />
          <Button 
            type="button" 
            onClick={onAddImage} 
            disabled={images.length >= 10}
            className="w-full sm:w-auto whitespace-nowrap"
            size="default"
          >
            <Icon name="Link" size={16} className="sm:mr-2" />
            <span className="hidden sm:inline">URL</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-xs text-muted-foreground">или</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>
        <div>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={onFileUpload}
            className="hidden"
          />
          <Button 
            type="button" 
            variant="outline" 
            className="w-full text-sm"
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={images.length >= 10 || isUploading}
          >
            <Icon name={isUploading ? "Loader2" : "Upload"} size={16} className={`mr-2 ${isUploading ? 'animate-spin' : ''}`} />
            {isUploading ? 'Загрузка...' : 'Загрузить с компьютера'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Добавлено: {images.length}/10 изображений. Первое — главное.
        </p>
        
        {images.length > 0 && (
          <div className="grid gap-2 max-h-[400px] overflow-y-auto">
            {images.map((img, index) => (
              <Card key={index} className="p-2 sm:p-3">
                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <div className="relative group flex-shrink-0">
                    <img 
                      src={img.image_url} 
                      alt="" 
                      style={{
                        width: img.width ? `${img.width}px` : undefined,
                        height: img.height ? `${img.height}px` : undefined,
                        objectFit: (img.object_fit as any) || 'cover'
                      }}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <div 
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center cursor-pointer"
                      onClick={() => toggleExpanded(index)}
                    >
                      <Icon name="Settings2" size={16} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-xs sm:text-sm break-all line-clamp-2">{img.image_url}</p>
                    {img.is_primary && (
                      <Badge variant="default" className="mt-1 text-xs">Главное</Badge>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-1 flex-shrink-0">
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onMoveImage(index, 'up')}
                        disabled={index === 0}
                        title="Вверх"
                        className="h-8 w-8 sm:h-10 sm:w-10"
                      >
                        <Icon name="ChevronUp" size={14} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onMoveImage(index, 'down')}
                        disabled={index === images.length - 1}
                        title="Вниз"
                        className="h-8 w-8 sm:h-10 sm:w-10"
                      >
                        <Icon name="ChevronDown" size={14} />
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      {!img.is_primary && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => onSetPrimary(index)}
                          title="Сделать главным"
                          className="h-8 w-8 sm:h-10 sm:w-10"
                        >
                          <Icon name="Star" size={14} />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleReplaceClick(index)}
                        title="Заменить изображение"
                        disabled={isUploading}
                        className="h-8 w-8 sm:h-10 sm:w-10"
                      >
                        <Icon name="RefreshCw" size={14} />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => onRemoveImage(index)}
                        title="Удалить"
                        className="h-8 w-8 sm:h-10 sm:w-10"
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {expandedIndex === index && (
                  <div className="mt-3 pt-3 border-t space-y-3">
                    <div>
                      <Label className="text-xs mb-2 block">Превью</Label>
                      <div className="bg-muted/30 rounded-lg p-4 flex items-center justify-center min-h-[120px]">
                        <img 
                          src={img.image_url} 
                          alt="Preview" 
                          style={{
                            width: img.width ? `${img.width}px` : 'auto',
                            height: img.height ? `${img.height}px` : 'auto',
                            objectFit: (img.object_fit as any) || 'cover',
                            maxWidth: '100%'
                          }}
                          className="rounded border-2 border-dashed border-primary/30"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Ширина (px)</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Авто"
                          value={img.width || ''}
                          onChange={(e) => {
                            const val = e.target.value ? parseInt(e.target.value) : undefined;
                            onUpdateImageDimensions(index, val, img.height, img.object_fit || 'cover');
                          }}
                          className="text-sm h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Высота (px)</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Авто"
                          value={img.height || ''}
                          onChange={(e) => {
                            const val = e.target.value ? parseInt(e.target.value) : undefined;
                            onUpdateImageDimensions(index, img.width, val, img.object_fit || 'cover');
                          }}
                          className="text-sm h-9"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Подгонка изображения</Label>
                      <Select
                        value={img.object_fit || 'cover'}
                        onValueChange={(val) => onUpdateImageDimensions(index, img.width, img.height, val)}
                      >
                        <SelectTrigger className="text-sm h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cover">Cover (обрезка)</SelectItem>
                          <SelectItem value="contain">Contain (уместить)</SelectItem>
                          <SelectItem value="fill">Fill (растянуть)</SelectItem>
                          <SelectItem value="none">None (оригинал)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Оставьте поля пустыми для автоматического размера
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageGallery;