import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface DeliveryZone {
  id: number;
  zone_name: string;
  delivery_price: string;
}

interface DeliveryOptionsProps {
  deliveryType: string;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  pickupAddress: string;
  selectedCity: string;
  deliveryZones: DeliveryZone[];
  selectedZoneId: number | null;
  deliveryAddress: string;
  getDeliveryFee: () => number;
  onDeliveryTypeChange: (type: string) => void;
  onZoneChange: (zoneId: number) => void;
  onAddressChange: (address: string) => void;
}

export const DeliveryOptions = ({
  deliveryType,
  deliveryEnabled,
  pickupEnabled,
  pickupAddress,
  selectedCity,
  deliveryZones,
  selectedZoneId,
  deliveryAddress,
  getDeliveryFee,
  onDeliveryTypeChange,
  onZoneChange,
  onAddressChange
}: DeliveryOptionsProps) => {
  if (!pickupEnabled && !deliveryEnabled) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-300 dark:border-yellow-700 rounded p-3">
        <p className="text-sm text-yellow-900 dark:text-yellow-100">
          В данный момент доставка и самовывоз недоступны. Пожалуйста, свяжитесь с нами для оформления заказа.
        </p>
      </div>
    );
  }

  return (
    <RadioGroup value={deliveryType} onValueChange={onDeliveryTypeChange}>
      {pickupEnabled && (
        <div className="flex items-start space-x-2 p-3 rounded-lg border-2 border-primary/20 bg-background hover:bg-primary/5 transition-colors">
          <RadioGroupItem value="pickup" id="pickup" className="mt-0.5" />
          <Label htmlFor="pickup" className="flex-1 cursor-pointer">
            <div className="flex items-start gap-2">
              <Icon name="Store" size={18} className="text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Самовывоз</p>
                {pickupAddress && (
                  <p className="text-xs text-muted-foreground mt-1">{pickupAddress}</p>
                )}
                <p className="text-sm font-medium text-green-600 mt-1">Бесплатно</p>
              </div>
            </div>
          </Label>
        </div>
      )}
      
      {deliveryEnabled && (
        <div className="space-y-2">
          <div className="flex items-start space-x-2 p-3 rounded-lg border-2 border-primary/20 bg-background hover:bg-primary/5 transition-colors">
            <RadioGroupItem value="delivery" id="delivery" className="mt-0.5" />
            <Label htmlFor="delivery" className="flex-1 cursor-pointer">
              <div className="flex items-start gap-2">
                <Icon name="Truck" size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">Доставка</p>
                  <p className="text-xs text-muted-foreground mt-1">Доставим по указанному адресу</p>
                  {selectedCity === 'Барнаул' ? (
                    <p className="text-sm font-medium text-primary mt-1">
                      {getDeliveryFee() > 0 ? `${getDeliveryFee()} ₽` : 'Бесплатно'}
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Стоимость рассчитает администратор
                    </p>
                  )}
                </div>
              </div>
            </Label>
          </div>
          
          {deliveryType === 'delivery' && (
            <div className="pl-9 space-y-3">
              {deliveryZones.length > 0 && (
                <div>
                  <Label htmlFor="delivery-zone" className="text-xs text-muted-foreground">
                    Выберите зону доставки
                  </Label>
                  <Select
                    value={selectedZoneId?.toString() || ''}
                    onValueChange={(value) => onZoneChange(parseInt(value))}
                  >
                    <SelectTrigger id="delivery-zone" className="w-full mt-1">
                      <SelectValue placeholder="Выберите зону" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryZones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id.toString()}>
                          {zone.zone_name} — {parseFloat(zone.delivery_price).toFixed(0)} ₽
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="delivery-address" className="text-xs text-muted-foreground">
                  Адрес доставки <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="delivery-address"
                  placeholder="Улица, дом, квартира"
                  value={deliveryAddress}
                  onChange={(e) => onAddressChange(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </RadioGroup>
  );
};
