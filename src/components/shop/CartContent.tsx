import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { CartItem, User } from '@/types/shop';

interface CartContentProps {
  cart: CartItem[];
  user: User | null;
  updateCartQuantity: (productId: number, quantity: number) => void;
  getTotalPrice: () => number;
  handleCheckout: (paymentMethod: string) => void;
}

const CartContent = ({ 
  cart, 
  user, 
  updateCartQuantity, 
  getTotalPrice, 
  handleCheckout 
}: CartContentProps) => {
  return (
    <div className="mt-6 space-y-4">
      {cart.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Корзина пуста</p>
      ) : (
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
          <Separator />
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Итого:</span>
            <span>{getTotalPrice()} ₽</span>
          </div>
          <div className="space-y-2">
            {user && (
              <Button className="w-full" variant="default" onClick={() => handleCheckout('balance')}>
                <Icon name="Wallet" size={18} className="mr-2" />
                Оплатить балансом ({(user.balance || 0).toFixed(2)}₽)
              </Button>
            )}
            <Button className="w-full" onClick={() => handleCheckout('card')}>
              <Icon name="CreditCard" size={18} className="mr-2" />
              Оплатить картой
            </Button>
            <Button className="w-full" variant="outline" onClick={() => handleCheckout('cash')}>
              <Icon name="Coins" size={18} className="mr-2" />
              Наличными при получении
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartContent;