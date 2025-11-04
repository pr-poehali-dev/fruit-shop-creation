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
          className="w-full justify-start h-auto py-4 border-2 group hover:bg-gradient-to-r hover:from-green-600 hover:to-green-500 hover:border-green-600 hover:text-white hover:shadow-lg transition-all duration-300"
          disabled={isDisabled}
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 group-hover:bg-white/20 flex items-center justify-center mr-3 flex-shrink-0 transition-colors duration-300">
            <Icon name="Wallet" size={20} className="text-blue-600 group-hover:text-white" />
          </div>
          <div className="text-left flex-1">
            <div className="font-semibold group-hover:text-white">Балансом сайта</div>
            <div className="text-xs text-foreground/70 group-hover:text-white/90 mt-1">
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
        className="w-full justify-start h-auto py-4 border-2 group hover:bg-gradient-to-r hover:from-green-600 hover:to-green-500 hover:border-green-600 hover:text-white hover:shadow-lg transition-all duration-300"
        disabled={isDisabled}
      >
        <div className="w-10 h-10 rounded-full bg-green-100 group-hover:bg-white/20 flex items-center justify-center mr-3 flex-shrink-0 transition-colors duration-300">
          <Icon name="CreditCard" size={20} className="text-green-600 group-hover:text-white" />
        </div>
        <div className="text-left flex-1">
          <div className="font-semibold group-hover:text-white">Банковская карта</div>
          <div className="text-xs text-foreground/70 group-hover:text-white/90 mt-1">
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
          className="w-full justify-start h-auto py-4 border-2 group hover:bg-gradient-to-r hover:from-green-600 hover:to-green-500 hover:border-green-600 hover:text-white hover:shadow-lg transition-all duration-300"
          disabled={isDisabled}
        >
          <div className="w-10 h-10 rounded-full bg-amber-100 group-hover:bg-white/20 flex items-center justify-center mr-3 flex-shrink-0 transition-colors duration-300">
            <Icon name="Banknote" size={20} className="text-amber-600 group-hover:text-white" />
          </div>
          <div className="text-left flex-1">
            <div className="font-semibold group-hover:text-white">Наличными</div>
            <div className="text-xs text-foreground/70 group-hover:text-white/90 mt-1">
              {preorderEnabled
                ? `Предоплата ${(finalPrice * 0.5).toFixed(2)} ₽ картой, вторая часть после обработки`
                : 'Оплата курьеру или в пункте выдачи'}
            </div>
          </div>
        </Button>
      )}

      <div className="pt-4 mt-4 border-t">
        <div className="bg-muted/30 rounded-lg p-3 text-center space-y-1">
          <p className="text-xs font-semibold text-foreground">ИП Бояринцев Вадим Вячеславович</p>
          <p className="text-xs text-muted-foreground">ИНН: 222261894107</p>
        </div>
      </div>
    </div>
  );
};