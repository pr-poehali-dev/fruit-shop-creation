import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  onRevokeLoyaltyCard: () => void;
  onIssueLoyaltyCard: () => void;
}

const LoyaltyTab = ({
  loadingLoyalty,
  loyaltyCard,
  onRevokeLoyaltyCard,
  onIssueLoyaltyCard
}: LoyaltyTabProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Карта лояльности</h3>
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
  );
};

export default LoyaltyTab;
