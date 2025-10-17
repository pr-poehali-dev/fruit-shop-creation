import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface BanInfo {
  banned: boolean;
  ban_reason?: string;
  ban_until?: string;
}

interface BanNotificationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banInfo: BanInfo;
  onBanExpired?: () => void;
}

const BanNotification = ({ open, onOpenChange, banInfo, onBanExpired }: BanNotificationProps) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!banInfo?.banned || !banInfo.ban_until) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const banEnd = new Date(banInfo.ban_until).getTime();
      const distance = banEnd - now;

      if (distance < 0) {
        setTimeLeft('Бан истёк');
        if (onBanExpired) {
          onBanExpired();
        }
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      let result = '';
      if (days > 0) result += `${days}д `;
      if (hours > 0) result += `${hours}ч `;
      if (minutes > 0) result += `${minutes}м `;
      result += `${seconds}с`;
      
      setTimeLeft(result);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [banInfo]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 mb-4 animate-pulse">
              <Icon name="ShieldAlert" size={40} className="text-red-600 dark:text-red-500" />
            </div>
            <DialogTitle className="text-2xl font-bold text-red-600 dark:text-red-500 mb-2">
              Доступ заблокирован
            </DialogTitle>
          </div>

          <Card className="p-6 border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="FileText" size={18} className="text-red-600" />
                  <h3 className="font-semibold text-sm text-red-900 dark:text-red-300">Причина блокировки:</h3>
                </div>
                <p className="text-base text-red-800 dark:text-red-200 pl-6">
                  {banInfo.ban_reason || 'Не указана'}
                </p>
              </div>

              {banInfo.ban_until && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Clock" size={18} className="text-red-600" />
                    <h3 className="font-semibold text-sm text-red-900 dark:text-red-300">Истекает через:</h3>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="bg-red-600 dark:bg-red-700 text-white px-6 py-3 rounded-lg font-mono text-2xl font-bold shadow-lg">
                      {timeLeft}
                    </div>
                  </div>
                  <p className="text-xs text-red-700 dark:text-red-400 text-center mt-2">
                    До: {new Date(banInfo.ban_until).toLocaleString('ru-RU')}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-4 rounded-lg">
            <Icon name="Info" size={16} />
            <p>Если считаете блокировку ошибочной, обратитесь в поддержку</p>
          </div>

          <Button 
            onClick={() => onOpenChange(false)} 
            variant="outline" 
            className="w-full"
          >
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BanNotification;