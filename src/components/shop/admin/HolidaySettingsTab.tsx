import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { getHolidaySettings, saveHolidaySettings, enableHoliday, disableHoliday, toggleCalendar, toggleBanner } from '@/utils/holidaySettings';
import CalendarAdmin from '@/components/CalendarAdmin';

const HolidaySettingsTab = () => {
  const [settings, setSettings] = useState(getHolidaySettings());
  const [showCalendarAdmin, setShowCalendarAdmin] = useState<'feb23' | 'march8' | null>(null);
  const [activeTab, setActiveTab] = useState<'themes' | 'prizes' | 'calendar'>('themes');

  const refreshSettings = () => {
    setSettings(getHolidaySettings());
  };

  const handleEnableHoliday = (holiday: 'feb23' | 'march8') => {
    enableHoliday(holiday);
    refreshSettings();
  };

  const handleDisableHoliday = () => {
    disableHoliday();
    refreshSettings();
  };

  const handleToggleCalendar = (enabled: boolean) => {
    toggleCalendar(enabled);
    refreshSettings();
  };

  const handleToggleBanner = (enabled: boolean) => {
    toggleBanner(enabled);
    refreshSettings();
  };

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

  const resetAllCalendars = () => {
    if (!confirm('⚠️ ВНИМАНИЕ! Это действие обнулит календари всех пользователей. Все открытые подарки будут сброшены. Продолжить?')) {
      return;
    }
    
    localStorage.removeItem('calendar_feb23');
    localStorage.removeItem('calendar_march8');
    alert('✅ Календари успешно обнулены!');
  };

  const getCalendarStats = (holiday: 'feb23' | 'march8') => {
    const calendar = localStorage.getItem(`calendar_${holiday}`);
    if (!calendar) return { total: 0, opened: 0 };
    
    const days = JSON.parse(calendar);
    return {
      total: days.length,
      opened: days.filter((d: any) => d.opened).length
    };
  };

  return (
    <div className="space-y-6">
      {/* Навигация по категориям */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('themes')}
          className={`px-4 py-3 font-semibold transition-colors relative ${
            activeTab === 'themes'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon name="Sparkles" size={18} />
            Праздничные темы
          </div>
        </button>
        <button
          onClick={() => setActiveTab('prizes')}
          className={`px-4 py-3 font-semibold transition-colors relative ${
            activeTab === 'prizes'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon name="Gift" size={18} />
            Управление призами
          </div>
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-3 font-semibold transition-colors relative ${
            activeTab === 'calendar'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon name="Calendar" size={18} />
            Календари пользователей
          </div>
        </button>
      </div>
      {/* Вкладка: Праздничные темы */}
      {activeTab === 'themes' && (
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
                          onClick={() => handleEnableHoliday(key as 'feb23' | 'march8')} 
                          className={`w-full bg-gradient-to-r ${config.color} hover:opacity-90 text-white`}
                          size="lg"
                        >
                          <Icon name="Sparkles" size={18} className="mr-2" />
                          Активировать тему
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleDisableHoliday} 
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
                    onClick={() => setShowCalendarAdmin(settings.activeHoliday!)}
                    variant="outline"
                    size="sm"
                  >
                    <Icon name="Settings" size={16} className="mr-2" />
                    Настроить призы
                  </Button>
                  <Switch
                    checked={settings.calendarEnabled}
                    onCheckedChange={handleToggleCalendar}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="Flag" size={24} className="text-primary" />
                  <div>
                    <h4 className="font-semibold">Праздничный баннер</h4>
                    <p className="text-sm text-gray-600">Показывать баннер в верхней части сайта</p>
                  </div>
                </div>
                <Switch
                  checked={settings.showBanner}
                  onCheckedChange={handleToggleBanner}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-1">Как работает календарь?</h4>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Клиенты открывают по одному подарку каждый день</li>
                      <li>Призы включают: бесплатную доставку, кэшбек, скидки</li>
                      <li>Для кэшбэка требуется карта лояльности</li>
                      <li>Настройте призы через кнопку "Настроить призы"</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon name="Sparkles" size={20} className="text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-900 mb-1">Секретные комбинации</h4>
                    <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                      <li><kbd>H</kbd> × 5 - Тестовый режим (все дни доступны)</li>
                      <li><kbd>Ctrl+Shift+K</kbd> - Админ-панель календаря</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* Вкладка: Управление призами */}
      {activeTab === 'prizes' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Gift" size={24} />
              Управление призами календаря
            </CardTitle>
            <CardDescription>
              Настройте призы для каждого праздничного календаря
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!settings.enabled || !settings.activeHoliday ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-xl font-semibold mb-2">Праздник не активирован</h3>
                <p className="text-gray-600 mb-4">
                  Сначала активируйте праздничную тему во вкладке "Праздничные темы"
                </p>
                <Button onClick={() => setActiveTab('themes')} variant="outline">
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Перейти к темам
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${holidayConfig[settings.activeHoliday].color} flex items-center justify-center text-3xl`}>
                      {holidayConfig[settings.activeHoliday].emoji}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        Призы для «{holidayConfig[settings.activeHoliday].name}»
                      </h3>
                      <p className="text-sm text-gray-600">
                        Настройте подарки, которые получат клиенты
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowCalendarAdmin(settings.activeHoliday!)}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                  >
                    <Icon name="Settings" size={20} className="mr-2" />
                    Редактировать призы
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Icon name="Package" size={18} />
                        Типы призов
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Icon name="Truck" size={16} className="text-blue-600" />
                          <span>Бесплатная доставка</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon name="Percent" size={16} className="text-green-600" />
                          <span>Кэшбек (требуется карта лояльности)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon name="BadgePercent" size={16} className="text-orange-600" />
                          <span>Скидка на покупку</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon name="Gift" size={16} className="text-pink-600" />
                          <span>Подарок</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Icon name="Info" size={18} />
                        Важная информация
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Призы распределяются случайно по дням</li>
                        <li>• Один приз = один день календаря</li>
                        <li>• Можно добавить неограниченное количество призов</li>
                        <li>• Изменения применяются к новым календарям</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Предпросмотр призов */}
                {(() => {
                  const prizes = localStorage.getItem(`prizes_${settings.activeHoliday}`);
                  if (!prizes) return null;
                  
                  const prizeList = JSON.parse(prizes);
                  if (prizeList.length === 0) return null;

                  return (
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Icon name="Eye" size={20} />
                          Предпросмотр настроенных призов
                        </CardTitle>
                        <CardDescription>
                          Список всех призов для календаря «{holidayConfig[settings.activeHoliday].name}»
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {prizeList.map((prize: any, index: number) => (
                            <div
                              key={prize.id || index}
                              className={`p-4 rounded-lg border-2 bg-gradient-to-br ${
                                settings.activeHoliday === 'feb23'
                                  ? 'from-blue-50 to-green-50 border-blue-200'
                                  : 'from-pink-50 to-purple-50 border-pink-200'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${holidayConfig[settings.activeHoliday].color} flex items-center justify-center flex-shrink-0`}>
                                  <Icon name={prize.icon as any} size={24} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm mb-1 truncate">{prize.name}</h4>
                                  <p className="text-xs text-gray-600 line-clamp-2">{prize.description}</p>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {prize.value && (
                                      <span className="px-2 py-0.5 bg-white/80 text-xs rounded-full font-semibold">
                                        {prize.value}%
                                      </span>
                                    )}
                                    {prize.requiresLoyaltyCard && (
                                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                        💳
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 text-center">
                          <p className="text-sm text-gray-600 mb-3">
                            Всего призов: <span className="font-semibold">{prizeList.length}</span>
                          </p>
                          <Button
                            onClick={() => setShowCalendarAdmin(settings.activeHoliday!)}
                            variant="outline"
                            size="sm"
                          >
                            <Icon name="Pencil" size={16} className="mr-2" />
                            Редактировать список призов
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Вкладка: Календари пользователей */}
      {activeTab === 'calendar' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Calendar" size={24} />
              Управление календарями пользователей
            </CardTitle>
            <CardDescription>
              Просматривайте статистику и управляйте календарями клиентов
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Календарь 23 февраля */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center text-3xl">
                      🎖️
                    </div>
                    <div>
                      <CardTitle>23 Февраля</CardTitle>
                      <CardDescription>Календарь мужского праздника</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const stats = getCalendarStats('feb23');
                    return (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Всего дней:</span>
                            <span className="font-semibold">{stats.total || '—'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Открыто подарков:</span>
                            <span className="font-semibold text-green-600">{stats.opened || 0}</span>
                          </div>
                          {stats.total > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-gradient-to-r from-blue-600 to-green-600 h-2.5 rounded-full transition-all"
                                style={{ width: `${(stats.opened / stats.total) * 100}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setShowCalendarAdmin('feb23')}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Icon name="Settings" size={16} className="mr-2" />
                            Настроить
                          </Button>
                          <Button
                            onClick={() => {
                              if (confirm('Обнулить календарь "23 Февраля" для всех пользователей?')) {
                                localStorage.removeItem('calendar_feb23');
                                alert('Календарь обнулён!');
                                setSettings({ ...settings });
                              }
                            }}
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                          >
                            <Icon name="RotateCcw" size={16} className="mr-2" />
                            Обнулить
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Календарь 8 марта */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-3xl">
                      🌸
                    </div>
                    <div>
                      <CardTitle>8 Марта</CardTitle>
                      <CardDescription>Календарь женского праздника</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const stats = getCalendarStats('march8');
                    return (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Всего дней:</span>
                            <span className="font-semibold">{stats.total || '—'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Открыто подарков:</span>
                            <span className="font-semibold text-green-600">{stats.opened || 0}</span>
                          </div>
                          {stats.total > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-gradient-to-r from-pink-500 to-purple-500 h-2.5 rounded-full transition-all"
                                style={{ width: `${(stats.opened / stats.total) * 100}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setShowCalendarAdmin('march8')}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Icon name="Settings" size={16} className="mr-2" />
                            Настроить
                          </Button>
                          <Button
                            onClick={() => {
                              if (confirm('Обнулить календарь "8 Марта" для всех пользователей?')) {
                                localStorage.removeItem('calendar_march8');
                                alert('Календарь обнулён!');
                                setSettings({ ...settings });
                              }
                            }}
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                          >
                            <Icon name="RotateCcw" size={16} className="mr-2" />
                            Обнулить
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <Icon name="AlertTriangle" size={24} />
                  Опасная зона
                </CardTitle>
                <CardDescription className="text-red-700">
                  Необратимые действия с календарями всех пользователей
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={resetAllCalendars}
                  variant="destructive"
                  size="lg"
                  className="w-full"
                >
                  <Icon name="Trash2" size={20} className="mr-2" />
                  Обнулить ВСЕ календари пользователей
                </Button>
              </CardContent>
            </Card>

            {/* Предпросмотр календарей */}
            {settings.enabled && settings.activeHoliday && (() => {
              const calendar = localStorage.getItem(`calendar_${settings.activeHoliday}`);
              if (!calendar) return null;

              const days = JSON.parse(calendar);
              const config = holidayConfig[settings.activeHoliday];

              return (
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Eye" size={20} />
                      Предпросмотр календаря «{config.name}»
                    </CardTitle>
                    <CardDescription>
                      Так клиенты видят календарь на сайте
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`p-6 rounded-xl bg-gradient-to-br ${config.color} bg-opacity-10`}>
                      <div className="text-center mb-4">
                        <div className="text-5xl mb-2">{config.emoji}</div>
                        <h3 className="text-xl font-bold text-gray-800">{config.name}</h3>
                      </div>
                      
                      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 max-w-3xl mx-auto">
                        {days.map((day: any) => (
                          <div
                            key={day.day}
                            className={`
                              aspect-square rounded-lg flex items-center justify-center text-lg font-bold
                              ${day.opened 
                                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg' 
                                : `bg-gradient-to-br ${config.color} text-white`
                              }
                            `}
                            title={day.opened ? `Открыт: ${day.prize.name}` : `День ${day.day}`}
                          >
                            {day.opened ? (
                              <Icon name="Gift" size={20} />
                            ) : (
                              <span>{day.day}</span>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                          {days.filter((d: any) => d.opened).length} из {days.length} дней открыто
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-1">Как работают календари?</h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Календарь создаётся индивидуально для каждого пользователя при первом открытии</li>
                    <li>Призы распределяются случайно из настроенного вами списка</li>
                    <li>Обнуление календаря сбрасывает прогресс всех пользователей</li>
                    <li>После обнуления новые календари генерируются заново</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showCalendarAdmin && (
        <CalendarAdmin
          holiday={showCalendarAdmin}
          onClose={() => setShowCalendarAdmin(null)}
        />
      )}
    </div>
  );
};

export default HolidaySettingsTab;