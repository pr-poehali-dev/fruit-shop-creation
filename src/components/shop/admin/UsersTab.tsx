import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface User {
  id: number;
  phone: string;
  full_name: string;
  is_admin: boolean;
  balance?: number;
  cashback?: number;
  created_at: string;
}

interface UsersTabProps {
  users: User[];
}

const UsersTab = ({ users }: UsersTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Пользователи</CardTitle>
        <CardDescription>Список всех зарегистрированных пользователей</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {users.map(user => (
            <div key={user.id} className="flex justify-between items-center p-4 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{user.full_name}</div>
                <div className="text-sm text-muted-foreground">{user.phone}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Баланс: {user.balance || 0}₽ | Кэшбек: {user.cashback || 0}₽
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user.is_admin && <Badge>Админ</Badge>}
                <Badge variant="outline">{new Date(user.created_at).toLocaleDateString()}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UsersTab;
