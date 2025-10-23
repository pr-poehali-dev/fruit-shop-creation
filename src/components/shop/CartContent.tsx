import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

import Icon from '@/components/ui/icon';
import { CartItem, User } from '@/types/shop';
import { useState, useEffect } from 'react';

interface DeliveryZone {
  id: number;
  zone_name: string;
  delivery_price: string;
}

interface CartContentProps {
  cart: CartItem[];
  user: User | null;
  updateCartQuantity: (productId: number, quantity: number) => void;
  getTotalPrice: () => number;
  handleCheckout: (paymentMethod: string, deliveryType: string, deliveryZoneId?: number) => void;
  siteSettings?: any;
}

const CartContent = ({ 
  cart, 
  user, 
  updateCartQuantity, 
  getTotalPrice, 
  handleCheckout,
  siteSettings 
}: CartContentProps) => {
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isCityDialogOpen, setIsCityDialogOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [citySearchQuery, setCitySearchQuery] = useState('');
  
  const deliveryEnabled = siteSettings?.delivery_enabled === true;
  const pickupEnabled = siteSettings?.pickup_enabled === true;
  const preorderSettings = siteSettings?.preorder_enabled || false;
  const preorderMessage = siteSettings?.preorder_message || 'Предзаказ на весну 2026. Доставка с марта по май 2026 года.';
  const preorderStartDate = siteSettings?.preorder_start_date;
  const preorderEndDate = siteSettings?.preorder_end_date;
  
  const isPreorderActive = () => {
    if (!preorderSettings) return false;
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (preorderStartDate) {
      const startDate = new Date(preorderStartDate);
      startDate.setHours(0, 0, 0, 0);
      if (now < startDate) return false;
    }
    
    if (preorderEndDate) {
      const endDate = new Date(preorderEndDate);
      endDate.setHours(23, 59, 59, 999);
      if (now > endDate) return false;
    }
    
    return true;
  };
  
  const preorderEnabled = isPreorderActive();
  const deliveryPrice = parseFloat(siteSettings?.delivery_price || 0);
  const courierDeliveryPrice = parseFloat(siteSettings?.courier_delivery_price || 0);
  const freeDeliveryMin = parseFloat(siteSettings?.free_delivery_min || 0);
  const pickupAddress = siteSettings?.address || '';
  
  useEffect(() => {
    if (pickupEnabled && !deliveryEnabled) {
      setDeliveryType('pickup');
    } else if (deliveryEnabled && !pickupEnabled) {
      setDeliveryType('delivery');
    } else if (pickupEnabled) {
      setDeliveryType('pickup');
    }
  }, [pickupEnabled, deliveryEnabled]);
  
  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/8c8e301f-2323-4f3b-85f0-14a3c210e670');
        const data = await response.json();
        setDeliveryZones(data.zones || []);
      } catch (error) {
        console.error('Failed to load delivery zones:', error);
      }
    };
    
    if (deliveryEnabled) {
      loadZones();
    }
  }, [deliveryEnabled]);
  
  const getZoneDeliveryPrice = () => {
    if (!selectedZoneId) return deliveryPrice + courierDeliveryPrice;
    const zone = deliveryZones.find(z => z.id === selectedZoneId);
    return zone ? parseFloat(zone.delivery_price) : deliveryPrice + courierDeliveryPrice;
  };
  
  const getFinalPrice = () => {
    const basePrice = getTotalPrice();
    if (deliveryType === 'delivery') {
      const isFreeDelivery = freeDeliveryMin > 0 && basePrice >= freeDeliveryMin;
      const totalDeliveryFee = isFreeDelivery ? 0 : getZoneDeliveryPrice();
      return basePrice + totalDeliveryFee;
    }
    return basePrice;
  };
  
  const getDeliveryFee = () => {
    const basePrice = getTotalPrice();
    const isFreeDelivery = freeDeliveryMin > 0 && basePrice >= freeDeliveryMin;
    return isFreeDelivery ? 0 : getZoneDeliveryPrice();
  };

  const russianCities = [
    'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань',
    'Нижний Новгород', 'Челябинск', 'Самара', 'Омск', 'Ростов-на-Дону',
    'Уфа', 'Красноярск', 'Воронеж', 'Пермь', 'Волгоград',
    'Краснодар', 'Саратов', 'Тюмень', 'Тольятти', 'Ижевск',
    'Барнаул', 'Ульяновск', 'Иркутск', 'Хабаровск', 'Ярославль',
    'Владивосток', 'Махачкала', 'Томск', 'Оренбург', 'Кемерово',
    'Новокузнецк', 'Рязань', 'Набережные Челны', 'Астрахань', 'Пенза',
    'Липецк', 'Киров', 'Чебоксары', 'Тула', 'Калининград',
    'Курск', 'Улан-Удэ', 'Ставрополь', 'Магнитогорск', 'Сочи',
    'Белгород', 'Нижний Тагил', 'Владимир', 'Архангельск', 'Калуга',
    'Сургут', 'Севастополь', 'Симферополь', 'Тверь', 'Чита',
    'Смоленск', 'Курган', 'Орёл', 'Владикавказ', 'Грозный',
    'Мурманск', 'Тамбов', 'Петрозаводск', 'Нижневартовск', 'Йошкар-Ола',
    'Новороссийск', 'Кострома', 'Таганрог', 'Комсомольск-на-Амуре', 'Стерлитамак',
    'Братск', 'Нальчик', 'Дзержинск', 'Орск', 'Сыктывкар',
    'Нижнекамск', 'Ангарск', 'Шахты', 'Старый Оскол', 'Великий Новгород',
    'Благовещенск', 'Энгельс', 'Псков', 'Бийск', 'Прокопьевск',
    'Рыбинск', 'Балаково', 'Армавир', 'Северодвинск', 'Королёв',
    'Петропавловск-Камчатский', 'Мытищи', 'Люберцы', 'Южно-Сахалинск', 'Волжский',
    'Подольск', 'Саранск', 'Абакан', 'Вологда', 'Норильск',
    'Якутск', 'Черкесск', 'Каменск-Уральский', 'Красногорск', 'Химки',
    'Электросталь', 'Майкоп', 'Салават', 'Альметьевск', 'Пятигорск',
    'Назрань', 'Одинцово', 'Миасс', 'Березники', 'Рубцовск',
    'Уссурийск', 'Новочеркасск', 'Копейск', 'Находка', 'Домодедово',
    'Первоуральск', 'Серпухов', 'Новомосковск', 'Дербент', 'Щёлково',
    'Черкесск', 'Новочебоксарск', 'Каспийск', 'Сызрань', 'Обнинск'
  ];

  const filteredCities = russianCities.filter(city =>
    city.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setDeliveryCity(city);
    setIsCityDialogOpen(false);
    setCitySearchQuery('');
  };

  const isCashPaymentAvailable = selectedCity === 'Барнаул';

  return (
    <div className="mt-6 space-y-4">
      {cart.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Корзина пуста</p>
      ) : (
        <>
          {cart.map((item, index) => (
            <div key={`${item.product.id}-${(item.product as any).selectedSize || ''}-${index}`} className="flex gap-4 items-center">
              <img src={item.product.image_url} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1">
                <h4 className="font-medium">{item.product.name}</h4>
                {(item.product as any).selectedSize && (
                  <p className="text-xs text-primary font-medium">Размер: {(item.product as any).selectedSize}</p>
                )}
                <p className="text-sm text-muted-foreground">{item.product.price} ₽</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, (item.product as any).selectedSize)}>
                  <Icon name="Minus" size={16} />
                </Button>
                <span className="w-8 text-center">{item.quantity}</span>
                <Button size="icon" variant="outline" onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, (item.product as any).selectedSize)}>
                  <Icon name="Plus" size={16} />
                </Button>
              </div>
            </div>
          ))}
          <Separator />
          
          {preorderEnabled && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Icon name="Calendar" size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Режим предзаказа</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{preorderMessage}</p>
                  {(preorderStartDate || preorderEndDate) && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {preorderStartDate && (
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                          С {new Date(preorderStartDate).toLocaleDateString('ru-RU')}
                        </span>
                      )}
                      {preorderEndDate && (
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                          До {new Date(preorderEndDate).toLocaleDateString('ru-RU')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-3 bg-muted/30 p-3 rounded-lg">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Icon name="MapPin" size={16} />
              Город и способ получения
            </h4>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Выберите город</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCityDialogOpen(true)}
                className="w-full justify-start"
              >
                <Icon name="MapPin" size={16} className="mr-2" />
                {selectedCity || 'Выберите город доставки'}
              </Button>
              {selectedCity && (
                <p className="text-xs text-muted-foreground">
                  {selectedCity === 'Барнаул' ? '✓ Доступна оплата наличными' : 'Доступна только онлайн-оплата'}
                </p>
              )}
            </div>
            {!pickupEnabled && !deliveryEnabled ? (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-300 dark:border-yellow-700 rounded p-3">
                <p className="text-sm text-yellow-900 dark:text-yellow-100">
                  В данный момент доставка и самовывоз недоступны. Пожалуйста, свяжитесь с нами для оформления заказа.
                </p>
              </div>
            ) : (
              <RadioGroup value={deliveryType} onValueChange={setDeliveryType}>
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
                          <p className="text-sm font-medium text-primary mt-1">
                            {getDeliveryFee() > 0 ? `${getDeliveryFee()} ₽` : 'Бесплатно'}
                          </p>
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
                            onValueChange={(value) => setSelectedZoneId(parseInt(value))}
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
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </RadioGroup>
            )}
          </div>

          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Товары:</span>
              <span>{getTotalPrice()} ₽</span>
            </div>
            {deliveryType === 'delivery' && getDeliveryFee() > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Доставка:</span>
                <span>{getDeliveryFee()} ₽</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Итого:</span>
              <span>{getFinalPrice()} ₽</span>
            </div>
            {preorderEnabled && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-300 dark:border-blue-700 rounded p-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-900 dark:text-blue-100 font-medium">Предоплата (50%):</span>
                  <span className="text-blue-900 dark:text-blue-100 font-bold">{(getFinalPrice() * 0.5).toFixed(2)} ₽</span>
                </div>
                <p className="text-[10px] text-blue-700 dark:text-blue-300 mt-1">Остальное оплатите при получении</p>
              </div>
            )}
          </div>
          
          <div className="space-y-3 bg-muted/30 p-3 rounded-lg">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Icon name="CreditCard" size={16} />
              Способ оплаты
            </h4>
            {!selectedCity && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                <p className="text-sm text-yellow-900 dark:text-yellow-100">
                  Сначала выберите город доставки
                </p>
              </div>
            )}
            {selectedCity && (
              <div className="space-y-2">
                {user ? (
                  <Button
                    onClick={() => handleCheckout('balance', deliveryType, selectedZoneId || undefined, deliveryCity, deliveryAddress)}
                    variant="outline"
                    className="w-full justify-start h-auto py-3"
                    disabled={!pickupEnabled && !deliveryEnabled || (deliveryType === 'delivery' && !deliveryAddress.trim())}
                  >
                    <Icon name="Wallet" size={18} className="mr-2 flex-shrink-0" />
                    <div className="text-left flex-1">
                      <div className="font-semibold text-sm">Балансом сайта</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {preorderEnabled
                          ? `Доступно: ${user.balance?.toFixed(2) || 0}₽ (требуется ${(getFinalPrice() * 0.5).toFixed(2)}₽ - 50% предоплата)`
                          : `Доступно: ${user.balance?.toFixed(2) || 0}₽`}
                      </div>
                    </div>
                  </Button>
                ) : (
                  <div className="p-3 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/30">
                    <p className="text-sm text-muted-foreground text-center">
                      Войдите, чтобы использовать баланс
                    </p>
                  </div>
                )}
                
                {isCashPaymentAvailable && (
                  <Button
                    onClick={() => handleCheckout('cash', deliveryType, selectedZoneId || undefined, deliveryCity, deliveryAddress)}
                    variant="outline"
                    className="w-full justify-start h-auto py-3"
                    disabled={!pickupEnabled && !deliveryEnabled || (deliveryType === 'delivery' && !deliveryAddress.trim())}
                  >
                    <Icon name="Banknote" size={18} className="mr-2 flex-shrink-0" />
                    <div className="text-left flex-1">
                      <div className="font-semibold text-sm">Наличными при получении</div>
                      {preorderEnabled && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Предоплата 50%: {(getFinalPrice() * 0.5).toFixed(2)}₽, остальное при получении
                        </div>
                      )}
                    </div>
                  </Button>
                )}
                
                <Button
                  onClick={() => handleCheckout('alfabank', deliveryType, selectedZoneId || undefined, deliveryCity, deliveryAddress)}
                  variant="outline"
                  className="w-full justify-start h-auto py-3"
                  disabled={!pickupEnabled && !deliveryEnabled || (deliveryType === 'delivery' && !deliveryAddress.trim())}
                >
                  <Icon name="CreditCard" size={18} className="mr-2 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-sm">Банковской картой (Alfabank)</div>
                    {preorderEnabled && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Предоплата 50%: {(getFinalPrice() * 0.5).toFixed(2)}₽
                      </div>
                    )}
                  </div>
                </Button>
              </div>
            )}
          </div>
        </>
      )}
      
      <Dialog open={isCityDialogOpen} onOpenChange={setIsCityDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Выберите город</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Поиск города..."
              value={citySearchQuery}
              onChange={(e) => setCitySearchQuery(e.target.value)}
              className="w-full"
            />
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-1">
                {filteredCities.map((city) => (
                  <Button
                    key={city}
                    variant={selectedCity === city ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleCitySelect(city)}
                  >
                    <Icon name="MapPin" size={16} className="mr-2" />
                    {city}
                    {city === 'Барнаул' && (
                      <span className="ml-auto text-xs text-green-600 dark:text-green-400">💵 Наличные</span>
                    )}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CartContent;