import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

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
  description: string;
  price: number;
  category_name: string;
  stock: number;
  show_stock?: boolean;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

interface ProductGalleryDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (product: Product) => void;
}

const ProductGalleryDialog = ({ product, open, onOpenChange, onAddToCart }: ProductGalleryDialogProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  if (!product) return null;

  const images = product.images && product.images.length > 0 
    ? product.images.filter(img => img.image_url && img.image_url.trim() !== '').sort((a, b) => a.sort_order - b.sort_order)
    : [];

  const currentImage = images[currentImageIndex]?.image_url || '';
  const hasMultipleImages = images.length > 1;
  const hasVariants = product.variants && product.variants.length > 0;
  const showStock = product.show_stock !== false;
  
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayStock = selectedVariant 
    ? (selectedVariant.stock || selectedVariant.stock === 0 ? selectedVariant.stock : 999) 
    : (product.stock || product.stock === 0 ? product.stock : 999);
  const isInStock = displayStock > 0;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCurrentImageIndex(0);
      setSelectedVariant(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="relative group">
            {currentImage && (
              <img 
                src={currentImage} 
                alt={product.name}
                className="w-full h-[400px] object-cover rounded-lg"
              />
            )}
            
            {hasMultipleImages && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handlePrevImage}
                >
                  <Icon name="ChevronLeft" size={24} />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleNextImage}
                >
                  <Icon name="ChevronRight" size={24} />
                </Button>
                
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {hasMultipleImages && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative rounded overflow-hidden border-2 transition-all ${
                    index === currentImageIndex 
                      ? 'border-primary scale-105' 
                      : 'border-transparent hover:border-primary/50'
                  }`}
                >
                  <img 
                    src={img.image_url} 
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Badge variant="secondary" className="mb-2">{product.category_name}</Badge>
              <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
            </div>

            {hasVariants && (
              <div>
                <p className="text-sm font-medium mb-2">Выберите размер:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.variants!.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedVariant?.size === variant.size
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <p className="font-medium text-sm">{variant.size}</p>
                      <p className="text-lg font-bold text-primary">{variant.price} ₽</p>
                      {showStock && (
                        <p className="text-xs text-muted-foreground">
                          {variant.stock > 0 ? `${variant.stock} шт.` : 'В наличии'}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-primary">{displayPrice} ₽</p>
                {showStock && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {isInStock ? (displayStock === 999 ? 'В наличии' : `В наличии: ${displayStock} шт.`) : 'Нет в наличии'}
                  </p>
                )}
              </div>
              
              <Button 
                size="lg"
                onClick={() => {
                  onAddToCart(product);
                  handleOpenChange(false);
                }}
                disabled={!isInStock}
              >
                <Icon name="ShoppingCart" size={20} className="mr-2" />
                В корзину
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductGalleryDialog;