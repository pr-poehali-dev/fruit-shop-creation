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
const CACHE_KEY = 'holiday_settings_cache';
const CACHE_DURATION = 10000;
const API_URL = 'https://functions.poehali.dev/9b1ac59e-93b6-41de-8974-a7f58d4ffaf9';

export const fetchHolidaySettingsFromAPI = async (): Promise<HolidaySettings> => {
  try {
    const response = await fetch(`${API_URL}?holiday_settings=true`);
    const data = await response.json();
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
    
    window.dispatchEvent(new CustomEvent('holiday-settings-changed', { detail: data }));
    return data;
  } catch (error) {
    console.error('Failed to fetch holiday settings:', error);
    return getHolidaySettings();
  }
};

export const getHolidaySettings = (): HolidaySettings => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    } else {
      fetchHolidaySettingsFromAPI();
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const settings = JSON.parse(stored);
    if (!settings.calendarDays) {
      settings.calendarDays = { feb23: 8, march8: 8 };
    }
    fetchHolidaySettingsFromAPI();
    return settings;
  }
  
  fetchHolidaySettingsFromAPI();
  
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

export const saveHolidaySettings = async (settings: HolidaySettings): Promise<void> => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    data: settings,
    timestamp: Date.now()
  }));
  
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_holiday',
        ...settings
      })
    });
    window.dispatchEvent(new CustomEvent('holiday-settings-changed', { detail: settings }));
  } catch (error) {
    console.error('Failed to save holiday settings to API:', error);
  }
};

export const enableHoliday = async (holiday: 'feb23' | 'march8'): Promise<void> => {
  const settings = getHolidaySettings();
  settings.enabled = true;
  settings.activeHoliday = holiday;
  settings.showBanner = true;
  settings.calendarEnabled = true;
  await saveHolidaySettings(settings);
};

export const disableHoliday = async (): Promise<void> => {
  const settings = getHolidaySettings();
  settings.enabled = false;
  settings.activeHoliday = null;
  settings.showBanner = false;
  settings.calendarEnabled = false;
  await saveHolidaySettings(settings);
};

export const toggleCalendar = async (enabled: boolean): Promise<void> => {
  const settings = getHolidaySettings();
  settings.calendarEnabled = enabled;
  await saveHolidaySettings(settings);
};

export const toggleBanner = async (enabled: boolean): Promise<void> => {
  const settings = getHolidaySettings();
  settings.showBanner = enabled;
  await saveHolidaySettings(settings);
};

export const setCalendarDays = async (holiday: 'feb23' | 'march8', days: number): Promise<void> => {
  const settings = getHolidaySettings();
  settings.calendarDays[holiday] = days;
  await saveHolidaySettings(settings);
};