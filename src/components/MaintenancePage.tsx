import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface MaintenancePageProps {
  reason: string;
  onAdminLogin: (phone: string, password: string) => void;
}

export default function MaintenancePage({ reason, onAdminLogin }: MaintenancePageProps) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showAdminForm, setShowAdminForm] = useState(false);
  const { toast } = useToast();

  const normalizePhone = (phoneInput: string): string => {
    const cleaned = phoneInput.replace(/\D/g, '');
    
    let normalized = cleaned;
    if (normalized.startsWith('8')) {
      normalized = '7' + normalized.slice(1);
    } else if (!normalized.startsWith('7')) {
      normalized = '7' + normalized;
    }
    
    if (normalized.length >= 11) {
      return `+7 (${normalized.slice(1, 4)}) ${normalized.slice(4, 7)}-${normalized.slice(7, 9)}-${normalized.slice(9, 11)}`;
    }
    
    return phoneInput;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || !password) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    console.log('Maintenance login:', { raw: phone, normalized: normalizedPhone });
    onAdminLogin(normalizedPhone, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
            <Icon name="Construction" size={40} className="text-orange-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Технические работы
          </h1>
          <p className="text-gray-600 text-lg">
            {reason}
          </p>
        </div>

        <div className="pt-4">
          <p className="text-sm text-gray-500">
            Мы скоро вернёмся! Приносим извинения за неудобства.
          </p>
        </div>

        {!showAdminForm ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdminForm(true)}
            className="text-gray-400 hover:text-gray-600"
          >
            Вход для администратора
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-6 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Номер телефона
              </label>
              <Input
                type="tel"
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-center"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Пароль
              </label>
              <Input
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center"
              />
            </div>

            <Button type="submit" className="w-full">
              Войти
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdminForm(false)}
              className="w-full"
            >
              Отмена
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}