import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  entity_type: string;
  entity_id: number;
  is_read: boolean;
  requires_rating: boolean;
  rating_given: boolean;
  created_at: string;
}

interface NotificationsDropdownProps {
  userId: number;
  onRatingRequest: (entityType: string, entityId: number) => void;
}

const NotificationsDropdown = ({ userId, onRatingRequest }: NotificationsDropdownProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/fc281a64-4d76-4cbd-9ae6-6cf970c14f35', {
        headers: {
          'X-User-Id': userId.toString(),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const filteredNotifications = (data.notifications || []).filter((n: Notification) => {
          if (n.requires_rating && n.rating_given) {
            return false;
          }
          return true;
        });
        setNotifications(filteredNotifications);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const markAsRead = async (notificationId: number) => {
    try {
      await fetch('https://functions.poehali.dev/fc281a64-4d76-4cbd-9ae6-6cf970c14f35', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString(),
        },
        body: JSON.stringify({ notification_id: notificationId }),
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('https://functions.poehali.dev/fc281a64-4d76-4cbd-9ae6-6cf970c14f35', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString(),
        },
        body: JSON.stringify({ action: 'mark_all_read' }),
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (!confirm('Вы уверены, что хотите удалить все уведомления?')) return;
    
    try {
      await fetch('https://functions.poehali.dev/fc281a64-4d76-4cbd-9ae6-6cf970c14f35', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString(),
        },
        body: JSON.stringify({ action: 'clear_all' }),
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.requires_rating && !notification.rating_given) {
      onRatingRequest(notification.entity_type, notification.entity_id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_status':
        return 'Package';
      case 'ticket_closed':
        return 'MessageCircle';
      default:
        return 'Bell';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-primary-foreground hover:bg-primary/90">
          <Icon name="Bell" size={24} />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-accent">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2">
          <h3 className="font-semibold">Уведомления</h3>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-1 text-xs">
                Прочитать все
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={clearAllNotifications} 
                className="h-7 w-7"
                title="Очистить все уведомления"
              >
                <Icon name="Trash2" size={16} />
              </Button>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="px-3 py-8 text-center text-muted-foreground">
            <Icon name="Bell" size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Нет уведомлений</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start gap-2 p-3 cursor-pointer ${
                !notification.is_read ? 'bg-accent/20' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-2 w-full">
                <Icon name={getNotificationIcon(notification.type)} size={20} className="mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                  {notification.requires_rating && !notification.rating_given && (
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon key={star} name="Star" size={16} className="text-yellow-500" />
                      ))}
                      <span className="text-xs ml-1">Оцените</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ru })}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;