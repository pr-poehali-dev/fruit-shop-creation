import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const DeliverySection = () => {
  return (
    <div className="max-w-3xl mx-auto px-2">
      <h2 className="text-2xl sm:text-4xl font-display font-bold mb-4 sm:mb-6">Доставка и оплата</h2>
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
              <h4 className="font-semibold">Курьерская доставка</h4>
              <p className="text-sm text-muted-foreground">По Москве и области — 500 ₽</p>
            </div>
            <div>
              <h4 className="font-semibold">Транспортная компания</h4>
              <p className="text-sm text-muted-foreground">По России — рассчитывается индивидуально</p>
            </div>
            <div>
              <h4 className="font-semibold">Самовывоз</h4>
              <p className="text-sm text-muted-foreground">Бесплатно из питомника</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="CreditCard" size={24} />
              Способы оплаты
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon name="Check" size={18} className="text-primary" />
              <span>Банковская карта онлайн</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Check" size={18} className="text-primary" />
              <span>Наличные при получении</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Check" size={18} className="text-primary" />
              <span>Банковский перевод</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliverySection;