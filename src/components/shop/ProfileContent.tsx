import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { User, Order } from '@/types/shop';
import UserTickets from './UserTickets';
import LoyaltyCard from './LoyaltyCard';

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
}

const ProfileContent = ({ user, orders, onShowAdminPanel, onLogout, onBalanceUpdate }: ProfileContentProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return 'ArrowDownToLine';
      case 'withdraw': return 'ArrowUpFromLine';
      case 'cashback_deposit': 
      case 'cashback_earned': return 'Gift';
      case 'cashback_used': return 'Wallet';
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
        return 'text-green-600';
      case 'withdraw':
      case 'order_payment':
        return 'text-red-600';
      default: 
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="text-center pb-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center">
          <Icon name="User" size={40} className="text-primary" />
        </div>
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
          <span className="text-lg font-semibold text-green-600">{user?.cashback?.toFixed(0) || '0'}₽</span>
        </div>
        {user && user.cashback && user.cashback > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Кэшбек 5% начисляется при оплате заказа балансом
          </p>
        )}
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Заказы</TabsTrigger>
          <TabsTrigger value="loyalty">Лояльность</TabsTrigger>
          <TabsTrigger value="transactions">Операции</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-3 mt-4">
          <h3 className="font-semibold">История заказов</h3>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Заказов пока нет</p>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <Card key={order.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Заказ #{order.id}</CardTitle>
                    <CardDescription className="text-xs">
                      {new Date(order.created_at).toLocaleDateString('ru-RU')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">{order.total_amount} ₽</p>
                    <Badge variant="outline" className="mt-2">
                      {order.status === 'pending' && '⏳ Ожидает обработки'}
                      {order.status === 'processing' && '📦 В обработке'}
                      {order.status === 'delivered' && '✅ Доставлен'}
                      {order.status === 'rejected' && '❌ Отклонён'}
                    </Badge>
                    {order.rejection_reason && (
                      <p className="text-xs text-red-600 mt-2">Причина: {order.rejection_reason}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-3 mt-4">
          <h3 className="font-semibold">Карта лояльности</h3>
          {user && (
            <LoyaltyCard 
              userId={user.id} 
              userBalance={user.balance || 0}
              onBalanceUpdate={onBalanceUpdate}
            />
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-3 mt-4">
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
                      {transaction.type === 'cashback_used' && 'Использование кэшбека'}
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
      
      <UserTickets user={user} />
      
      <Separator className="my-4" />
      
      <Button variant="destructive" className="w-full" onClick={onLogout}>
        <Icon name="LogOut" size={18} className="mr-2" />
        Выйти
      </Button>
    </div>
  );
};

export default ProfileContent;
