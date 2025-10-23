import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface LoyaltySettingsSectionProps {
  siteSettings: any;
}

const LoyaltySettingsSection = ({ siteSettings }: LoyaltySettingsSectionProps) => {
  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Icon name="CreditCard" size={20} />
        Программа лояльности
      </h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="loyalty-card-price">Стоимость карты лояльности (₽)</Label>
          <Input 
            id="loyalty-card-price" 
            name="loyalty_card_price" 
            type="number"
            step="0.01"
            min="0"
            defaultValue={siteSettings.loyalty_card_price || 500} 
          />
          <p className="text-xs text-muted-foreground mt-1">
            Стоимость активации карты лояльности для клиента
          </p>
        </div>
        <div>
          <Label htmlFor="loyalty-unlock-amount">Сумма для бесплатной карты (₽)</Label>
          <Input 
            id="loyalty-unlock-amount" 
            name="loyalty_unlock_amount" 
            type="number"
            step="0.01"
            min="0"
            defaultValue={siteSettings.loyalty_unlock_amount || 5000} 
          />
          <p className="text-xs text-muted-foreground mt-1">
            При заказах на эту сумму карта выдаётся бесплатно
          </p>
        </div>
        <div>
          <Label htmlFor="loyalty-cashback-percent">Процент кэшбэка с картой (%)</Label>
          <Input 
            id="loyalty-cashback-percent" 
            name="loyalty_cashback_percent" 
            type="number"
            step="0.1"
            min="0"
            max="100"
            defaultValue={siteSettings.loyalty_cashback_percent || 5} 
          />
          <p className="text-xs text-muted-foreground mt-1">
            Процент возврата от суммы покупки для владельцев карты
          </p>
        </div>
        <div>
          <Label htmlFor="balance-payment-cashback">Кэшбэк при оплате балансом (%)</Label>
          <Input 
            id="balance-payment-cashback" 
            name="balance_payment_cashback_percent" 
            type="number"
            step="0.1"
            min="0"
            max="100"
            defaultValue={siteSettings.balance_payment_cashback_percent || 5} 
          />
          <p className="text-xs text-muted-foreground mt-1">
            Дополнительный кэшбэк при оплате личным балансом
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoyaltySettingsSection;
