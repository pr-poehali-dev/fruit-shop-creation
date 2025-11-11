import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import MaintenanceModeSection from './settings/MaintenanceModeSection';
import HolidayThemeSection from './settings/HolidayThemeSection';
import BasicInfoSection from './settings/BasicInfoSection';
import PaymentSettingsSection from './settings/PaymentSettingsSection';
import DeliverySettingsSection from './settings/DeliverySettingsSection';
import LoyaltySettingsSection from './settings/LoyaltySettingsSection';
import PagesContentSection from './settings/PagesContentSection';
import AdminSettingsSection from './settings/AdminSettingsSection';
import OnlineCounterSection from './settings/OnlineCounterSection';

interface SettingsTabProps {
  siteSettings: any;
  onSaveSettings: (e: React.FormEvent<HTMLFormElement>) => void;
}

const SettingsTab = ({ siteSettings, onSaveSettings }: SettingsTabProps) => {
  const [holidayTheme, setHolidayTheme] = useState(siteSettings.holiday_theme || 'none');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(siteSettings.is_maintenance_mode || false);
  const [autoMaintenanceEnabled, setAutoMaintenanceEnabled] = useState(siteSettings.auto_maintenance_enabled || false);

  useEffect(() => {
    setHolidayTheme(siteSettings.holiday_theme || 'none');
    setIsMaintenanceMode(siteSettings.is_maintenance_mode || false);
    setAutoMaintenanceEnabled(siteSettings.auto_maintenance_enabled || false);
  }, [siteSettings]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Информация о сайте</CardTitle>
        <CardDescription>Настройте основную информацию</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSaveSettings} className="space-y-4">
          <MaintenanceModeSection 
            siteSettings={siteSettings}
            isMaintenanceMode={isMaintenanceMode}
            autoMaintenanceEnabled={autoMaintenanceEnabled}
            onMaintenanceModeChange={setIsMaintenanceMode}
            onAutoMaintenanceChange={setAutoMaintenanceEnabled}
          />
          
          <HolidayThemeSection 
            holidayTheme={holidayTheme}
            onThemeChange={setHolidayTheme}
          />
          
          <BasicInfoSection siteSettings={siteSettings} />
          
          <PaymentSettingsSection siteSettings={siteSettings} />
          
          <DeliverySettingsSection siteSettings={siteSettings} />
          
          <LoyaltySettingsSection siteSettings={siteSettings} />
          
          <PagesContentSection siteSettings={siteSettings} />
          
          <AdminSettingsSection siteSettings={siteSettings} />
          
          <OnlineCounterSection siteSettings={siteSettings} />

          <Button type="submit" className="w-full">
            Сохранить изменения
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SettingsTab;