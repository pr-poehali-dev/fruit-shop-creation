import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import QrScanner from 'react-qr-scanner';

const API_LOYALTY = 'https://functions.poehali.dev/ed127250-fe9d-4c7e-9a93-fb8b7fdc038a';

const LoyaltyScannerTab = () => {
  const { toast } = useToast();
  const [cardNumber, setCardNumber] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const cardInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cardInputRef.current && !isCameraActive) {
      cardInputRef.current.focus();
    }
  }, [isCameraActive]);

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
        setIsCameraActive(false);
        
        setTimeout(() => {
          if (cardInputRef.current) {
            cardInputRef.current.focus();
          }
        }, 100);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось начислить кэшбэк',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось начислить кэшбэк',
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
    const cleanValue = extractCardNumber(value.trim());
    setCardNumber(cleanValue);
    
    if (cleanValue.startsWith('LC') && cleanValue.length >= 10 && purchaseAmount) {
      setTimeout(() => {
        const amountInput = document.getElementById('purchase-amount') as HTMLInputElement;
        if (amountInput) {
          amountInput.focus();
        }
      }, 100);
    }
  };

  const handleScan = (data: any) => {
    if (data?.text) {
      const cleanValue = extractCardNumber(data.text);
      setCardNumber(cleanValue);
      setIsCameraActive(false);
      
      toast({
        title: 'QR-код отсканирован',
        description: `Карта: ${cleanValue}`
      });

      setTimeout(() => {
        const amountInput = document.getElementById('purchase-amount') as HTMLInputElement;
        if (amountInput) {
          amountInput.focus();
        }
      }, 200);
    }
  };

  const handleError = (err: any) => {
    console.error('Camera error:', err);
    setCameraError('Не удалось получить доступ к камере');
    setIsCameraActive(false);
    toast({
      title: 'Ошибка камеры',
      description: 'Проверьте разрешения для доступа к камере',
      variant: 'destructive'
    });
  };

  const toggleCamera = () => {
    if (isCameraActive) {
      setIsCameraActive(false);
      setCameraError('');
    } else {
      setCameraError('');
      setIsCameraActive(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Сканер карт лояльности</CardTitle>
        <CardDescription>Начисление кэшбэка по QR-коду карты</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-primary/5 p-4 rounded-lg border-2 border-dashed border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="ScanLine" size={24} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Сканирование QR-кода</p>
                  <p className="text-xs text-muted-foreground">Камера или ввод вручную</p>
                </div>
              </div>
              <Button
                type="button"
                variant={isCameraActive ? "destructive" : "default"}
                size="sm"
                onClick={toggleCamera}
              >
                <Icon name={isCameraActive ? "CameraOff" : "Camera"} size={18} className="mr-2" />
                {isCameraActive ? 'Закрыть' : 'Открыть камеру'}
              </Button>
            </div>

            {isCameraActive && (
              <div className="mb-4 rounded-lg overflow-hidden border-2 border-primary">
                <QrScanner
                  delay={300}
                  onError={handleError}
                  onScan={handleScan}
                  style={{ width: '100%' }}
                  constraints={{
                    video: { facingMode: 'environment' }
                  }}
                />
              </div>
            )}

            {cameraError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
                  <Icon name="AlertCircle" size={16} />
                  {cameraError}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="card-number">Номер карты</Label>
                <Input
                  ref={cardInputRef}
                  id="card-number"
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  placeholder="Отсканируйте QR или введите LC..."
                  required
                  className="font-mono text-base"
                  autoComplete="off"
                  autoFocus={!isCameraActive}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Нажмите "Открыть камеру" для сканирования QR-кода
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
                Начислить кэшбэк
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
                    <p>Начислено кэшбэка: <strong className="text-lg">+{lastResult.cashback_earned.toFixed(2)}₽</strong></p>
                    <p>Новый баланс кэшбэка: <strong>{lastResult.new_cashback.toFixed(2)}₽</strong></p>
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
              <li>• Нажмите "Открыть камеру" и наведите на QR-код</li>
              <li>• Или введите номер карты вручную</li>
              <li>• Введите сумму покупки (минимум 100₽)</li>
              <li>• Система начислит 3% кэшбэка на счет клиента</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoyaltyScannerTab;