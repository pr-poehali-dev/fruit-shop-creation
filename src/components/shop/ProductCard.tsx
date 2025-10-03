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
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  showStock?: boolean;
}

const ProductCard = ({ product, onAddToCart, showStock = false }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover" />
      <CardHeader>
        <CardTitle className="font-display">{product.name}</CardTitle>
        <CardDescription>{product.category_name}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-4">
          <p className="text-2xl font-bold text-primary">{product.price} ₽</p>
          {showStock && <Badge variant="secondary">В наличии: {product.stock}</Badge>}
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
