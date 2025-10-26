import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface LoyaltyCard {
  id: number;
  card_number: string;
  qr_code: string;
  is_active: boolean;
  purchased_at: string;
}

interface LoyaltyTabProps {
  loadingLoyalty: boolean;
  loyaltyCard: LoyaltyCard | null;
  selectedUser: any;
  cashbackAmount: string;
  cashbackDescription: string;
  onCashbackAmountChange: (value: string) => void;
  onCashbackDescriptionChange: (value: string) => void;
  onAddCashback: () => void;
  onSubtractCashback: () => void;
  onRevokeLoyaltyCard: () => void;
  onIssueLoyaltyCard: () => void;
}

const LoyaltyTab = ({
  loadingLoyalty,
  loyaltyCard,
  selectedUser,
  cashbackAmount,
  cashbackDescription,
  onCashbackAmountChange,
  onCashbackDescriptionChange,
  onAddCashback,
  onSubtractCashback,
  onRevokeLoyaltyCard,
  onIssueLoyaltyCard
}: LoyaltyTabProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Управление кэшбэком</h3>
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <div>
            <Label>Текущий кэшбэк</Label>
            <p className="text-2xl font-bold text-green-600">{Number(selectedUser?.cashback || 0).toFixed(2)}₽</p>
          </div>
          <div>
            <Label htmlFor="cashback-amount">Сумма (₽) *</Label>
            <Input
              id="cashback-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={cashbackAmount}
              onChange={(e) => onCashbackAmountChange(e.target.value)}
              placeholder="100"
            />
          </div>
          <div>
            <Label htmlFor="cashback-description">Описание операции</Label>
            <Textarea
              id="cashback-description"
              value={cashbackDescription}
              onChange={(e) => onCashbackDescriptionChange(e.target.value)}
              placeholder="Операция с кэшбэком"
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="destructive"
              onClick={onSubtractCashback}
              className="flex-1"
              disabled={!cashbackAmount || parseFloat(cashbackAmount) <= 0}
            >
              <Icon name="Minus" size={18} className="mr-2" />
              Списать {cashbackAmount ? `${cashbackAmount}₽` : ''}
            </Button>
            <Button 
              onClick={onAddCashback}
              className="flex-1"
              disabled={!cashbackAmount || parseFloat(cashbackAmount) <= 0}
            >
              <Icon name="Plus" size={18} className="mr-2" />
              Начислить {cashbackAmount ? `${cashbackAmount}₽` : ''}
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Карта лояльности</h3>
        {loadingLoyalty ? (
        <p className="text-center text-muted-foreground py-8">Загрузка...</p>
      ) : loyaltyCard ? (
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Номер карты</p>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{loyaltyCard.card_number}</p>
              </div>
              {loyaltyCard.is_active ? (
                <Badge className="bg-green-500">Активна</Badge>
              ) : (
                <Badge variant="destructive">Отозвана</Badge>
              )}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Выдана:</span>
                <span className="font-medium">
                  {new Date(loyaltyCard.purchased_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">QR-код:</span>
                <span className="font-mono text-xs">{loyaltyCard.qr_code.substring(0, 30)}...</span>
              </div>
            </div>
          </div>

          {loyaltyCard.is_active && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                <Icon name="AlertTriangle" size={18} />
                Опасная зона
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Отзыв карты лояльности деактивирует её. Пользователь потеряет доступ к кэшбэку по этой карте.
              </p>
              <Button 
                variant="destructive" 
                onClick={onRevokeLoyaltyCard}
                className="w-full"
              >
                <Icon name="Ban" size={18} className="mr-2" />
                Забрать карту лояльности
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed rounded-lg space-y-4">
          <Icon name="CreditCard" size={48} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">У пользователя нет карты лояльности</p>
          <Button onClick={onIssueLoyaltyCard} className="bg-purple-600 hover:bg-purple-700">
            <Icon name="Plus" size={18} className="mr-2" />
            Выдать карту администратором
          </Button>
        </div>
      )}
      </div>
    </div>
  );
};

export default LoyaltyTab;