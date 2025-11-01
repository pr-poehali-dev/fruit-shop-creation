import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOffline) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top">
      <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">Нет подключения к интернету</span>
      </div>
    </div>
  );
}
