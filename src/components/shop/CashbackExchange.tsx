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
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Icon name="ArrowLeftRight" size={20} className="text-green-600 sm:w-6 sm:h-6" />
          Обмен кэшбека
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Курс: <span className="font-bold text-green-600">0.4₽ = 1₽</span> на баланс
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
        <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); handleExchange(); }} data-form-type="other">
          <input type="text" name="prevent_autofill" autoComplete="off" style={{ position: 'absolute', top: '-9999px', left: '-9999px' }} tabIndex={-1} aria-hidden="true" />
          <input type="password" name="prevent_autofill_pass" autoComplete="new-password" style={{ position: 'absolute', top: '-9999px', left: '-9999px' }} tabIndex={-1} aria-hidden="true" />
          
          <div className="p-3 sm:p-4 bg-white/50 dark:bg-black/20 rounded-lg space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-muted-foreground">Доступно:</span>
              <span className="text-xl sm:text-2xl font-bold text-green-600">{maxCashback}₽</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              <Button 
                type="button"
                size="sm" 
                variant="outline" 
                onClick={() => setPercentage(0.25)}
                className="text-[11px] sm:text-xs h-8 sm:h-9 px-1 sm:px-2"
              >
                25%
              </Button>
              <Button 
                type="button"
                size="sm" 
                variant="outline" 
                onClick={() => setPercentage(0.5)}
                className="text-[11px] sm:text-xs h-8 sm:h-9 px-1 sm:px-2"
              >
                50%
              </Button>
              <Button 
                type="button"
                size="sm" 
                variant="outline" 
                onClick={() => setPercentage(0.75)}
                className="text-[11px] sm:text-xs h-8 sm:h-9 px-1 sm:px-2"
              >
                75%
              </Button>
              <Button 
                type="button"
                size="sm" 
                variant="outline" 
                onClick={() => setPercentage(1)}
                className="text-[11px] sm:text-xs h-8 sm:h-9 px-1 sm:px-2"
              >
                Всё
              </Button>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2 mt-3 sm:mt-4">
            <Label htmlFor="cashback-input" className="text-xs sm:text-sm">Сумма кэшбека</Label>
            <div className="relative">
              <Input
                id="cashback-input"
                name="cashback_exchange_amount_field"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={cashbackAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setCashbackAmount(value);
                }}
                placeholder="0"
                autoComplete="off"
                data-form-type="other"
                data-lpignore="true"
                data-1p-ignore="true"
                className="pr-8 text-base sm:text-lg h-11 sm:h-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm sm:text-base">₽</span>
            </div>
          </div>

          <div className="flex items-center justify-center py-1 sm:py-2 mt-3 sm:mt-4">
            <Icon name="ArrowDown" size={24} className="text-green-600 animate-pulse sm:w-8 sm:h-8" />
          </div>

          <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">На баланс</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                {rubleValue.toFixed(2)}₽
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-1 sm:pt-2 mt-3 sm:mt-4">
            <Button
              type="submit"
              disabled={!cashbackValue || cashbackValue > userCashback || isExchanging}
              className="flex-1 bg-green-600 hover:bg-green-700 h-11 sm:h-12 text-sm sm:text-base"
            >
              <Icon name="Repeat" size={16} className="mr-2 sm:w-[18px] sm:h-[18px]" />
              {isExchanging ? 'Обмен...' : 'Обменять'}
            </Button>
          </div>

          <div className="text-[11px] sm:text-xs text-muted-foreground space-y-0.5 sm:space-y-1 pt-2 border-t mt-3 sm:mt-4">
            <p className="flex items-center gap-1">
              <Icon name="Info" size={12} className="flex-shrink-0 sm:w-[14px] sm:h-[14px]" />
              <span>Курс: 1₽ кэшбека = 0.40₽ баланса</span>
            </p>
            <p className="flex items-center gap-1">
              <Icon name="Zap" size={12} className="flex-shrink-0 sm:w-[14px] sm:h-[14px]" />
              <span>Мгновенное зачисление</span>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CashbackExchange;