export interface HolidaySettings {
  enabled: boolean;
  activeHoliday: 'feb23' | 'march8' | null;
  showBanner: boolean;
  calendarEnabled: boolean;
  calendarDays: {
    feb23: number;
    march8: number;
  };
}

const STORAGE_KEY = 'holiday_settings';

export const getHolidaySettings = (): HolidaySettings => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const settings = JSON.parse(stored);
    if (!settings.calendarDays) {
      settings.calendarDays = { feb23: 8, march8: 8 };
    }
    return settings;
  }
  
  return {
    enabled: false,
    activeHoliday: null,
    showBanner: false,
    calendarEnabled: false,
    calendarDays: {
      feb23: 8,
      march8: 8
    }
  };
};

export const saveHolidaySettings = (settings: HolidaySettings): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

export const enableHoliday = (holiday: 'feb23' | 'march8'): void => {
  const settings = getHolidaySettings();
  settings.enabled = true;
  settings.activeHoliday = holiday;
  settings.showBanner = true;
  settings.calendarEnabled = true;
  saveHolidaySettings(settings);
};

export const disableHoliday = (): void => {
  const settings = getHolidaySettings();
  settings.enabled = false;
  settings.activeHoliday = null;
  settings.showBanner = false;
  settings.calendarEnabled = false;
  saveHolidaySettings(settings);
};

export const toggleCalendar = (enabled: boolean): void => {
  const settings = getHolidaySettings();
  settings.calendarEnabled = enabled;
  saveHolidaySettings(settings);
};

export const toggleBanner = (enabled: boolean): void => {
  const settings = getHolidaySettings();
  settings.showBanner = enabled;
  saveHolidaySettings(settings);
};

export const setCalendarDays = (holiday: 'feb23' | 'march8', days: number): void => {
  const settings = getHolidaySettings();
  settings.calendarDays[holiday] = days;
  saveHolidaySettings(settings);
};