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
  purchased_at: string;
}

const LoyaltyCard = ({ userId, userBalance, onBalanceUpdate }: LoyaltyCardProps) => {
  const { toast } = useToast();
  const [card, setCard] = useState<LoyaltyCardData | null>(null);
  const [cardPrice, setCardPrice] = useState<number>(500);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const loadCard = async () => {
    try {
      const response = await fetch(`${API_LOYALTY}?user_id=${userId}`);
      const data = await response.json();
      setCard(data.card);
      setCardPrice(data.card_price || 500);
    } catch (error) {
      console.error('Failed to load loyalty card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCard();
  }, [userId]);

  const handlePurchase = async () => {
    if (userBalance < cardPrice) {
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
        body: JSON.stringify({ user_id: userId })
      });

      const data = await response.json();

      if (data.success) {
        setCard(data.card);
        onBalanceUpdate();
        toast({
          title: 'Карта куплена!',
          description: 'Виртуальная карта лояльности активирована'
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
        <CardContent className="p-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="CreditCard" size={32} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Карта лояльности</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Получите виртуальную карту с QR-кодом
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-primary">{cardPrice}₽</p>
            <Button 
              onClick={handlePurchase} 
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
              <p className="text-xs text-destructive">
                Недостаточно средств на балансе
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl p-6 text-white shadow-2xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-xs opacity-80 uppercase tracking-wider">Карта лояльности</p>
            <p className="text-2xl font-bold mt-1">{card.card_number}</p>
          </div>
          <Icon name="Crown" size={32} className="text-yellow-300" />
        </div>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center mb-6">
          <div className="bg-white p-3 rounded-lg">
            <QRCodeSVG 
              value={card.qr_code} 
              size={120}
              level="H"
              includeMargin={false}
            />
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs opacity-80">Активирована</p>
            <p className="text-sm font-medium">
              {new Date(card.purchased_at).toLocaleDateString('ru-RU')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle2" size={20} className="text-green-300" />
            <span className="text-sm font-medium">Активна</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          Предъявите QR-код при покупке для получения специальных предложений
        </p>
      </div>
    </div>
  );
};

export default LoyaltyCard;