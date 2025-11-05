import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CourierHeader from '@/components/courier/CourierHeader';
import CourierStats from '@/components/courier/CourierStats';
import OrderCard from '@/components/courier/OrderCard';
import EarningsHistory from '@/components/courier/EarningsHistory';
import AccessDenied from '@/components/courier/AccessDenied';

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
    console.log('CourierPage: checking access, userData:', userData);
    
    if (!userData) {
      console.log('CourierPage: no user data');
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в систему для доступа',
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    console.log('CourierPage: parsed user:', parsedUser);
    console.log('CourierPage: is_courier from localStorage:', parsedUser.is_courier);
    
    try {
      console.log('CourierPage: fetching fresh user data from server...');
      const response = await fetch('https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'user', user_id: parsedUser.id })
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log('CourierPage: server response:', JSON.stringify(data, null, 2));
      
      if (data.user) {
        console.log('CourierPage: fresh user data received');
        console.log('CourierPage: is_courier from server:', data.user.is_courier);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        
        if (!data.user.is_courier) {
          console.log('CourierPage: ACCESS DENIED - is_courier is false');
          setIsLoading(false);
        } else {
          console.log('CourierPage: ACCESS GRANTED - is_courier is true');
          loadData(data.user.id);
        }
      } else {
        console.log('CourierPage: no user in response, using cache');
        setUser(parsedUser);
        if (!parsedUser.is_courier) {
          console.log('CourierPage: ACCESS DENIED (cache)');
          setIsLoading(false);
        } else {
          loadData(parsedUser.id);
        }
      }
    } catch (error) {
      console.error('CourierPage: Failed to fetch user data:', error);
      setUser(parsedUser);
      if (!parsedUser.is_courier) {
        setIsLoading(false);
      } else {
        loadData(parsedUser.id);
      }
    }
  };

  const loadData = async (courierId: number) => {
    try {
      setIsLoading(true);
      
      const availableRes = await fetch('https://functions.poehali.dev/b35bef37-8423-4939-b43b-0fb565cc8853', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'courier_available_orders' })
      });
      const availableData = await availableRes.json();
      if (availableData.success) {
        setAvailableOrders(availableData.orders);
      }
      
      const myOrdersRes = await fetch('https://functions.poehali.dev/b35bef37-8423-4939-b43b-0fb565cc8853', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'courier_my_orders', courier_id: courierId })
      });
      const myOrdersData = await myOrdersRes.json();
      if (myOrdersData.success) {
        setMyOrders(myOrdersData.orders);
      }
      
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
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <CourierHeader userName={user.full_name || user.phone} />
        <CourierStats stats={stats} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available" className="flex items-center gap-2">
              <Icon name="Package" size={16} />
              Доступные ({availableOrders.length})
            </TabsTrigger>
            <TabsTrigger value="my-orders" className="flex items-center gap-2">
              <Icon name="Truck" size={16} />
              Мои заказы ({myOrders.length})
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-2">
              <Icon name="Wallet" size={16} />
              Заработок
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Загрузка заказов...</p>
                </CardContent>
              </Card>
            ) : availableOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Нет доступных заказов</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    type="available"
                    onTakeOrder={takeOrder}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-orders" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Загрузка...</p>
                </CardContent>
              </Card>
            ) : myOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Icon name="Truck" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">У вас нет активных заказов</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    type="in-progress"
                    onCompleteDelivery={completeDelivery}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="earnings">
            <Card>
              <CardContent className="py-6">
                <EarningsHistory earnings={earnings} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}