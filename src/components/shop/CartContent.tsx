import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import Icon from '@/components/ui/icon';
import { CartItem, User } from '@/types/shop';
import { useState, useEffect } from 'react';

interface DeliveryZone {
  id: number;
  zone_name: string;
  delivery_price: string;
}

interface CartContentProps {
  cart: CartItem[];
  user: User | null;
  updateCartQuantity: (productId: number, quantity: number) => void;
  getTotalPrice: () => number;
  handleCheckout: (paymentMethod: string, deliveryType: string, deliveryZoneId?: number) => void;
  siteSettings?: any;
}

const CartContent = ({ 
  cart, 
  user, 
  updateCartQuantity, 
  getTotalPrice, 
  handleCheckout,
  siteSettings 
}: CartContentProps) => {
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  
  const deliveryEnabled = siteSettings?.delivery_enabled !== false;
  const pickupEnabled = siteSettings?.pickup_enabled !== false;
  const preorderEnabled = siteSettings?.preorder_enabled || false;
  const preorderMessage = siteSettings?.preorder_message || 'Предзаказ на весну 2026. Доставка с марта по май 2026 года.';
  const deliveryPrice = parseFloat(siteSettings?.delivery_price || 0);
  const courierDeliveryPrice = parseFloat(siteSettings?.courier_delivery_price || 0);
  const freeDeliveryMin = parseFloat(siteSettings?.free_delivery_min || 0);
  const pickupAddress = siteSettings?.address || '';
  
  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/8c8e301f-2323-4f3b-85f0-14a3c210e670');
        const data = await response.json();
        setDeliveryZones(data.zones || []);
      } catch (error) {
        console.error('Failed to load delivery zones:', error);
      }
    };
    
    if (deliveryEnabled) {
      loadZones();
    }
  }, [deliveryEnabled]);
  
  const getZoneDeliveryPrice = () => {
    if (!selectedZoneId) return deliveryPrice + courierDeliveryPrice;
    const zone = deliveryZones.find(z => z.id === selectedZoneId);
    return zone ? parseFloat(zone.delivery_price) : deliveryPrice + courierDeliveryPrice;
  };
  
  const getFinalPrice = () => {
    const basePrice = getTotalPrice();
    if (deliveryType === 'delivery') {
      const isFreeDelivery = freeDeliveryMin > 0 && basePrice >= freeDeliveryMin;
      const totalDeliveryFee = isFreeDelivery ? 0 : getZoneDeliveryPrice();
      return basePrice + totalDeliveryFee;
    }
    return basePrice;
  };
  
  const getDeliveryFee = () => {
    const basePrice = getTotalPrice();
    const isFreeDelivery = freeDeliveryMin > 0 && basePrice >= freeDeliveryMin;
    return isFreeDelivery ? 0 : getZoneDeliveryPrice();
  };

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
          
          {preorderEnabled && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Icon name="Calendar" size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Режим предзаказа</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{preorderMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-3 bg-muted/30 p-3 rounded-lg">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Icon name="MapPin" size={16} />
              Способ получения
            </h4>
            <RadioGroup value={deliveryType} onValueChange={setDeliveryType}>
              {pickupEnabled && (
                <div className="flex items-start space-x-2 p-3 rounded-lg border-2 border-primary/20 bg-background hover:bg-primary/5 transition-colors">
                  <RadioGroupItem value="pickup" id="pickup" className="mt-0.5" />
                  <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                    <div className="flex items-start gap-2">
                      <Icon name="Store" size={18} className="text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold">Самовывоз</p>
                        {pickupAddress && (
                          <p className="text-xs text-muted-foreground mt-1">{pickupAddress}</p>
                        )}
                        <p className="text-sm font-medium text-green-600 mt-1">Бесплатно</p>
                      </div>
                    </div>
                  </Label>
                </div>
              )}
              
              {deliveryEnabled && (
                <div className="space-y-2">
                  <div className="flex items-start space-x-2 p-3 rounded-lg border-2 border-primary/20 bg-background hover:bg-primary/5 transition-colors">
                    <RadioGroupItem value="delivery" id="delivery" className="mt-0.5" />
                    <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                      <div className="flex items-start gap-2">
                        <Icon name="Truck" size={18} className="text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold">Доставка</p>
                          <p className="text-xs text-muted-foreground mt-1">Доставим по указанному адресу</p>
                          <p className="text-sm font-medium text-primary mt-1">
                            {getDeliveryFee() > 0 ? `${getDeliveryFee()} ₽` : 'Бесплатно'}
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>
                  
                  {deliveryType === 'delivery' && deliveryZones.length > 0 && (
                    <div className="pl-9">
                      <Label htmlFor="delivery-zone" className="text-xs text-muted-foreground">
                        Выберите зону доставки
                      </Label>
                      <Select
                        value={selectedZoneId?.toString() || ''}
                        onValueChange={(value) => setSelectedZoneId(parseInt(value))}
                      >
                        <SelectTrigger id="delivery-zone" className="w-full mt-1">
                          <SelectValue placeholder="Выберите зону" />
                        </SelectTrigger>
                        <SelectContent>
                          {deliveryZones.map((zone) => (
                            <SelectItem key={zone.id} value={zone.id.toString()}>
                              {zone.zone_name} — {parseFloat(zone.delivery_price).toFixed(0)} ₽
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
            </RadioGroup>
          </div>

          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Товары:</span>
              <span>{getTotalPrice()} ₽</span>
            </div>
            {deliveryType === 'delivery' && getDeliveryFee() > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Доставка:</span>
                <span>{getDeliveryFee()} ₽</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Итого:</span>
              <span>{getFinalPrice()} ₽</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {user && (
              <Button className="w-full" variant="default" onClick={() => handleCheckout('balance', deliveryType, selectedZoneId || undefined)}>
                <Icon name="Wallet" size={18} className="mr-2" />
                Оплатить балансом ({(user.balance || 0).toFixed(2)}₽)
              </Button>
            )}
            <Button className="w-full" onClick={() => handleCheckout('alfabank', deliveryType, selectedZoneId || undefined)}>
              <Icon name="CreditCard" size={18} className="mr-2" />
              Оплатить через Альфа-Банк
            </Button>
            <Button className="w-full" variant="outline" onClick={() => handleCheckout('cash', deliveryType, selectedZoneId || undefined)}>
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