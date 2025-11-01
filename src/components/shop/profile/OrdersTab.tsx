import { useState } from 'react';
import { Order } from '@/types/shop';
import OrderItem from './OrderItem';
import DeliveryPaymentDialog from './DeliveryPaymentDialog';
import SecondPaymentDialog from './SecondPaymentDialog';

interface OrdersTabProps {
  orders: Order[];
  userId: number;
  userBalance: number;
  userEmail?: string;
  onOrderUpdate: () => void;
}

const OrdersTab = ({ orders, userId, userBalance, userEmail, onOrderUpdate }: OrdersTabProps) => {
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [payingDeliveryOrder, setPayingDeliveryOrder] = useState<Order | null>(null);
  const [payingSecondPaymentOrder, setPayingSecondPaymentOrder] = useState<Order | null>(null);

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Вы уверены, что хотите отменить этот заказ?')) return;
    
    setCancellingOrderId(orderId);
    try {
      const response = await fetch('https://functions.poehali.dev/b35bef37-8423-4939-b43b-0fb565cc8853', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel_order',
          order_id: orderId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        onOrderUpdate();
        alert('Заказ успешно отменён. Средства и кэшбэк обновлены.');
      } else {
        alert(data.error || 'Не удалось отменить заказ');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Произошла ошибка при отмене заказа');
    } finally {
      setCancellingOrderId(null);
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6">
      <h3 className="font-semibold text-sm sm:text-base">История заказов</h3>
      {orders.length === 0 ? (
        <p className="text-xs sm:text-sm text-muted-foreground">Заказов пока нет</p>
      ) : (
        <div className="space-y-1.5 sm:space-y-2 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
          {orders.map(order => (
            <OrderItem
              key={order.id}
              order={order}
              isExpanded={expandedOrderId === order.id}
              onToggle={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
              onCancel={handleCancelOrder}
              onPayDelivery={(ord) => setPayingDeliveryOrder(ord)}
              onPayRemaining={(ord) => setPayingSecondPaymentOrder(ord)}
              isCancelling={cancellingOrderId === order.id}
            />
          ))}
        </div>
      )}
      
      <DeliveryPaymentDialog
        order={payingDeliveryOrder}
        userId={userId}
        userBalance={userBalance}
        userEmail={userEmail}
        onClose={() => setPayingDeliveryOrder(null)}
        onSuccess={onOrderUpdate}
      />
      
      <SecondPaymentDialog
        order={payingSecondPaymentOrder}
        userId={userId}
        userBalance={userBalance}
        userEmail={userEmail}
        onClose={() => setPayingSecondPaymentOrder(null)}
        onSuccess={onOrderUpdate}
      />
    </div>
  );
};

export default OrdersTab;