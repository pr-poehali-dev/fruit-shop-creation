import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface OrdersTabProps {
  orders: any[];
  onUpdateStatus: (orderId: number, status: string, rejectionReason?: string) => void;
  onDeleteOrder: (orderId: number) => void;
  onUpdateItemStock?: (orderId: number, itemId: number, isOutOfStock: boolean) => void;
  onUpdateItemAvailability?: (itemId: number, availableQuantity: number, availablePrice?: number) => void;
}

const statusLabels: Record<string, string> = {
  'pending': '⏳ Ожидает',
  'processing': '📦 В обработке',
  'delivered': '✅ Доставлен',
  'rejected': '❌ Отклонён',
  'cancelled': '🚫 Отменён'
};

const OrdersTab = ({ orders, onUpdateStatus, onDeleteOrder, onUpdateItemStock, onUpdateItemAvailability }: OrdersTabProps) => {
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [viewingOrder, setViewingOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [itemAvailability, setItemAvailability] = useState<Record<number, { quantity: number; price: string }>>({});

  const openStatusDialog = (order: any) => {
    setEditingOrder(order);
    setNewStatus(order.status);
    setRejectionReason(order.rejection_reason || '');
  };

  const handleSaveStatus = () => {
    if (editingOrder) {
      onUpdateStatus(
        editingOrder.id, 
        newStatus, 
        newStatus === 'rejected' ? rejectionReason : undefined
      );
      setEditingOrder(null);
      setRejectionReason('');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'rejected': return 'destructive';
      case 'cancelled': return 'destructive';
      case 'shipped': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Заказы</CardTitle>
          <CardDescription>Все заказы пользователей</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="p-3 sm:p-4 border rounded-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm sm:text-base">Заказ #{order.id}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {order.user_name} ({order.user_phone})
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:text-right">
                    <div className="font-bold text-base sm:text-lg">
                      {order.items ? 
                        order.items
                          .filter((i: any) => i.product_name && !i.is_out_of_stock)
                          .reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0)
                        : order.total_amount
                      }₽
                    </div>
                    <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs">
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div>
                    <div className="font-medium">Способ оплаты:</div>
                    <div className="text-muted-foreground">
                      {order.payment_method === 'balance' ? 'Баланс' : order.payment_method === 'card' ? 'Карта' : 'При получении'}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Доставка:</div>
                    <div className="text-muted-foreground">
                      {order.delivery_type === 'delivery' ? '🚚 Доставка' : '🏪 Самовывоз'}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="font-medium">Адрес:</div>
                    <div className="text-muted-foreground break-words">{order.delivery_address}</div>
                  </div>
                </div>

                {order.rejection_reason && (
                  <div className="text-sm bg-destructive/10 p-2 rounded">
                    <div className="font-medium text-destructive">Причина отказа:</div>
                    <div className="text-muted-foreground">{order.rejection_reason}</div>
                  </div>
                )}

                {order.status === 'cancelled' && order.cancellation_reason && (
                  <div className="text-sm bg-orange-50 dark:bg-orange-950/20 p-2 rounded border border-orange-200 dark:border-orange-800">
                    <div className="font-medium text-orange-700 dark:text-orange-300">
                      Отменён {order.cancelled_by === 'admin' ? '(администратором)' : '(пользователем)'}:
                    </div>
                    <div className="text-muted-foreground">{order.cancellation_reason}</div>
                  </div>
                )}

                {order.items && order.items.length > 0 && (
                  <div className="text-xs sm:text-sm">
                    <div className="font-medium mb-1">
                      Товары ({order.items.filter((i: any) => i.product_name).length})
                      {order.items.some((i: any) => i.is_out_of_stock) && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          <Icon name="AlertCircle" size={12} className="mr-1" />
                          Есть недоступные
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setViewingOrder(order)}
                      className="text-xs h-7 px-2"
                    >
                      <Icon name="Package" size={14} className="mr-1" />
                      Показать детали
                    </Button>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => openStatusDialog(order)}
                    className="text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    <Icon name="Edit" size={14} className="mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Изменить статус</span>
                    <span className="sm:hidden">Статус</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => onDeleteOrder(order.id)}
                    className="text-xs sm:text-sm"
                  >
                    <Icon name="Trash2" size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingOrder} onOpenChange={(open) => !open && setEditingOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить статус заказа #{editingOrder?.id}</DialogTitle>
            <DialogDescription>Обновите статус обработки заказа</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Статус заказа</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">⏳ Ожидает обработки</SelectItem>
                  <SelectItem value="processing">📦 В обработке</SelectItem>
                  <SelectItem value="delivered">✅ Доставлен</SelectItem>
                  <SelectItem value="rejected">❌ Отклонён</SelectItem>
                  <SelectItem value="cancelled">🚫 Отменён (админ)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(newStatus === 'rejected' || newStatus === 'cancelled') && (
              <div>
                <Label>{newStatus === 'rejected' ? 'Причина отказа *' : 'Причина отмены'}</Label>
                <Textarea 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={newStatus === 'rejected' ? 'Укажите причину отказа в заказе' : 'Укажите причину отмены заказа (необязательно)'}
                  rows={3}
                  required={newStatus === 'rejected'}
                />
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingOrder(null)}>
                Отмена
              </Button>
              <Button 
                onClick={handleSaveStatus}
                disabled={newStatus === 'rejected' && !rejectionReason.trim()}
              >
                <Icon name="Save" size={18} className="mr-2" />
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingOrder} onOpenChange={(open) => !open && setViewingOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Заказ #{viewingOrder?.id} - Детали</DialogTitle>
            <DialogDescription>
              Управление наличием товаров в заказе
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-medium text-muted-foreground">Клиент</div>
                <div>{viewingOrder?.user_name}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Телефон</div>
                <div>{viewingOrder?.user_phone}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Сумма</div>
                <div className="font-bold text-lg">
                  {viewingOrder?.items ? 
                    viewingOrder.items
                      .filter((i: any) => i.product_name && !i.is_out_of_stock)
                      .reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0)
                    : viewingOrder?.total_amount
                  }₽
                </div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Статус</div>
                <Badge variant={getStatusBadgeVariant(viewingOrder?.status)}>
                  {statusLabels[viewingOrder?.status] || viewingOrder?.status}
                </Badge>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="font-medium mb-3">Товары в заказе:</div>
              <div className="space-y-2">
                {viewingOrder?.items?.filter((i: any) => i.product_name).map((item: any, idx: number) => (
                  <div 
                    key={idx} 
                    className={`p-3 border rounded-lg ${item.is_out_of_stock ? 'bg-destructive/5 border-destructive/20' : ''}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Заказано: {item.quantity} шт. × {item.price}₽ = {item.price * item.quantity}₽
                          </div>
                        </div>
                        {onUpdateItemStock && (
                          <Button
                            size="sm"
                            variant={item.is_out_of_stock ? "outline" : "destructive"}
                            onClick={() => {
                              const newOutOfStockStatus = !item.is_out_of_stock;
                              onUpdateItemStock(viewingOrder.id, item.id, newOutOfStockStatus);
                              const updatedItems = viewingOrder.items.map((i: any) => 
                                i.id === item.id ? {...i, is_out_of_stock: newOutOfStockStatus} : i
                              );
                              const newTotal = updatedItems
                                .filter((i: any) => !i.is_out_of_stock)
                                .reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0);
                              setViewingOrder({
                                ...viewingOrder,
                                items: updatedItems,
                                total_amount: newTotal
                              });
                            }}
                            className="text-xs"
                          >
                            <Icon name={item.is_out_of_stock ? "Check" : "X"} size={14} className="mr-1" />
                            {item.is_out_of_stock ? 'Есть' : 'Нет'}
                          </Button>
                        )}
                      </div>

                      {item.is_out_of_stock && (
                        <div className="space-y-2 pt-2 border-t">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Есть в наличии (шт)</Label>
                              <Input
                                type="number"
                                min="0"
                                max={item.quantity}
                                placeholder="0"
                                className="h-8 text-sm"
                                value={itemAvailability[item.id]?.quantity ?? item.available_quantity ?? 0}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  setItemAvailability(prev => ({
                                    ...prev,
                                    [item.id]: {
                                      quantity: value,
                                      price: prev[item.id]?.price ?? item.available_price ?? item.price
                                    }
                                  }));
                                }}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Цена (₽)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder={item.price}
                                className="h-8 text-sm"
                                value={itemAvailability[item.id]?.price ?? item.available_price ?? ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setItemAvailability(prev => ({
                                    ...prev,
                                    [item.id]: {
                                      quantity: prev[item.id]?.quantity ?? item.available_quantity ?? 0,
                                      price: value
                                    }
                                  }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <Icon name="Info" size={12} className="inline mr-1" />
                            Укажите количество, если товар есть частично, или новую цену
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs"
                            onClick={() => {
                              const availability = itemAvailability[item.id];
                              if (availability && onUpdateItemAvailability) {
                                const price = availability.price ? parseFloat(availability.price) : undefined;
                                onUpdateItemAvailability(item.id, availability.quantity, price);
                                alert('Данные о наличии сохранены');
                              }
                            }}
                          >
                            <Icon name="Save" size={14} className="mr-1" />
                            Сохранить наличие
                          </Button>
                        </div>
                      )}

                      {item.is_out_of_stock && (
                        <div className="text-xs text-destructive flex items-center gap-1">
                          <Icon name="AlertCircle" size={12} />
                          Нет в наличии в нужном количестве
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-3 border-t font-bold">
                <span>Итого к оплате:</span>
                <span className="text-lg">
                  {viewingOrder?.items ? 
                    viewingOrder.items
                      .filter((i: any) => i.product_name && !i.is_out_of_stock)
                      .reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0)
                    : viewingOrder?.total_amount
                  }₽
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setViewingOrder(null)}>
                Закрыть
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrdersTab;