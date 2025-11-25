import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface ReferralData {
  user_id: number;
  user_phone: string;
  user_name: string;
  promo_code: string;
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  total_earned: number;
  referrals: Array<{
    referred_user_id: number;
    referred_phone: string;
    referred_name: string;
    referred_at: string;
    order_total: number;
    order_status: string;
    bonus_earned: number;
    bonus_awarded: boolean;
  }>;
}

const ReferralStatsTab = () => {
  const [referralData, setReferralData] = useState<ReferralData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'earned' | 'referrals'>('earned');
  const { toast } = useToast();

  useEffect(() => {
    loadReferralStats();
  }, []);

  const loadReferralStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc?action=all_referral_stats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (data.success) {
        setReferralData(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load referral stats:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить статистику рефералов',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string, bonusAwarded: boolean) => {
    if (bonusAwarded) {
      return <Badge className="bg-green-500">✅ Бонус получен</Badge>;
    }
    
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">⏳ Обрабатывается</Badge>;
      case 'processing':
        return <Badge variant="secondary">⏳ Обрабатывается</Badge>;
      case 'completed':
        return <Badge variant="outline">📦 Заказ &lt; 1500₽</Badge>;
      default:
        return <Badge variant="outline">⏰ Ждём заказ</Badge>;
    }
  };

  const filteredData = referralData
    .filter(data => 
      data.user_phone.includes(searchQuery) ||
      data.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      data.promo_code.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'earned') {
        return b.total_earned - a.total_earned;
      }
      return b.successful_referrals - a.successful_referrals;
    });

  const totalStats = {
    totalUsers: referralData.length,
    totalReferrals: referralData.reduce((sum, data) => sum + data.total_referrals, 0),
    successfulReferrals: referralData.reduce((sum, data) => sum + data.successful_referrals, 0),
    totalEarned: referralData.reduce((sum, data) => sum + data.total_earned, 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Всего приглашений</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Успешных приглашений</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalStats.successfulReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Всего начислено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalEarned}₽</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Статистика рефералов</CardTitle>
              <CardDescription>Подробная информация по всем пользователям реферальной программы</CardDescription>
            </div>
            <Button onClick={loadReferralStats} variant="outline" size="sm">
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Обновить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Поиск по телефону, имени или промокоду..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button
                variant={sortBy === 'earned' ? 'default' : 'outline'}
                onClick={() => setSortBy('earned')}
                size="sm"
              >
                По заработку
              </Button>
              <Button
                variant={sortBy === 'referrals' ? 'default' : 'outline'}
                onClick={() => setSortBy('referrals')}
                size="sm"
              >
                По кол-ву
              </Button>
            </div>

            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'Ничего не найдено' : 'Нет данных по рефералам'}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredData.map((data) => (
                  <Card key={data.user_id} className="border-l-4 border-l-emerald-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {data.user_name || data.user_phone}
                          </CardTitle>
                          <CardDescription className="space-y-1 mt-1">
                            <div>📱 {data.user_phone}</div>
                            <div>🎫 Промокод: <span className="font-mono font-bold">{data.promo_code}</span></div>
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-emerald-600">{data.total_earned}₽</div>
                          <div className="text-sm text-muted-foreground">заработано</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Icon name="Users" size={16} className="text-muted-foreground" />
                          <span className="text-sm">Всего: {data.total_referrals}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="CheckCircle2" size={16} className="text-green-600" />
                          <span className="text-sm">Успешных: {data.successful_referrals}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="Clock" size={16} className="text-orange-600" />
                          <span className="text-sm">Ожидает: {data.pending_referrals}</span>
                        </div>
                      </div>

                      {data.referrals.length > 0 && (
                        <div className="border-t pt-4">
                          <div className="text-sm font-semibold mb-2">Приглашённые пользователи:</div>
                          <div className="space-y-2">
                            {data.referrals.map((ref, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">
                                    {ref.referred_name || ref.referred_phone}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Регистрация: {new Date(ref.referred_at).toLocaleDateString('ru-RU')}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {ref.order_total > 0 && (
                                    <div className="text-sm font-medium">{ref.order_total}₽</div>
                                  )}
                                  {getStatusBadge(ref.order_status, ref.bonus_awarded)}
                                  {ref.bonus_earned > 0 && (
                                    <div className="text-sm font-bold text-emerald-600">+{ref.bonus_earned}₽</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralStatsTab;