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
      formatted += ' (' + cleaned.substring(1, 4);
    }
    if (cleaned.length >= 5) {
      formatted += ') ' + cleaned.substring(4, 7);
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
      <DialogContent className="overflow-hidden p-0 max-w-4xl sm:max-w-[90vw]">
        <div className="relative flex flex-col md:flex-row min-h-[600px]">
          <div className="flex w-full md:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-950 via-green-800 to-teal-700 min-h-[200px] md:min-h-[600px]">
            <div className="absolute inset-0">
              <div className="sun"></div>
              <div className="leaf leaf-1"></div>
              <div className="leaf leaf-2"></div>
              <div className="leaf leaf-3"></div>
              <div className="leaf leaf-4"></div>
              <div className="leaf leaf-5"></div>
              <div className="leaf leaf-6"></div>
              <div className="leaf leaf-7"></div>
              <div className="leaf leaf-8"></div>
              <div className="tree tree-1"></div>
              <div className="tree tree-2"></div>
              <div className="tree tree-3"></div>
              <div className="tree tree-4"></div>
              <div className="flower flower-1"></div>
              <div className="flower flower-2"></div>
              <div className="flower flower-3"></div>
              <div className="flower flower-4"></div>
              <div className="butterfly butterfly-1"></div>
              <div className="butterfly butterfly-2"></div>
              <div className="cloud cloud-1"></div>
              <div className="cloud cloud-2"></div>
              <div className="cloud cloud-3"></div>
              <div className="grass"></div>
              <div className="bird bird-1"></div>
              <div className="bird bird-2"></div>
            </div>
            <div className="relative z-10 flex flex-col justify-center p-8 text-white">
              <h2 className="text-3xl font-bold mb-4 drop-shadow-lg">Питомник растений</h2>
              <p className="text-lg opacity-90 drop-shadow">Качественные саженцы для вашего сада</p>
            </div>
          </div>
          <div className="w-full md:w-1/2 p-8 bg-white">
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
                  placeholder="+7 (999) 123-45-67" 
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
                  placeholder="+7 (999) 123-45-67" 
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
          </div>
        </div>
        <style>{`
          .sun {
            position: absolute;
            top: 8%;
            right: 10%;
            width: 70px;
            height: 70px;
            background: radial-gradient(circle, rgba(255, 220, 100, 0.9), rgba(255, 180, 50, 0.6));
            border-radius: 50%;
            box-shadow: 0 0 30px rgba(255, 220, 100, 0.5);
            animation: pulse 3s ease-in-out infinite;
          }
          
          .leaf {
            position: absolute;
            width: 30px;
            height: 30px;
            background: rgba(134, 239, 172, 0.7);
            border-radius: 50% 0;
            animation: float 6s ease-in-out infinite;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          
          .leaf-1 { top: 10%; left: 10%; animation-delay: 0s; }
          .leaf-2 { top: 30%; left: 80%; animation-delay: 1s; background: rgba(187, 247, 208, 0.7); }
          .leaf-3 { top: 50%; left: 20%; animation-delay: 2s; }
          .leaf-4 { top: 70%; left: 70%; animation-delay: 3s; background: rgba(167, 243, 208, 0.7); }
          .leaf-5 { top: 20%; left: 50%; animation-delay: 4s; }
          .leaf-6 { top: 80%; left: 40%; animation-delay: 5s; background: rgba(110, 231, 183, 0.7); }
          .leaf-7 { top: 60%; left: 85%; animation-delay: 2.5s; }
          .leaf-8 { top: 35%; left: 15%; animation-delay: 3.5s; background: rgba(134, 239, 172, 0.8); }
          
          .tree {
            position: absolute;
            bottom: 0;
            width: 60px;
            height: 120px;
            background: linear-gradient(to top, rgba(6, 78, 59, 0.5), rgba(52, 211, 153, 0.4));
            border-radius: 50% 50% 0 0;
            animation: sway 4s ease-in-out infinite;
          }
          
          .tree::before {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 12px;
            height: 35px;
            background: rgba(92, 64, 51, 0.7);
            border-radius: 2px;
          }
          
          .tree-1 { left: 10%; animation-delay: 0s; }
          .tree-2 { left: 35%; height: 100px; animation-delay: 1s; }
          .tree-3 { left: 65%; height: 140px; animation-delay: 0.5s; }
          .tree-4 { left: 85%; height: 110px; animation-delay: 1.5s; }
          
          .flower {
            position: absolute;
            bottom: 40px;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(255, 182, 193, 0.9), rgba(255, 105, 180, 0.7));
            border-radius: 50%;
            animation: bloom 3s ease-in-out infinite;
          }
          
          .flower::before {
            content: '';
            position: absolute;
            bottom: -15px;
            left: 50%;
            transform: translateX(-50%);
            width: 2px;
            height: 15px;
            background: rgba(34, 139, 34, 0.6);
          }
          
          .flower-1 { left: 20%; animation-delay: 0s; }
          .flower-2 { left: 40%; animation-delay: 1s; background: radial-gradient(circle, rgba(255, 255, 150, 0.9), rgba(255, 215, 0, 0.7)); }
          .flower-3 { left: 60%; animation-delay: 2s; background: radial-gradient(circle, rgba(221, 160, 221, 0.9), rgba(218, 112, 214, 0.7)); }
          .flower-4 { left: 80%; animation-delay: 1.5s; background: radial-gradient(circle, rgba(255, 182, 193, 0.9), rgba(255, 105, 180, 0.7)); }
          
          .butterfly {
            position: absolute;
            width: 18px;
            height: 15px;
            animation: fly 8s ease-in-out infinite;
          }
          
          .butterfly::before,
          .butterfly::after {
            content: '';
            position: absolute;
            width: 8px;
            height: 12px;
            background: radial-gradient(ellipse, rgba(255, 200, 100, 0.8), rgba(255, 150, 50, 0.6));
            border-radius: 50% 50% 0 50%;
            animation: flutter 0.3s ease-in-out infinite;
          }
          
          .butterfly::before {
            left: 0;
            transform-origin: right center;
          }
          
          .butterfly::after {
            right: 0;
            transform: scaleX(-1);
            transform-origin: left center;
          }
          
          .butterfly-1 { top: 25%; left: 30%; animation-delay: 0s; }
          .butterfly-2 { top: 55%; left: 70%; animation-delay: 3s; }
          
          .cloud {
            position: absolute;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50px;
            animation: drift 25s linear infinite;
            box-shadow: 0 2px 10px rgba(255,255,255,0.1);
          }
          
          .cloud-1 {
            top: 12%;
            left: -120px;
            width: 90px;
            height: 35px;
          }
          
          .cloud-2 {
            top: 35%;
            left: -180px;
            width: 110px;
            height: 45px;
            animation-delay: 10s;
          }
          
          .cloud-3 {
            top: 50%;
            left: -150px;
            width: 80px;
            height: 30px;
            animation-delay: 18s;
          }
          
          .grass {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 50px;
            background: linear-gradient(to top, rgba(34, 139, 34, 0.4), transparent);
          }
          
          .bird {
            position: absolute;
            width: 20px;
            height: 8px;
            animation: birdFly 15s linear infinite;
          }
          
          .bird::before,
          .bird::after {
            content: '';
            position: absolute;
            width: 10px;
            height: 2px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 2px;
            animation: wingFlap 0.5s ease-in-out infinite;
          }
          
          .bird::before {
            left: 0;
            transform: rotate(-20deg);
            transform-origin: right center;
          }
          
          .bird::after {
            right: 0;
            transform: rotate(20deg);
            transform-origin: left center;
          }
          
          .bird-1 { top: 18%; left: -30px; animation-delay: 2s; }
          .bird-2 { top: 28%; left: -50px; animation-delay: 8s; }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.05); opacity: 1; }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-15px) rotate(90deg); }
            50% { transform: translateY(-25px) rotate(180deg); }
            75% { transform: translateY(-15px) rotate(270deg); }
          }
          
          @keyframes sway {
            0%, 100% { transform: rotate(-1deg); }
            50% { transform: rotate(2deg); }
          }
          
          @keyframes bloom {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }
          
          @keyframes fly {
            0% { transform: translate(0, 0); }
            25% { transform: translate(50px, -30px); }
            50% { transform: translate(100px, 10px); }
            75% { transform: translate(50px, 40px); }
            100% { transform: translate(0, 0); }
          }
          
          @keyframes flutter {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-15deg); }
          }
          
          @keyframes drift {
            0% { left: -150px; }
            100% { left: 110%; }
          }
          
          @keyframes birdFly {
            0% { left: -50px; }
            100% { left: 110%; }
          }
          
          @keyframes wingFlap {
            0%, 100% { transform: rotate(-20deg); }
            50% { transform: rotate(-40deg); }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;