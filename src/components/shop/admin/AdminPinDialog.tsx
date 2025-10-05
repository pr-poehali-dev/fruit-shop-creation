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
const SESSION_DURATION = 30 * 60 * 1000;

const AdminPinDialog = ({ open, onSuccess, onCancel }: AdminPinDialogProps) => {
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const verified = localStorage.getItem(ADMIN_PIN_KEY);
    const expiry = localStorage.getItem(PIN_EXPIRY_KEY);
    
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

  const handleVerify = async () => {
    if (!pin.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите PIN-код',
        variant: 'destructive'
      });
      return;
    }

    if (attempts >= 3) {
      toast({
        title: 'Слишком много попыток',
        description: 'Подождите 5 минут перед следующей попыткой',
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
        
        toast({
          title: 'Доступ разрешён',
          description: 'Добро пожаловать в панель администратора'
        });
        
        setPin('');
        setAttempts(0);
        onSuccess();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        toast({
          title: 'Неверный PIN-код',
          description: `Осталось попыток: ${3 - newAttempts}`,
          variant: 'destructive'
        });
        
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
              disabled={isVerifying || attempts >= 3}
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-center">
              Сессия действует 30 минут
            </p>
          </div>

          {attempts > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive text-center">
                Неверный PIN-код. Осталось попыток: {3 - attempts}
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
              disabled={isVerifying || attempts >= 3}
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