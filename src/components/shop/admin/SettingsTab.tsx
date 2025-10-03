import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface SettingsTabProps {
  siteSettings: any;
  onSaveSettings: (e: React.FormEvent<HTMLFormElement>) => void;
}

const SettingsTab = ({ siteSettings, onSaveSettings }: SettingsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Информация о сайте</CardTitle>
        <CardDescription>Настройте основную информацию</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSaveSettings} className="space-y-4">
          <div>
            <Label htmlFor="site-name">Название питомника</Label>
            <Input id="site-name" name="site_name" defaultValue={siteSettings.site_name || 'Питомник растений'} required />
          </div>
          <div>
            <Label htmlFor="site-description">Описание</Label>
            <Textarea id="site-description" name="site_description" defaultValue={siteSettings.site_description || 'Плодовые и декоративные культуры высокого качества'} rows={3} />
          </div>
          <div>
            <Label htmlFor="site-phone">Телефон</Label>
            <Input id="site-phone" name="phone" defaultValue={siteSettings.phone || '+7 (495) 123-45-67'} />
          </div>
          <div>
            <Label htmlFor="site-email">Email</Label>
            <Input id="site-email" name="email" type="email" defaultValue={siteSettings.email || 'info@plantsnursery.ru'} />
          </div>
          <div>
            <Label htmlFor="site-address">Адрес</Label>
            <Input id="site-address" name="address" defaultValue={siteSettings.address || 'Московская область, г. Пушкино, ул. Садовая, 15'} />
          </div>
          <div>
            <Label htmlFor="work-hours">Режим работы</Label>
            <Input id="work-hours" name="work_hours" defaultValue={siteSettings.work_hours || 'Пн-Вс: 9:00 - 19:00'} />
          </div>
          <Button type="submit">
            <Icon name="Save" size={18} className="mr-2" />
            Сохранить изменения
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SettingsTab;
