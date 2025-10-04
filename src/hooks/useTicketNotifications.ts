import { useState, useEffect } from 'react';
import { User } from '@/types/shop';

const API_SUPPORT = 'https://functions.poehali.dev/a833bb69-e590-4a5f-a513-450a69314192';

export const useTicketNotifications = (user: User | null) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [needsRating, setNeedsRating] = useState(false);

  const loadNotifications = async () => {
    if (!user) {
      setUnreadCount(0);
      setNeedsRating(false);
      return;
    }

    try {
      const response = await fetch(`${API_SUPPORT}?user_id=${user.id}`);
      const data = await response.json();
      
      const unread = data.total_unread || 0;
      setUnreadCount(unread);
      
      const ticket = data.active_ticket;
      const isClosed = ticket && (ticket.status === 'closed' || ticket.status === 'resolved');
      const requiresRating = isClosed && !ticket.rating;
      setNeedsRating(requiresRating);
      
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    const interval = setInterval(loadNotifications, 10000);
    
    return () => clearInterval(interval);
  }, [user]);

  return { 
    unreadCount, 
    needsRating, 
    refreshNotifications: loadNotifications 
  };
};