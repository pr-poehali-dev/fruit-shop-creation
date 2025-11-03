import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AboutSectionProps {
  siteSettings?: any;
}

const AboutSection = ({ siteSettings }: AboutSectionProps) => {

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 px-2">
      <h2 className="text-2xl sm:text-4xl font-display font-bold mb-4 sm:mb-6">
        {siteSettings?.about_title || 'О нас'}
      </h2>
      <p className="text-base sm:text-lg whitespace-pre-line">
        {siteSettings?.about_text || 'Мы — семейный питомник растений с многолетним опытом выращивания плодовых и декоративных культур. Наша миссия — помочь вам создать сад вашей мечты с качественными и здоровыми растениями.'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
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

      <Card className="mt-6 sm:mt-8 bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Реквизиты</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm sm:text-base">
            <p className="font-medium">ИП Бояринцев Вадим Вячеславович</p>
            <p className="text-muted-foreground">ИНН: 222261894107</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutSection;