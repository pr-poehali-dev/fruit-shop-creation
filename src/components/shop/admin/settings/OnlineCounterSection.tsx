import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

interface OnlineCounterSectionProps {
  siteSettings: any;
}

export default function OnlineCounterSection({ siteSettings }: OnlineCounterSectionProps) {
  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-lg font-semibold">Настройки онлайн-счётчика</h3>
      
      <div className="flex items-center justify-between space-x-4">
        <div className="flex-1">
          <Label htmlFor="show_online_counter">Показывать количество онлайн</Label>
          <p className="text-sm text-muted-foreground">
            Отображать счётчик посетителей на главной странице
          </p>
        </div>
        <Switch
          id="show_online_counter"
          name="show_online_counter"
          defaultChecked={siteSettings.show_online_counter !== false}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="online_boost">Накрутка онлайна (0-300)</Label>
        <p className="text-sm text-muted-foreground">
          Добавить к реальному количеству онлайн посетителей для создания эффекта популярности
        </p>
        <Input
          id="online_boost"
          name="online_boost"
          type="number"
          min="0"
          max="300"
          defaultValue={siteSettings.online_boost || 0}
        />
      </div>
    </div>
  );
}
