import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API_UPLOAD = 'https://functions.poehali.dev/44df414c-694f-4079-aa96-764afeaf23e3';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  className?: string;
  showPreview?: boolean;
}

const ImageUploader = ({
  onImageUploaded,
  currentImageUrl,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 85,
  className = '',
  showPreview = true
}: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
  const [fileSize, setFileSize] = useState<string>('');
  const { toast } = useToast();

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ошибка',
        description: 'Выберите файл изображения',
        variant: 'destructive'
      });
      return;
    }

    // Форматируем размер файла
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setFileSize(`${sizeInMB} MB`);
    
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64Image = event.target?.result as string;

        const response = await fetch(API_UPLOAD, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Image,
            max_width: maxWidth,
            max_height: maxHeight,
            quality: quality
          })
        });

        const data = await response.json();

        if (data.success && data.url) {
          setPreviewUrl(data.url);
          onImageUploaded(data.url);
          toast({
            title: 'Успешно',
            description: `Изображение загружено${data.optimized_size ? ` (${data.optimized_size})` : ''}`
          });
        } else {
          throw new Error(data.error || 'Не удалось загрузить');
        }
      } catch (error) {
        console.error('Upload error:', error);
        setPreviewUrl(''); // Убираем превью при ошибке
        toast({
          title: 'Ошибка',
          description: error instanceof Error ? error.message : 'Не удалось загрузить изображение',
          variant: 'destructive'
        });
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось прочитать файл',
        variant: 'destructive'
      });
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
      e.target.value = ''; // Сбрасываем input для повторной загрузки
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) uploadImage(file);
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    onImageUploaded('');
  };

  return (
    <div className={className}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-primary font-medium">Загрузка и оптимизация...</p>
            {fileSize && <p className="text-xs text-muted-foreground">Размер: {fileSize}</p>}
          </div>
        ) : showPreview && previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-64 mx-auto object-contain rounded"
            />
            <div className="mt-3 flex gap-2 justify-center">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRemoveImage}
              >
                <Icon name="X" size={14} className="mr-1" />
                Удалить
              </Button>
              <label className="cursor-pointer">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                    input?.click();
                  }}
                >
                  <Icon name="RefreshCw" size={14} className="mr-1" />
                  Заменить
                </Button>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          <>
            <Icon name="Upload" size={32} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Перетащите изображение сюда или нажмите для выбора
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Поддерживаются файлы любого размера (будут оптимизированы до {maxWidth}x{maxHeight})
            </p>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;