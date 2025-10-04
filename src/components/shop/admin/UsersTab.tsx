import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
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

interface Transaction {
  id: number;
  user_id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

interface UsersTabProps {
  users: User[];
  onAddBalance: (userId: number, amount: number, description: string) => void;
  onAddCashback: (userId: number, amount: number, description: string) => void;
  onToggleAdmin: (userId: number, isAdmin: boolean) => void;
}

const UsersTab = ({ users, onAddBalance, onAddCashback, onToggleAdmin }: UsersTabProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [operationType, setOperationType] = useState<'balance' | 'cashback'>('balance');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const loadTransactions = async (userId: number) => {
    setLoadingTransactions(true);
    try {
      const response = await fetch(`https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc?action=balance&user_id=${userId}`);
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setOperationType('balance');
    loadTransactions(user.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser && amount) {
      if (operationType === 'balance') {
        onAddBalance(selectedUser.id, parseFloat(amount), description);
      } else {
        onAddCashback(selectedUser.id, parseFloat(amount), description);
      }
      setSelectedUser(null);
      setAmount('');
      setDescription('');
    }
  };

  const handleToggleAdmin = (user: User) => {
    onToggleAdmin(user.id, !user.is_admin);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return 'ArrowDownToLine';
      case 'withdraw': return 'ArrowUpFromLine';
      case 'cashback_deposit': return 'Gift';
      case 'cashback_used': return 'Wallet';
      case 'order_payment': return 'ShoppingCart';
      default: return 'CircleDot';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit': 
      case 'cashback_deposit': 
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
                  <div className="flex flex-col items-center gap-1">
                    <Label className="text-xs text-muted-foreground">Админ</Label>
                    <Switch 
                      checked={user.is_admin} 
                      onCheckedChange={() => handleToggleAdmin(user)}
                    />
                  </div>
                  <Badge variant="outline">{new Date(user.created_at).toLocaleDateString()}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUserClick(user)}
                  >
                    <Icon name="Wallet" size={16} className="mr-2" />
                    Управление
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Управление пользователем</DialogTitle>
            <DialogDescription>
              {selectedUser?.full_name} ({selectedUser?.phone})
            </DialogDescription>
          </DialogHeader>

          <Tabs value={operationType} onValueChange={(v) => setOperationType(v as 'balance' | 'cashback')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="balance">Баланс</TabsTrigger>
              <TabsTrigger value="cashback">Кэшбек</TabsTrigger>
              <TabsTrigger value="history">История</TabsTrigger>
            </TabsList>

            <TabsContent value="balance">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Текущий баланс</Label>
                  <p className="text-2xl font-bold text-primary">{Number(selectedUser?.balance || 0).toFixed(2)}₽</p>
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
            </TabsContent>

            <TabsContent value="cashback">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Текущий кэшбек</Label>
                  <p className="text-2xl font-bold text-green-600">{Math.round(Number(selectedUser?.cashback || 0))}₽</p>
                </div>
                <div>
                  <Label htmlFor="cashback-amount">Сумма кэшбека (₽) *</Label>
                  <Input
                    id="cashback-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cashback-description">Описание операции</Label>
                  <Textarea
                    id="cashback-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Начисление кэшбека администратором"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setSelectedUser(null)}>
                    Отмена
                  </Button>
                  <Button type="submit">
                    <Icon name="Gift" size={18} className="mr-2" />
                    Начислить {amount ? `${amount}₽` : ''}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">История операций</h3>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => selectedUser && loadTransactions(selectedUser.id)}
                    disabled={loadingTransactions}
                  >
                    <Icon name="RefreshCw" size={16} className="mr-2" />
                    Обновить
                  </Button>
                </div>

                {loadingTransactions ? (
                  <p className="text-center text-muted-foreground py-8">Загрузка...</p>
                ) : transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">История операций пуста</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {transactions.map(transaction => (
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
                            {transaction.type.includes('deposit') || transaction.type === 'cashback_used' ? '+' : '-'}
                            {Number(transaction.amount).toFixed(2)}₽
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {transaction.type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UsersTab;