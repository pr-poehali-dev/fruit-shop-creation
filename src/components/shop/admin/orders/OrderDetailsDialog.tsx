import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface OrderDetailsDialogProps {
  order: any;
  statusLabels: Record<string, string>;
  getStatusBadgeVariant: (status: string) => string;
  itemAvailability: Record<number, { quantity: number; price: string }>;
  onClose: () => void;
  onUpdateItemStock?: (orderId: number, itemId: number, isOutOfStock: boolean) => void;
  onUpdateItemAvailability?: (itemId: number, availableQuantity: number, availablePrice?: number) => void;
  onItemAvailabilityChange: (itemId: number, field: 'quantity' | 'price', value: string) => void;
}

export const OrderDetailsDialog = ({
  order,
  statusLabels,
  getStatusBadgeVariant,
  itemAvailability,
  onClose,
  onUpdateItemStock,
  onUpdateItemAvailability,
  onItemAvailabilityChange
}: OrderDetailsDialogProps) => {
  if (!order) return null;

  const handleToggleOutOfStock = (itemId: number, currentStatus: boolean) => {
    if (onUpdateItemStock) {
      onUpdateItemStock(order.id, itemId, !currentStatus);
    }
  };

  const handleSaveAvailability = (itemId: number, originalPrice: string) => {
    const availability = itemAvailability[itemId];
    if (!availability || !onUpdateItemAvailability) return;

    const quantity = parseInt(availability.quantity.toString());
    const price = availability.price.trim() 
      ? parseFloat(availability.price)
      : parseFloat(originalPrice);

    if (quantity > 0) {
      onUpdateItemAvailability(itemId, quantity, price);
    }
  };

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Заказ #{order.id}</span>
            <Badge variant={getStatusBadgeVariant(order.status)}>
              {statusLabels[order.status] || order.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="font-medium text-muted-foreground">Клиент</div>
              <div>{order.user_name}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Телефон</div>
              <div>{order.user_phone}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Способ оплаты</div>
              <div>
                {order.payment_method === 'balance' ? 'Баланс' : 
                 order.payment_method === 'card' ? 'Карта' : 
                 order.payment_method === 'sber_qr' ? 'СберБанк QR' :
                 'При получении'}
              </div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Доставка</div>
              <div>
                {order.delivery_type === 'delivery' ? '🚚 Доставка' : '🏪 Самовывоз'}
                {order.delivery_zone_id && (
                  <span className="ml-1 text-xs text-primary">
                    (Зона #{order.delivery_zone_id})
                  </span>
                )}
              </div>
            </div>
            <div className="col-span-2">
              <div className="font-medium text-muted-foreground">Адрес</div>
              <div>{order.delivery_address}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Дата создания</div>
              <div>{new Date(order.created_at).toLocaleString('ru-RU')}</div>
            </div>
          </div>

          {order.rejection_reason && (
            <div className="bg-destructive/10 p-3 rounded">
              <div className="font-medium text-destructive">Причина отказа:</div>
              <div>{order.rejection_reason}</div>
            </div>
          )}

          {order.status === 'cancelled' && order.cancellation_reason && (
            <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded border border-orange-200 dark:border-orange-800">
              <div className="font-medium text-orange-700 dark:text-orange-300">
                Отменён {order.cancelled_by === 'admin' ? '(администратором)' : '(пользователем)'}:
              </div>
              <div>{order.cancellation_reason}</div>
            </div>
          )}

          <div>
            <div className="font-medium mb-2">Товары:</div>
            <div className="space-y-2">
              {order.items && order.items.length > 0 ? (
                order.items
                  .filter((item: any) => item.product_name)
                  .map((item: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <div className="font-medium">{item.product_name}</div>
                          {item.is_out_of_stock && (
                            <Badge variant="destructive" className="mt-1">
                              <Icon name="AlertCircle" size={12} className="mr-1" />
                              Недоступен
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={item.is_out_of_stock ? 'line-through text-muted-foreground' : ''}>
                            {item.quantity} × {parseFloat(item.price).toFixed(2)}₽
                          </div>
                          <div className={`font-bold ${item.is_out_of_stock ? 'line-through text-muted-foreground' : ''}`}>
                            {(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}₽
                          </div>
                        </div>
                      </div>

                      {item.is_out_of_stock && (
                        <div className="space-y-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded">
                          <div className="text-xs font-medium text-amber-700 dark:text-amber-300">
                            Укажите доступное количество:
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Input
                                type="number"
                                placeholder="Количество"
                                min="0"
                                value={itemAvailability[item.id]?.quantity ?? ''}
                                onChange={(e) => onItemAvailabilityChange(item.id, 'quantity', e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="flex-1">
                              <Input
                                type="number"
                                placeholder={`Цена (${parseFloat(item.price).toFixed(2)}₽)`}
                                step="0.01"
                                value={itemAvailability[item.id]?.price ?? ''}
                                onChange={(e) => onItemAvailabilityChange(item.id, 'price', e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleSaveAvailability(item.id, item.price)}
                              disabled={!itemAvailability[item.id]?.quantity}
                            >
                              Сохранить
                            </Button>
                          </div>
                          {item.available_quantity > 0 && (
                            <div className="text-xs text-green-600 dark:text-green-400">
                              ✓ Доступно: {item.available_quantity} шт. по {parseFloat(item.available_price || item.price).toFixed(2)}₽
                            </div>
                          )}
                        </div>
                      )}

                      {onUpdateItemStock && (
                        <Button
                          size="sm"
                          variant={item.is_out_of_stock ? "default" : "destructive"}
                          onClick={() => handleToggleOutOfStock(item.id, item.is_out_of_stock)}
                        >
                          <Icon 
                            name={item.is_out_of_stock ? "Check" : "X"} 
                            size={14} 
                            className="mr-1" 
                          />
                          {item.is_out_of_stock ? 'Вернуть' : 'Нет в наличии'}
                        </Button>
                      )}
                    </div>
                  ))
              ) : (
                <div className="text-muted-foreground text-center py-4">Товары не указаны</div>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t">
            <div className={`flex justify-between items-center ${order.is_preorder ? 'text-sm text-muted-foreground' : 'font-bold text-lg'}`}>
              <span>Итого:</span>
              <span className={order.is_preorder ? 'line-through' : ''}>
                {order.items ? 
                  order.items
                    .filter((i: any) => i.product_name)
                    .reduce((sum: number, i: any) => {
                      if (i.is_out_of_stock) {
                        if (i.available_quantity > 0) {
                          const price = parseFloat(i.available_price) || parseFloat(i.price);
                          const qty = parseInt(i.available_quantity);
                          return sum + (price * qty);
                        }
                        return sum;
                      }
                      return sum + (parseFloat(i.price) * parseInt(i.quantity));
                    }, 0).toFixed(2)
                  : parseFloat(order.total_amount).toFixed(2)
                }₽
              </span>
            </div>
            {order.is_preorder && order.amount_paid && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-300 dark:border-blue-700 rounded p-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-900 dark:text-blue-100 font-bold text-base">Оплачено полностью (50%):</span>
                  <span className="text-blue-900 dark:text-blue-100 font-bold text-lg">{parseFloat(order.amount_paid).toFixed(2)}₽</span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Остальное клиент оплатит при получении</p>
              </div>
            )}
            {!order.is_preorder && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-300 dark:border-green-700 rounded p-3">
                <div className="flex items-center justify-center gap-2">
                  <Icon name="CheckCircle" size={16} className="text-green-700 dark:text-green-300" />
                  <span className="text-green-900 dark:text-green-100 font-semibold text-sm">Заказ оплачен полностью</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};