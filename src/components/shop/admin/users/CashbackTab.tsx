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
  onSubmit: (e: React.FormEvent) => void;
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
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label>Текущий кэшбэк</Label>
        <p className="text-2xl font-bold text-green-600">{Math.round(Number(selectedUser?.cashback || 0))}₽</p>
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
          placeholder="Начисление кэшбэка администратором"
          rows={2}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Отмена
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          <Icon name="Gift" size={18} className="mr-2" />
          Начислить {amount ? `${amount}₽` : ''}
        </Button>
      </div>
    </form>
  );
};

export default CashbackTab;
