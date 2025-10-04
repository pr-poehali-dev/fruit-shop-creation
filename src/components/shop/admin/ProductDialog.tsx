import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface ProductImage {
  id?: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
  category_name: string;
  stock: number;
  is_active: boolean;
  images?: ProductImage[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: Product | null;
  categories: Category[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>, images: ProductImage[]) => void;
}

const ProductDialog = ({ open, onOpenChange, editingProduct, categories, onSubmit }: ProductDialogProps) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editingProduct?.images && editingProduct.images.length > 0) {
      setImages(editingProduct.images);
    } else if (editingProduct?.image_url) {
      setImages([{ image_url: editingProduct.image_url, is_primary: true, sort_order: 0 }]);
    } else {
      setImages([]);
    }
    setNewImageUrl('');
  }, [editingProduct, open]);

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    if (isUploading) return;
    if (images.length >= 10) {
      alert('Можно добавить максимум 10 изображений');
      return;
    }
    
    const url = newImageUrl.trim();
    
    if (images.some(img => img.image_url === url)) {
      alert('Это изображение уже добавлено');
      return;
    }
    
    setIsUploading(true);
    
    const img = new Image();
    img.onload = () => {
      setImages(prevImages => {
        if (prevImages.some(img => img.image_url === url)) {
          return prevImages;
        }
        const newImage: ProductImage = {
          image_url: url,
          is_primary: prevImages.length === 0,
          sort_order: prevImages.length
        };
        return [...prevImages, newImage];
      });
      setNewImageUrl('');
      setIsUploading(false);
    };
    
    img.onerror = () => {
      alert('Не удалось загрузить изображение по этому URL. Проверьте правильность ссылки.');
      setIsUploading(false);
    };
    
    img.src = url;
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    if (newImages.length > 0 && images[index].is_primary) {
      newImages[0].is_primary = true;
    }
    newImages.forEach((img, i) => img.sort_order = i);
    setImages(newImages);
  };

  const handleSetPrimary = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      is_primary: i === index
    }));
    setImages(newImages);
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === images.length - 1)) return;
    
    const newImages = [...images];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];
    newImages.forEach((img, i) => img.sort_order = i);
    setImages(newImages);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }
    
    if (images.length >= 10) {
      alert('Можно добавить максимум 10 изображений');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target?.result as string;
        
        try {
          const response = await fetch('https://functions.poehali.dev/44df414c-694f-4079-aa96-764afeaf23e3', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: base64Image,
              filename: file.name
            })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success && data.url) {
            setImages(prevImages => {
              const newImage: ProductImage = {
                image_url: data.url,
                is_primary: prevImages.length === 0,
                sort_order: prevImages.length
              };
              return [...prevImages, newImage];
            });
          } else {
            console.error('Upload error:', data);
            alert(`Ошибка загрузки: ${data.error || 'Неизвестная ошибка'}`);
          }
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          alert(`Ошибка запроса: ${fetchError instanceof Error ? fetchError.message : 'Неизвестная ошибка'}`);
        }
        
        setIsUploading(false);
      };
      
      reader.onerror = () => {
        alert('Ошибка чтения файла');
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Reader error:', error);
      alert('Ошибка обработки файла');
      setIsUploading(false);
    }
    
    e.target.value = '';
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (images.length === 0) {
      alert('Добавьте хотя бы одно изображение товара');
      return;
    }
    onSubmit(e, images);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-2xl h-[90vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 gap-3 sm:gap-4">
        <DialogHeader className="pr-6">
          <DialogTitle className="text-lg sm:text-xl">{editingProduct ? 'Редактировать товар' : 'Добавить товар'}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">Заполните информацию о товаре</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <Label htmlFor="product-name" className="text-sm">Название товара *</Label>
            <Input 
              id="product-name" 
              name="name" 
              defaultValue={editingProduct?.name} 
              required 
              placeholder="Например: Яблоня Антоновка"
              className="mt-1 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="product-description" className="text-sm">Описание</Label>
            <Textarea 
              id="product-description" 
              name="description" 
              defaultValue={editingProduct?.description}
              placeholder="Подробное описание товара"
              rows={3}
              className="mt-1 text-sm resize-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="product-price" className="text-sm">Цена (₽) *</Label>
              <Input 
                id="product-price" 
                name="price" 
                type="number" 
                step="0.01"
                defaultValue={editingProduct?.price} 
                required
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="product-stock" className="text-sm">Количество на складе *</Label>
              <Input 
                id="product-stock" 
                name="stock" 
                type="number" 
                defaultValue={editingProduct?.stock || 0} 
                required
                className="mt-1 text-sm"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="product-category" className="text-sm">Категория *</Label>
            <Select name="category_id" defaultValue={editingProduct?.category_id?.toString()} required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Галерея изображений (до 10 фото) *</Label>
            <div className="space-y-2 sm:space-y-3 mt-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input 
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                  className="text-sm flex-1"
                />
                <Button 
                  type="button" 
                  onClick={handleAddImage} 
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
                  onChange={handleFileUpload}
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
                <div className="grid gap-2 max-h-[250px] sm:max-h-[300px] overflow-y-auto">
                  {images.map((img, index) => (
                    <Card key={index} className="p-2 sm:p-3">
                      <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                        <img src={img.image_url} alt="" className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm truncate">{img.image_url}</p>
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
                              onClick={() => handleMoveImage(index, 'up')}
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
                              onClick={() => handleMoveImage(index, 'down')}
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
                                onClick={() => handleSetPrimary(index)}
                                title="Сделать главным"
                                className="h-8 w-8 sm:h-10 sm:w-10"
                              >
                                <Icon name="Star" size={14} />
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => handleRemoveImage(index)}
                              title="Удалить"
                              className="h-8 w-8 sm:h-10 sm:w-10"
                            >
                              <Icon name="Trash2" size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-end pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Отмена
            </Button>
            <Button 
              type="submit"
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;