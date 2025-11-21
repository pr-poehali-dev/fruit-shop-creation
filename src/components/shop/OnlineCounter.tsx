import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const API_STATISTICS = 'https://functions.poehali.dev/5417d2b2-c525-4686-856d-577e2d90240c';

export default function OnlineCounter() {
  const [online, setOnline] = useState<number>(0);
  const [displayOnline, setDisplayOnline] = useState<number>(0);
  const [showCounter, setShowCounter] = useState<boolean>(true);
  const [maxOnline, setMaxOnline] = useState<number>(0);

  useEffect(() => {
    const fetchOnline = async () => {
      try {
        const response = await fetch(`${API_STATISTICS}?action=online`);
        const data = await response.json();
        setOnline(data.online);
        setMaxOnline(data.online);
        setShowCounter(data.show_counter);
      } catch (error) {
        console.error('Failed to fetch online count:', error);
      }
    };

    fetchOnline();
    const fetchInterval = setInterval(fetchOnline, 30000);

    return () => clearInterval(fetchInterval);
  }, []);

  useEffect(() => {
    if (maxOnline === 0) return;

    const updateDisplayOnline = () => {
      const min = Math.max(1, Math.floor(maxOnline * 0.6));
      const randomOnline = Math.floor(Math.random() * (maxOnline - min + 1)) + min;
      setDisplayOnline(randomOnline);
    };

    updateDisplayOnline();
    const displayInterval = setInterval(updateDisplayOnline, 5000 + Math.random() * 5000);

    return () => clearInterval(displayInterval);
  }, [maxOnline]);

  if (!showCounter) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon name="Users" size={16} />
      <span>{displayOnline} онлайн</span>
    </div>
  );
}