import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface OrdersTabProps {
  orders: any[];
  onUpdateStatus: (orderId: number, status: string, rejectionReason?: string) => void;
  onDeleteOrder: (orderId: number) => void;
}

const statusLabels: Record<string, string> = {
  'pending': '⏳ Ожидает',
  'processing': '📦 В обработке',
  'delivered': '✅ Доставлен',
  'rejected': '❌ Отклонён'
};

const OrdersTab = ({ orders, onUpdateStatus, onDeleteOrder }: OrdersTabProps) => {
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

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
                    <div className="font-bold text-base sm:text-lg">{order.total_amount}₽</div>
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
                    <div className="font-medium">Адрес доставки:</div>
                    <div className="text-muted-foreground break-words">{order.delivery_address}</div>
                  </div>
                </div>

                {order.rejection_reason && (
                  <div className="text-sm bg-destructive/10 p-2 rounded">
                    <div className="font-medium text-destructive">Причина отказа:</div>
                    <div className="text-muted-foreground">{order.rejection_reason}</div>
                  </div>
                )}

                {order.items && order.items.length > 0 && (
                  <div className="text-xs sm:text-sm">
                    <div className="font-medium">Товары:</div>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      {order.items.filter((i: any) => i.product_name).map((item: any, idx: number) => (
                        <li key={idx} className="break-words">
                          {item.product_name} x{item.quantity} = {item.price * item.quantity}₽
                        </li>
                      ))}
                    </ul>
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
                </SelectContent>
              </Select>
            </div>

            {newStatus === 'rejected' && (
              <div>
                <Label>Причина отказа *</Label>
                <Textarea 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Укажите причину отказа в заказе"
                  rows={3}
                  required
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
    </>
  );
};

export default OrdersTab;