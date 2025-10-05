import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const API_LOYALTY = 'https://functions.poehali.dev/ed127250-fe9d-4c7e-9a93-fb8b7fdc038a';

interface LoyaltyCardProps {
  userId: number;
  userBalance: number;
  onBalanceUpdate: () => void;
}

interface LoyaltyCardData {
  id: number;
  card_number: string;
  qr_code: string;
  activated_at: string;
  expires_at?: string;
}

const LoyaltyCard = ({ userId, userBalance, onBalanceUpdate }: LoyaltyCardProps) => {
  const { toast } = useToast();
  const [card, setCard] = useState<LoyaltyCardData | null>(null);
  const [cardPrice, setCardPrice] = useState<number>(500);
  const [unlockAmount, setUnlockAmount] = useState<number>(5000);
  const [cashbackPercent, setCashbackPercent] = useState<number>(5);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [canUnlock, setCanUnlock] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const loadCard = async () => {
    try {
      const response = await fetch(`${API_LOYALTY}?user_id=${userId}`);
      const data = await response.json();
      setCard(data.card);
      setCardPrice(data.card_price || 500);
      setUnlockAmount(data.unlock_amount || 5000);
      setCashbackPercent(data.cashback_percent || 5);
      setTotalSpent(data.total_spent || 0);
      setCanUnlock(data.can_unlock || false);
    } catch (error) {
      console.error('Failed to load loyalty card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCard();
  }, [userId]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadCard();
    }, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  const handlePurchase = async (unlockFree = false) => {
    if (!unlockFree && userBalance < cardPrice) {
      toast({
        title: 'Недостаточно средств',
        description: `На балансе ${userBalance.toFixed(2)}₽, требуется ${cardPrice}₽`,
        variant: 'destructive'
      });
      return;
    }

    setIsPurchasing(true);
    try {
      const response = await fetch(API_LOYALTY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, unlock_free: unlockFree })
      });

      const data = await response.json();

      if (data.success) {
        setCard(data.card);
        onBalanceUpdate();
        toast({
          title: unlockFree ? 'Карта разблокирована!' : 'Карта куплена!',
          description: unlockFree 
            ? 'Карта лояльности разблокирована за сумму покупок'
            : 'Виртуальная карта лояльности активирована'
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось купить карту',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось купить карту',
        variant: 'destructive'
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!card) {
    return (
      <Card className="w-full border-2 border-dashed">
        <CardContent className="p-6 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="CreditCard" size={32} className="text-primary" />
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Карта лояльности</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Кэшбек {cashbackPercent}% с каждой покупки по карте
              </p>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Купить сейчас</span>
                <span className="text-2xl font-bold text-primary">{cardPrice}₽</span>
              </div>
              <Button 
                onClick={() => handlePurchase(false)} 
                disabled={isPurchasing || userBalance < cardPrice}
                className="w-full"
              >
                {isPurchasing ? (
                  <>Покупка...</>
                ) : (
                  <>
                    <Icon name="ShoppingBag" size={18} className="mr-2" />
                    Купить карту
                  </>
                )}
              </Button>
              {userBalance < cardPrice && (
                <p className="text-xs text-destructive text-center">
                  Недостаточно средств на балансе
                </p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">или</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Разблокировать за покупки</span>
                <span className="text-lg font-bold text-green-600">{unlockAmount}₽</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Прогресс</span>
                  <span>{totalSpent.toFixed(0)} / {unlockAmount}₽</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${Math.min((totalSpent / unlockAmount) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <Button 
                onClick={() => handlePurchase(true)} 
                disabled={isPurchasing || !canUnlock}
                variant={canUnlock ? "default" : "outline"}
                className="w-full"
              >
                {canUnlock ? (
                  <>
                    <Icon name="Gift" size={18} className="mr-2" />
                    Получить бесплатно
                  </>
                ) : (
                  <>
                    <Icon name="Lock" size={18} className="mr-2" />
                    Заблокирована
                  </>
                )}
              </Button>
              {!canUnlock && (
                <p className="text-xs text-center text-muted-foreground">
                  Осталось купить на {(unlockAmount - totalSpent).toFixed(0)}₽
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 rounded-2xl p-6 text-white shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl hover:scale-[1.02]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-300/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-xs opacity-90 uppercase tracking-wider font-semibold">Карта лояльности</p>
              <p className="text-2xl font-bold mt-1 tracking-wide">{card.card_number}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <Icon name="Sparkles" size={28} className="text-yellow-300" />
            </div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 flex items-center justify-center mb-6 shadow-lg">
            <div className="bg-white p-3 rounded-lg shadow-inner">
              <QRCodeSVG 
                value={card.qr_code} 
                size={120}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs opacity-90 font-medium">Активирована</p>
                <p className="text-sm font-bold">
                  {new Date(card.activated_at).toLocaleDateString('ru-RU')}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Icon name="CheckCircle2" size={18} className="text-green-300" />
                <span className="text-sm font-bold">Активна</span>
              </div>
            </div>
            {card.expires_at && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                <Icon name="Calendar" size={16} className="text-yellow-300" />
                <div className="flex-1">
                  <p className="text-xs opacity-90">Действительна до</p>
                  <p className="text-sm font-bold">
                    {new Date(card.expires_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-teal-950/30 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-emerald-500 p-1.5 rounded-lg">
            <Icon name="Percent" size={16} className="text-white" />
          </div>
          <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
            Кэшбек {cashbackPercent}% от покупки
          </p>
        </div>
        <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
          Предъявите QR-код при покупке от 100₽ и получайте кэшбэк на счет
        </p>
      </div>
    </div>
  );
};

export default LoyaltyCard;