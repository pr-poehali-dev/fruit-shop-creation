import { useState, useEffect } from 'react';
import { User } from '@/types/shop';

const API_AUTH = 'https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleAuth = async (
    e: React.FormEvent<HTMLFormElement>, 
    action: 'login' | 'register',
    onSuccess: (user: User, message: string) => void,
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
      
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        const message = action === 'login' ? 'Вы вошли в систему' : 'Регистрация успешна';
        onSuccess(data.user, message);
      } else {
        onError(data.error);
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
    handleLogout
  };
};
