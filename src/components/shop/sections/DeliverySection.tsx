import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface DeliverySectionProps {
  siteSettings?: any;
}

const DeliverySection = ({ siteSettings }: DeliverySectionProps) => {
  let paymentMethods = [
    'Банковская карта онлайн',
    'Оплата при получении наличными',
    'Оплата при получении картой',
    'Банковский перевод для юр. лиц'
  ];
  
  if (siteSettings?.payment_methods) {
    if (Array.isArray(siteSettings.payment_methods) && siteSettings.payment_methods.length > 0) {
      paymentMethods = siteSettings.payment_methods;
    } else if (typeof siteSettings.payment_methods === 'string' && siteSettings.payment_methods.trim()) {
      paymentMethods = siteSettings.payment_methods.split('\n').filter((m: string) => m.trim());
    }
  }
  
  const deliveryEnabled = siteSettings?.delivery_enabled === true;
  const pickupEnabled = siteSettings?.pickup_enabled === true;
  const hasAnyDelivery = deliveryEnabled || pickupEnabled;

  return (
    <div className="max-w-3xl mx-auto px-2">
      <h2 className="text-2xl sm:text-4xl font-display font-bold mb-4 sm:mb-6">
        {siteSettings?.delivery_title || 'Доставка и оплата'}
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
            {!hasAnyDelivery && (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-300 dark:border-yellow-700 rounded p-3">
                <p className="text-sm text-yellow-900 dark:text-yellow-100">
                  В данный момент доставка временно недоступна. Пожалуйста, свяжитесь с нами для уточнения деталей.
                </p>
              </div>
            )}
            {deliveryEnabled && (
              <>
                <div>
                  <h4 className="font-semibold">{siteSettings?.delivery_courier_title || 'Курьерская доставка'}</h4>
                  <p className="text-sm text-muted-foreground">{siteSettings?.delivery_courier_text || 'По Москве и области — 500 ₽'}</p>
                </div>
                <div>
                  <h4 className="font-semibold">{siteSettings?.delivery_transport_title || 'Транспортная компания'}</h4>
                  <p className="text-sm text-muted-foreground">{siteSettings?.delivery_transport_text || 'По России — рассчитывается индивидуально'}</p>
                </div>
              </>
            )}
            {pickupEnabled && (
              <div>
                <h4 className="font-semibold">{siteSettings?.delivery_pickup_title || 'Самовывоз'}</h4>
                <p className="text-sm text-muted-foreground">{siteSettings?.delivery_pickup_text || 'Бесплатно из питомника'}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="CreditCard" size={24} />
              {siteSettings?.payment_title || 'Способы оплаты'}
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