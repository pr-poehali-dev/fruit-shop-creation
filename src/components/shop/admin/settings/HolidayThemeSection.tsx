import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HolidayThemeSectionProps {
  holidayTheme: string;
  onThemeChange: (theme: string) => void;
}

const HolidayThemeSection = ({ holidayTheme, onThemeChange }: HolidayThemeSectionProps) => {
  return (
    <div className="border-b pb-4 mb-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>🎃</span> Праздничная тема сайта <span>🎄</span>
      </h3>
      <div>
        <Label htmlFor="holiday-theme">Выберите праздничную тему</Label>
        <input type="hidden" name="holiday_theme" value={holidayTheme} />
        <Select value={holidayTheme} onValueChange={onThemeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Выберите тему" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <div className="flex items-center gap-2">
                <span>🌿</span>
                <span>Без праздничной темы</span>
              </div>
            </SelectItem>
            <SelectItem value="new_year">
              <div className="flex items-center gap-2">
                <span>🎄</span>
                <span>Новый год</span>
              </div>
            </SelectItem>
            <SelectItem value="halloween">
              <div className="flex items-center gap-2">
                <span>🎃</span>
                <span>Хэллоуин</span>
              </div>
            </SelectItem>
            <SelectItem value="summer">
              <div className="flex items-center gap-2">
                <span>☀️</span>
                <span>Лето</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          Праздничное оформление сайта будет автоматически применено
        </p>
      </div>
    </div>
  );
};

export default HolidayThemeSection;
