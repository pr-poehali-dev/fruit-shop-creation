import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface PaymentSettingsSectionProps {
  siteSettings: any;
}

const PaymentSettingsSection = ({ siteSettings }: PaymentSettingsSectionProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const hasCredentials = siteSettings.alfabank_login && siteSettings.alfabank_password;

  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Icon name="CreditCard" size={20} />
        Настройки оплаты Альфа-Банк
      </h3>
      
      {hasCredentials && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <Icon name="CheckCircle" size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">Касса подключена</p>
            <p className="text-xs text-green-700 mt-1">
              Клиенты могут оплачивать заказы банковскими картами
            </p>
          </div>
        </div>
      )}

      {!hasCredentials && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <Icon name="AlertCircle" size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">Касса не настроена</p>
            <p className="text-xs text-amber-700 mt-1">
              Введите данные для активации онлайн-оплаты
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="mb-3 p-3 bg-white border border-blue-100 rounded">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-700">
              <p className="font-medium mb-1">Где получить данные:</p>
              <ol className="list-decimal list-inside space-y-1 ml-1">
                <li>Войдите в личный кабинет Альфа-Банка для бизнеса</li>
                <li>Перейдите в раздел "Интернет-эквайринг"</li>
                <li>Найдите раздел "API" или "Настройки интеграции"</li>
                <li>Скопируйте логин и пароль для API</li>
              </ol>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="alfabank-login" className="flex items-center gap-2">
            <Icon name="User" size={16} />
            Логин Альфа-Банка
            {!siteSettings.alfabank_login && <span className="text-red-500">*</span>}
          </Label>
          <Input 
            id="alfabank-login" 
            name="alfabank_login" 
            defaultValue={siteSettings.alfabank_login || ''} 
            placeholder="merchant-api-login-test"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Icon name="Key" size={12} />
            Логин для доступа к API интернет-эквайринга
          </p>
        </div>

        <div>
          <Label htmlFor="alfabank-password" className="flex items-center gap-2">
            <Icon name="Lock" size={16} />
            Пароль Альфа-Банка
            {!siteSettings.alfabank_password && <span className="text-red-500">*</span>}
          </Label>
          <div className="relative mt-1">
            <Input 
              id="alfabank-password" 
              name="alfabank_password" 
              type={showPassword ? "text" : "password"}
              defaultValue={siteSettings.alfabank_password || ''} 
              placeholder="••••••••••••"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <Icon name={showPassword ? "EyeOff" : "Eye"} size={18} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Icon name="Shield" size={12} />
            Пароль хранится в зашифрованном виде в базе данных
          </p>
        </div>

        <div className="mt-4 p-3 bg-white border border-blue-100 rounded">
          <div className="flex items-start gap-2">
            <Icon name="Lightbulb" size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-700">
              <p className="font-medium mb-1">Тестовая среда:</p>
              <p>Для тестирования используйте тестовые учетные данные из личного кабинета. После настройки замените на боевые данные для приема реальных платежей.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettingsSection;