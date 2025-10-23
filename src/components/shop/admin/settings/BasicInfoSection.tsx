import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface BasicInfoSectionProps {
  siteSettings: any;
}

const BasicInfoSection = ({ siteSettings }: BasicInfoSectionProps) => {
  return (
    <>
      <div>
        <Label htmlFor="site-name">Название питомника</Label>
        <Input id="site-name" name="site_name" defaultValue={siteSettings.site_name || 'Питомник растений'} required />
      </div>
      <div>
        <Label htmlFor="logo-url">URL логотипа</Label>
        <Input 
          id="logo-url" 
          name="logo_url" 
          defaultValue={siteSettings.logo_url || 'https://storage.yandexcloud.net/poehali-files/d64bcbd2-3424-4fbc-8e3a-56f22a820104.jpg'} 
          placeholder="https://storage.yandexcloud.net/poehali-files/d64bcbd2-3424-4fbc-8e3a-56f22a820104.jpg"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Введите путь к изображению логотипа или ссылку (например: /img/logo.jpg)
        </p>
        {siteSettings.logo_url && (
          <div className="mt-2">
            <img 
              src={siteSettings.logo_url} 
              alt="Превью логотипа" 
              className="max-w-[200px] max-h-[100px] object-contain border rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
      <div>
        <Label htmlFor="site-description">Описание</Label>
        <Textarea id="site-description" name="site_description" defaultValue={siteSettings.site_description || 'Плодовые и декоративные культуры высокого качества'} rows={3} />
      </div>
      <div>
        <Label htmlFor="site-phone">Телефон</Label>
        <Input id="site-phone" name="phone" type="tel" defaultValue={siteSettings.phone || '+7 (495) 123-45-67'} />
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
    </>
  );
};

export default BasicInfoSection;
