import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { User } from '@/types/shop';
import { logUserAction } from '@/utils/userLogger';

interface SettingsTabProps {
  user: User | null;
  onUserUpdate: (updatedUser: User) => void;
}

const SettingsTab = ({ user, onUserUpdate }: SettingsTabProps) => {
  const { toast } = useToast();
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [snowEnabled, setSnowEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      setIsDarkTheme(true);
      document.documentElement.classList.add('dark');
    }

    if (user?.snow_effect_enabled !== undefined) {
      setSnowEnabled(user.snow_effect_enabled);
    }
  }, [user]);

  const toggleTheme = async () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    
    if (user) {
      await logUserAction(
        user.id,
        'theme_change',
        `Смена темы на ${newTheme ? 'тёмную' : 'светлую'}`,
        'settings',
        undefined,
        { theme: newTheme ? 'dark' : 'light' }
      );
    }
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      toast({
        title: 'Тёмная тема включена',
        description: 'Интерфейс переключён на тёмную тему'
      });
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      toast({
        title: 'Светлая тема включена',
        description: 'Интерфейс переключён на светлую тему'
      });
    }
  };

  const toggleSnowEffect = async (enabled: boolean) => {
    if (!user) return;
    setIsLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          snow_effect_enabled: enabled
        })
      });

      const data = await response.json();

      if (data.success) {
        setSnowEnabled(enabled);
        onUserUpdate({ ...user, snow_effect_enabled: enabled });
        toast({
          title: enabled ? 'Снег включён' : 'Снег отключён',
          description: enabled ? 'Новогодние снежинки теперь падают на экране' : 'Снежинки больше не отображаются'
        });
        
        if (user) {
          await logUserAction(
            user.id,
            'snow_effect_toggle',
            `Эффект снега ${enabled ? 'включён' : 'отключён'}`,
            'settings',
            undefined,
            { snow_enabled: enabled }
          );
        }
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось изменить настройку',
          variant: 'destructive'
        });
        setSnowEnabled(!enabled);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройку',
        variant: 'destructive'
      });
      setSnowEnabled(!enabled);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Palette" size={20} />
            Внешний вид
          </CardTitle>
          <CardDescription>Настройте оформление интерфейса</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="dark-mode">Тёмная тема</Label>
              <p className="text-sm text-muted-foreground">
                Переключить на тёмное оформление
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={isDarkTheme}
              onCheckedChange={toggleTheme}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Snowflake" size={20} />
            Эффекты
          </CardTitle>
          <CardDescription>Новогодние снежинки и анимация</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="snow-effect">Падающий снег</Label>
              <p className="text-sm text-muted-foreground">
                Отображать новогодние снежинки на экране
              </p>
            </div>
            <Switch
              id="snow-effect"
              checked={snowEnabled}
              onCheckedChange={toggleSnowEffect}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;