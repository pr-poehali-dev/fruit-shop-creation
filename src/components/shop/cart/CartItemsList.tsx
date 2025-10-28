import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { CartItem } from '@/types/shop';

interface CartItemsListProps {
  cart: CartItem[];
  updateCartQuantity: (productId: number, quantity: number, size?: string) => void;
}

export const CartItemsList = ({ cart, updateCartQuantity }: CartItemsListProps) => {
  return (
    <>
      {cart.map((item, index) => (
        <div key={`${item.product.id}-${(item.product as any).selectedSize || ''}-${index}`} className="flex gap-4 items-center">
          <img src={item.product.image_url} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
          <div className="flex-1">
            <h4 className="font-medium">{item.product.name}</h4>
            {(item.product as any).selectedSize && (
              <p className="text-xs text-primary font-medium">Размер: {(item.product as any).selectedSize}</p>
            )}
            <p className="text-sm text-muted-foreground">{item.product.price} ₽</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, (item.product as any).selectedSize)}>
              <Icon name="Minus" size={16} />
            </Button>
            <span className="w-8 text-center">{item.quantity}</span>
            <Button size="icon" variant="outline" onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, (item.product as any).selectedSize)}>
              <Icon name="Plus" size={16} />
            </Button>
          </div>
        </div>
      ))}
    </>
  );
};
