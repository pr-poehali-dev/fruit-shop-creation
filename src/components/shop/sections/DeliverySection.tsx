import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useEffect, useState } from 'react';

const DeliverySection = () => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Ошибка загрузки настроек:', err));
  }, []);

  const paymentMethods = settings?.payment_methods 
    ? (Array.isArray(settings.payment_methods) 
        ? settings.payment_methods 
        : settings.payment_methods.split('\n').filter((m: string) => m.trim()))
    : ['Банковская карта онлайн', 'Наличные при получении', 'Банковский перевод'];

  return (
    <div className="max-w-3xl mx-auto px-2">
      <h2 className="text-2xl sm:text-4xl font-display font-bold mb-4 sm:mb-6">
        {settings?.delivery_title || 'Доставка и оплата'}
      </h2>
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Package" size={24} />
              Способы доставки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold">{settings?.delivery_courier_title || 'Курьерская доставка'}</h4>
              <p className="text-sm text-muted-foreground">{settings?.delivery_courier_text || 'По Москве и области — 500 ₽'}</p>
            </div>
            <div>
              <h4 className="font-semibold">{settings?.delivery_transport_title || 'Транспортная компания'}</h4>
              <p className="text-sm text-muted-foreground">{settings?.delivery_transport_text || 'По России — рассчитывается индивидуально'}</p>
            </div>
            <div>
              <h4 className="font-semibold">{settings?.delivery_pickup_title || 'Самовывоз'}</h4>
              <p className="text-sm text-muted-foreground">{settings?.delivery_pickup_text || 'Бесплатно из питомника'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="CreditCard" size={24} />
              {settings?.payment_title || 'Способы оплаты'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentMethods.map((method: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Icon name="Check" size={18} className="text-primary" />
                <span>{method}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliverySection;