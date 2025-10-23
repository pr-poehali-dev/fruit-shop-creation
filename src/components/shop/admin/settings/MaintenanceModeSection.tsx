import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

interface MaintenanceModeSectionProps {
  siteSettings: any;
  isMaintenanceMode: boolean;
  autoMaintenanceEnabled: boolean;
  onMaintenanceModeChange: (checked: boolean) => void;
  onAutoMaintenanceChange: (checked: boolean) => void;
}

const MaintenanceModeSection = ({
  siteSettings,
  isMaintenanceMode,
  autoMaintenanceEnabled,
  onMaintenanceModeChange,
  onAutoMaintenanceChange
}: MaintenanceModeSectionProps) => {
  return (
    <div className="border-b pb-4 mb-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Icon name="Construction" size={20} className="text-orange-600" />
        Режим технического обслуживания
      </h3>
      <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
        <div className="flex-1">
          <Label htmlFor="maintenance-mode" className="text-base font-medium">
            Закрыть сайт на техническое обслуживание
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Посетители увидят страницу с сообщением. Админы смогут войти по номеру и паролю.
          </p>
        </div>
        <input type="hidden" name="is_maintenance_mode" value={isMaintenanceMode ? 'true' : 'false'} />
        <Switch
          id="maintenance-mode"
          checked={isMaintenanceMode}
          onCheckedChange={onMaintenanceModeChange}
        />
      </div>
      {isMaintenanceMode && (
        <div className="mt-4">
          <Label htmlFor="maintenance-reason">Причина закрытия сайта</Label>
          <Textarea
            id="maintenance-reason"
            name="maintenance_reason"
            defaultValue={siteSettings.maintenance_reason || 'Сайт временно закрыт на техническое обслуживание'}
            rows={3}
            placeholder="Сайт временно закрыт на техническое обслуживание"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Это сообщение увидят все посетители сайта
          </p>
        </div>
      )}
      
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <Label htmlFor="auto-maintenance" className="text-base font-medium flex items-center gap-2">
              <Icon name="Clock" size={18} className="text-blue-600" />
              Автоматическое включение/выключение
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Сайт автоматически закроется и откроется в указанное время
            </p>
          </div>
          <input type="hidden" name="auto_maintenance_enabled" value={autoMaintenanceEnabled ? 'true' : 'false'} />
          <Switch
            id="auto-maintenance"
            checked={autoMaintenanceEnabled}
            onCheckedChange={onAutoMaintenanceChange}
          />
        </div>
        
        {autoMaintenanceEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-blue-200">
            <div>
              <Label htmlFor="maintenance-start" className="text-sm">Начало обслуживания</Label>
              <Input
                id="maintenance-start"
                name="maintenance_start_time"
                type="datetime-local"
                defaultValue={siteSettings.maintenance_start_time ? new Date(siteSettings.maintenance_start_time).toISOString().slice(0, 16) : ''}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Сайт закроется в это время
              </p>
            </div>
            
            <div>
              <Label htmlFor="maintenance-end" className="text-sm">Окончание обслуживания</Label>
              <Input
                id="maintenance-end"
                name="maintenance_end_time"
                type="datetime-local"
                defaultValue={siteSettings.maintenance_end_time ? new Date(siteSettings.maintenance_end_time).toISOString().slice(0, 16) : ''}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Сайт откроется в это время
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceModeSection;
