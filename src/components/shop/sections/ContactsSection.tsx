import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface ContactsSectionProps {
  settings?: {
    phone?: string;
    email?: string;
    address?: string;
    work_hours?: string;
  };
}

const ContactsSection = ({ settings }: ContactsSectionProps) => {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-4xl font-display font-bold mb-6">Контакты</h2>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3">
            <Icon name="MapPin" size={24} className="text-primary mt-1" />
            <div>
              <h4 className="font-semibold">Адрес питомника</h4>
              <p className="text-muted-foreground">{settings?.address || 'Московская область, г. Пушкино, ул. Садовая, 15'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Icon name="Phone" size={24} className="text-primary mt-1" />
            <div>
              <h4 className="font-semibold">Телефон</h4>
              <p className="text-muted-foreground">{settings?.phone || '+7 (495) 123-45-67'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Icon name="Mail" size={24} className="text-primary mt-1" />
            <div>
              <h4 className="font-semibold">Email</h4>
              <p className="text-muted-foreground">{settings?.email || 'info@plantsnursery.ru'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Icon name="Clock" size={24} className="text-primary mt-1" />
            <div>
              <h4 className="font-semibold">Режим работы</h4>
              <p className="text-muted-foreground">{settings?.work_hours || 'Пн-Вс: 9:00 - 19:00'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactsSection;