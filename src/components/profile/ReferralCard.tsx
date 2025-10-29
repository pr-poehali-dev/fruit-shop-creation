import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { User } from '@/types/shop';

interface ReferralStats {
  total_referrals: number;
  completed_referrals: number;
  total_earned: number;
  referrals: Array<{
    full_name: string;
    phone: string;
    created_at: string;
    first_order_made: boolean;
    reward_given: boolean;
    reward_amount: number;
  }>;
}

interface ReferralCardProps {
  user: User | null;
}

export const ReferralCard = ({ user }: ReferralCardProps) => {
  const [referralCode, setReferralCode] = useState<string>('');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const generateReferralCode = (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const codeResponse = await fetch(
          `https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc?action=referral_code&user_id=${user.id}`
        );
        
        if (codeResponse.ok) {
          const codeData = await codeResponse.json();
          if (codeData.referral_code) {
            setReferralCode(codeData.referral_code);
          } else {
            const newCode = generateReferralCode();
            const createResponse = await fetch(
              'https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'create_referral_code',
                  user_id: user.id,
                  referral_code: newCode
                })
              }
            );
            if (createResponse.ok) {
              setReferralCode(newCode);
            }
          }
        }

        const statsResponse = await fetch(
          `https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc?action=referral_stats&user_id=${user.id}`
        );
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
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
    <Card className="border-primary/20">
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
              {stats?.total_referrals || 0}
            </div>
            <div className="text-sm text-muted-foreground">Приглашено друзей</div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {stats?.completed_referrals || 0}
            </div>
            <div className="text-sm text-muted-foreground">Сделали заказ</div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card text-center">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
              {stats?.total_earned || 0} ₽
            </div>
            <div className="text-sm text-muted-foreground">Заработано</div>
          </div>
        </div>

        {stats && stats.referrals && stats.referrals.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="UserCheck" size={18} />
              Приглашенные друзья
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.referrals.map((ref, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-border bg-card flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="font-medium">{ref.full_name || 'Имя не указано'}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(ref.created_at).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                  <div className="text-right">
                    {ref.first_order_made ? (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                        <Icon name="Check" size={14} />
                        +{ref.reward_amount} ₽
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-sm">
                        <Icon name="Clock" size={14} />
                        Ожидание заказа
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
