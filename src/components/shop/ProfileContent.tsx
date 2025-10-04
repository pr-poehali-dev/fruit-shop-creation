import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { User, Order } from '@/types/shop';
import UserTickets from './UserTickets';
import LoyaltyCard from './LoyaltyCard';

interface ProfileContentProps {
  user: User | null;
  orders: Order[];
  onShowAdminPanel: () => void;
  onLogout: () => void;
  onBalanceUpdate: () => void;
}

const ProfileContent = ({ user, orders, onShowAdminPanel, onLogout, onBalanceUpdate }: ProfileContentProps) => {
  return (
    <div className="mt-6 space-y-4">
      <div className="text-center pb-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center">
          <Icon name="User" size={40} className="text-primary" />
        </div>
        <h3 className="text-xl font-semibold">{user?.full_name || 'Пользователь'}</h3>
        <p className="text-sm text-muted-foreground">{user?.phone}</p>
        <Badge variant={user?.is_admin ? 'default' : 'secondary'} className="mt-2">
          {user?.is_admin ? 'Администратор' : 'Пользователь'}
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
      <div>
        <h3 className="font-semibold mb-3">История заказов</h3>
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
      </div>
      
      <Separator />
      
      <div>
        <h3 className="font-semibold mb-3">Карта лояльности</h3>
        {user && (
          <LoyaltyCard 
            userId={user.id} 
            userBalance={user.balance || 0}
            onBalanceUpdate={onBalanceUpdate}
          />
        )}
      </div>
      
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