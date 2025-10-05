import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface CashbackExchangeProps {
  userCashback: number;
  userId: number;
  onExchangeSuccess: () => void;
}

const EXCHANGE_RATE = 0.4;

const CashbackExchange = ({ userCashback, userId, onExchangeSuccess }: CashbackExchangeProps) => {
  const [cashbackAmount, setCashbackAmount] = useState('');
  const [isExchanging, setIsExchanging] = useState(false);

  const cashbackValue = parseFloat(cashbackAmount) || 0;
  const rubleValue = cashbackValue * EXCHANGE_RATE;
  const maxCashback = Math.floor(userCashback);

  const handleExchange = async () => {
    if (cashbackValue <= 0 || cashbackValue > userCashback) {
      alert('Некорректная сумма кэшбека');
      return;
    }

    if (!confirm(`Обменять ${cashbackValue}₽ кэшбека на ${rubleValue.toFixed(2)}₽?`)) {
      return;
    }

    setIsExchanging(true);
    try {
      const response = await fetch('https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          type: 'cashback_exchange',
          amount: rubleValue,
          cashback_amount: cashbackValue,
          description: `Обмен ${cashbackValue}₽ кэшбека на ${rubleValue.toFixed(2)}₽`
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Успешно! Вы получили ${rubleValue.toFixed(2)}₽ на баланс`);
        setCashbackAmount('');
        onExchangeSuccess();
      } else {
        alert(data.error || 'Ошибка при обмене кэшбека');
      }
    } catch (error) {
      console.error('Error exchanging cashback:', error);
      alert('Произошла ошибка при обмене');
    } finally {
      setIsExchanging(false);
    }
  };

  const setPercentage = (percent: number) => {
    const amount = Math.floor(maxCashback * percent);
    setCashbackAmount(amount.toString());
  };

  return (
    <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="ArrowLeftRight" size={24} className="text-green-600" />
          Обмен кэшбека
        </CardTitle>
        <CardDescription>
          Конвертируйте кэшбек в рубли на баланс по курсу <span className="font-bold text-green-600">0.4₽ = 1₽</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Доступно кэшбека:</span>
            <span className="text-2xl font-bold text-green-600">{maxCashback}₽</span>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setPercentage(0.25)}
              className="flex-1 text-xs"
            >
              25%
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setPercentage(0.5)}
              className="flex-1 text-xs"
            >
              50%
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setPercentage(0.75)}
              className="flex-1 text-xs"
            >
              75%
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setPercentage(1)}
              className="flex-1 text-xs"
            >
              Всё
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cashback-input">Сумма кэшбека для обмена</Label>
          <div className="relative">
            <Input
              id="cashback-input"
              type="number"
              min="1"
              max={maxCashback}
              value={cashbackAmount}
              onChange={(e) => setCashbackAmount(e.target.value)}
              placeholder="0"
              className="pr-8 text-lg"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">₽</span>
          </div>
        </div>

        <div className="flex items-center justify-center py-2">
          <Icon name="ArrowDown" size={32} className="text-green-600 animate-pulse" />
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg border-2 border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Вы получите на баланс</p>
            <p className="text-3xl font-bold text-blue-600">
              {rubleValue.toFixed(2)}₽
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleExchange}
            disabled={!cashbackValue || cashbackValue > userCashback || isExchanging}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Icon name="Repeat" size={18} className="mr-2" />
            {isExchanging ? 'Обмен...' : 'Обменять'}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p className="flex items-center gap-1">
            <Icon name="Info" size={14} />
            Курс обмена: 1₽ кэшбека = 0.40₽ баланса
          </p>
          <p className="flex items-center gap-1">
            <Icon name="Zap" size={14} />
            Мгновенное зачисление на баланс
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashbackExchange;
