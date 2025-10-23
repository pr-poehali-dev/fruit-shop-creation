import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface AdminSettingsSectionProps {
  siteSettings: any;
}

const AdminSettingsSection = ({ siteSettings }: AdminSettingsSectionProps) => {
  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Icon name="Shield" size={20} />
        Администрирование
      </h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="admin-pin">PIN-код для админ-панели</Label>
          <Input 
            id="admin-pin" 
            name="admin_pin" 
            type="password"
            defaultValue={siteSettings.admin_pin || '0000'} 
            placeholder="4-значный PIN"
            maxLength={4}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Используется для входа в админ-панель. По умолчанию: 0000
          </p>
        </div>
        <div>
          <Label htmlFor="promotions">Акции и специальные предложения</Label>
          <Textarea 
            id="promotions" 
            name="promotions" 
            defaultValue={siteSettings.promotions || ''} 
            rows={3}
            placeholder="Опишите актуальные акции..."
          />
        </div>
        <div>
          <Label htmlFor="additional-info">Дополнительная информация</Label>
          <Textarea 
            id="additional-info" 
            name="additional_info" 
            defaultValue={siteSettings.additional_info || ''} 
            rows={3}
            placeholder="Любая дополнительная информация..."
          />
        </div>
        <div>
          <Label htmlFor="price-list-url">Ссылка на прайс-лист</Label>
          <Input 
            id="price-list-url" 
            name="price_list_url" 
            defaultValue={siteSettings.price_list_url || ''} 
            placeholder="https://example.com/price.pdf"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Ссылка на файл с актуальным прайс-листом
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsSection;
