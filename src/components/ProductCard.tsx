import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  category_name: string;
  stock: number;
  expected_date?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  showStock?: boolean;
}

const ProductCard = ({ product, onAddToCart, showStock = false }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {product.stock !== null && product.stock <= 0 && (
          <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-3 py-1.5 rounded-lg shadow-lg text-xs font-semibold">
            <div className="flex flex-col gap-0.5">
              <span>Нет в наличии</span>
              {product.expected_date && (
                <span className="text-[10px] opacity-90">
                  Ожидается {new Date(product.expected_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                </span>
              )}
            </div>
          </div>
        )}
        <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover" />
      </div>
      <CardHeader>
        <CardTitle className="font-display">{product.name}</CardTitle>
        <CardDescription>{product.category_name}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-4">
          <p className="text-2xl font-bold text-primary">{product.price} ₽</p>
          {showStock && (
            <Badge variant="secondary">В наличии: {product.stock}</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => onAddToCart(product)}>
          <Icon name="ShoppingCart" size={18} className="mr-2" />
          В корзину
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;