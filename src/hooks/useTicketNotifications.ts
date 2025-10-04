import { useState, useEffect } from 'react';
import { User } from '@/types/shop';

const API_SUPPORT = 'https://functions.poehali.dev/a833bb69-e590-4a5f-a513-450a69314192';

export const useTicketNotifications = (user: User | null) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await fetch(`${API_SUPPORT}?user_id=${user.id}`);
      const data = await response.json();
      setUnreadCount(data.total_unread || 0);
    } catch (error) {
      console.error('Failed to load unread tickets:', error);
    }
  };

  useEffect(() => {
    loadUnreadCount();
    
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  return { unreadCount, refreshUnreadCount: loadUnreadCount };
};
