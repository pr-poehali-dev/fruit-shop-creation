import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AdminAuthParams {
  setUser: (user: any) => void;
  setShowAuthDialog: (value: boolean) => void;
}

export const useAdminAuth = ({ setUser, setShowAuthDialog }: AdminAuthParams) => {
  const { toast } = useToast();
  const [requiresAdminCode, setRequiresAdminCode] = useState(false);
  const [pendingAdminUser, setPendingAdminUser] = useState<{ id: number; full_name: string } | null>(null);
  const [adminCodeError, setAdminCodeError] = useState('');

  const onAuthSuccess = (userData: any, message: string, requiresCode?: boolean) => {
    console.log('✅ onAuthSuccess called:', { userData, message, requiresCode });
    if (requiresCode) {
      console.log('🔐 Setting requiresAdminCode to TRUE');
      setRequiresAdminCode(true);
      setPendingAdminUser({ id: userData.id, full_name: userData.full_name });
      setAdminCodeError('');
      console.log('📋 State updated:', { requiresAdminCode: true, pendingAdminUser: { id: userData.id, full_name: userData.full_name } });
    } else {
      setShowAuthDialog(false);
      setRequiresAdminCode(false);
      setPendingAdminUser(null);
      toast({
        title: message,
        description: `Добро пожаловать, ${userData.full_name || userData.phone}!`
      });
    }
  };

  const onAuthError = (error: string) => {
    toast({
      title: 'Ошибка',
      description: error,
      variant: 'destructive'
    });
  };

  const handleAdminCodeVerify = async (code: string) => {
    if (!pendingAdminUser) return;

    try {
      const API_AUTH = 'https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc';
      const response = await fetch(API_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_code',
          user_id: pendingAdminUser.id,
          login_code: code
        })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userId', data.user.id.toString());
        setShowAuthDialog(false);
        setRequiresAdminCode(false);
        setPendingAdminUser(null);
        setAdminCodeError('');
        toast({
          title: 'Доступ разрешён',
          description: `Добро пожаловать в админку, ${data.user.full_name}!`
        });
      } else {
        setAdminCodeError(data.error || 'Неверный код');
      }
    } catch (error) {
      setAdminCodeError('Не удалось проверить код');
    }
  };

  const resetAdminAuth = () => {
    setRequiresAdminCode(false);
    setPendingAdminUser(null);
    setAdminCodeError('');
  };

  return {
    requiresAdminCode,
    pendingAdminUser,
    adminCodeError,
    onAuthSuccess,
    onAuthError,
    handleAdminCodeVerify,
    resetAdminAuth
  };
};