import { useState, useEffect } from 'react';
import { User } from '@/types/shop';

const API_AUTH = 'https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  const [banInfo, setBanInfo] = useState<{banned: boolean; ban_reason?: string; ban_until?: string} | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    const syncUserData = async () => {
      if (!user?.id) return;
      
      try {
        const [balanceResponse, banResponse] = await Promise.all([
          fetch(`${API_AUTH}?action=balance&user_id=${user.id}`),
          fetch(`${API_AUTH}?action=ban_status&user_id=${user.id}`)
        ]);
        
        const balanceData = await balanceResponse.json();
        const banData = await banResponse.json();
        
        if (banData.banned) {
          setBanInfo({
            banned: true,
            ban_reason: banData.ban_reason,
            ban_until: banData.ban_until
          });
          setUser(null);
          localStorage.removeItem('user');
          return;
        }
        
        if (balanceData.balance !== undefined) {
          setUser(prev => {
            if (!prev) return prev;
            const updatedUser = {
              ...prev,
              balance: balanceData.balance,
              cashback: balanceData.cashback,
              is_admin: balanceData.is_admin
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
          });
        }
      } catch (error) {
        console.error('Failed to sync user data:', error);
      }
    };

    const interval = setInterval(syncUserData, 10000);
    if (user?.id) {
      syncUserData();
    }

    return () => clearInterval(interval);
  }, [user?.id]);

  const handleAuth = async (
    e: React.FormEvent<HTMLFormElement>, 
    action: 'login' | 'register',
    onSuccess: (user: User, message: string, requiresCode?: boolean) => void,
    onError: (error: string) => void
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch(API_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          phone: formData.get('phone'),
          password: formData.get('password'),
          full_name: formData.get('full_name') || ''
        })
      });
      
      const data = await response.json();
      console.log('Auth response:', data);
      
      if (data.banned) {
        setBanInfo({
          banned: true,
          ban_reason: data.ban_reason,
          ban_until: data.ban_until
        });
        return;
      }
      
      if (!response.ok) {
        onError(data.error || 'Ошибка авторизации');
        return;
      }
      
      if (data.requires_code) {
        // Admin login requires code verification
        const message = 'Введите код доступа';
        onSuccess(data.user, message, true);
        setBanInfo(null);
      } else if (data.success) {
        // Regular login
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        const message = action === 'login' ? 'Вы вошли в систему' : 'Регистрация успешна';
        onSuccess(data.user, message, false);
        setBanInfo(null);
      } else {
        onError(data.error || 'Неизвестная ошибка');
      }
    } catch (error) {
      onError('Не удалось выполнить операцию');
    }
  };

  const handleLogout = (onLogout: () => void) => {
    setUser(null);
    localStorage.removeItem('user');
    onLogout();
  };

  return {
    user,
    setUser,
    isRefreshingBalance,
    setIsRefreshingBalance,
    handleAuth,
    handleLogout,
    banInfo
  };
};