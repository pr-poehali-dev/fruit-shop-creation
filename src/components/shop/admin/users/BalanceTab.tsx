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

interface BalanceTabProps {
  selectedUser: User | null;
  amount: string;
  description: string;
  onAmountChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const BalanceTab = ({
  selectedUser,
  amount,
  description,
  onAmountChange,
  onDescriptionChange,
  onSubmit,
  onCancel
}: BalanceTabProps) => {
  const handleSubmit = (e: React.FormEvent, isSubtract: boolean) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    form.setAttribute('data-action', isSubtract ? 'subtract' : 'add');
    onSubmit(e);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Текущий баланс</Label>
        <p className="text-2xl font-bold text-primary">{Number(selectedUser?.balance || 0).toFixed(2)}₽</p>
      </div>
      <div>
        <Label htmlFor="amount">Сумма (₽) *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="1000"
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Описание операции</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Операция с балансом"
          rows={2}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Отмена
        </Button>
        <Button 
          type="button" 
          variant="destructive"
          onClick={(e) => handleSubmit(e as any, true)}
          className="w-full sm:w-auto"
        >
          <Icon name="Minus" size={18} className="mr-2" />
          Списать {amount ? `${amount}₽` : ''}
        </Button>
        <Button 
          type="button"
          onClick={(e) => handleSubmit(e as any, false)}
          className="w-full sm:w-auto"
        >
          <Icon name="Plus" size={18} className="mr-2" />
          Начислить {amount ? `${amount}₽` : ''}
        </Button>
      </div>
    </div>
  );
};

export default BalanceTab;