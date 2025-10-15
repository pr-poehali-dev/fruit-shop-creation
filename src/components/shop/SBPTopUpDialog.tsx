import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface SBPTopUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
}

const SBPTopUpDialog: React.FC<SBPTopUpDialogProps> = ({ open, onOpenChange, userId }) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const presetAmounts = [100, 500, 1000, 2000, 5000];

  React.useEffect(() => {
    if (!open) {
      setAmount('');
      setIsLoading(false);
    }
  }, [open]);

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
      toast({
        title: 'В разработке',
        description: 'Интеграция с Альфа-Банком скоро будет доступна',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-version="sbp-v2">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="CreditCard" size={24} className="text-primary" />
            Пополнить баланс
          </DialogTitle>
          <DialogDescription>
            Оплата через Альфа-Банк. Безопасная оплата картой. Минимум 10₽
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
                Оплатить через Альфа-Банк
              </>
            )}
          </Button>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
              <Icon name="Shield" size={14} />
              <span>Безопасная оплата через Альфа-Банк</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-green-600">
              <Icon name="Lock" size={14} />
              <span>Защищённая транзакция</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <Icon name="Zap" size={14} />
              <span>Моментальное зачисление</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SBPTopUpDialog;