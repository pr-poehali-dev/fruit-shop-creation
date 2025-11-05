import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

interface EarningRecord {
  id: number;
  order_id: number;
  amount: number;
  earned_at: string;
  paid_out: boolean;
  paid_out_at?: string;
  delivery_address: string;
}

interface EarningsStats {
  total_deliveries: number;
  total_earned: number;
  paid_out: number;
  pending: number;
}

export default function CourierPage() {
  const [user, setUser] = useState<any>(null);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [stats, setStats] = useState<EarningsStats>({
    total_deliveries: 0,
    total_earned: 0,
    paid_out: 0,
    pending: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const { toast } = useToast();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в систему для доступа',
        variant: 'destructive'
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    
    // Обновляем данные пользователя с сервера
    try {
      const response = await fetch('https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'user', user_id: parsedUser.id })
      });
      
      const data = await response.json();
      if (data.user) {
        // Обновляем localStorage с актуальными данными
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        
        if (!data.user.is_courier) {
          toast({
            title: 'Доступ запрещён',
            description: 'У вас нет прав курьера. Обратитесь к администратору.',
            variant: 'destructive'
          });
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          loadData(data.user.id);
        }
      } else {
        setUser(parsedUser);
        if (!parsedUser.is_courier) {
          toast({
            title: 'Доступ запрещён',
            description: 'У вас нет прав курьера',
            variant: 'destructive'
          });
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          loadData(parsedUser.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setUser(parsedUser);
      if (!parsedUser.is_courier) {
        toast({
          title: 'Доступ запрещён',
          description: 'У вас нет прав курьера',
          variant: 'destructive'
        });
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        loadData(parsedUser.id);
      }
    }
  };

  const loadData = async (courierId: number) => {
    try {
      setIsLoading(true);
      
      // Load available orders
      const availableRes = await fetch('https://functions.poehali.dev/b35bef37-8423-4939-b43b-0fb565cc8853', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'courier_available_orders' })
      });
      const availableData = await availableRes.json();
      if (availableData.success) {
        setAvailableOrders(availableData.orders);
      }
      
      // Load my orders
      const myOrdersRes = await fetch('https://functions.poehali.dev/b35bef37-8423-4939-b43b-0fb565cc8853', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'courier_my_orders', courier_id: courierId })
      });
      const myOrdersData = await myOrdersRes.json();
      if (myOrdersData.success) {
        setMyOrders(myOrdersData.orders);
      }
      
      // Load earnings
      const earningsRes = await fetch('https://functions.poehali.dev/b35bef37-8423-4939-b43b-0fb565cc8853', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'courier_earnings', courier_id: courierId })
      });
      const earningsData = await earningsRes.json();
      if (earningsData.success) {
        setStats(earningsData.stats);
        setEarnings(earningsData.earnings);
      }
    } catch (error) {
      console.error('Failed to load courier data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const takeOrder = async (orderId: number) => {
    if (!user) return;
    
    try {
      const res = await fetch('https://functions.poehali.dev/b35bef37-8423-4939-b43b-0fb565cc8853', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'courier_take_order',
          order_id: orderId,
          courier_id: user.id
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast({
          title: 'Заказ взят!',
          description: 'Заказ назначен вам'
        });
        loadData(user.id);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось взять заказ',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось взять заказ',
        variant: 'destructive'
      });
    }
  };

  const completeDelivery = async (orderId: number) => {
    if (!user) return;
    
    try {
      const res = await fetch('https://functions.poehali.dev/b35bef37-8423-4939-b43b-0fb565cc8853', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'courier_complete_delivery',
          order_id: orderId,
          courier_id: user.id
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast({
          title: 'Доставка завершена!',
          description: `Вы заработали ${data.earned}₽`
        });
        loadData(user.id);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось завершить доставку',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось завершить доставку',
        variant: 'destructive'
      });
    }
  };

  if (!user || !user.is_courier) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="ShieldAlert" size={24} className="text-red-500" />
              Доступ запрещён
            </CardTitle>
            <CardDescription>
              У вас нет прав курьера. Обратитесь к администратору.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Truck" size={28} className="text-green-600" />
              Панель курьера
            </CardTitle>
            <CardDescription>
              Добро пожаловать, {user.full_name || user.phone}!
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Всего доставок</CardDescription>
              <CardTitle className="text-3xl">{stats.total_deliveries}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Заработано</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.total_earned}₽</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>К выплате</CardDescription>
              <CardTitle className="text-3xl text-orange-600">{stats.pending}₽</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Выплачено</CardDescription>
              <CardTitle className="text-3xl text-gray-600">{stats.paid_out}₽</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">
              Доступные ({availableOrders.length})
            </TabsTrigger>
            <TabsTrigger value="my-orders">
              Мои заказы ({myOrders.length})
            </TabsTrigger>
            <TabsTrigger value="earnings">
              История заработка
            </TabsTrigger>
          </TabsList>

          {/* Available Orders */}
          <TabsContent value="available" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                </CardContent>
              </Card>
            ) : availableOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Icon name="Package" size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground">Нет доступных заказов</p>
                </CardContent>
              </Card>
            ) : (
              availableOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Заказ #{order.id}</CardTitle>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        250₽
                      </Badge>
                    </div>
                    <CardDescription>
                      {new Date(order.created_at).toLocaleString('ru-RU')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Icon name="User" size={18} className="text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={18} className="text-gray-500 mt-0.5" />
                      <p className="text-sm">{order.delivery_address}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Icon name="Banknote" size={18} className="text-gray-500" />
                      <p className="text-sm">
                        Сумма: <strong>{order.total_amount}₽</strong>
                        {' • '}
                        {order.payment_method === 'cash' ? 'Наличные' : 
                         order.payment_method === 'card' ? 'Карта' : 'Баланс'}
                      </p>
                    </div>
                    
                    <Button 
                      onClick={() => takeOrder(order.id)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Icon name="CheckCircle" size={18} className="mr-2" />
                      Взять заказ
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* My Orders */}
          <TabsContent value="my-orders" className="space-y-4">
            {myOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Icon name="Inbox" size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground">У вас нет заказов</p>
                </CardContent>
              </Card>
            ) : (
              myOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Заказ #{order.id}</CardTitle>
                      <Badge 
                        variant={order.status === 'выполнен' ? 'default' : 'secondary'}
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      Взят: {new Date(order.courier_assigned_at!).toLocaleString('ru-RU')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Icon name="User" size={18} className="text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={18} className="text-gray-500 mt-0.5" />
                      <p className="text-sm">{order.delivery_address}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Icon name="Banknote" size={18} className="text-gray-500" />
                      <p className="text-sm">
                        Сумма: <strong>{order.total_amount}₽</strong>
                      </p>
                    </div>
                    
                    {order.status !== 'выполнен' && (
                      <Button 
                        onClick={() => completeDelivery(order.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Icon name="PackageCheck" size={18} className="mr-2" />
                        Завершить доставку
                      </Button>
                    )}
                    
                    {order.courier_delivered_at && (
                      <p className="text-xs text-muted-foreground">
                        Завершён: {new Date(order.courier_delivered_at).toLocaleString('ru-RU')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Earnings History */}
          <TabsContent value="earnings" className="space-y-4">
            {earnings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Icon name="Wallet" size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground">История заработка пуста</p>
                </CardContent>
              </Card>
            ) : (
              earnings.map((earning) => (
                <Card key={earning.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">Заказ #{earning.order_id}</p>
                        <p className="text-sm text-muted-foreground">
                          {earning.delivery_address}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(earning.earned_at).toLocaleString('ru-RU')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {earning.amount}₽
                        </p>
                        <Badge 
                          variant={earning.paid_out ? 'default' : 'secondary'}
                          className="mt-1"
                        >
                          {earning.paid_out ? 'Выплачено' : 'К выплате'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}