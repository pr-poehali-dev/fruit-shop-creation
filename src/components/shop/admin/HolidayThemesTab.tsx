import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

interface HolidayThemesTabProps {
  settings: any;
  onEnableHoliday: (holiday: 'feb23' | 'march8') => void;
  onDisableHoliday: () => void;
  onToggleCalendar: (enabled: boolean) => void;
  onToggleBanner: (enabled: boolean) => void;
  onOpenCalendarAdmin: (holiday: 'feb23' | 'march8') => void;
}

const HolidayThemesTab = ({
  settings,
  onEnableHoliday,
  onDisableHoliday,
  onToggleCalendar,
  onToggleBanner,
  onOpenCalendarAdmin
}: HolidayThemesTabProps) => {
  const holidayConfig = {
    feb23: {
      name: '23 Февраля',
      emoji: '🎖️',
      color: 'from-blue-600 to-green-600',
      description: 'День защитника Отечества'
    },
    march8: {
      name: '8 Марта',
      emoji: '🌸',
      color: 'from-pink-500 to-purple-500',
      description: 'Международный женский день'
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Calendar" size={24} />
          Управление праздничными темами
        </CardTitle>
        <CardDescription>
          Включайте и настраивайте праздничные календари с подарками для клиентов
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Icon name="Sparkles" size={20} />
            Выбрать праздничную тему
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(holidayConfig).map(([key, config]) => {
              const isActive = settings.enabled && settings.activeHoliday === key;
              return (
                <Card 
                  key={key} 
                  className={`transition-all ${isActive ? 'border-4 shadow-xl' : 'border-2 hover:shadow-lg'}`}
                  style={isActive ? { borderColor: key === 'feb23' ? '#2563eb' : '#ec4899' } : {}}
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center text-5xl shadow-lg ${isActive ? 'animate-pulse' : ''}`}>
                        {config.emoji}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl flex items-center gap-2">
                          {config.name}
                          {isActive && (
                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                              <Icon name="Check" size={12} className="mr-1" />
                              Активно
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription className="text-base">{config.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!isActive ? (
                      <Button 
                        onClick={() => onEnableHoliday(key as 'feb23' | 'march8')} 
                        className={`w-full bg-gradient-to-r ${config.color} hover:opacity-90 text-white`}
                        size="lg"
                      >
                        <Icon name="Sparkles" size={18} className="mr-2" />
                        Активировать тему
                      </Button>
                    ) : (
                      <Button 
                        onClick={onDisableHoliday} 
                        variant="outline" 
                        className="w-full border-2"
                        size="lg"
                      >
                        <Icon name="X" size={18} className="mr-2" />
                        Отключить тему
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {settings.enabled && settings.activeHoliday && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Icon name="Calendar" size={24} className="text-primary" />
                <div>
                  <h4 className="font-semibold">Праздничный календарь</h4>
                  <p className="text-sm text-gray-600">Ежедневные подарки для клиентов</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => onOpenCalendarAdmin(settings.activeHoliday!)}
                  variant="outline"
                  size="sm"
                >
                  <Icon name="Settings" size={16} className="mr-2" />
                  Настроить призы
                </Button>
                <Switch
                  checked={settings.calendarEnabled}
                  onCheckedChange={onToggleCalendar}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Icon name="Layout" size={24} className="text-primary" />
                <div>
                  <h4 className="font-semibold">Праздничный баннер</h4>
                  <p className="text-sm text-gray-600">Баннер в верхней части сайта</p>
                </div>
              </div>
              <Switch
                checked={settings.showBanner}
                onCheckedChange={onToggleBanner}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HolidayThemesTab;
