import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface DeliverySettingsSectionProps {
  siteSettings: any;
}

const DeliverySettingsSection = ({ siteSettings }: DeliverySettingsSectionProps) => {
  return (
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
  );
};

export default DeliverySettingsSection;
