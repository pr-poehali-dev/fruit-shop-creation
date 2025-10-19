import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  phone: string;
  full_name: string;
  is_admin: boolean;
  balance?: number;
  cashback?: number;
  created_at: string;
}

interface ProfileTabProps {
  selectedUser: User | null;
  onCancel: () => void;
  onUpdate: () => void;
}

const ProfileTab = ({ selectedUser, onCancel, onUpdate }: ProfileTabProps) => {
  const [fullName, setFullName] = useState(selectedUser?.full_name || '');
  const [phone, setPhone] = useState(selectedUser?.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Имя не может быть пустым',
        variant: 'destructive'
      });
      return;
    }

    if (!phone.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Телефон не может быть пустым',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен быть не менее 6 символов',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      const requestBody: any = {
        user_id: selectedUser?.id,
        full_name: fullName.trim(),
        phone: phone.trim()
      };

      if (newPassword) {
        requestBody.new_password = newPassword;
      }

      const response = await fetch('https://functions.poehali.dev/4986919b-8daf-4d91-b11a-b3bde148f13f', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: newPassword ? 'Данные и пароль пользователя обновлены' : 'Данные пользователя обновлены'
        });
        setNewPassword('');
        setConfirmPassword('');
        onUpdate();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось обновить данные',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить данные',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Имя пользователя</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Введите имя"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Номер телефона</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+7 (XXX) XXX-XX-XX"
        />
      </div>

      <div className="space-y-4 border-t pt-4">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Icon name="Key" size={16} />
          Изменить пароль
        </h4>
        
        <div className="space-y-2">
          <Label htmlFor="newPassword">Новый пароль</Label>
          <div className="flex gap-2">
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Оставьте пустым, если не хотите менять"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-2).toUpperCase();
                setNewPassword(randomPassword);
                setConfirmPassword(randomPassword);
                toast({
                  title: 'Пароль сгенерирован',
                  description: `Новый пароль: ${randomPassword}`,
                  duration: 10000
                });
              }}
              title="Генерировать случайный пароль"
            >
              <Icon name="RefreshCw" size={16} />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Повторите новый пароль"
            disabled={!newPassword}
          />
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">ID:</span>
          <span className="font-medium">{selectedUser?.id}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Баланс:</span>
          <span className="font-medium">{selectedUser?.balance || 0}₽</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Кэшбэк:</span>
          <span className="font-medium">{selectedUser?.cashback || 0}₽</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Дата регистрации:</span>
          <span className="font-medium">
            {selectedUser?.created_at ? new Date(selectedUser.created_at).toLocaleDateString('ru-RU') : '-'}
          </span>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          <Icon name="Save" size={16} className="mr-2" />
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
};

export default ProfileTab;