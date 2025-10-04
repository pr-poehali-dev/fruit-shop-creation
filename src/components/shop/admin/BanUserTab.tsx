import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface BanUserTabProps {
  userId: number;
  userName: string;
}

const BanUserTab = ({ userId, userName }: BanUserTabProps) => {
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('24');
  const [customDuration, setCustomDuration] = useState('');
  const [currentBan, setCurrentBan] = useState<{banned: boolean; ban_reason?: string; ban_until?: string} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBanStatus();
  }, [userId]);

  const loadBanStatus = async () => {
    try {
      const response = await fetch(`https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc?action=ban_status&user_id=${userId}`);
      const data = await response.json();
      setCurrentBan(data);
    } catch (error) {
      console.error('Error loading ban status:', error);
    }
  };

  const handleBan = async () => {
    if (!banReason.trim()) {
      alert('Укажите причину блокировки');
      return;
    }

    if (!confirm(`Вы уверены, что хотите заблокировать ${userName}?`)) {
      return;
    }

    setLoading(true);
    try {
      const hours = banDuration === 'custom' ? parseInt(customDuration) : parseInt(banDuration);
      
      const response = await fetch('https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ban_user',
          user_id: userId,
          ban_reason: banReason,
          duration_hours: hours
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Пользователь заблокирован');
        setBanReason('');
        loadBanStatus();
      } else {
        alert(data.error || 'Ошибка при блокировке');
      }
    } catch (error) {
      alert('Произошла ошибка при блокировке');
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async () => {
    if (!confirm(`Вы уверены, что хотите разблокировать ${userName}?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unban_user',
          user_id: userId
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Пользователь разблокирован');
        loadBanStatus();
      } else {
        alert(data.error || 'Ошибка при разблокировке');
      }
    } catch (error) {
      alert('Произошла ошибка при разблокировке');
    } finally {
      setLoading(false);
    }
  };

  if (currentBan?.banned) {
    return (
      <div className="space-y-4">
        <Card className="p-6 border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <Icon name="ShieldAlert" size={24} />
              <h3 className="font-bold text-lg">Пользователь заблокирован</h3>
            </div>

            <div>
              <Label className="text-red-900 dark:text-red-300">Причина блокировки:</Label>
              <p className="text-red-800 dark:text-red-200 mt-1">
                {currentBan.ban_reason || 'Не указана'}
              </p>
            </div>

            {currentBan.ban_until && (
              <div>
                <Label className="text-red-900 dark:text-red-300">Блокировка до:</Label>
                <p className="text-red-800 dark:text-red-200 mt-1">
                  {new Date(currentBan.ban_until).toLocaleString('ru-RU')}
                </p>
              </div>
            )}
          </div>
        </Card>

        <Button 
          onClick={handleUnban} 
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          <Icon name="ShieldCheck" size={18} className="mr-2" />
          {loading ? 'Разблокировка...' : 'Разблокировать пользователя'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300 mb-2">
          <Icon name="AlertTriangle" size={20} />
          <h4 className="font-semibold">Блокировка пользователя</h4>
        </div>
        <p className="text-sm text-yellow-700 dark:text-yellow-400">
          При блокировке пользователь не сможет войти в систему до истечения срока бана.
        </p>
      </div>

      <div>
        <Label htmlFor="ban-reason">Причина блокировки *</Label>
        <Textarea
          id="ban-reason"
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
          placeholder="Нарушение правил сервиса, спам, мошенничество..."
          rows={3}
          className="mt-1"
        />
      </div>

      <div>
        <Label>Длительность блокировки</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Button
            type="button"
            variant={banDuration === '1' ? 'default' : 'outline'}
            onClick={() => setBanDuration('1')}
          >
            1 час
          </Button>
          <Button
            type="button"
            variant={banDuration === '24' ? 'default' : 'outline'}
            onClick={() => setBanDuration('24')}
          >
            1 день
          </Button>
          <Button
            type="button"
            variant={banDuration === '168' ? 'default' : 'outline'}
            onClick={() => setBanDuration('168')}
          >
            7 дней
          </Button>
          <Button
            type="button"
            variant={banDuration === '720' ? 'default' : 'outline'}
            onClick={() => setBanDuration('720')}
          >
            30 дней
          </Button>
          <Button
            type="button"
            variant={banDuration === 'permanent' ? 'default' : 'outline'}
            onClick={() => setBanDuration('permanent')}
          >
            Навсегда
          </Button>
          <Button
            type="button"
            variant={banDuration === 'custom' ? 'default' : 'outline'}
            onClick={() => setBanDuration('custom')}
          >
            Свой срок
          </Button>
        </div>

        {banDuration === 'custom' && (
          <div className="mt-3">
            <Label htmlFor="custom-duration">Количество часов</Label>
            <Input
              id="custom-duration"
              type="number"
              min="1"
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
              placeholder="48"
              className="mt-1"
            />
          </div>
        )}
      </div>

      <Button 
        onClick={handleBan} 
        disabled={loading}
        variant="destructive"
        className="w-full"
      >
        <Icon name="Ban" size={18} className="mr-2" />
        {loading ? 'Блокировка...' : 'Заблокировать пользователя'}
      </Button>
    </div>
  );
};

export default BanUserTab;
