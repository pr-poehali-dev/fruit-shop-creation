import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface RobokassaTopUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
}

const RobokassaTopUpDialog: React.FC<RobokassaTopUpDialogProps> = ({ open, onOpenChange, userId }) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const presetAmounts = [100, 500, 1000, 2000, 5000];

  const handleTopUp = async () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Введите корректную сумму',
        variant: 'destructive'
      });
      return;
    }

    if (numAmount < 10) {
      toast({
        title: 'Ошибка',
        description: 'Минимальная сумма пополнения 10₽',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/e659ee47-51d9-49ab-86dd-473d6b5c49af', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          description: 'Пополнение баланса',
          user_id: userId.toString()
        })
      });

      const data = await response.json();

      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать платёж',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать платёж',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Wallet" size={24} className="text-primary" />
            Пополнить баланс
          </DialogTitle>
          <DialogDescription>
            Выберите сумму или введите свою. Минимум 10₽
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-3 gap-2">
            {presetAmounts.map((preset) => (
              <Button
                key={preset}
                variant={amount === preset.toString() ? 'default' : 'outline'}
                onClick={() => setAmount(preset.toString())}
                className="h-12"
              >
                {preset}₽
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-amount">Или введите свою сумму</Label>
            <div className="relative">
              <Input
                id="custom-amount"
                type="number"
                min="10"
                step="1"
                placeholder="Введите сумму"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₽
              </span>
            </div>
          </div>

          <Button
            onClick={handleTopUp}
            disabled={isLoading || !amount}
            className="w-full h-12 text-base font-semibold"
          >
            {isLoading ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Переход к оплате...
              </>
            ) : (
              <>
                <Icon name="CreditCard" size={20} className="mr-2" />
                Пополнить через Robokassa
              </>
            )}
          </Button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Icon name="Shield" size={14} />
            <span>Безопасная оплата через Robokassa</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RobokassaTopUpDialog;
