import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Product } from './types';

interface ProductCardFooterProps {
  product: Product;
  hideMainPrice: boolean;
  onAddToCartClick: (e: React.MouseEvent) => void;
}

const ProductCardFooter = ({ 
  product, 
  hideMainPrice, 
  onAddToCartClick 
}: ProductCardFooterProps) => {
  return (
    <CardFooter className="flex gap-2 pt-4">
      {!hideMainPrice && (
        <Button 
          className="flex-1" 
          onClick={onAddToCartClick}
          disabled={product.stock !== null && product.stock <= 0}
        >
          <Icon name="ShoppingCart" size={18} className="mr-2" />
          {product.stock !== null && product.stock <= 0 ? 'Нет в наличии' : 'В корзину'}
        </Button>
      )}
    </CardFooter>
  );
};

export default ProductCardFooter;
