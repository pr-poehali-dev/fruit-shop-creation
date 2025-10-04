import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const API_LOYALTY = 'https://functions.poehali.dev/ed127250-fe9d-4c7e-9a93-fb8b7fdc038a';

const LoyaltyScannerTab = () => {
  const { toast } = useToast();
  const [cardNumber, setCardNumber] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(purchaseAmount);
    
    if (!cardNumber.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите номер карты',
        variant: 'destructive'
      });
      return;
    }

    if (isNaN(amount) || amount < 100) {
      toast({
        title: 'Ошибка',
        description: 'Минимальная сумма покупки - 100₽',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    setLastResult(null);

    try {
      const response = await fetch(API_LOYALTY, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_number: cardNumber,
          purchase_amount: amount
        })
      });

      const data = await response.json();

      if (data.success) {
        setLastResult(data);
        toast({
          title: 'Кэшбек начислен!',
          description: `+${data.cashback_earned.toFixed(2)}₽ для ${data.user_name}`
        });
        setCardNumber('');
        setPurchaseAmount('');
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось начислить кэшбек',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось начислить кэшбек',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const extractCardNumber = (input: string) => {
    if (input.startsWith('LOYALTY:')) {
      const parts = input.split(':');
      return parts[1] || input;
    }
    return input;
  };

  const handleCardNumberChange = (value: string) => {
    const cleanValue = extractCardNumber(value);
    setCardNumber(cleanValue);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Сканер карт лояльности</CardTitle>
        <CardDescription>Начисление кэшбека по QR-коду карты</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-primary/5 p-4 rounded-lg border-2 border-dashed border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="ScanLine" size={24} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold">Сканируйте QR-код</p>
                <p className="text-xs text-muted-foreground">Или введите номер карты вручную</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="card-number">Номер карты</Label>
                <Input
                  id="card-number"
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  placeholder="LC..."
                  required
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  При сканировании QR номер карты введется автоматически
                </p>
              </div>

              <div>
                <Label htmlFor="purchase-amount">Сумма покупки (₽)</Label>
                <Input
                  id="purchase-amount"
                  type="number"
                  step="0.01"
                  min="100"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  placeholder="1000"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Кэшбек 3% начисляется от суммы покупки от 100₽
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isProcessing} className="w-full">
            {isProcessing ? (
              <>Обработка...</>
            ) : (
              <>
                <Icon name="Percent" size={18} className="mr-2" />
                Начислить кэшбек
              </>
            )}
          </Button>

          {lastResult && (
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <Icon name="CheckCircle2" size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 dark:text-green-100">
                    Кэшбек успешно начислен
                  </h4>
                  <div className="mt-2 space-y-1 text-sm text-green-800 dark:text-green-200">
                    <p>Клиент: <strong>{lastResult.user_name}</strong> ({lastResult.user_phone})</p>
                    <p>Начислено кэшбека: <strong className="text-lg">+{lastResult.cashback_earned.toFixed(2)}₽</strong></p>
                    <p>Новый баланс кэшбека: <strong>{lastResult.new_cashback.toFixed(2)}₽</strong></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Icon name="Info" size={16} />
              Как это работает
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Клиент показывает QR-код карты лояльности</li>
              <li>• Отсканируйте код или введите номер карты</li>
              <li>• Введите сумму покупки (минимум 100₽)</li>
              <li>• Система начислит 3% кэшбека на счет клиента</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoyaltyScannerTab;
