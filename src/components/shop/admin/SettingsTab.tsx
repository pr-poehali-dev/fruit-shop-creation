import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';

interface SettingsTabProps {
  siteSettings: any;
  onSaveSettings: (e: React.FormEvent<HTMLFormElement>) => void;
}

const SettingsTab = ({ siteSettings, onSaveSettings }: SettingsTabProps) => {
  const [holidayTheme, setHolidayTheme] = useState(siteSettings.holiday_theme || 'none');

  useEffect(() => {
    setHolidayTheme(siteSettings.holiday_theme || 'none');
  }, [siteSettings]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Информация о сайте</CardTitle>
        <CardDescription>Настройте основную информацию</CardDescription>
      </CardHeader>
      <CardContent>
        <form key={JSON.stringify(siteSettings)} onSubmit={onSaveSettings} className="space-y-4">
          <div className="border-b pb-4 mb-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>🎃</span> Праздничная тема сайта <span>🎄</span>
            </h3>
            <div>
              <Label htmlFor="holiday-theme">Выберите праздничную тему</Label>
              <input type="hidden" name="holiday_theme" value={holidayTheme} />
              <Select value={holidayTheme} onValueChange={setHolidayTheme}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите тему" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <div className="flex items-center gap-2">
                      <span>🌿</span>
                      <span>Без праздничной темы</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="new_year">
                    <div className="flex items-center gap-2">
                      <span>🎄</span>
                      <span>Новый год</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="halloween">
                    <div className="flex items-center gap-2">
                      <span>🎃</span>
                      <span>Хэллоуин</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="summer">
                    <div className="flex items-center gap-2">
                      <span>☀️</span>
                      <span>Лето</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Праздничное оформление сайта будет автоматически применено
              </p>
            </div>
          </div>
          <div>
            <Label htmlFor="site-name">Название питомника</Label>
            <Input id="site-name" name="site_name" defaultValue={siteSettings.site_name || 'Питомник растений'} required />
          </div>
          <div>
            <Label htmlFor="logo-url">URL логотипа</Label>
            <Input 
              id="logo-url" 
              name="logo_url" 
              defaultValue={siteSettings.logo_url || ''} 
              placeholder="/img/a1a22e5b-c78c-45d4-b175-00ce2339c64f.jpg"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Введите путь к изображению логотипа или ссылку (например: /img/logo.jpg)
            </p>
            {siteSettings.logo_url && (
              <div className="mt-2">
                <img 
                  src={siteSettings.logo_url} 
                  alt="Превью логотипа" 
                  className="h-16 w-16 rounded-full object-cover border-2 border-emerald-500"
                />
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="site-description">Описание</Label>
            <Textarea id="site-description" name="site_description" defaultValue={siteSettings.site_description || 'Плодовые и декоративные культуры высокого качества'} rows={3} />
          </div>
          <div>
            <Label htmlFor="site-phone">Телефон</Label>
            <Input id="site-phone" name="phone" defaultValue={siteSettings.phone || '+7 (495) 123-45-67'} />
          </div>
          <div>
            <Label htmlFor="site-email">Email</Label>
            <Input id="site-email" name="email" type="email" defaultValue={siteSettings.email || 'info@plantsnursery.ru'} />
          </div>
          <div>
            <Label htmlFor="site-address">Адрес</Label>
            <Input id="site-address" name="address" defaultValue={siteSettings.address || 'Московская область, г. Пушкино, ул. Садовая, 15'} />
          </div>
          <div>
            <Label htmlFor="work-hours">Режим работы</Label>
            <Input id="work-hours" name="work_hours" defaultValue={siteSettings.work_hours || 'Пн-Вс: 9:00 - 19:00'} />
          </div>
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon name="Truck" size={20} />
              Настройки доставки
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="delivery-enabled" 
                  name="delivery_enabled"
                  defaultChecked={siteSettings.delivery_enabled !== false}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="delivery-enabled" className="cursor-pointer">
                  Включить доставку (если выключено - только самовывоз)
                </Label>
              </div>
              <div>
                <Label htmlFor="delivery-price">Стоимость доставки (₽)</Label>
                <Input 
                  id="delivery-price" 
                  name="delivery_price" 
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={siteSettings.delivery_price || 0} 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Укажите 0 для бесплатной доставки
                </p>
              </div>
              <div>
                <Label htmlFor="free-delivery-min">Минимальная сумма для бесплатной доставки (₽)</Label>
                <Input 
                  id="free-delivery-min" 
                  name="free_delivery_min" 
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={siteSettings.free_delivery_min || 3000} 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  При заказе от этой суммы доставка становится бесплатной. Укажите 0, чтобы отключить
                </p>
              </div>
              <div>
                <Label htmlFor="courier-delivery-price">Стоимость курьерской доставки (₽)</Label>
                <Input 
                  id="courier-delivery-price" 
                  name="courier_delivery_price" 
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={siteSettings.courier_delivery_price || 300} 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Стоимость доставки курьером
                </p>
              </div>
            </div>
          </div>
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">Настройки карты лояльности</h3>
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
                  Цена покупки виртуальной карты лояльности с QR-кодом
                </p>
              </div>
              <div>
                <Label htmlFor="loyalty-unlock-amount">Сумма покупок для бесплатного получения (₽)</Label>
                <Input 
                  id="loyalty-unlock-amount" 
                  name="loyalty_unlock_amount" 
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={siteSettings.loyalty_unlock_amount || 5000} 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Карта автоматически откроется при достижении этой суммы покупок
                </p>
              </div>
              <div>
                <Label htmlFor="loyalty-cashback-percent">Процент кэшбэка по карте лояльности (%)</Label>
                <Input 
                  id="loyalty-cashback-percent" 
                  name="loyalty_cashback_percent" 
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  defaultValue={siteSettings.loyalty_cashback_percent || 5} 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Процент от покупки, который начисляется владельцам карты лояльности
                </p>
              </div>
              <div>
                <Label htmlFor="balance-payment-cashback-percent">Процент кэшбэка при оплате балансом (%)</Label>
                <Input 
                  id="balance-payment-cashback-percent" 
                  name="balance_payment_cashback_percent" 
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  defaultValue={siteSettings.balance_payment_cashback_percent || 5} 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Процент от покупки с баланса, который возвращается как кэшбэк владельцам карты
                </p>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="price-list-url">Ссылка на прайс-лист</Label>
            <Input 
              id="price-list-url" 
              name="price_list_url" 
              type="url"
              defaultValue={siteSettings.price_list_url || ''} 
              placeholder="https://example.com/price.pdf"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ссылка на скачивание прайс-листа (PDF, Excel и т.д.)
            </p>
          </div>
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">Дополнительная информация для меню</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="promotions">Акции</Label>
                <Textarea 
                  id="promotions" 
                  name="promotions" 
                  defaultValue={siteSettings.promotions || ''} 
                  placeholder="Например: Скидка 20% на все саженцы!"
                  rows={3} 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Эта информация будет отображаться в боковом меню
                </p>
              </div>
              <div>
                <Label htmlFor="additional-info">Дополнительная информация</Label>
                <Textarea 
                  id="additional-info" 
                  name="additional_info" 
                  defaultValue={siteSettings.additional_info || ''} 
                  placeholder="Любая важная информация для клиентов"
                  rows={4} 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Дополнительные сведения, которые будут показаны в меню
                </p>
              </div>
            </div>
          </div>
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon name="Shield" size={20} />
              Безопасность
            </h3>
            <div>
              <Label htmlFor="admin-pin">PIN-код для входа в админ-панель</Label>
              <Input 
                id="admin-pin" 
                name="admin_pin" 
                type="text"
                maxLength={10}
                defaultValue={siteSettings.admin_pin || '0000'} 
                placeholder="0000"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Дополнительная защита для админ-панели. Потребуется вводить при каждом входе. По умолчанию: 0000
              </p>
              <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <Icon name="AlertTriangle" size={16} />
                  <span>Запомните свой PIN-код! Без него вход в админ-панель будет невозможен.</span>
                </p>
              </div>
            </div>
          </div>
          <Button type="submit">
            <Icon name="Save" size={18} className="mr-2" />
            Сохранить изменения
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SettingsTab;