import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { User, Order } from '@/types/shop';
import UserTickets from './UserTickets';
import LoyaltyCard from './LoyaltyCard';
import CashbackExchange from './CashbackExchange';

interface Transaction {
  id: number;
  user_id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

interface ProfileContentProps {
  user: User | null;
  orders: Order[];
  onShowAdminPanel: () => void;
  onLogout: () => void;
  onBalanceUpdate: () => void;
  scrollToSupport?: boolean;
}

const ProfileContent = ({ user, orders, onShowAdminPanel, onLogout, onBalanceUpdate, scrollToSupport = false }: ProfileContentProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);
  const supportRef = useRef<HTMLDivElement>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const avatarEmojis = ['👤', '😊', '😎', '🤓', '🥳', '😇', '🤠', '🧑‍💻', '👨‍💼', '👩‍💼', '🦸', '🦹', '🧙', '🧛', '🧜', '🧚'];

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  useEffect(() => {
    if (scrollToSupport && supportRef.current) {
      setTimeout(() => {
        supportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [scrollToSupport]);

  const loadTransactions = async () => {
    if (!user) return;
    
    setLoadingTransactions(true);
    try {
      const response = await fetch(`https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc?action=balance&user_id=${user.id}`);
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleUpdateAvatar = async (avatar: string) => {
    if (!user) return;

    try {
      const response = await fetch('https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_avatar',
          user_id: user.id,
          avatar: avatar
        })
      });

      const data = await response.json();

      if (data.success) {
        const updatedUser = { ...user, avatar: data.avatar };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  };

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
        const userResponse = await fetch(`https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc?action=user&user_id=${user.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const userData = await userResponse.json();
        if (userData.user) {
          localStorage.setItem('user', JSON.stringify(userData.user));
        }
        alert('Заказ успешно отменён. Средства и кэшбек обновлены.');
        window.location.reload();
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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return 'ArrowDownToLine';
      case 'withdraw': return 'ArrowUpFromLine';
      case 'cashback_deposit': 
      case 'cashback_earned': return 'Gift';
      case 'cashback_used': return 'Wallet';
      case 'cashback_exchange': return 'ArrowLeftRight';
      case 'cashback_cancelled': return 'XCircle';
      case 'purchase':
      case 'order_payment': return 'ShoppingCart';
      default: return 'CircleDot';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit': 
      case 'cashback_deposit': 
      case 'cashback_earned':
      case 'cashback_used': 
      case 'cashback_exchange':
        return 'text-green-600';
      case 'withdraw':
      case 'order_payment':
      case 'purchase':
      case 'cashback_cancelled':
        return 'text-red-600';
      default: 
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="text-center pb-4">
        <div 
          className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors relative group"
          onClick={() => setShowAvatarPicker(!showAvatarPicker)}
        >
          {user?.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('/')) ? (
            <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-4xl">{user?.avatar || '👤'}</span>
          )}
          <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Icon name="Camera" size={24} className="text-white" />
          </div>
        </div>
        {showAvatarPicker && (
          <Card className="p-4 mb-4">
            <div className="space-y-3">
              <div className="grid grid-cols-8 gap-2">
                {avatarEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      handleUpdateAvatar(emoji);
                      setShowAvatarPicker(false);
                    }}
                    className="text-3xl hover:scale-125 transition-transform cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <Separator />
              <div className="flex gap-2">
                <Input
                  placeholder="URL изображения"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (customAvatarUrl) {
                      handleUpdateAvatar(customAvatarUrl);
                      setShowAvatarPicker(false);
                      setCustomAvatarUrl('');
                    }
                  }}
                >
                  OK
                </Button>
              </div>
            </div>
          </Card>
        )}
        <h3 className="text-xl font-semibold">{user?.full_name || 'Пользователь'}</h3>
        <p className="text-sm text-muted-foreground">{user?.phone}</p>
        <Badge variant={user?.is_admin ? 'default' : 'secondary'} className="mt-2">
          {user?.is_admin ? (
            <span className="flex items-center gap-1">
              <span className="text-yellow-400">👑</span> 
              Администратор
            </span>
          ) : (
            'Пользователь'
          )}
        </Badge>
      </div>
      
      <Separator />
      
      <div className="bg-muted p-4 rounded-lg space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Баланс:</span>
          <span className="text-lg font-bold">{user?.balance?.toFixed(2) || '0.00'}₽</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Кэшбек:</span>
          <span className="text-lg font-semibold text-green-600">{user?.cashback ? user.cashback.toFixed(0) : '0'}₽</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Кэшбек 5% начисляется при оплате заказа балансом
        </p>
      </div>
      
      {user?.is_admin && (
        <>
          <Button className="w-full" variant="default" onClick={onShowAdminPanel}>
            <Icon name="Settings" size={18} className="mr-2" />
            Панель администратора
          </Button>
          <Separator />
        </>
      )}

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-4 gap-1">
          <TabsTrigger value="orders" className="text-xs sm:text-sm px-1 sm:px-2">Заказы</TabsTrigger>
          <TabsTrigger value="cashback" className="text-xs sm:text-sm px-1 sm:px-2">Обмен</TabsTrigger>
          <TabsTrigger value="loyalty" className="text-xs sm:text-sm px-1 sm:px-2">Карта</TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs sm:text-sm px-1 sm:px-2">История</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-3 mt-6">
          <h3 className="font-semibold">История заказов</h3>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Заказов пока нет</p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {orders.map(order => (
                <Card key={order.id} className="border">
                  <CardHeader 
                    className="pb-3 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon 
                          name={expandedOrderId === order.id ? "ChevronDown" : "ChevronRight"} 
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
                              .filter((i: any) => i.product_name && !i.is_out_of_stock)
                              .reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0)
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
                  
                  {expandedOrderId === order.id && (
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
                          {order.items.filter((i: any) => i.product_name).map((item: any, idx: number) => (
                            <div 
                              key={idx} 
                              className={`text-xs p-2 rounded border ${item.is_out_of_stock ? 'bg-destructive/5 border-destructive/20' : 'bg-muted/30'}`}
                            >
                              <div className="flex justify-between items-start">
                                <span className={item.is_out_of_stock ? 'line-through text-muted-foreground' : ''}>
                                  {item.product_name}
                                </span>
                                {!item.is_out_of_stock && (
                                  <span className="font-medium">{item.quantity} × {item.price}₽</span>
                                )}
                              </div>
                              {item.is_out_of_stock && (
                                <div className="text-destructive mt-1 flex items-center gap-1">
                                  <Icon name="AlertCircle" size={12} />
                                  Товар отсутствует в наличии
                                </div>
                              )}
                            </div>
                          ))}
                          <div className="flex justify-between items-center pt-2 border-t text-sm font-bold">
                            <span>Итого к оплате:</span>
                            <span>
                              {order.items
                                .filter((i: any) => i.product_name && !i.is_out_of_stock)
                                .reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0)
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
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingOrderId === order.id}
                        >
                          <Icon name="X" size={14} className="mr-1" />
                          {cancellingOrderId === order.id ? 'Отмена...' : 'Отменить заказ'}
                        </Button>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cashback" className="space-y-3 mt-6">
          {user && (
            <CashbackExchange
              userCashback={user.cashback || 0}
              userId={user.id}
              onExchangeSuccess={() => {
                loadTransactions();
                onBalanceUpdate();
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-3 mt-6">
          <h3 className="font-semibold">Карта лояльности</h3>
          {user && (
            <LoyaltyCard 
              userId={user.id} 
              userBalance={user.balance || 0}
              onBalanceUpdate={onBalanceUpdate}
            />
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-3 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">История операций</h3>
            <Button 
              size="sm" 
              variant="outline"
              onClick={loadTransactions}
              disabled={loadingTransactions}
            >
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Обновить
            </Button>
          </div>
          
          {loadingTransactions ? (
            <p className="text-center text-muted-foreground py-4">Загрузка...</p>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">История операций пуста</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {transactions.slice(0, 20).map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon 
                      name={getTransactionIcon(transaction.type)} 
                      size={20} 
                      className={getTransactionColor(transaction.type)}
                    />
                    <div>
                      <p className="text-sm font-medium">{transaction.description || 'Операция'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${getTransactionColor(transaction.type)}`}>
                      {(transaction.type.includes('deposit') || transaction.type === 'cashback_used') ? '+' : '-'}
                      {Number(transaction.amount).toFixed(2)}₽
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {transaction.type === 'deposit' && 'Пополнение'}
                      {transaction.type === 'withdraw' && 'Списание'}
                      {transaction.type === 'cashback_deposit' && 'Кэшбек'}
                      {transaction.type === 'cashback_earned' && 'Кэшбек'}
                      {transaction.type === 'cashback_used' && 'Использование кэшбэка'}
                      {transaction.type === 'order_payment' && 'Оплата заказа'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <Separator />
      
      <div ref={supportRef}>
        <UserTickets user={user} />
      </div>
      
      <Separator className="my-4" />
      
      <Button variant="destructive" className="w-full" onClick={onLogout}>
        <Icon name="LogOut" size={18} className="mr-2" />
        Выйти
      </Button>
    </div>
  );
};

export default ProfileContent;