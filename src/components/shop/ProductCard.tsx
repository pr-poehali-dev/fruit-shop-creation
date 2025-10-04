import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

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
  category_name: string;
  stock: number;
  show_stock?: boolean;
  hide_main_price?: boolean;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: number) => void;
}

const ProductCard = ({ product, onAddToCart, onViewDetails, isFavorite = false, onToggleFavorite }: ProductCardProps) => {
  const primaryImage = product.images?.find(img => img.is_primary)?.image_url || product.image_url;
  const hasMultipleImages = product.images && product.images.length > 1;
  const hasVariants = product.variants && product.variants.length > 0;
  const showStock = product.show_stock !== false;
  const hideMainPrice = product.hide_main_price && hasVariants && product.variants!.length >= 2;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(product.id);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow relative">
      <div className="snow-cap"></div>
      <div className="relative group cursor-pointer" onClick={() => onViewDetails(product)}>
        {onToggleFavorite && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all hover:scale-110"
          >
            <Icon 
              name="Heart" 
              size={20} 
              className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}
            />
          </button>
        )}
        <img src={primaryImage} alt={product.name} className="w-full h-48 object-cover" />
        {hasMultipleImages && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="text-white text-center">
              <Icon name="Images" size={32} className="mx-auto mb-2" />
              <p className="text-sm font-medium">Ещё {product.images!.length - 1} фото</p>
            </div>
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="font-display">{product.name}</CardTitle>
        <CardDescription>{product.category_name}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="mt-4">
          {hideMainPrice ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {product.variants!.map((variant, idx) => (
                  <div key={idx} className="flex items-baseline gap-1">
                    <Badge variant="outline" className="text-xs">
                      {variant.size}
                    </Badge>
                    <span className="text-sm font-semibold">{variant.price} ₽</span>
                  </div>
                ))}
              </div>
            </div>
          ) : hasVariants ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Цены от:</p>
              <p className="text-2xl font-bold text-primary">{Math.min(...product.variants!.map(v => v.price))} ₽</p>
              <div className="flex flex-wrap gap-1">
                {product.variants!.slice(0, 3).map((variant, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {variant.size}
                  </Badge>
                ))}
                {product.variants!.length > 3 && (
                  <Badge variant="outline" className="text-xs">+{product.variants!.length - 3}</Badge>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-primary">{product.price} ₽</p>
              {showStock && (
                <Badge variant="secondary">
                  {product.stock > 0 ? `В наличии: ${product.stock}` : 'В наличии'}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button 
          variant="outline" 
          className="flex-1 relative overflow-hidden snow-button" 
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(product);
          }}
        >
          <div className="button-snow-cap"></div>
          <Icon name="Eye" size={18} className="mr-2" />
          Подробнее
        </Button>
        <Button 
          className="flex-1 relative overflow-hidden snow-button" 
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
        >
          <div className="button-snow-cap"></div>
          <Icon name="ShoppingCart" size={18} className="mr-2" />
          В корзину
        </Button>
      </CardFooter>
      
      <style>{`
        .snow-cap {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 20px;
          background: linear-gradient(to bottom, #ffffff 0%, #f0f9ff 50%, transparent 100%);
          border-radius: 0 0 50% 50% / 0 0 100% 100%;
          z-index: 10;
          pointer-events: none;
          box-shadow: 0 2px 8px rgba(255, 255, 255, 0.5);
        }
        
        .snow-cap::before {
          content: '';
          position: absolute;
          top: -2px;
          left: 10%;
          right: 10%;
          height: 4px;
          background: white;
          border-radius: 50%;
          filter: blur(1px);
        }
        
        .snow-cap::after {
          content: '❄️';
          position: absolute;
          top: 2px;
          right: 15px;
          font-size: 12px;
          animation: sparkle 2s ease-in-out infinite;
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0.6; transform: rotate(0deg); }
          50% { opacity: 1; transform: rotate(20deg); }
        }
        
        .button-snow-cap {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 8px;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 0%, rgba(240, 249, 255, 0.2) 50%, transparent 100%);
          border-radius: 0 0 50% 50% / 0 0 100% 100%;
          pointer-events: none;
          z-index: 1;
        }
        
        .snow-button {
          transition: all 0.3s ease;
        }
        
        .snow-button:hover .button-snow-cap {
          height: 12px;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.6) 0%, rgba(240, 249, 255, 0.3) 50%, transparent 100%);
        }
      `}</style>
    </Card>
  );
};

export default ProductCard;