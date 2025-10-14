import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  phone: string;
  full_name: string;
  is_admin: boolean;
  balance?: number;
  cashback?: number;
  created_at: string;
}

interface CashbackTabProps {
  selectedUser: User | null;
  amount: string;
  description: string;
  onAmountChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: (e: React.FormEvent, finalAmount?: number) => void;
  onCancel: () => void;
}

const CashbackTab = ({
  selectedUser,
  amount,
  description,
  onAmountChange,
  onDescriptionChange,
  onSubmit,
  onCancel
}: CashbackTabProps) => {
  const [isDeduct, setIsDeduct] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = isDeduct ? -Math.abs(parseFloat(amount)) : parseFloat(amount);
    onSubmit(e, finalAmount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Текущий кэшбэк</Label>
        <p className="text-2xl font-bold text-green-600">{Math.round(Number(selectedUser?.cashback || 0))}₽</p>
      </div>

      <div className="flex gap-2 bg-muted p-1 rounded-lg">
        <Button
          type="button"
          variant={!isDeduct ? 'default' : 'ghost'}
          className="flex-1"
          onClick={() => setIsDeduct(false)}
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Начислить
        </Button>
        <Button
          type="button"
          variant={isDeduct ? 'destructive' : 'ghost'}
          className="flex-1"
          onClick={() => setIsDeduct(true)}
        >
          <Icon name="Minus" size={16} className="mr-2" />
          Списать
        </Button>
      </div>

      <div>
        <Label htmlFor="cashback-amount">Сумма кэшбэка (₽) *</Label>
        <Input
          id="cashback-amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="100"
          required
        />
      </div>
      <div>
        <Label htmlFor="cashback-description">Описание операции</Label>
        <Textarea
          id="cashback-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={isDeduct ? "Списание за покупку" : "Начисление кэшбэка администратором"}
          rows={2}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Отмена
        </Button>
        <Button 
          type="submit" 
          className="w-full sm:w-auto"
          variant={isDeduct ? 'destructive' : 'default'}
        >
          <Icon name={isDeduct ? "Minus" : "Gift"} size={18} className="mr-2" />
          {isDeduct ? 'Списать' : 'Начислить'} {amount ? `${amount}₽` : ''}
        </Button>
      </div>
    </form>
  );
};

export default CashbackTab;