import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface SettingsTabProps {
  siteSettings: any;
  onSaveSettings: (e: React.FormEvent<HTMLFormElement>) => void;
}

const SettingsTab = ({ siteSettings, onSaveSettings }: SettingsTabProps) => {
  const [holidayTheme, setHolidayTheme] = useState(siteSettings.holiday_theme || 'none');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Информация о сайте</CardTitle>
        <CardDescription>Настройте основную информацию</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSaveSettings} className="space-y-4">
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
                <Label htmlFor="loyalty-cashback-percent">Процент кэшбэка (%)</Label>
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
                  Процент от покупки, который начисляется на баланс владельцам карты
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