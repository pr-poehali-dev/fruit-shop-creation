import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { getHolidaySettings } from '@/utils/holidaySettings';

interface Prize {
  id: string;
  name: string;
  description: string;
  type: 'free_delivery' | 'cashback' | 'discount' | 'gift';
  value?: number;
  requiresLoyaltyCard?: boolean;
  icon: string;
}

interface CalendarDay {
  day: number;
  prize: Prize;
  opened: boolean;
}

interface HolidayCalendarProps {
  holiday: 'feb23' | 'march8';
  onClose: () => void;
  testMode?: boolean;
}

const HolidayCalendar = ({ holiday, onClose, testMode = false }: HolidayCalendarProps) => {
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [hasLoyaltyCard, setHasLoyaltyCard] = useState<boolean>(false);
  const [showLoyaltyPrompt, setShowLoyaltyPrompt] = useState(false);

  const holidayConfig = {
    feb23: {
      title: 'Календарь к 23 Февраля',
      emoji: '🎖️',
      colors: {
        primary: 'from-blue-600 to-green-600',
        accent: 'bg-blue-500',
        text: 'text-blue-900'
      },
      startDate: new Date('2026-02-16'),
      endDate: new Date('2026-02-23')
    },
    march8: {
      title: 'Календарь к 8 Марта',
      emoji: '🌸',
      colors: {
        primary: 'from-pink-500 to-purple-500',
        accent: 'bg-pink-500',
        text: 'text-pink-900'
      },
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-08')
    }
  };

  const config = holidayConfig[holiday];

  useEffect(() => {
    const savedCalendar = localStorage.getItem(`calendar_${holiday}`);
    const savedLoyaltyCard = localStorage.getItem('has_loyalty_card') === 'true';
    setHasLoyaltyCard(savedLoyaltyCard);

    if (savedCalendar) {
      setCalendar(JSON.parse(savedCalendar));
    } else {
      initializeCalendar();
    }
  }, [holiday]);

  const initializeCalendar = () => {
    const prizes = getPrizes();
    const days = getDaysCount();
    const newCalendar: CalendarDay[] = [];

    for (let i = 1; i <= days; i++) {
      newCalendar.push({
        day: i,
        prize: prizes[Math.floor(Math.random() * prizes.length)],
        opened: false
      });
    }

    setCalendar(newCalendar);
    localStorage.setItem(`calendar_${holiday}`, JSON.stringify(newCalendar));
  };

  const getDaysCount = () => {
    const settings = getHolidaySettings();
    return settings.calendarDays[holiday] || 8;
  };

  const getPrizes = (): Prize[] => {
    const savedPrizes = localStorage.getItem(`prizes_${holiday}`);
    if (savedPrizes) {
      return JSON.parse(savedPrizes);
    }

    return [
      {
        id: '1',
        name: 'Бесплатная доставка',
        description: 'Бесплатная доставка на следующий заказ',
        type: 'free_delivery',
        icon: 'Truck'
      },
      {
        id: '2',
        name: 'Кэшбек 10%',
        description: 'Получите 10% кэшбэка на карту лояльности',
        type: 'cashback',
        value: 10,
        requiresLoyaltyCard: true,
        icon: 'Percent'
      },
      {
        id: '3',
        name: 'Кэшбек 15%',
        description: 'Получите 15% кэшбэка на карту лояльности',
        type: 'cashback',
        value: 15,
        requiresLoyaltyCard: true,
        icon: 'Percent'
      },
      {
        id: '4',
        name: 'Скидка 20%',
        description: 'Скидка 20% на следующую покупку',
        type: 'discount',
        value: 20,
        icon: 'BadgePercent'
      },
      {
        id: '5',
        name: 'Подарок',
        description: 'Бесплатный саженец при следующем заказе',
        type: 'gift',
        icon: 'Gift'
      }
    ];
  };

  const canOpenDay = (day: number): boolean => {
    if (testMode) return true;

    const settings = getHolidaySettings();
    if (!settings.enabled || settings.activeHoliday !== holiday || !settings.calendarEnabled) {
      return false;
    }

    return true;
  };

  const openDay = (dayData: CalendarDay) => {
    if (dayData.opened || !canOpenDay(dayData.day)) return;

    if (dayData.prize.requiresLoyaltyCard && !hasLoyaltyCard) {
      setShowLoyaltyPrompt(true);
      setSelectedDay(dayData);
      return;
    }

    setSelectedDay({ ...dayData, opened: true });
    
    const updatedCalendar = calendar.map(d =>
      d.day === dayData.day ? { ...d, opened: true } : d
    );
    setCalendar(updatedCalendar);
    localStorage.setItem(`calendar_${holiday}`, JSON.stringify(updatedCalendar));
  };

  const getLoyaltyCard = () => {
    setHasLoyaltyCard(true);
    localStorage.setItem('has_loyalty_card', 'true');
    setShowLoyaltyPrompt(false);
    
    if (selectedDay) {
      openDay(selectedDay);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className={`bg-gradient-to-r ${config.colors.primary} p-6 rounded-t-3xl text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <Icon name="X" size={24} />
          </button>
          
          <div className="text-center">
            <div className="text-6xl mb-3">{config.emoji}</div>
            <h2 className="text-3xl font-bold mb-2">{config.title}</h2>
            <p className="text-white/90">Открывайте по одному подарку каждый день!</p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-6">
            {calendar.map((dayData) => {
              const available = canOpenDay(dayData.day);
              const opened = dayData.opened;

              return (
                <div key={dayData.day} className="relative group">
                  <button
                    onClick={() => openDay(dayData)}
                    disabled={!available || opened}
                    className={`
                      w-full aspect-square rounded-xl flex items-center justify-center text-2xl font-bold
                      transition-all transform hover:scale-105 relative
                      ${opened ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg' : ''}
                      ${available && !opened ? `${config.colors.accent} text-white hover:shadow-xl cursor-pointer` : ''}
                      ${!available ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''}
                    `}
                  >
                    {opened ? (
                      <Icon name="Gift" size={32} />
                    ) : (
                      <span>{dayData.day}</span>
                    )}
                    
                    {available && !opened && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    )}
                  </button>
                  
                  {opened && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
                      <div className="font-semibold mb-1">{dayData.prize.name}</div>
                      <div className="text-gray-300">{dayData.prize.description}</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {testMode && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4 rounded">
              <div className="flex items-center gap-2">
                <Icon name="AlertTriangle" size={20} className="text-yellow-600" />
                <p className="text-sm text-yellow-800 font-medium">
                  Режим тестирования активен - все дни доступны для открытия
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedDay && !showLoyaltyPrompt && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center transform animate-bounce-in">
            <div className="text-7xl mb-4">{config.emoji}</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">Поздравляем!</h3>
            <p className="text-gray-600 mb-2">Вы получили:</p>
            
            <div className={`p-6 rounded-xl ${config.colors.accent} bg-opacity-10 mb-6`}>
              <div className="flex justify-center mb-3">
                <Icon name={selectedDay.prize.icon as any} size={48} className={config.colors.text} />
              </div>
              <h4 className="text-xl font-bold mb-2">{selectedDay.prize.name}</h4>
              <p className="text-gray-600">{selectedDay.prize.description}</p>
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className={`w-full ${config.colors.accent} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all`}
            >
              Отлично!
            </button>
          </div>
        </div>
      )}

      {showLoyaltyPrompt && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">Нужна карта лояльности</h3>
            <p className="text-gray-600 mb-6">
              Для получения кэшбэка необходима карта лояльности нашего питомника.
              Хотите оформить её прямо сейчас?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLoyaltyPrompt(false)}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={getLoyaltyCard}
                className={`flex-1 ${config.colors.accent} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all`}
              >
                Оформить карту
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidayCalendar;