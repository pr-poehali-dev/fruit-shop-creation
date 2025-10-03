import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const AboutSection = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-4xl font-display font-bold mb-6">О нас</h2>
      <p className="text-lg">Мы — семейный питомник растений с многолетним опытом выращивания плодовых и декоративных культур.</p>
      <p className="text-lg">Наша миссия — помочь вам создать сад вашей мечты с качественными и здоровыми растениями.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="text-center">
          <CardHeader>
            <Icon name="Award" size={48} className="mx-auto text-primary" />
            <CardTitle>Качество</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Все растения проходят строгий контроль качества</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardHeader>
            <Icon name="Truck" size={48} className="mx-auto text-primary" />
            <CardTitle>Доставка</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Бережная доставка по всей России</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardHeader>
            <Icon name="Heart" size={48} className="mx-auto text-primary" />
            <CardTitle>Поддержка</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Консультации по уходу за растениями</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutSection;
