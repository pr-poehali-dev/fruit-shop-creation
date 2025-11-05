import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  total_amount: number;
  payment_method: string;
  created_at: string;
  status: string;
  courier_assigned_at?: string;
  courier_delivered_at?: string;
}

interface OrderCardProps {
  order: Order;
  type: 'available' | 'in-progress';
  onTakeOrder?: (orderId: number) => void;
  onCompleteDelivery?: (orderId: number) => void;
}

export default function OrderCard({ order, type, onTakeOrder, onCompleteDelivery }: OrderCardProps) {
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

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'card':
        return <Badge variant="secondary">Картой</Badge>;
      case 'cash':
        return <Badge variant="outline">Наличными</Badge>;
      case 'online':
        return <Badge variant="default">Онлайн</Badge>;
      default:
        return <Badge>{method}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon name="Package" size={20} />
            Заказ #{order.id}
          </span>
          {getPaymentMethodBadge(order.payment_method)}
        </CardTitle>
        <CardDescription>
          {formatDate(order.created_at)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Icon name="User" size={16} className="mt-1 text-muted-foreground" />
            <div>
              <p className="font-medium">{order.customer_name}</p>
              <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Icon name="MapPin" size={16} className="mt-1 text-muted-foreground" />
            <p className="text-sm">{order.delivery_address}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Icon name="Wallet" size={16} className="text-muted-foreground" />
            <p className="font-semibold text-lg text-green-600">{order.total_amount}₽</p>
          </div>
        </div>

        {type === 'available' && onTakeOrder && (
          <Button 
            onClick={() => onTakeOrder(order.id)} 
            className="w-full"
            size="lg"
          >
            <Icon name="CheckCircle" size={18} className="mr-2" />
            Взять заказ
          </Button>
        )}

        {type === 'in-progress' && onCompleteDelivery && (
          <Button 
            onClick={() => onCompleteDelivery(order.id)} 
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <Icon name="PackageCheck" size={18} className="mr-2" />
            Доставлено
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
