import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface EarningRecord {
  id: number;
  order_id: number;
  amount: number;
  earned_at: string;
  paid_out: boolean;
  paid_out_at?: string;
  delivery_address: string;
}

interface EarningsHistoryProps {
  earnings: EarningRecord[];
}

export default function EarningsHistory({ earnings }: EarningsHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (earnings.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="Wallet" size={48} className="mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">История заработка пуста</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {earnings.map((earning) => (
        <Card key={earning.id}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">Заказ #{earning.order_id}</p>
                  {earning.paid_out ? (
                    <Badge variant="default" className="bg-green-600">
                      <Icon name="CheckCircle" size={12} className="mr-1" />
                      Выплачено
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Icon name="Clock" size={12} className="mr-1" />
                      Ожидает
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="MapPin" size={14} />
                  <p className="line-clamp-1">{earning.delivery_address}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(earning.earned_at)}
                  {earning.paid_out && earning.paid_out_at && (
                    <span> • Выплачено: {formatDate(earning.paid_out_at)}</span>
                  )}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="text-xl font-bold text-green-600">+{earning.amount}₽</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
