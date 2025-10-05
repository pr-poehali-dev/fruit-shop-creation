import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Order } from '@/types/shop';

interface OrderItemProps {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
  onCancel: (orderId: number) => void;
  isCancelling: boolean;
}

const OrderItem = ({ order, isExpanded, onToggle, onCancel, isCancelling }: OrderItemProps) => {
  return (
    <Card className="border">
      <CardHeader 
        className="pb-3 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon 
              name={isExpanded ? "ChevronDown" : "ChevronRight"} 
              size={18} 
              className="text-muted-foreground"
            />
            <div>
              <CardTitle className="text-sm">Заказ #{order.id}</CardTitle>
              <CardDescription className="text-xs">
                {new Date(order.created_at).toLocaleDateString('ru-RU')}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {order.items ? 
                order.items
                  .filter((i: any) => i.product_name)
                  .reduce((sum: number, i: any) => {
                    if (i.is_out_of_stock) {
                      if (i.available_quantity > 0) {
                        const price = i.available_price || i.price;
                        return sum + (price * i.available_quantity);
                      }
                      return sum;
                    }
                    return sum + (i.price * i.quantity);
                  }, 0)
                : order.total_amount
              } ₽
            </span>
            <Badge variant="outline" className="text-xs">
              {order.status === 'pending' && '⏳'}
              {order.status === 'processing' && '📦'}
              {order.status === 'delivered' && '✅'}
              {order.status === 'rejected' && '❌'}
              {order.status === 'cancelled' && '🚫'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0 space-y-3">
          <Separator />
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Статус:</span>
              <Badge variant="outline">
                {order.status === 'pending' && 'Ожидает обработки'}
                {order.status === 'processing' && 'В обработке'}
                {order.status === 'delivered' && 'Доставлен'}
                {order.status === 'rejected' && 'Отклонён'}
                {order.status === 'cancelled' && 'Отменён'}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Способ оплаты:</span>
              <span className="font-medium">
                {order.payment_method === 'balance' ? 'Баланс' : 'Карта'}
              </span>
            </div>
            {order.delivery_address && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Адрес:</span>
                <span className="font-medium text-right max-w-[200px] truncate">
                  {order.delivery_address}
                </span>
              </div>
            )}
          </div>
          
          {order.items && order.items.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Товары:</div>
              {order.items.filter((i: any) => i.product_name).map((item: any, idx: number) => {
                const hasPartialAvailability = item.is_out_of_stock && item.available_quantity > 0;
                const effectivePrice = item.available_price || item.price;
                const effectiveQuantity = hasPartialAvailability ? item.available_quantity : item.quantity;
                
                return (
                  <div 
                    key={idx} 
                    className={`text-xs p-2 rounded border ${item.is_out_of_stock ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800' : 'bg-muted/30'}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={item.is_out_of_stock && !hasPartialAvailability ? 'line-through text-muted-foreground' : ''}>
                        {item.product_name}
                      </span>
                      {!item.is_out_of_stock && (
                        <span className="font-medium">{item.quantity} × {item.price}₽</span>
                      )}
                    </div>
                    
                    {item.is_out_of_stock && (
                      <div className="mt-1 space-y-1">
                        {hasPartialAvailability ? (
                          <>
                            <div className="text-orange-600 dark:text-orange-400 flex items-center gap-1">
                              <Icon name="AlertCircle" size={12} />
                              <span>Доступно: {effectiveQuantity} шт. из {item.quantity}</span>
                            </div>
                            <div className="font-medium">
                              {effectiveQuantity} × {effectivePrice}₽ = {(effectiveQuantity * effectivePrice).toFixed(2)}₽
                              {item.available_price && item.available_price !== item.price && (
                                <span className="text-muted-foreground ml-1">(новая цена)</span>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="text-destructive flex items-center gap-1">
                            <Icon name="AlertCircle" size={12} />
                            Товар отсутствует в наличии
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="flex justify-between items-center pt-2 border-t text-sm font-bold">
                <span>Итого к оплате:</span>
                <span>
                  {order.items
                    .filter((i: any) => i.product_name)
                    .reduce((sum: number, i: any) => {
                      if (i.is_out_of_stock) {
                        if (i.available_quantity > 0) {
                          const price = i.available_price || i.price;
                          return sum + (price * i.available_quantity);
                        }
                        return sum;
                      }
                      return sum + (i.price * i.quantity);
                    }, 0)
                  }₽
                </span>
              </div>
            </div>
          )}
          
          {order.rejection_reason && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
              <span className="font-semibold">Причина отклонения:</span> {order.rejection_reason}
            </div>
          )}
          
          {order.status === 'cancelled' && order.cancellation_reason && (
            <div className="p-2 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded text-xs">
              <span className="font-semibold text-orange-700 dark:text-orange-300">
                Отменён {order.cancelled_by === 'admin' ? '(администратором)' : '(вами)'}:
              </span>
              <span className="text-muted-foreground ml-1">{order.cancellation_reason}</span>
            </div>
          )}
          
          {(order.status === 'pending' || order.status === 'processing') && (
            <Button 
              size="sm" 
              variant="destructive"
              className="w-full"
              onClick={() => onCancel(order.id)}
              disabled={isCancelling}
            >
              <Icon name="X" size={14} className="mr-1" />
              {isCancelling ? 'Отмена...' : 'Отменить заказ'}
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default OrderItem;
