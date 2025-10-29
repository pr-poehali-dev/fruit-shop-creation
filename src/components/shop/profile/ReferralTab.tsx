import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Referral {
  id: number;
  referred_user: {
    id: number;
    full_name: string;
    phone: string;
  };
  first_order_total: number | null;
  reward_given: boolean;
  created_at: string;
}

interface ReferralTabProps {
  userId: number;
}

const ReferralTab = ({ userId }: ReferralTabProps) => {
  const [referralCode, setReferralCode] = useState<string>('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    loadReferralData();
  }, [userId]);

  const loadReferralData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://functions.poehali.dev/4cd5b74b-cec5-4932-85c7-5e0e9a44df43?user_id=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setReferralCode(data.referral_code);
        setReferrals(data.referrals || []);
        setTotalEarned(data.total_earned || 0);
      }
    } catch (error) {
      console.error('Failed to load referral data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getReferralStatus = (referral: Referral) => {
    if (referral.reward_given) {
      return {
        text: '✅ Выполнено',
        color: 'text-green-600',
        description: `Заказ на ${referral.first_order_total}₽ • Бонус 500₽ получен`
      };
    }
    
    if (referral.first_order_total) {
      if (referral.first_order_total >= 1500) {
        return {
          text: '⏳ Обрабатывается',
          color: 'text-blue-600',
          description: `Заказ на ${referral.first_order_total}₽ • Бонус скоро будет начислен`
        };
      } else {
        return {
          text: '📦 Первый заказ',
          color: 'text-orange-600',
          description: `Заказ на ${referral.first_order_total}₽ • Нужно от 1500₽`
        };
      }
    }
    
    return {
      text: '⏰ Ожидание',
      color: 'text-gray-500',
      description: 'Ещё не сделал заказ'
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Icon name="Gift" size={20} className="text-primary" />
            <h3 className="font-semibold text-lg">Реферальная программа</h3>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Приглашайте друзей и получайте <span className="font-bold text-primary">500₽</span> за каждого, 
            кто сделает заказ от <span className="font-bold">1500₽</span>
          </p>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Ваша реферальная ссылка:</p>
            <div className="flex gap-2">
              <Input 
                value={`${window.location.origin}?ref=${referralCode}`}
                readOnly
                className="font-mono text-xs bg-background"
              />
              <Button 
                onClick={copyReferralLink}
                size="sm"
                className="shrink-0"
              >
                <Icon name={copied ? "Check" : "Copy"} size={16} />
              </Button>
            </div>
          </div>

          {totalEarned > 0 && (
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Всего заработано:</span>
                <span className="text-xl font-bold text-primary">{totalEarned}₽</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="space-y-3">
        <h4 className="font-semibold flex items-center gap-2">
          <Icon name="Users" size={18} />
          Ваши рефералы ({referrals.length})
        </h4>

        {referrals.length === 0 ? (
          <Card className="p-6 text-center">
            <Icon name="UserPlus" size={32} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              У вас пока нет рефералов. Поделитесь ссылкой с друзьями!
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {referrals.map((referral) => {
              const status = getReferralStatus(referral);
              return (
                <Card key={referral.id} className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon name="User" size={14} className="shrink-0 text-muted-foreground" />
                        <p className="font-medium text-sm truncate">
                          {referral.referred_user.full_name || referral.referred_user.phone}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1.5">
                        {status.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Регистрация: {new Date(referral.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <div className={`text-xs font-medium whitespace-nowrap ${status.color}`}>
                      {status.text}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralTab;
