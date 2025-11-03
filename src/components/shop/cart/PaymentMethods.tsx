import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { User } from '@/types/shop';

interface PaymentMethodsProps {
  user: User | null;
  selectedCity: string;
  isCashPaymentAvailable: boolean;
  preorderEnabled: boolean;
  finalPrice: number;
  deliveryType: string;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  deliveryAddress: string;
  selectedZoneId: number | null;
  deliveryCity: string;
  onCheckout: (paymentMethod: string, deliveryType: string, deliveryZoneId?: number, city?: string, address?: string) => void;
}

export const PaymentMethods = ({
  user,
  selectedCity,
  isCashPaymentAvailable,
  preorderEnabled,
  finalPrice,
  deliveryType,
  deliveryEnabled,
  pickupEnabled,
  deliveryAddress,
  selectedZoneId,
  deliveryCity,
  onCheckout
}: PaymentMethodsProps) => {
  if (!selectedCity) {
    return (
      <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
        <p className="text-sm text-yellow-900 dark:text-yellow-100">
          Сначала выберите город доставки
        </p>
      </div>
    );
  }

  const isDisabled = !pickupEnabled && !deliveryEnabled || (deliveryType === 'delivery' && !deliveryAddress.trim());

  return (
    <div className="space-y-2">
      {user && (
        <Button
          onClick={() => onCheckout('balance', deliveryType, selectedZoneId || undefined, deliveryCity, deliveryAddress)}
          variant="outline"
          className="w-full justify-start h-auto py-3"
          disabled={isDisabled}
        >
          <Icon name="Wallet" size={18} className="mr-2 flex-shrink-0" />
          <div className="text-left flex-1">
            <div className="font-semibold text-sm">Балансом сайта</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {preorderEnabled
                ? `Предоплата: ${(finalPrice * 0.5).toFixed(2)} ₽ (баланс: ${user.balance} ₽)`
                : `Ваш баланс: ${user.balance} ₽`}
            </div>
          </div>
        </Button>
      )}
      
      <Button
        onClick={() => onCheckout('card', deliveryType, selectedZoneId || undefined, deliveryCity, deliveryAddress)}
        variant="outline"
        className="w-full justify-start h-auto py-3"
        disabled={isDisabled}
      >
        <Icon name="CreditCard" size={18} className="mr-2 flex-shrink-0" />
        <div className="text-left flex-1">
          <div className="font-semibold text-sm">Банковская карта</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {preorderEnabled
              ? `Предоплата: ${(finalPrice * 0.5).toFixed(2)} ₽`
              : 'Оплата через Альфабанк'}
          </div>
        </div>
      </Button>



      {isCashPaymentAvailable && (
        <Button
          onClick={() => onCheckout('cash', deliveryType, selectedZoneId || undefined, deliveryCity, deliveryAddress)}
          variant="outline"
          className="w-full justify-start h-auto py-3"
          disabled={isDisabled}
        >
          <Icon name="Banknote" size={18} className="mr-2 flex-shrink-0" />
          <div className="text-left flex-1">
            <div className="font-semibold text-sm">Наличными</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {preorderEnabled
                ? `Предоплата ${(finalPrice * 0.5).toFixed(2)} ₽ картой, вторая часть после обработки`
                : 'Оплата курьеру или в пункте выдачи'}
            </div>
          </div>
        </Button>
      )}

      <div className="pt-3 mt-3 border-t text-center space-y-1">
        <p className="text-xs text-muted-foreground font-medium">ИП Бояринцев Вадим Вячеславович</p>
        <p className="text-xs text-muted-foreground">ИНН: 222261894107</p>
      </div>
    </div>
  );
};