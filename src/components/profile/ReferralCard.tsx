import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { User } from '@/types/shop';

interface InvitedUser {
  id: number;
  full_name: string;
  phone: string;
  reward_given: boolean;
  first_order_made: boolean;
  first_order_total: number | null;
  invited_at: string;
}

interface ReferralCardProps {
  user: User | null;
}

export const ReferralCard = ({ user }: ReferralCardProps) => {
  const [referralCode, setReferralCode] = useState<string>('');
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc?action=get_referral_data&user_id=${user.id}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setReferralCode(data.referral_code || '');
            
            const formattedInvited = (data.referrals || []).map((ref: any) => ({
              id: ref.referred_user.id,
              full_name: ref.referred_user.full_name,
              phone: ref.referred_user.phone,
              reward_given: ref.reward_given,
              first_order_made: ref.first_order_total !== null,
              first_order_total: ref.first_order_total,
              invited_at: ref.created_at
            }));
            
            setInvitedUsers(formattedInvited);
            setTotalEarned(data.total_earned || 0);
          }
        }
      } catch (error) {
        console.error('Failed to fetch referral data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [user?.id]);

  const referralLink = referralCode
    ? `${window.location.origin}?ref=${referralCode}`
    : '';

  const completedReferrals = invitedUsers.filter(u => u.reward_given).length;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <Icon name="Loader" className="animate-spin" size={24} />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Card className="border-primary/20 relative">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
            <Icon name="Users" size={24} className="text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Реферальная программа</CardTitle>
            <CardDescription>Приглашайте друзей и получайте бонусы</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Icon name="Gift" size={18} className="text-primary" />
            Как это работает?
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Поделитесь своей реферальной ссылкой с друзьями</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Друг регистрируется по вашей ссылке</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>После первого заказа друга вы получаете <strong className="text-primary">500 ₽</strong> на баланс</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Деньги можно использовать для оплаты заказов</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Icon name="Link" size={18} />
            Ваша реферальная ссылка
          </h3>
          <div className="flex gap-2">
            <div className="flex-1 p-3 rounded-lg bg-muted/50 border border-border font-mono text-sm break-all">
              {referralLink}
            </div>
            <Button
              onClick={copyToClipboard}
              variant={copied ? 'default' : 'outline'}
              size="lg"
              className="px-4"
            >
              <Icon name={copied ? 'Check' : 'Copy'} size={18} />
            </Button>
          </div>
          {copied && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
              <Icon name="Check" size={14} />
              Ссылка скопирована!
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {invitedUsers.length}
            </div>
            <div className="text-sm text-muted-foreground">Приглашено друзей</div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {completedReferrals}
            </div>
            <div className="text-sm text-muted-foreground">Бонусы получены</div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card text-center">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
              {totalEarned} ₽
            </div>
            <div className="text-sm text-muted-foreground">Заработано</div>
          </div>
        </div>

        {invitedUsers.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="UserCheck" size={18} />
              Приглашенные друзья
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {invitedUsers.map((ref) => {
                const getStatusBadge = () => {
                  if (ref.reward_given) {
                    return <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full flex items-center gap-1"><Icon name="Check" size={12} />Бонус получен</span>;
                  }
                  if (ref.first_order_made && ref.first_order_total && ref.first_order_total >= 1500) {
                    return <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full flex items-center gap-1"><Icon name="Clock" size={12} />Обрабатывается</span>;
                  }
                  if (ref.first_order_made && ref.first_order_total && ref.first_order_total < 1500) {
                    return <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full">Заказ &lt; 1500₽</span>;
                  }
                  return <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full flex items-center gap-1"><Icon name="Clock" size={12} />Ждём заказ</span>;
                };

                return (
                  <div
                    key={ref.id}
                    className="p-3 rounded-lg border border-border bg-card flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{ref.full_name || ref.phone}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(ref.invited_at).toLocaleDateString('ru-RU')}
                      </div>
                      {ref.first_order_total && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Первый заказ: {ref.first_order_total}₽
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {getStatusBadge()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};