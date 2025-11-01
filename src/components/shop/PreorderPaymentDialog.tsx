import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import { logUserAction } from '@/utils/userLogger';

const API_ORDERS = 'https://functions.poehali.dev/b35bef37-8423-4939-b43b-0fb565cc8853';
const API_ALFABANK = 'https://functions.poehali.dev/60d635ae-584e-4966-b483-528742647efb';

interface PreorderPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  remainingAmount: number;
  userBalance: number;
  userId: number;
  userEmail?: string;
  onPaymentComplete: () => void;
}

const PreorderPaymentDialog: React.FC<PreorderPaymentDialogProps> = ({
  open,
  onOpenChange,
  orderId,
  remainingAmount,
  userBalance,
  userId,
  userEmail,
  onPaymentComplete,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'alfabank'>('balance');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      if (paymentMethod === 'balance') {
        if (userBalance < remainingAmount) {
          toast.error('Недостаточно средств на балансе');
          setIsProcessing(false);
          return;
        }

        const response = await fetch(API_ORDERS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'complete_preorder_payment',
            order_id: orderId,
            user_id: userId,
            payment_method: 'balance',
          }),
        });

        const data = await response.json();

        if (data.success) {
          await logUserAction(
            userId,
            'order_payment',
            `Доплата за предзаказ #${orderId} - ${remainingAmount}₽`,
            'order',
            orderId,
            { payment_method: 'balance', amount: remainingAmount }
          );
          toast.success('Оплата успешно завершена!');
          onPaymentComplete();
          onOpenChange(false);
        } else {
          toast.error(data.error || 'Ошибка при оплате');
        }
      } else {
        const response = await fetch(API_ALFABANK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: remainingAmount,
            user_id: userId,
            email: userEmail,
            description: `Доплата за предзаказ #${orderId}`,
            return_url: `${window.location.origin}/payment/success?order_id=${orderId}`,
            order_id: orderId,
            is_preorder_payment: true,
          }),
        });

        const data = await response.json();
        console.log('Alfabank payment response:', data);

        if (data.payment_url) {
          window.location.href = data.payment_url;
        } else {
          console.error('No payment_url in response:', data);
          toast.error(data.error || data.message || 'Ошибка создания платежа');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Ошибка при оплате');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="CreditCard" size={24} className="text-primary" />
            Доплата за предзаказ
          </DialogTitle>
          <DialogDescription>
            Необходимо оплатить оставшиеся 50% стоимости заказа
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">К оплате</p>
            <p className="text-2xl font-bold">{remainingAmount.toLocaleString('ru-RU')} ₽</p>
          </div>

          <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'balance' | 'alfabank')}>
            <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="balance" id="balance" />
              <Label htmlFor="balance" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="Wallet" size={20} className="text-primary" />
                    <span>Списать с баланса</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {userBalance.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="alfabank" id="alfabank" />
              <Label htmlFor="alfabank" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Icon name="CreditCard" size={20} className="text-primary" />
                  <span>Банковская карта</span>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {paymentMethod === 'balance' && userBalance < remainingAmount && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm flex items-start gap-2">
              <Icon name="AlertCircle" size={18} className="mt-0.5 flex-shrink-0" />
              <span>Недостаточно средств на балансе. Пополните баланс или выберите другой способ оплаты.</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isProcessing}
            >
              Отмена
            </Button>
            <Button
              onClick={handlePayment}
              className="flex-1"
              disabled={isProcessing || (paymentMethod === 'balance' && userBalance < remainingAmount)}
            >
              {isProcessing ? 'Обработка...' : 'Оплатить'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreorderPaymentDialog;