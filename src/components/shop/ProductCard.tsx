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
  siteSettings?: any;
  isAuthenticated?: boolean;
  onShowAuth?: () => void;
}

const ProductCard = ({ product, onAddToCart, onViewDetails, isFavorite = false, onToggleFavorite, siteSettings, isAuthenticated = false, onShowAuth }: ProductCardProps) => {
  const primaryImage = product.images?.find(img => img.is_primary)?.image_url || product.image_url;
  const hasMultipleImages = product.images && product.images.length > 1;
  const hasVariants = product.variants && product.variants.length > 0;
  const showStock = product.show_stock !== false;
  const hideMainPrice = product.hide_main_price && hasVariants && product.variants!.length >= 2;
  const isNewYear = siteSettings?.holiday_theme === 'new_year';
  const isHalloween = siteSettings?.holiday_theme === 'halloween';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(product.id);
    }
  };

  return (
    <Card className={`overflow-hidden transition-all relative ${isHalloween ? 'halloween-card hover:shadow-[0_0_30px_rgba(255,120,0,0.5)] border-2 border-orange-500/30' : 'hover:shadow-lg'}`}>
      {isNewYear && <div className="snow-cap"></div>}
      {isHalloween && (
        <>
          <div className="halloween-glow"></div>
          <div className="halloween-corner halloween-corner-tl">🕷️</div>
          <div className="halloween-corner halloween-corner-tr">🦇</div>
        </>
      )}
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
        {primaryImage && primaryImage.trim() !== '' ? (
          <>
            <img src={primaryImage} alt={product.name} className="w-full h-48 object-cover" />
            {hasMultipleImages && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-white text-center">
                  <Icon name="Images" size={32} className="mx-auto mb-2" />
                  <p className="text-sm font-medium">Ещё {product.images!.length - 1} фото</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
            <div className="text-center text-gray-400 dark:text-gray-500">
              <Icon name="ImageOff" size={48} className="mx-auto mb-2" />
              <p className="text-sm font-medium">Картинка ещё не добавлена</p>
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
          className={`flex-1 relative overflow-hidden ${isNewYear ? 'snow-button' : ''} ${isHalloween ? 'halloween-button-outline' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(product);
          }}
        >
          {isNewYear && <div className="button-snow-cap"></div>}
          {isHalloween && <div className="halloween-button-glow"></div>}
          <Icon name="Eye" size={18} className="mr-2" />
          Подробнее
        </Button>
        <Button 
          className={`flex-1 relative overflow-hidden ${isNewYear ? 'snow-button' : ''} ${isHalloween ? 'halloween-button' : ''} ${!isAuthenticated ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            console.log('ProductCard button clicked', { isAuthenticated, hasVariants, product: product.name });
            if (!isAuthenticated) {
              console.log('User not authenticated, showing auth dialog');
              onShowAuth?.();
              return;
            }
            if (hasVariants) {
              console.log('Has variants, opening details');
              onViewDetails(product);
            } else {
              console.log('Adding to cart', product.name);
              onAddToCart(product);
            }
          }}
        >
          {isNewYear && <div className="button-snow-cap"></div>}
          {isHalloween && <div className="halloween-button-glow"></div>}
          {!isAuthenticated ? (
            <>
              <Icon name="Lock" size={18} className="mr-2" />
              Войти для покупки
            </>
          ) : (
            <>
              <Icon name="ShoppingCart" size={18} className="mr-2" />
              В корзину
            </>
          )}
        </Button>
      </CardFooter>
      
      <style>{`
        .halloween-card {
          position: relative;
          background: linear-gradient(135deg, rgba(20, 10, 30, 0.05) 0%, rgba(40, 20, 0, 0.05) 100%);
        }

        .halloween-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 0%, rgba(255, 120, 0, 0.1) 0%, transparent 50%);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
        }

        .halloween-card:hover .halloween-glow {
          opacity: 1;
        }

        .halloween-corner {
          position: absolute;
          font-size: 20px;
          z-index: 10;
          animation: halloween-corner-float 3s ease-in-out infinite;
          filter: drop-shadow(0 0 8px rgba(255, 120, 0, 0.6));
        }

        .halloween-corner-tl {
          top: 8px;
          left: 8px;
        }

        .halloween-corner-tr {
          top: 8px;
          right: 8px;
          animation-delay: 1.5s;
        }

        @keyframes halloween-corner-float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-5px) rotate(10deg);
          }
        }

        .halloween-button {
          background: linear-gradient(135deg, #ff7700 0%, #ff4500 50%, #ff7700 100%);
          background-size: 200% 200%;
          animation: halloween-gradient 3s ease infinite;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(255, 120, 0, 0.4);
          border: 2px solid #ff9933;
        }

        .halloween-button:hover {
          box-shadow: 0 0 30px rgba(255, 120, 0, 0.8);
          transform: translateY(-2px);
        }

        .halloween-button-outline {
          border: 2px solid #ff7700;
          background: rgba(255, 120, 0, 0.05);
          color: #ff7700;
          box-shadow: 0 0 15px rgba(255, 120, 0, 0.2);
        }

        .halloween-button-outline:hover {
          background: rgba(255, 120, 0, 0.15);
          box-shadow: 0 0 25px rgba(255, 120, 0, 0.4);
          transform: translateY(-2px);
        }

        .halloween-button-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255, 200, 100, 0.6) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          opacity: 0;
          animation: halloween-button-pulse 2s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes halloween-gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes halloween-button-pulse {
          0%, 100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          50% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1.2);
          }
        }

        .snow-cap {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 25px;
          background: linear-gradient(to bottom, 
            #ffffff 0%, 
            #f0f9ff 30%, 
            #e0f2fe 60%, 
            rgba(224, 242, 254, 0.3) 100%
          );
          border-radius: 0 0 60% 40% / 0 0 120% 80%;
          z-index: 10;
          pointer-events: none;
          box-shadow: 
            0 4px 12px rgba(147, 197, 253, 0.4),
            inset 0 -2px 4px rgba(255, 255, 255, 0.8),
            inset 0 2px 3px rgba(255, 255, 255, 1);
          filter: drop-shadow(0 2px 4px rgba(191, 219, 254, 0.6));
        }
        
        .snow-cap::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          background: 
            radial-gradient(ellipse 15px 8px at 20% 40%, rgba(255, 255, 255, 0.9) 0%, transparent 70%),
            radial-gradient(ellipse 12px 6px at 45% 50%, rgba(255, 255, 255, 0.7) 0%, transparent 70%),
            radial-gradient(ellipse 18px 9px at 70% 35%, rgba(255, 255, 255, 0.8) 0%, transparent 70%),
            radial-gradient(ellipse 10px 5px at 85% 45%, rgba(255, 255, 255, 0.6) 0%, transparent 70%);
          border-radius: inherit;
        }
        
        .snow-cap::after {
          content: '';
          position: absolute;
          top: 18px;
          left: 0;
          right: 0;
          height: 8px;
          background: 
            radial-gradient(circle 3px at 15% 50%, #e0f2fe 0%, transparent 100%),
            radial-gradient(circle 4px at 35% 50%, #dbeafe 0%, transparent 100%),
            radial-gradient(circle 3px at 55% 50%, #e0f2fe 0%, transparent 100%),
            radial-gradient(circle 5px at 75% 50%, #dbeafe 0%, transparent 100%),
            radial-gradient(circle 3px at 90% 50%, #e0f2fe 0%, transparent 100%);
          filter: blur(1px);
          opacity: 0.7;
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