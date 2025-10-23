import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface PagesContentSectionProps {
  siteSettings: any;
}

const PagesContentSection = ({ siteSettings }: PagesContentSectionProps) => {
  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Icon name="FileText" size={20} />
        Контент страниц
      </h3>
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h4 className="text-md font-semibold mb-3">О питомнике</h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="about-title">Заголовок раздела</Label>
              <Input 
                id="about-title" 
                name="about_title" 
                defaultValue={siteSettings.about_title || ''} 
                placeholder="О нашем питомнике"
              />
            </div>
            <div>
              <Label htmlFor="about-text">Текст раздела</Label>
              <Textarea 
                id="about-text" 
                name="about_text" 
                defaultValue={siteSettings.about_text || ''} 
                rows={4}
                placeholder="Расскажите о вашем питомнике..."
              />
            </div>
          </div>
        </div>

        <div className="border-b pb-4">
          <h4 className="text-md font-semibold mb-3">Уход за растениями</h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="care-title">Общий заголовок</Label>
              <Input 
                id="care-title" 
                name="care_title" 
                defaultValue={siteSettings.care_title || ''} 
                placeholder="Уход за растениями"
              />
            </div>
            <div>
              <Label htmlFor="care-watering-title">Полив - заголовок</Label>
              <Input 
                id="care-watering-title" 
                name="care_watering_title" 
                defaultValue={siteSettings.care_watering_title || ''} 
                placeholder="Полив"
              />
            </div>
            <div>
              <Label htmlFor="care-watering-text">Полив - описание</Label>
              <Textarea 
                id="care-watering-text" 
                name="care_watering_text" 
                defaultValue={siteSettings.care_watering_text || ''} 
                rows={3}
                placeholder="Рекомендации по поливу..."
              />
            </div>
            <div>
              <Label htmlFor="care-lighting-title">Освещение - заголовок</Label>
              <Input 
                id="care-lighting-title" 
                name="care_lighting_title" 
                defaultValue={siteSettings.care_lighting_title || ''} 
                placeholder="Освещение"
              />
            </div>
            <div>
              <Label htmlFor="care-lighting-text">Освещение - описание</Label>
              <Textarea 
                id="care-lighting-text" 
                name="care_lighting_text" 
                defaultValue={siteSettings.care_lighting_text || ''} 
                rows={3}
                placeholder="Рекомендации по освещению..."
              />
            </div>
            <div>
              <Label htmlFor="care-pruning-title">Обрезка - заголовок</Label>
              <Input 
                id="care-pruning-title" 
                name="care_pruning_title" 
                defaultValue={siteSettings.care_pruning_title || ''} 
                placeholder="Обрезка"
              />
            </div>
            <div>
              <Label htmlFor="care-pruning-text">Обрезка - описание</Label>
              <Textarea 
                id="care-pruning-text" 
                name="care_pruning_text" 
                defaultValue={siteSettings.care_pruning_text || ''} 
                rows={3}
                placeholder="Рекомендации по обрезке..."
              />
            </div>
          </div>
        </div>

        <div className="border-b pb-4">
          <h4 className="text-md font-semibold mb-3">Доставка и оплата</h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="delivery-title">Общий заголовок</Label>
              <Input 
                id="delivery-title" 
                name="delivery_title" 
                defaultValue={siteSettings.delivery_title || ''} 
                placeholder="Доставка и оплата"
              />
            </div>
            <div>
              <Label htmlFor="delivery-courier-title">Курьерская доставка - заголовок</Label>
              <Input 
                id="delivery-courier-title" 
                name="delivery_courier_title" 
                defaultValue={siteSettings.delivery_courier_title || ''} 
                placeholder="Курьерская доставка"
              />
            </div>
            <div>
              <Label htmlFor="delivery-courier-text">Курьерская доставка - описание</Label>
              <Textarea 
                id="delivery-courier-text" 
                name="delivery_courier_text" 
                defaultValue={siteSettings.delivery_courier_text || ''} 
                rows={3}
                placeholder="Условия курьерской доставки..."
              />
            </div>
            <div>
              <Label htmlFor="delivery-transport-title">Транспортная доставка - заголовок</Label>
              <Input 
                id="delivery-transport-title" 
                name="delivery_transport_title" 
                defaultValue={siteSettings.delivery_transport_title || ''} 
                placeholder="Транспортная компания"
              />
            </div>
            <div>
              <Label htmlFor="delivery-transport-text">Транспортная доставка - описание</Label>
              <Textarea 
                id="delivery-transport-text" 
                name="delivery_transport_text" 
                defaultValue={siteSettings.delivery_transport_text || ''} 
                rows={3}
                placeholder="Условия доставки через ТК..."
              />
            </div>
            <div>
              <Label htmlFor="delivery-pickup-title">Самовывоз - заголовок</Label>
              <Input 
                id="delivery-pickup-title" 
                name="delivery_pickup_title" 
                defaultValue={siteSettings.delivery_pickup_title || ''} 
                placeholder="Самовывоз"
              />
            </div>
            <div>
              <Label htmlFor="delivery-pickup-text">Самовывоз - описание</Label>
              <Textarea 
                id="delivery-pickup-text" 
                name="delivery_pickup_text" 
                defaultValue={siteSettings.delivery_pickup_text || ''} 
                rows={3}
                placeholder="Условия самовывоза..."
              />
            </div>
            <div>
              <Label htmlFor="payment-title">Заголовок раздела оплаты</Label>
              <Input 
                id="payment-title" 
                name="payment_title" 
                defaultValue={siteSettings.payment_title || ''} 
                placeholder="Способы оплаты"
              />
            </div>
            <div>
              <Label htmlFor="payment-methods">Способы оплаты (по одному на строку)</Label>
              <Textarea 
                id="payment-methods" 
                name="payment_methods" 
                defaultValue={
                  Array.isArray(siteSettings.payment_methods) 
                    ? siteSettings.payment_methods.join('\n') 
                    : (siteSettings.payment_methods || '')
                } 
                rows={4}
                placeholder="Наличными при получении&#10;Банковской картой онлайн&#10;Безналичный расчёт для юр. лиц"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Каждый способ оплаты на новой строке
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagesContentSection;
