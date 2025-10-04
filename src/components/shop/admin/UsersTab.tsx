import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

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
  onAddBalance: (userId: number, amount: number, description: string) => void;
}

const UsersTab = ({ users, onAddBalance }: UsersTabProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser && amount) {
      onAddBalance(selectedUser.id, parseFloat(amount), description);
      setSelectedUser(null);
      setAmount('');
      setDescription('');
    }
  };

  return (
    <>
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
                  <div className="font-medium flex items-center gap-2">
                    {user.full_name}
                    {user.is_admin && <Icon name="Crown" size={18} className="text-yellow-500" />}
                  </div>
                  <div className="text-sm text-muted-foreground">{user.phone}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Баланс: {Number(user.balance || 0).toFixed(2)}₽ | Кэшбек: {Math.round(Number(user.cashback || 0))}₽
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{new Date(user.created_at).toLocaleDateString()}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedUser(user)}
                  >
                    <Icon name="Wallet" size={16} className="mr-2" />
                    Начислить баланс
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Начисление баланса</DialogTitle>
            <DialogDescription>
              Пополнение баланса для {selectedUser?.full_name} ({selectedUser?.phone})
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Текущий баланс</Label>
              <p className="text-2xl font-bold text-primary">{selectedUser?.balance || 0}₽</p>
            </div>
            <div>
              <Label htmlFor="amount">Сумма пополнения (₽) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Описание операции</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Пополнение баланса администратором"
                rows={2}
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setSelectedUser(null)}>
                Отмена
              </Button>
              <Button type="submit">
                <Icon name="Plus" size={18} className="mr-2" />
                Начислить {amount ? `${amount}₽` : ''}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UsersTab;