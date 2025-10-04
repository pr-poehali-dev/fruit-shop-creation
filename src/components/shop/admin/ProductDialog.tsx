import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import ProductBasicFields from './ProductBasicFields';
import ProductImageGallery from './ProductImageGallery';
import ProductVariants from './ProductVariants';

interface ProductImage {
  id?: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

interface ProductVariant {
  id?: number;
  size: string;
  price: number;
  stock: number;
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
  show_stock?: boolean;
  images?: ProductImage[];
  variants?: ProductVariant[];
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
  onSubmit: (e: React.FormEvent<HTMLFormElement>, images: ProductImage[], variants: ProductVariant[], showStock: boolean) => void;
}

const ProductDialog = ({ open, onOpenChange, editingProduct, categories, onSubmit }: ProductDialogProps) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newVariantSize, setNewVariantSize] = useState('');
  const [newVariantPrice, setNewVariantPrice] = useState('');
  const [newVariantStock, setNewVariantStock] = useState('');
  const [showStock, setShowStock] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editingProduct?.images && editingProduct.images.length > 0) {
      setImages(editingProduct.images);
    } else {
      setImages([]);
    }
    
    if (editingProduct?.variants && editingProduct.variants.length > 0) {
      setVariants(editingProduct.variants);
    } else {
      setVariants([]);
    }
    
    setShowStock(editingProduct?.show_stock ?? true);
    setNewImageUrl('');
    setNewVariantSize('');
    setNewVariantPrice('');
    setNewVariantStock('');
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
      const newImage: ProductImage = {
        image_url: url,
        is_primary: images.length === 0,
        sort_order: images.length
      };
      setImages([...images, newImage]);
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

  const handleAddVariant = () => {
    if (!newVariantSize.trim() || !newVariantPrice.trim()) return;
    
    const newVariant: ProductVariant = {
      size: newVariantSize.trim(),
      price: parseFloat(newVariantPrice),
      stock: parseInt(newVariantStock) || 0,
      sort_order: variants.length
    };
    
    setVariants([...variants, newVariant]);
    setNewVariantSize('');
    setNewVariantPrice('');
    setNewVariantStock('');
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    newVariants.forEach((v, i) => v.sort_order = i);
    setVariants(newVariants);
  };

  const handleMoveVariant = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === variants.length - 1)) return;
    
    const newVariants = [...variants];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newVariants[index], newVariants[swapIndex]] = [newVariants[swapIndex], newVariants[index]];
    newVariants.forEach((v, i) => v.sort_order = i);
    setVariants(newVariants);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (images.length === 0) {
      alert('Добавьте хотя бы одно изображение товара');
      return;
    }
    onSubmit(e, images, variants, showStock);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-2xl lg:max-w-4xl xl:max-w-5xl h-[90vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 gap-3 sm:gap-4">
        <DialogHeader className="pr-6">
          <DialogTitle className="text-lg sm:text-xl">{editingProduct ? 'Редактировать товар' : 'Добавить товар'}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">Заполните информацию о товаре</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit} className="space-y-3 sm:space-y-4">
          <ProductBasicFields
            editingProduct={editingProduct}
            categories={categories}
            showStock={showStock}
            onShowStockChange={setShowStock}
          />

          <ProductImageGallery
            images={images}
            newImageUrl={newImageUrl}
            isUploading={isUploading}
            onAddImage={handleAddImage}
            onRemoveImage={handleRemoveImage}
            onSetPrimary={handleSetPrimary}
            onMoveImage={handleMoveImage}
            onFileUpload={handleFileUpload}
            onNewImageUrlChange={setNewImageUrl}
          />

          <ProductVariants
            variants={variants}
            newVariantSize={newVariantSize}
            newVariantPrice={newVariantPrice}
            newVariantStock={newVariantStock}
            onAddVariant={handleAddVariant}
            onRemoveVariant={handleRemoveVariant}
            onMoveVariant={handleMoveVariant}
            onNewVariantSizeChange={setNewVariantSize}
            onNewVariantPriceChange={setNewVariantPrice}
            onNewVariantStockChange={setNewVariantStock}
          />

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