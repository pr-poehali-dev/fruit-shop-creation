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
  images?: ProductImage[];
  variants?: ProductVariant[];
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart, onViewDetails }: ProductCardProps) => {
  const primaryImage = product.images?.find(img => img.is_primary)?.image_url || product.image_url;
  const hasMultipleImages = product.images && product.images.length > 1;
  const hasVariants = product.variants && product.variants.length > 0;
  const showStock = product.show_stock !== false;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative group cursor-pointer" onClick={() => onViewDetails(product)}>
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
          {hasVariants ? (
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
              {showStock && <Badge variant="secondary">В наличии: {product.stock}</Badge>}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button 
          variant="outline" 
          className="flex-1" 
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(product);
          }}
        >
          <Icon name="Eye" size={18} className="mr-2" />
          Подробнее
        </Button>
        <Button 
          className="flex-1" 
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
        >
          <Icon name="ShoppingCart" size={18} className="mr-2" />
          В корзину
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;