import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OrdersTabProps {
  orders: any[];
}

const OrdersTab = ({ orders }: OrdersTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Заказы</CardTitle>
        <CardDescription>Все заказы пользователей</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="p-4 border rounded-lg space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">Заказ #{order.id}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.user_name} ({order.user_phone})
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{order.total_amount}₽</div>
                  <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Способ оплаты:</div>
                <div className="text-muted-foreground">
                  {order.payment_method === 'balance' ? 'Баланс' : order.payment_method === 'card' ? 'Карта' : 'При получении'}
                </div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Адрес доставки:</div>
                <div className="text-muted-foreground">{order.delivery_address}</div>
              </div>
              {order.items && order.items.length > 0 && (
                <div className="text-sm">
                  <div className="font-medium">Товары:</div>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {order.items.filter((i: any) => i.product_name).map((item: any, idx: number) => (
                      <li key={idx}>
                        {item.product_name} x{item.quantity} = {item.price * item.quantity}₽
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersTab;
