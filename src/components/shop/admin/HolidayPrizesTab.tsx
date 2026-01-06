import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface HolidayPrizesTabProps {
  settings: any;
  onOpenCalendarAdmin: (holiday: 'feb23' | 'march8') => void;
}

const HolidayPrizesTab = ({ settings, onOpenCalendarAdmin }: HolidayPrizesTabProps) => {
  const holidayConfig = {
    feb23: {
      name: '23 Февраля',
      emoji: '🎖️',
      color: 'from-blue-600 to-green-600'
    },
    march8: {
      name: '8 Марта',
      emoji: '🌸',
      color: 'from-pink-500 to-purple-500'
    }
  };

  if (!settings.enabled || !settings.activeHoliday) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Gift" size={24} />
            Управление призами
          </CardTitle>
          <CardDescription>
            Настройте призы для праздничного календаря
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Icon name="Calendar" size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">Сначала активируйте праздничную тему</p>
            <p className="text-sm text-gray-500">Перейдите во вкладку "Праздничные темы" и выберите праздник</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const config = holidayConfig[settings.activeHoliday as 'feb23' | 'march8'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Gift" size={24} />
          Управление призами: {config.name}
        </CardTitle>
        <CardDescription>
          Настройте призы, которые получат клиенты при открытии календаря
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-3xl`}>
              {config.emoji}
            </div>
            <div>
              <h4 className="font-semibold text-lg">Активный праздник</h4>
              <p className="text-sm text-gray-600">{config.name}</p>
            </div>
          </div>
          <Button onClick={() => onOpenCalendarAdmin(settings.activeHoliday!)}>
            <Icon name="Settings" size={16} className="mr-2" />
            Редактировать призы
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Icon name="Package" size={20} />
            Настроенные призы
          </h3>
          {(() => {
            const prizes = localStorage.getItem(`prizes_${settings.activeHoliday}`);
            if (!prizes) {
              return (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Icon name="Gift" size={40} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 mb-2">Призы ещё не настроены</p>
                  <Button onClick={() => onOpenCalendarAdmin(settings.activeHoliday!)} variant="outline">
                    Добавить призы
                  </Button>
                </div>
              );
            }

            const prizeList = JSON.parse(prizes);
            
            return (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {prizeList.map((prize: any) => (
                  <div
                    key={prize.id}
                    className="p-4 rounded-lg border-2 bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                        <Icon name={prize.icon} size={24} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{prize.name}</h4>
                        {prize.value && (
                          <span className="text-xs text-primary font-bold">{prize.value}%</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{prize.description}</p>
                    <div className="flex gap-1 flex-wrap">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                        {prize.type === 'free_delivery' && 'Доставка'}
                        {prize.type === 'cashback' && 'Кэшбек'}
                        {prize.type === 'discount' && 'Скидка'}
                        {prize.type === 'gift' && 'Подарок'}
                      </span>
                      {prize.requiresLoyaltyCard && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          Карта
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
};

export default HolidayPrizesTab;
