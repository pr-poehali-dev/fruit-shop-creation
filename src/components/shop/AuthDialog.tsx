import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface BanInfo {
  banned: boolean;
  ban_reason?: string;
  ban_until?: string;
}

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>, action: 'login' | 'register') => void;
  onGoogleLogin?: () => void;
  banInfo?: BanInfo | null;
}

const AuthDialog = ({ open, onOpenChange, onSubmit, onGoogleLogin, banInfo }: AuthDialogProps) => {
  const [timeLeft, setTimeLeft] = useState('');

  const formatPhoneInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = '+7';
    
    if (cleaned.length > 1) {
      formatted += '(' + cleaned.substring(1, 4);
    }
    if (cleaned.length >= 5) {
      formatted += ')' + cleaned.substring(4, 7);
    }
    if (cleaned.length >= 8) {
      formatted += '-' + cleaned.substring(7, 9);
    }
    if (cleaned.length >= 10) {
      formatted += '-' + cleaned.substring(9, 11);
    }
    
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const cursorPosition = input.selectionStart || 0;
    const oldValue = input.value;
    const newValue = formatPhoneInput(input.value);
    
    input.value = newValue;
    
    if (oldValue.length > newValue.length) {
      input.setSelectionRange(cursorPosition, cursorPosition);
    } else {
      const newCursor = cursorPosition + (newValue.length - oldValue.length);
      input.setSelectionRange(newCursor, newCursor);
    }
  };

  useEffect(() => {
    if (!banInfo?.banned || !banInfo.ban_until) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const banEnd = new Date(banInfo.ban_until).getTime();
      const distance = banEnd - now;

      if (distance < 0) {
        setTimeLeft('Бан истёк');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      let result = '';
      if (days > 0) result += `${days}д `;
      if (hours > 0) result += `${hours}ч `;
      if (minutes > 0) result += `${minutes}м `;
      result += `${seconds}с`;
      
      setTimeLeft(result);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [banInfo]);

  if (banInfo?.banned) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 mb-4 animate-pulse">
                <Icon name="ShieldAlert" size={40} className="text-red-600 dark:text-red-500" />
              </div>
              <DialogTitle className="text-2xl font-bold text-red-600 dark:text-red-500 mb-2">
                Доступ заблокирован
              </DialogTitle>
            </div>

            <Card className="p-6 border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="FileText" size={18} className="text-red-600" />
                    <h3 className="font-semibold text-sm text-red-900 dark:text-red-300">Причина блокировки:</h3>
                  </div>
                  <p className="text-base text-red-800 dark:text-red-200 pl-6">
                    {banInfo.ban_reason || 'Не указана'}
                  </p>
                </div>

                {banInfo.ban_until && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="Clock" size={18} className="text-red-600" />
                      <h3 className="font-semibold text-sm text-red-900 dark:text-red-300">Истекает через:</h3>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="bg-red-600 dark:bg-red-700 text-white px-6 py-3 rounded-lg font-mono text-2xl font-bold shadow-lg">
                        {timeLeft}
                      </div>
                    </div>
                    <p className="text-xs text-red-700 dark:text-red-400 text-center mt-2">
                      До: {new Date(banInfo.ban_until).toLocaleString('ru-RU')}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-4 rounded-lg">
              <Icon name="Info" size={16} />
              <p>Если считаете блокировку ошибочной, обратитесь в поддержку</p>
            </div>

            <Button 
              onClick={() => onOpenChange(false)} 
              variant="outline" 
              className="w-full"
            >
              Закрыть
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Вход и регистрация</DialogTitle>
          <DialogDescription>Войдите или создайте новый аккаунт</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Вход</TabsTrigger>
            <TabsTrigger value="register">Регистрация</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={(e) => onSubmit(e, 'login')} className="space-y-4" autoComplete="on">
              <div>
                <Label htmlFor="login-phone">Телефон</Label>
                <Input 
                  id="login-phone" 
                  name="phone" 
                  type="tel" 
                  placeholder="+7(999)123-45-67" 
                  defaultValue="+7"
                  onChange={handlePhoneChange}
                  onFocus={(e) => {
                    if (e.target.value === '') e.target.value = '+7';
                  }}
                  autoComplete="username"
                  required 
                />
              </div>
              <div>
                <Label htmlFor="login-password">Пароль</Label>
                <Input id="login-password" name="password" type="password" autoComplete="current-password" required />
              </div>
              <Button type="submit" className="w-full">Войти</Button>
              
              {onGoogleLogin && (
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Для администраторов</span>
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={onGoogleLogin}
                  >
                    <Icon name="Chrome" size={18} className="mr-2" />
                    Войти через Google
                  </Button>
                </>
              )}
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={(e) => onSubmit(e, 'register')} className="space-y-4" autoComplete="on">
              <div>
                <Label htmlFor="register-phone">Телефон</Label>
                <Input 
                  id="register-phone" 
                  name="phone" 
                  type="tel" 
                  placeholder="+7(999)123-45-67" 
                  defaultValue="+7"
                  onChange={handlePhoneChange}
                  onFocus={(e) => {
                    if (e.target.value === '') e.target.value = '+7';
                  }}
                  autoComplete="username"
                  required 
                />
              </div>
              <div>
                <Label htmlFor="register-name">Имя</Label>
                <Input id="register-name" name="full_name" placeholder="Иван Иванов" autoComplete="name" />
              </div>
              <div>
                <Label htmlFor="register-password">Пароль</Label>
                <Input id="register-password" name="password" type="password" autoComplete="new-password" required />
              </div>
              <Button type="submit" className="w-full">Зарегистрироваться</Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;