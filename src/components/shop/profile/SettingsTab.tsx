import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { User } from '@/types/shop';

interface SettingsTabProps {
  user: User | null;
  onUserUpdate: (updatedUser: User) => void;
}

const SettingsTab = ({ user, onUserUpdate }: SettingsTabProps) => {
  const { toast } = useToast();
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      setIsDarkTheme(true);
      document.documentElement.classList.add('dark');
    }

    if (user?.two_factor_enabled) {
      setTwoFactorEnabled(true);
    }
  }, [user]);

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    
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

  const enableTwoFactor = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/YOUR_2FA_FUNCTION_URL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setup',
          user_id: user.id
        })
      });

      const data = await response.json();

      if (data.success) {
        setQrCode(data.qr_code);
        setSecret(data.secret);
        setShowQR(true);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось настроить 2FA',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключить двухфакторную аутентификацию',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyTwoFactor = async () => {
    if (!user || !verificationCode) return;
    setIsLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/YOUR_2FA_FUNCTION_URL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          user_id: user.id,
          code: verificationCode
        })
      });

      const data = await response.json();

      if (data.success) {
        setTwoFactorEnabled(true);
        setShowQR(false);
        setVerificationCode('');
        onUserUpdate({ ...user, two_factor_enabled: true });
        toast({
          title: 'Двухфакторная аутентификация включена',
          description: 'Теперь при входе потребуется код из приложения'
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Неверный код подтверждения',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подтвердить двухфакторную аутентификацию',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/YOUR_2FA_FUNCTION_URL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'disable',
          user_id: user.id
        })
      });

      const data = await response.json();

      if (data.success) {
        setTwoFactorEnabled(false);
        onUserUpdate({ ...user, two_factor_enabled: false });
        toast({
          title: 'Двухфакторная аутентификация отключена',
          description: 'Вход теперь доступен только по паролю'
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отключить 2FA',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отключить двухфакторную аутентификацию',
        variant: 'destructive'
      });
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
            <Icon name="Shield" size={20} />
            Безопасность
          </CardTitle>
          <CardDescription>Двухфакторная аутентификация (Google Authenticator)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="two-factor">Двухфакторная аутентификация</Label>
              <p className="text-sm text-muted-foreground">
                Дополнительная защита аккаунта с помощью кодов
              </p>
            </div>
            <Switch
              id="two-factor"
              checked={twoFactorEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  enableTwoFactor();
                } else {
                  disableTwoFactor();
                }
              }}
              disabled={isLoading}
            />
          </div>

          {showQR && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="text-center">
                <h4 className="font-semibold mb-2">Отсканируйте QR-код</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Используйте Google Authenticator или аналогичное приложение
                </p>
                {qrCode && (
                  <div className="flex justify-center mb-4">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                )}
                {secret && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Или введите код вручную:</p>
                    <code className="bg-background px-3 py-1 rounded text-sm font-mono">{secret}</code>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-code">Код подтверждения</Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>

              <Button 
                onClick={verifyTwoFactor} 
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full"
              >
                {isLoading ? 'Проверка...' : 'Подтвердить'}
              </Button>

              <Button 
                variant="outline" 
                onClick={() => setShowQR(false)}
                className="w-full"
              >
                Отмена
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
