import { useState, useEffect } from 'react';
import { getHolidaySettings, enableHoliday, disableHoliday } from '@/utils/holidaySettings';
import Icon from '@/components/ui/icon';

const HolidayDebugPanel = () => {
  const [settings, setSettings] = useState(getHolidaySettings());
  const [isOpen, setIsOpen] = useState(false);

  const refreshSettings = () => {
    setSettings(getHolidaySettings());
  };

  useEffect(() => {
    const handleSettingsChange = (e: CustomEvent) => {
      setSettings(e.detail);
    };

    const handleStorageChange = () => {
      refreshSettings();
    };

    window.addEventListener('holiday-settings-changed', handleSettingsChange as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    const interval = setInterval(refreshSettings, 1000);
    
    return () => {
      window.removeEventListener('holiday-settings-changed', handleSettingsChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleEnable = (holiday: 'feb23' | 'march8') => {
    enableHoliday(holiday);
    setTimeout(refreshSettings, 100);
  };

  const handleDisable = () => {
    disableHoliday();
    setTimeout(refreshSettings, 100);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 z-50 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
        title="Настройки праздников (тест)"
      >
        <Icon name="Calendar" size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-6 z-50 bg-white rounded-xl shadow-2xl p-4 w-80 border-2 border-purple-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Icon name="Calendar" size={20} />
          Настройки праздников
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Icon name="X" size={20} />
        </button>
      </div>

      <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Включено:</span>
          <span className={`font-semibold ${settings.enabled ? 'text-green-600' : 'text-red-600'}`}>
            {settings.enabled ? 'Да' : 'Нет'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Праздник:</span>
          <span className="font-semibold">
            {settings.activeHoliday === 'feb23' ? '🎖️ 23 Февраля' : 
             settings.activeHoliday === 'march8' ? '🌸 8 Марта' : 
             '—'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Баннер:</span>
          <span className={`font-semibold ${settings.showBanner ? 'text-green-600' : 'text-gray-400'}`}>
            {settings.showBanner ? 'Вкл' : 'Выкл'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Календарь:</span>
          <span className={`font-semibold ${settings.calendarEnabled ? 'text-green-600' : 'text-gray-400'}`}>
            {settings.calendarEnabled ? 'Вкл' : 'Выкл'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => handleEnable('feb23')}
          className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
        >
          🎖️ Активировать 23 Февраля
        </button>
        <button
          onClick={() => handleEnable('march8')}
          className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
        >
          🌸 Активировать 8 Марта
        </button>
        {settings.enabled && (
          <button
            onClick={handleDisable}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
          >
            ✕ Отключить всё
          </button>
        )}
      </div>

      <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
        💡 Совет: После активации праздника обновите страницу
      </div>
    </div>
  );
};

export default HolidayDebugPanel;