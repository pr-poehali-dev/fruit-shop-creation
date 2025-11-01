import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface AccessibilitySettings {
  enabled: boolean;
  fontSize: number;
  contrast: 'normal' | 'high' | 'extra-high';
  lineSpacing: number;
  letterSpacing: number;
}

export default function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    enabled: false,
    fontSize: 100,
    contrast: 'normal',
    lineSpacing: 150,
    letterSpacing: 0,
  });

  useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
      applySettings(parsed);
    }
  }, []);

  const applySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    if (newSettings.enabled) {
      root.classList.add('accessibility-mode');
      root.style.setProperty('--accessibility-font-size', `${newSettings.fontSize}%`);
      root.style.setProperty('--accessibility-line-spacing', `${newSettings.lineSpacing / 100}`);
      root.style.setProperty('--accessibility-letter-spacing', `${newSettings.letterSpacing / 100}em`);
      
      root.classList.remove('contrast-normal', 'contrast-high', 'contrast-extra-high');
      root.classList.add(`contrast-${newSettings.contrast}`);
      
      document.body.style.fontSize = `${newSettings.fontSize}%`;
    } else {
      root.classList.remove('accessibility-mode', 'contrast-normal', 'contrast-high', 'contrast-extra-high');
      root.style.removeProperty('--accessibility-font-size');
      root.style.removeProperty('--accessibility-line-spacing');
      root.style.removeProperty('--accessibility-letter-spacing');
      document.body.style.fontSize = '';
    }
  };

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    applySettings(newSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      enabled: false,
      fontSize: 100,
      contrast: 'normal',
      lineSpacing: 150,
      letterSpacing: 0,
    };
    updateSettings(defaultSettings);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Icon name={settings.enabled ? 'EyeOff' : 'Eye'} size={20} />
          <span>Настройки доступности</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Настройки доступности</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Режим для слабовидящих</Label>
              <Button
                variant={settings.enabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateSettings({ enabled: !settings.enabled })}
              >
                {settings.enabled ? 'Вкл' : 'Выкл'}
              </Button>
            </div>

            {settings.enabled && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Размер шрифта</Label>
                    <span className="text-sm text-muted-foreground">{settings.fontSize}%</span>
                  </div>
                  <Slider
                    value={[settings.fontSize]}
                    onValueChange={([value]) => updateSettings({ fontSize: value })}
                    min={80}
                    max={200}
                    step={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Контрастность</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={settings.contrast === 'normal' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSettings({ contrast: 'normal' })}
                    >
                      Обычная
                    </Button>
                    <Button
                      variant={settings.contrast === 'high' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSettings({ contrast: 'high' })}
                    >
                      Высокая
                    </Button>
                    <Button
                      variant={settings.contrast === 'extra-high' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSettings({ contrast: 'extra-high' })}
                    >
                      Макс
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Межстрочный интервал</Label>
                    <span className="text-sm text-muted-foreground">{settings.lineSpacing}%</span>
                  </div>
                  <Slider
                    value={[settings.lineSpacing]}
                    onValueChange={([value]) => updateSettings({ lineSpacing: value })}
                    min={100}
                    max={250}
                    step={10}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Межбуквенный интервал</Label>
                    <span className="text-sm text-muted-foreground">{settings.letterSpacing}px</span>
                  </div>
                  <Slider
                    value={[settings.letterSpacing]}
                    onValueChange={([value]) => updateSettings({ letterSpacing: value })}
                    min={0}
                    max={10}
                    step={1}
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetSettings}
                  className="w-full"
                >
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Сбросить настройки
                </Button>
              </>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}