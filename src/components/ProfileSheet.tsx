import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface User {
  id: number;
  phone: string;
  full_name: string;
  is_admin: boolean;
}

interface Order {
  id: number;
  total_amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  orders: Order[];
  onLogout: () => void;
}

const ProfileSheet = ({ open, onOpenChange, user, orders, onLogout }: ProfileSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Профиль</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div>
            <Label>Телефон</Label>
            <p className="font-medium">{user.phone}</p>
          </div>
          <div>
            <Label>Имя</Label>
            <p className="font-medium">{user.full_name || 'Не указано'}</p>
          </div>
          {user.is_admin && (
            <Badge variant="secondary">Администратор</Badge>
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
      </SheetContent>
    </Sheet>
  );
};

export default ProfileSheet;
