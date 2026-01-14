import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { getHolidaySettings } from '@/utils/holidaySettings';

interface HolidayBannerProps {
  onOpenCalendar: (holiday: 'feb23' | 'march8') => void;
  isPrizeModalOpen?: boolean;
}

const HolidayBanner = ({ onOpenCalendar, isPrizeModalOpen = false }: HolidayBannerProps) => {
  const [settings, setSettings] = useState(getHolidaySettings());
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const currentSettings = getHolidaySettings();
    setSettings(currentSettings);

    const dismissedKey = `holiday_banner_dismissed_${currentSettings.activeHoliday}`;
    const dismissed = localStorage.getItem(dismissedKey);
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const today = new Date();
      const hoursPassed = (today.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60);
      if (hoursPassed < 1) {
        setIsVisible(false);
      }
    }

    const handleSettingsChange = (e: CustomEvent) => {
      setSettings(e.detail);
      setIsVisible(true);
    };

    const handleStorageChange = () => {
      const updatedSettings = getHolidaySettings();
      setSettings(updatedSettings);
      setIsVisible(true);
    };

    window.addEventListener('holiday-settings-changed', handleSettingsChange as EventListener);
    window.addEventListener('storage', handleStorageChange);

    const interval = setInterval(() => {
      const updatedSettings = getHolidaySettings();
      const currentJson = JSON.stringify(settings);
      const updatedJson = JSON.stringify(updatedSettings);
      if (currentJson !== updatedJson) {
        setSettings(updatedSettings);
        setIsVisible(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('holiday-settings-changed', handleSettingsChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [settings]);

  const dismissBanner = () => {
    setIsVisible(false);
    // Сохраняем время закрытия для конкретного праздника
    const dismissedKey = `holiday_banner_dismissed_${settings.activeHoliday}`;
    localStorage.setItem(dismissedKey, new Date().toISOString());
  };

  if (!settings.enabled || !settings.showBanner || !settings.activeHoliday || !isVisible || isPrizeModalOpen) return null;

  const activeHoliday = settings.activeHoliday;

  const config = {
    feb23: {
      gradient: 'from-blue-600 via-green-600 to-blue-600',
      emoji: '🎖️',
      title: 'С 23 Февраля!',
      description: 'Открывайте праздничный календарь и получайте подарки каждый день',
      buttonText: 'Открыть календарь',
      particles: ['⭐', '🎯', '🏆', '⚡'],
      animation: 'military'
    },
    march8: {
      gradient: 'from-pink-500 via-purple-500 to-pink-500',
      emoji: '🌸',
      title: 'С 8 Марта!',
      description: 'Специальные подарки и сюрпризы ждут вас в праздничном календаре',
      buttonText: 'Получить подарок',
      particles: ['🌸', '🌺', '🌷', '💐', '🦋', '✨'],
      animation: 'spring'
    }
  };

  const currentConfig = config[activeHoliday];

  return (
    <div className="relative overflow-hidden">
      <div className={`relative bg-gradient-to-r ${currentConfig.gradient} text-white py-8 px-4`}>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}
        />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${8 + Math.random() * 8}s`
              }}
            >
              {currentConfig.particles[Math.floor(Math.random() * currentConfig.particles.length)]}
            </div>
          ))}
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <button
            onClick={dismissBanner}
            className="absolute top-0 right-0 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <Icon name="X" size={20} />
          </button>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left flex-1">
              <div className="text-6xl mb-3 animate-bounce">{currentConfig.emoji}</div>
              <h2 className="text-4xl font-bold mb-2 animate-pulse">{currentConfig.title}</h2>
              <p className="text-lg text-white/90 mb-4">{currentConfig.description}</p>
              
              <button
                onClick={() => onOpenCalendar(activeHoliday)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-800 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                <Icon name="Gift" size={24} />
                {currentConfig.buttonText}
              </button>
            </div>

            <div className="hidden md:block">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 bg-white/10 rounded-3xl transform rotate-6 animate-pulse" />
                <div className="absolute inset-0 bg-white/20 rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">{currentConfig.emoji}</div>
                    <div className="text-2xl font-bold">Подарки<br/>каждый день!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
};

export default HolidayBanner;