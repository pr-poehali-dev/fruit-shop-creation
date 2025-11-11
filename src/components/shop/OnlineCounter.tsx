import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const API_STATISTICS = 'https://functions.poehali.dev/5417d2b2-c525-4686-856d-577e2d90240c';

export default function OnlineCounter() {
  const [online, setOnline] = useState<number>(0);
  const [showCounter, setShowCounter] = useState<boolean>(true);

  useEffect(() => {
    const fetchOnline = async () => {
      try {
        const response = await fetch(`${API_STATISTICS}?action=online`);
        const data = await response.json();
        setOnline(data.online);
        setShowCounter(data.show_counter);
      } catch (error) {
        console.error('Failed to fetch online count:', error);
      }
    };

    fetchOnline();
    const interval = setInterval(fetchOnline, 30000); // Обновление каждые 30 секунд

    return () => clearInterval(interval);
  }, []);

  if (!showCounter) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon name="Users" size={16} />
      <span>{online} онлайн</span>
    </div>
  );
}
