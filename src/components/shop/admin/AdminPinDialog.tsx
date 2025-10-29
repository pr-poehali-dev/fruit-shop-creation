import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface AdminPinDialogProps {
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

const ADMIN_PIN_KEY = 'admin_pin_verified';
const PIN_EXPIRY_KEY = 'admin_pin_expiry';
const LOCKOUT_KEY = 'admin_pin_lockout';
const SESSION_DURATION = 30 * 60 * 1000;
const LOCKOUT_DURATION = 10 * 60 * 1000;
const MAX_ATTEMPTS = 3;

const AdminPinDialog = ({ open, onSuccess, onCancel }: AdminPinDialogProps) => {
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const verified = localStorage.getItem(ADMIN_PIN_KEY);
    const expiry = localStorage.getItem(PIN_EXPIRY_KEY);
    const lockout = localStorage.getItem(LOCKOUT_KEY);
    
    if (lockout) {
      const lockoutEnd = parseInt(lockout, 10);
      if (Date.now() < lockoutEnd) {
        setLockoutTime(lockoutEnd);
      } else {
        localStorage.removeItem(LOCKOUT_KEY);
      }
    }
    
    if (verified === 'true' && expiry) {
      const expiryTime = parseInt(expiry, 10);
      if (Date.now() < expiryTime) {
        onSuccess();
      } else {
        localStorage.removeItem(ADMIN_PIN_KEY);
        localStorage.removeItem(PIN_EXPIRY_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (!lockoutTime) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, lockoutTime - Date.now());
      setRemainingTime(remaining);

      if (remaining === 0) {
        setLockoutTime(null);
        setAttempts(0);
        localStorage.removeItem(LOCKOUT_KEY);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutTime]);

  const handleVerify = async () => {
    if (!pin.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите PIN-код',
        variant: 'destructive'
      });
      return;
    }

    if (lockoutTime && Date.now() < lockoutTime) {
      const minutes = Math.ceil((lockoutTime - Date.now()) / 60000);
      toast({
        title: 'Доступ заблокирован',
        description: `Слишком много неудачных попыток. Попробуйте через ${minutes} мин.`,
        variant: 'destructive'
      });
      return;
    }

    setIsVerifying(true);

    try {
      const API_SETTINGS = 'https://functions.poehali.dev/9b1ac59e-93b6-41de-8974-a7f58d4ffaf9';
      const response = await fetch(API_SETTINGS);
      const data = await response.json();
      
      const correctPin = data.settings?.admin_pin || '0000';

      if (pin === correctPin) {
        const expiryTime = Date.now() + SESSION_DURATION;
        localStorage.setItem(ADMIN_PIN_KEY, 'true');
        localStorage.setItem(PIN_EXPIRY_KEY, expiryTime.toString());
        localStorage.removeItem(LOCKOUT_KEY);
        
        toast({
          title: 'Доступ разрешён',
          description: 'Добро пожаловать в панель администратора'
        });
        
        setPin('');
        setAttempts(0);
        setLockoutTime(null);
        onSuccess();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          const lockoutEnd = Date.now() + LOCKOUT_DURATION;
          localStorage.setItem(LOCKOUT_KEY, lockoutEnd.toString());
          setLockoutTime(lockoutEnd);
          
          toast({
            title: 'Доступ заблокирован',
            description: 'Слишком много неудачных попыток. Вход заблокирован на 10 минут.',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Неверный PIN-код',
            description: `Осталось попыток: ${MAX_ATTEMPTS - newAttempts}`,
            variant: 'destructive'
          });
        }
        
        setPin('');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось проверить PIN-код',
        variant: 'destructive'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Icon name="Shield" size={32} className="text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Защита админ-панели</DialogTitle>
          <DialogDescription className="text-center">
            Введите PIN-код для доступа к панели администратора
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Введите PIN-код"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={10}
              className="text-center text-2xl tracking-widest"
              disabled={isVerifying || (lockoutTime !== null && Date.now() < lockoutTime)}
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-center">
              Сессия действует 30 минут
            </p>
          </div>

          {lockoutTime && Date.now() < lockoutTime ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Icon name="Lock" size={18} className="text-destructive" />
                <p className="text-sm font-semibold text-destructive">
                  Доступ заблокирован
                </p>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Попробуйте снова через {Math.floor(remainingTime / 60000)}:{String(Math.floor((remainingTime % 60000) / 1000)).padStart(2, '0')}
              </p>
            </div>
          ) : attempts > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive text-center">
                Неверный PIN-код. Осталось попыток: {MAX_ATTEMPTS - attempts}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isVerifying}
            >
              Отмена
            </Button>
            <Button
              onClick={handleVerify}
              className="flex-1"
              disabled={isVerifying || (lockoutTime !== null && Date.now() < lockoutTime)}
            >
              {isVerifying ? (
                <>Проверка...</>
              ) : (
                <>
                  <Icon name="Lock" size={18} className="mr-2" />
                  Войти
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPinDialog;