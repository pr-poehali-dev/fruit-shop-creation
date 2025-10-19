import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';

interface SettingsTabProps {
  siteSettings: any;
  onSaveSettings: (e: React.FormEvent<HTMLFormElement>) => void;
}

const SettingsTab = ({ siteSettings, onSaveSettings }: SettingsTabProps) => {
  const [holidayTheme, setHolidayTheme] = useState(siteSettings.holiday_theme || 'none');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(siteSettings.is_maintenance_mode || false);
  const [autoMaintenanceEnabled, setAutoMaintenanceEnabled] = useState(siteSettings.auto_maintenance_enabled || false);

  useEffect(() => {
    setHolidayTheme(siteSettings.holiday_theme || 'none');
    setIsMaintenanceMode(siteSettings.is_maintenance_mode || false);
    setAutoMaintenanceEnabled(siteSettings.auto_maintenance_enabled || false);
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
              <Icon name="Construction" size={20} className="text-orange-600" />
              Режим технического обслуживания
            </h3>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex-1">
                <Label htmlFor="maintenance-mode" className="text-base font-medium">
                  Закрыть сайт на техническое обслуживание
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Посетители увидят страницу с сообщением. Админы смогут войти по номеру и паролю.
                </p>
              </div>
              <input type="hidden" name="is_maintenance_mode" value={isMaintenanceMode ? 'true' : 'false'} />
              <Switch
                id="maintenance-mode"
                checked={isMaintenanceMode}
                onCheckedChange={setIsMaintenanceMode}
              />
            </div>
            {isMaintenanceMode && (
              <div className="mt-4">
                <Label htmlFor="maintenance-reason">Причина закрытия сайта</Label>
                <Textarea
                  id="maintenance-reason"
                  name="maintenance_reason"
                  defaultValue={siteSettings.maintenance_reason || 'Сайт временно закрыт на техническое обслуживание'}
                  rows={3}
                  placeholder="Сайт временно закрыт на техническое обслуживание"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Это сообщение увидят все посетители сайта
                </p>
              </div>
            )}
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <Label htmlFor="auto-maintenance" className="text-base font-medium flex items-center gap-2">
                    <Icon name="Clock" size={18} className="text-blue-600" />
                    Автоматическое включение/выключение
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Сайт автоматически закроется и откроется в указанное время
                  </p>
                </div>
                <input type="hidden" name="auto_maintenance_enabled" value={autoMaintenanceEnabled ? 'true' : 'false'} />
                <Switch
                  id="auto-maintenance"
                  checked={autoMaintenanceEnabled}
                  onCheckedChange={setAutoMaintenanceEnabled}
                />
              </div>
              
              {autoMaintenanceEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-blue-200">
                  <div>
                    <Label htmlFor="maintenance-start" className="text-sm">Начало обслуживания</Label>
                    <Input
                      id="maintenance-start"
                      name="maintenance_start_time"
                      type="datetime-local"
                      defaultValue={siteSettings.maintenance_start_time ? new Date(siteSettings.maintenance_start_time).toISOString().slice(0, 16) : ''}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Сайт закроется в это время
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="maintenance-end" className="text-sm">Окончание обслуживания</Label>
                    <Input
                      id="maintenance-end"
                      name="maintenance_end_time"
                      type="datetime-local"
                      defaultValue={siteSettings.maintenance_end_time ? new Date(siteSettings.maintenance_end_time).toISOString().slice(0, 16) : ''}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Сайт откроется в это время
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
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
              defaultValue={siteSettings.logo_url || 'https://storage.yandexcloud.net/poehali-files/d64bcbd2-3424-4fbc-8e3a-56f22a820104.jpg'} 
              placeholder="https://storage.yandexcloud.net/poehali-files/d64bcbd2-3424-4fbc-8e3a-56f22a820104.jpg"
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
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="delivery-enabled" 
                    name="delivery_enabled"
                    value="on"
                    defaultChecked={siteSettings.delivery_enabled === true}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <Label htmlFor="delivery-enabled" className="cursor-pointer">
                    Включить доставку
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="pickup-enabled" 
                    name="pickup_enabled"
                    value="on"
                    defaultChecked={siteSettings.pickup_enabled === true}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <Label htmlFor="pickup-enabled" className="cursor-pointer">
                    Включить самовывоз
                  </Label>
                </div>
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
              <div className="border-t pt-4">
                <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                  <Icon name="Calendar" size={18} />
                  Система предзаказа
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="preorder-enabled" 
                      name="preorder_enabled"
                      value="on"
                      defaultChecked={siteSettings.preorder_enabled === true}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <Label htmlFor="preorder-enabled" className="cursor-pointer">
                      Включить режим предзаказа
                    </Label>
                  </div>
                  <div>
                    <Label htmlFor="preorder-message">Сообщение о предзаказе</Label>
                    <Textarea 
                      id="preorder-message" 
                      name="preorder_message" 
                      defaultValue={siteSettings.preorder_message || 'Предзаказ на весну 2026. Доставка с марта по май 2026 года.'} 
                      rows={2}
                      placeholder="Например: Предзаказ на весну 2026. Доставка с марта по май 2026 года."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Это сообщение будет показываться клиентам на сайте
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="preorder-start-date">Дата начала приёма предзаказов</Label>
                      <Input 
                        id="preorder-start-date" 
                        name="preorder_start_date" 
                        type="date"
                        defaultValue={siteSettings.preorder_start_date || ''} 
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        С какой даты принимаем предзаказы
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="preorder-end-date">Дата окончания приёма предзаказов</Label>
                      <Input 
                        id="preorder-end-date" 
                        name="preorder_end_date" 
                        type="date"
                        defaultValue={siteSettings.preorder_end_date || ''} 
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        До какой даты принимаем предзаказы
                      </p>
                    </div>
                  </div>
                </div>
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