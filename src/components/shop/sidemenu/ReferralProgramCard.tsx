import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface ReferralProgramCardProps {
  show: boolean;
  userId?: number;
}

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

export const ReferralProgramCard = ({ show, userId }: ReferralProgramCardProps) => {
  const [referralCode, setReferralCode] = useState<string>('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [totalEarned, setTotalEarned] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'waiting'>('all');

  useEffect(() => {
    if (show && userId) {
      loadReferralData();
    }
  }, [show, userId]);

  const loadReferralData = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc?action=get_referral_data&user_id=${userId}`);
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
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-950/30',
        description: `Заказ на ${referral.first_order_total}₽ • Бонус 500₽ получен`
      };
    }
    
    if (referral.first_order_total) {
      if (referral.first_order_total >= 1500) {
        return {
          text: '⌛ Обрабатывается',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-950/30',
          description: `Заказ на ${referral.first_order_total}₽ • Бонус скоро будет начислен`
        };
      } else {
        return {
          text: '📦 Малая сумма',
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-950/30',
          description: `Заказ на ${referral.first_order_total}₽ • Нужно от 1500₽`
        };
      }
    }
    
    return {
      text: '⏰ Не заказал',
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-900/30',
      description: 'Зарегистрировался, но ещё не сделал заказ'
    };
  };

  if (!show) return null;

  if (isLoading) {
    return (
      <div>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon name="Gift" size={20} className="text-primary" />
            Реферальная программа
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Всего заработано:</span>
                <span className="text-lg font-bold text-primary">{totalEarned}₽</span>
              </div>
            </div>
          )}

          {referrals.length > 0 && (
            <div className="flex items-center justify-between text-xs pt-2 border-t">
              <div className="flex gap-3 text-muted-foreground">
                <span>✅ {referrals.filter(r => r.reward_given).length}</span>
                <span>⌛ {referrals.filter(r => !r.reward_given && r.first_order_total && r.first_order_total >= 1500).length}</span>
                <span>📦 {referrals.filter(r => !r.reward_given && r.first_order_total && r.first_order_total < 1500).length}</span>
                <span>⏰ {referrals.filter(r => !r.first_order_total).length}</span>
              </div>
              <span className="text-muted-foreground">Всего: {referrals.length}</span>
            </div>
          )}

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-xs"
          >
            <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} className="mr-1" />
            {isExpanded ? 'Скрыть список' : 'Показать список рефералов'}
          </Button>

          {isExpanded && (
            <div className="space-y-2 pt-2">
              {referrals.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                    className="h-7 text-xs"
                  >
                    Все ({referrals.length})
                  </Button>
                  <Button
                    variant={statusFilter === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('completed')}
                    className="h-7 text-xs"
                  >
                    ✅ Выполнено ({referrals.filter(r => r.reward_given).length})
                  </Button>
                  <Button
                    variant={statusFilter === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('pending')}
                    className="h-7 text-xs"
                  >
                    ⌛ В процессе ({referrals.filter(r => !r.reward_given && r.first_order_total && r.first_order_total >= 1500).length})
                  </Button>
                  <Button
                    variant={statusFilter === 'waiting' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('waiting')}
                    className="h-7 text-xs"
                  >
                    ⏰ Ожидают ({referrals.filter(r => !r.first_order_total).length})
                  </Button>
                </div>
              )}
              
              {referrals.length === 0 ? (
                <div className="text-center py-4">
                  <Icon name="UserPlus" size={24} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    У вас пока нет рефералов
                  </p>
                </div>
              ) : (
                referrals
                  .filter(referral => {
                    if (statusFilter === 'all') return true;
                    if (statusFilter === 'completed') return referral.reward_given;
                    if (statusFilter === 'pending') return !referral.reward_given && referral.first_order_total && referral.first_order_total >= 1500;
                    if (statusFilter === 'waiting') return !referral.first_order_total;
                    return true;
                  })
                  .map((referral) => {
                  const status = getReferralStatus(referral);
                  return (
                    <Card key={referral.id} className={`p-2.5 ${status.bgColor}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Icon name="User" size={12} className="shrink-0 text-muted-foreground" />
                            <p className="font-medium text-xs truncate">
                              {referral.referred_user.full_name || referral.referred_user.phone}
                            </p>
                          </div>
                          <p className="text-[10px] text-muted-foreground mb-1">
                            {status.description}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Приглашён: {new Date(referral.created_at).toLocaleDateString('ru-RU', { 
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className={`text-[10px] font-medium whitespace-nowrap px-2 py-1 rounded ${status.color} ${status.bgColor}`}>
                          {status.text}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};