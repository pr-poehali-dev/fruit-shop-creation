import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface ImageItem {
  id: string;
  url: string;
  name: string;
}

const Gallery = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Ошибка',
          description: 'Можно загружать только изображения',
          variant: 'destructive'
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: ImageItem = {
          id: Date.now().toString() + Math.random(),
          url: e.target?.result as string,
          name: file.name
        };
        setImages((prev) => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (selectedImage === id) {
      setSelectedImage(null);
    }
    toast({
      title: 'Удалено',
      description: 'Фото удалено из галереи'
    });
  };

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Галерея фотографий
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Загрузите и сохраните ваши любимые фотографии
            </p>
          </div>

          <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-pink-200 dark:border-gray-700">
            <div className="flex flex-col items-center justify-center space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                size="lg"
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              >
                <Icon name="Upload" className="mr-2" />
                Загрузить фото
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Поддерживаются форматы: JPG, PNG, GIF, WEBP
              </p>
            </div>
          </Card>

          {images.length === 0 ? (
            <Card className="p-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-dashed border-2 border-pink-300 dark:border-gray-600">
              <div className="text-center space-y-4">
                <Icon name="Image" size={64} className="mx-auto text-pink-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">
                  Пока нет загруженных фотографий
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((image) => (
                <Card
                  key={image.id}
                  className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-pink-200 dark:border-gray-700"
                  onClick={() => setSelectedImage(image.id)}
                >
                  <div className="aspect-square">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image.url, image.name);
                      }}
                    >
                      <Icon name="Download" size={20} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(image.id);
                      }}
                    >
                      <Icon name="Trash2" size={20} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Button
              size="sm"
              variant="ghost"
              className="absolute -top-12 right-0 text-white hover:text-white hover:bg-white/20"
              onClick={() => setSelectedImage(null)}
            >
              <Icon name="X" size={24} />
            </Button>
            <img
              src={images.find((img) => img.id === selectedImage)?.url}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
