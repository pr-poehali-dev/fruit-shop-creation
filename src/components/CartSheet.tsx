import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface CartItem {
  product: {
    id: number;
    name: string;
    price: number;
    image_url: string;
  };
  quantity: number;
}

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onCheckout: (paymentMethod: string) => void;
}

const CartSheet = ({ open, onOpenChange, cart, onUpdateQuantity, onCheckout }: CartSheetProps) => {
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Корзина</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {cart.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Корзина пуста</p>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.product.id} className="flex gap-4 items-center">
                  <img src={item.product.image_url} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.product.price} ₽</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}>
                      <Icon name="Minus" size={16} />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button size="icon" variant="outline" onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}>
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
                <Button className="w-full" onClick={() => onCheckout('card')}>
                  <Icon name="CreditCard" size={18} className="mr-2" />
                  Оплатить картой
                </Button>
                <Button className="w-full" variant="outline" onClick={() => onCheckout('cash')}>
                  <Icon name="Wallet" size={18} className="mr-2" />
                  Наличными при получении
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
