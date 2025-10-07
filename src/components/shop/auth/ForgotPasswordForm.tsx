import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+7')) {
      value = '+7' + value.replace(/^\+?7?/, '');
    }
    value = value.replace(/[^\d+]/g, '');
    if (value.length > 12) value = value.slice(0, 12);
    setPhone(value);
    e.target.value = value;
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/c7d83bd6-2027-4170-8c35-7f6462c5274a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка запроса');
      }

      setSuccess('Запрос отправлен администратору. Ожидайте код для сброса пароля.');
      setStep('reset');
    } catch (err: any) {
      setError(err.message || 'Ошибка при отправке запроса');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/c7d83bd6-2027-4170-8c35-7f6462c5274a', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, new_password: newPassword })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка сброса пароля');
      }

      setSuccess('Пароль успешно изменён! Теперь вы можете войти.');
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Ошибка при сбросе пароля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
        <Icon name="ArrowLeft" size={16} className="mr-2" />
        Назад к входу
      </Button>

      {error && (
        <Alert variant="destructive">
          <Icon name="AlertCircle" size={16} />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 text-green-700 dark:text-green-400">
          <Icon name="CheckCircle" size={16} />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {step === 'request' ? (
        <form onSubmit={handleRequestReset} className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Восстановление пароля</h3>
            <p className="text-sm text-muted-foreground">
              Укажите номер телефона. Администратор получит запрос и отправит вам код для сброса пароля.
            </p>
          </div>

          <div>
            <Label htmlFor="forgot-phone">Телефон</Label>
            <Input 
              id="forgot-phone" 
              type="tel" 
              placeholder="+7 (999) 123-45-67"
              value={phone}
              onChange={handlePhoneChange}
              onFocus={(e) => {
                if (e.target.value === '') e.target.value = '+7';
              }}
              required
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Отправка...' : 'Отправить запрос'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Введите код и новый пароль</h3>
            <p className="text-sm text-muted-foreground">
              Код восстановления будет отправлен вам администратором.
            </p>
          </div>

          <div>
            <Label htmlFor="reset-code">Код восстановления</Label>
            <Input 
              id="reset-code" 
              type="text"
              placeholder="Введите код от администратора"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="new-password">Новый пароль</Label>
            <Input 
              id="new-password" 
              type="password"
              placeholder="Введите новый пароль"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Сброс...' : 'Изменить пароль'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordForm;