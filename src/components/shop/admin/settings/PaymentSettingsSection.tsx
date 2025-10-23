import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface PaymentSettingsSectionProps {
  siteSettings: any;
}

const PaymentSettingsSection = ({ siteSettings }: PaymentSettingsSectionProps) => {
  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Icon name="CreditCard" size={20} />
        Настройки оплаты Альфа-Банк
      </h3>
      <div className="space-y-4 mb-6 p-4 bg-blue-50 rounded-lg">
        <div>
          <Label htmlFor="alfabank-login">Логин Альфа-Банка</Label>
          <Input 
            id="alfabank-login" 
            name="alfabank_login" 
            defaultValue={siteSettings.alfabank_login || ''} 
            placeholder="Логин для API Альфа-Банка"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Логин для доступа к API интернет-эквайринга
          </p>
        </div>
        <div>
          <Label htmlFor="alfabank-password">Пароль Альфа-Банка</Label>
          <Input 
            id="alfabank-password" 
            name="alfabank_password" 
            type="password"
            defaultValue={siteSettings.alfabank_password || ''} 
            placeholder="Пароль для API Альфа-Банка"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Пароль для доступа к API интернет-эквайринга
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettingsSection;
