import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface ReferralProgramCardProps {
  show: boolean;
  userId?: number;
}

interface InvitedUser {
  id: number;
  full_name: string;
  phone: string;
  reward_given: boolean;
  first_order_made: boolean;
  first_order_total: number | null;
  invited_at: string;
}

export const ReferralProgramCard = ({ show, userId }: ReferralProgramCardProps) => {
  const [promoCode, setPromoCode] = useState<string>('');
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [totalEarned, setTotalEarned] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (show && userId) {
      loadPromoData();
    }
  }, [show, userId]);

  const loadPromoData = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc?action=get_code&user_id=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setPromoCode(data.promo_code);
        setInvitedUsers(data.invited || []);
        setTotalEarned(data.total_earned || 0);
      }
    } catch (error) {
      console.error('Failed to load promo data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные промокода',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyPromoCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    toast({
      title: 'Скопировано!',
      description: 'Промокод скопирован в буфер обмена'
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (user: InvitedUser) => {
    if (user.reward_given) {
      return <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">✅ Бонус получен</span>;
    }
    if (user.first_order_made && user.first_order_total && user.first_order_total >= 1500) {
      return <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">⏳ Обрабатывается</span>;
    }
    if (user.first_order_made && user.first_order_total && user.first_order_total < 1500) {
      return <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full">📦 Заказ &lt; 1500₽</span>;
    }
    return <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full">⏰ Ждём заказ</span>;
  };

  if (!show) return null;

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon name="Gift" size={20} className="text-purple-600" />
          Программа промокодов
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-purple-900 dark:text-purple-100 font-medium">
            Ваш промокод:
          </p>
          <div className="flex gap-2">
            <Input 
              value={promoCode}
              readOnly
              className="font-bold text-lg text-center bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700"
            />
            <Button 
              onClick={copyPromoCode}
              size="sm"
              className="shrink-0 bg-purple-600 hover:bg-purple-700"
            >
              <Icon name={copied ? "Check" : "Copy"} size={16} />
            </Button>
          </div>
          <p className="text-xs text-purple-700 dark:text-purple-300">
            Друзья вводят этот код при регистрации и вы получаете <strong>500₽</strong> после их первого заказа от <strong>1500₽</strong>
          </p>
        </div>

        {totalEarned > 0 && (
          <div className="pt-3 border-t border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-700 dark:text-purple-300">Всего заработано:</span>
              <span className="text-xl font-bold text-purple-600">{totalEarned}₽</span>
            </div>
          </div>
        )}

        {invitedUsers.length > 0 && (
          <div className="flex items-center justify-between text-sm pt-3 border-t border-purple-200 dark:border-purple-700">
            <span className="text-purple-700 dark:text-purple-300">Приглашено друзей:</span>
            <span className="font-bold text-purple-600">{invitedUsers.length}</span>
          </div>
        )}

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-xs text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900"
        >
          <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} className="mr-1" />
          {isExpanded ? 'Скрыть список' : `Показать приглашённых (${invitedUsers.length})`}
        </Button>

        {isExpanded && (
          <div className="space-y-2 pt-2">
            {invitedUsers.length === 0 ? (
              <div className="text-center py-4">
                <Icon name="UserPlus" size={32} className="mx-auto mb-2 text-purple-400" />
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Вы ещё никого не пригласили
                </p>
              </div>
            ) : (
              invitedUsers.map((user) => (
                <Card key={user.id} className="bg-white/50 dark:bg-gray-900/50 border-purple-200 dark:border-purple-800">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon name="User" size={16} className="text-purple-600" />
                        <span className="text-sm font-medium">{user.full_name || user.phone}</span>
                      </div>
                      {getStatusBadge(user)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Зарегистрировался: {new Date(user.invited_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                    {user.first_order_total && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Первый заказ: {user.first_order_total}₽
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
