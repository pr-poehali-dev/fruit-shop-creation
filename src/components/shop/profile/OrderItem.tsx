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
  onPayDelivery: (order: Order) => void;
  onPayRemaining: (order: Order) => void;
  isCancelling: boolean;
}

const OrderItem = ({ order, isExpanded, onToggle, onCancel, onPayDelivery, onPayRemaining, isCancelling }: OrderItemProps) => {
  return (
    <Card className="border">
      <CardHeader 
        className="p-3 sm:pb-3 cursor-pointer active:bg-accent/30 hover:bg-accent/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <Icon 
              name={isExpanded ? "ChevronDown" : "ChevronRight"} 
              size={16} 
              className="text-muted-foreground flex-shrink-0 sm:w-[18px] sm:h-[18px]"
            />
            <div className="min-w-0">
              <CardTitle className="text-xs sm:text-sm">Заказ #{order.id}</CardTitle>
              <CardDescription className="text-[10px] sm:text-xs">
                {new Date(order.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
              {order.is_preorder && order.amount_paid ? 
                parseFloat(order.amount_paid).toFixed(2)
                : order.items ? 
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
              } ₽
            </span>
            <Badge variant="outline" className="text-base sm:text-xs px-1 py-0 sm:px-2 sm:py-1">
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
        <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6 space-y-2.5 sm:space-y-3">
          <Separator />
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex justify-between text-xs sm:text-sm gap-2">
              <span className="text-muted-foreground">Статус:</span>
              <Badge variant="outline" className="text-[10px] sm:text-xs">
                {order.status === 'pending' && 'Ожидает'}
                {order.status === 'processing' && 'В обработке'}
                {order.status === 'delivered' && 'Доставлен'}
                {order.status === 'rejected' && 'Отклонён'}
                {order.status === 'cancelled' && 'Отменён'}
              </Badge>
            </div>
            <div className="flex justify-between text-xs sm:text-sm gap-2">
              <span className="text-muted-foreground">Оплата:</span>
              <span className="font-medium">
                {order.payment_method === 'balance' ? 'Баланс' : 
                 order.payment_method === 'sber_qr' ? 'СберБанк QR' :
                 order.payment_method === 'card' ? 'Карта' : 
                 'При получении'}
              </span>
            </div>
            {order.delivery_address && (
              <div className="flex justify-between text-xs sm:text-sm gap-2">
                <span className="text-muted-foreground flex-shrink-0">Адрес:</span>
                <span className="font-medium text-right max-w-[150px] sm:max-w-[200px] truncate">
                  {order.delivery_address}
                </span>
              </div>
            )}
            {order.custom_delivery_price !== null && order.custom_delivery_price !== undefined && (
              <div className="flex justify-between text-xs sm:text-sm gap-2">
                <span className="text-muted-foreground">Доставка:</span>
                <span className={`font-bold ${order.delivery_price_paid ? 'text-green-600 dark:text-green-400' : 'text-primary'}`}>
                  {order.custom_delivery_price}₽ {order.delivery_price_paid && '✓'}
                </span>
              </div>
            )}
          </div>
          
          {order.items && order.items.length > 0 && (
            <div className="space-y-1.5 sm:space-y-2">
              <div className="text-xs sm:text-sm font-medium">Товары:</div>
              {order.items.filter((i: any) => i.product_name).map((item: any, idx: number) => {
                const hasPartialAvailability = item.is_out_of_stock && item.available_quantity > 0;
                const effectivePrice = item.available_price || item.price;
                const effectiveQuantity = hasPartialAvailability ? item.available_quantity : item.quantity;
                
                return (
                  <div 
                    key={idx} 
                    className={`text-[11px] sm:text-xs p-2 rounded border ${item.is_out_of_stock ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800' : 'bg-muted/30'}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className={`break-words ${item.is_out_of_stock && !hasPartialAvailability ? 'line-through text-muted-foreground' : ''}`}>
                        {item.product_name}
                      </span>
                      {!item.is_out_of_stock && (
                        <span className="font-medium whitespace-nowrap flex-shrink-0">{item.quantity} × {item.price}₽</span>
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
              <div className="space-y-2">
                <div className="flex justify-between items-center pt-2 border-t text-xs sm:text-sm">
                  <span className={order.is_preorder ? 'text-muted-foreground' : 'font-bold'}>Итого:</span>
                  <span className={order.is_preorder ? 'text-muted-foreground line-through' : 'font-bold'}>
                    {order.items
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
                    }₽
                  </span>
                </div>
                {(() => {
                  const totalAmount = order.items
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
                    }, 0);
                  
                  const amountPaid = parseFloat(order.amount_paid || '0');
                  const deliveryPaid = order.delivery_price_paid ? parseFloat(order.custom_delivery_price || '0') : 0;
                  const totalPaid = amountPaid + deliveryPaid;
                  const isFullyPaid = totalPaid >= totalAmount;

                  if (isFullyPaid) {
                    return (
                      <div className="bg-green-50 dark:bg-green-950/20 border border-green-300 dark:border-green-700 rounded p-2">
                        <div className="flex items-center justify-center gap-2">
                          <Icon name="CheckCircle" size={14} className="text-green-700 dark:text-green-300" />
                          <span className="text-green-900 dark:text-green-100 font-semibold text-xs sm:text-sm">Вы оплатили заказ полностью</span>
                        </div>
                      </div>
                    );
                  } else if (order.is_preorder && amountPaid > 0) {
                    return (
                      <div className="space-y-2">
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-300 dark:border-blue-700 rounded p-2">
                          <div className="flex justify-between items-center">
                            <span className="text-blue-900 dark:text-blue-100 font-bold text-xs sm:text-sm">Вы оплатили (предоплата 50%):</span>
                            <span className="text-blue-900 dark:text-blue-100 font-bold text-xs sm:text-sm">{amountPaid.toFixed(2)}₽</span>
                          </div>
                        </div>
                        {order.delivery_price_paid && (
                          <div className="bg-green-50 dark:bg-green-950/20 border border-green-300 dark:border-green-700 rounded p-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Icon name="Truck" size={14} className="text-green-700 dark:text-green-300" />
                                <span className="text-green-900 dark:text-green-100 font-semibold text-xs sm:text-sm">Доставка оплачена:</span>
                              </div>
                              <span className="text-green-900 dark:text-green-100 font-bold text-xs sm:text-sm">{parseFloat(order.custom_delivery_price || '0').toFixed(2)}₽</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          )}
          
          {order.rejection_reason && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-[11px] sm:text-xs text-red-600">
              <span className="font-semibold">Причина:</span> {order.rejection_reason}
            </div>
          )}
          
          {order.status === 'cancelled' && order.cancellation_reason && (
            <div className="p-2 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded text-[11px] sm:text-xs">
              <span className="font-semibold text-orange-700 dark:text-orange-300">
                {order.cancelled_by === 'admin' ? 'Отменён админом' : 'Отменён вами'}:
              </span>
              <span className="text-muted-foreground ml-1">{order.cancellation_reason}</span>
            </div>
          )}
          
          {order.status === 'processing' && order.delivery_price_set_by_admin && order.custom_delivery_price && (
            <div className="p-3 bg-primary/10 border border-primary/30 rounded space-y-2">
              <div className="text-xs sm:text-sm font-medium">
                Стоимость доставки: <span className="text-lg font-bold text-primary">{order.custom_delivery_price}₽</span>
              </div>
              <Button 
                size="sm" 
                className="w-full text-xs sm:text-sm h-9 sm:h-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onPayDelivery(order);
                }}
              >
                <Icon name="CreditCard" size={14} className="mr-1.5" />
                Оплатить доставку
              </Button>
            </div>
          )}
          
          {order.status === 'processing' && order.is_preorder && (
            (() => {
              const secondPaymentAmount = parseFloat(order.second_payment_amount || '0');
              const secondPaymentPaid = order.second_payment_paid;
              const deliveryPaid = order.delivery_paid;
              const deliveryAmount = parseFloat(order.custom_delivery_price || '500');
              
              return (
                <div className="space-y-2">
                  {!secondPaymentPaid && secondPaymentAmount > 0 && (
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-300 dark:border-orange-700 rounded space-y-2">
                      <div className="text-xs sm:text-sm font-medium text-orange-900 dark:text-orange-100">
                        Необходимо доплатить: <span className="text-lg font-bold">{secondPaymentAmount.toFixed(2)}₽</span>
                      </div>
                      <div className="text-[10px] sm:text-xs text-orange-700 dark:text-orange-300">
                        Оплатите оставшиеся 50% стоимости заказа
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full text-xs sm:text-sm h-9 sm:h-10 bg-orange-600 hover:bg-orange-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPayRemaining(order);
                        }}
                      >
                        <Icon name="CreditCard" size={14} className="mr-1.5" />
                        Доплатить за заказ ({secondPaymentAmount.toFixed(2)}₽)
                      </Button>
                    </div>
                  )}
                  

                </div>
              );
            })()
          )}
          
          {order.status === 'pending' && (
            <Button 
              size="sm" 
              variant="destructive"
              className="w-full text-xs sm:text-sm h-9 sm:h-10"
              onClick={(e) => {
                e.stopPropagation();
                onCancel(order.id);
              }}
              disabled={isCancelling}
            >
              <Icon name="X" size={14} className="mr-1.5" />
              {isCancelling ? 'Отмена...' : 'Отменить заказ'}
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default OrderItem;