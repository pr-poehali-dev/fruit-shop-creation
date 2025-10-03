import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { User, Order } from '@/types/shop';

interface ProfileContentProps {
  user: User | null;
  orders: Order[];
  onShowAdminPanel: () => void;
  onLogout: () => void;
}

const ProfileContent = ({ user, orders, onShowAdminPanel, onLogout }: ProfileContentProps) => {
  return (
    <div className="mt-6 space-y-4">
      <div>
        <Label>Телефон</Label>
        <p className="font-medium">{user?.phone}</p>
      </div>
      <div>
        <Label>Имя</Label>
        <p className="font-medium">{user?.full_name || 'Не указано'}</p>
      </div>
      
      <Separator />
      
      <div className="bg-muted p-4 rounded-lg space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Баланс:</span>
          <span className="text-lg font-bold">{user?.balance?.toFixed(2) || '0.00'}₽</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Кэшбек:</span>
          <span className="text-lg font-semibold text-green-600">{user?.cashback?.toFixed(2) || '0.00'}₽</span>
        </div>
        {user && user.cashback && user.cashback > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Кэшбек 5% начисляется при оплате заказа балансом
          </p>
        )}
      </div>
      
      {user?.is_admin && (
        <>
          <Badge variant="secondary">Администратор</Badge>
          <Button className="w-full" variant="default" onClick={onShowAdminPanel}>
            <Icon name="Settings" size={18} className="mr-2" />
            Панель администратора
          </Button>
        </>
      )}
      <Separator />
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
                  <Badge variant="outline" className="mt-2">{order.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Button variant="destructive" className="w-full" onClick={onLogout}>Выйти</Button>
    </div>
  );
};

export default ProfileContent;
