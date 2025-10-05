import { useState, useEffect } from 'react';
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
import BanUserTab from './BanUserTab';

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

interface LoyaltyCard {
  id: number;
  card_number: string;
  qr_code: string;
  is_active: boolean;
  purchased_at: string;
}

interface UsersTabProps {
  users: User[];
  onAddBalance: (userId: number, amount: number, description: string) => void;
  onAddCashback: (userId: number, amount: number, description: string) => void;
  onToggleAdmin: (userId: number, isAdmin: boolean) => void;
  onIssueLoyaltyCard: (userId: number) => Promise<void>;
}

const UsersTab = ({ users, onAddBalance, onAddCashback, onToggleAdmin, onIssueLoyaltyCard }: UsersTabProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [operationType, setOperationType] = useState<'balance' | 'cashback' | 'loyalty'>('balance');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loyaltyCard, setLoyaltyCard] = useState<LoyaltyCard | null>(null);
  const [loadingLoyalty, setLoadingLoyalty] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      const updatedUser = users.find(u => u.id === selectedUser.id);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    }
  }, [users]);

  const loadTransactions = async (userId: number) => {
    try {
      setLoadingTransactions(true);
      const response = await fetch(`https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc?action=balance&user_id=${userId}`);
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const loadLoyaltyCard = async (userId: number) => {
    setLoadingLoyalty(true);
    try {
      const response = await fetch(`https://functions.poehali.dev/ed127250-fe9d-4c7e-9a93-fb8b7fdc038a?user_id=${userId}`);
      const data = await response.json();
      setLoyaltyCard(data.card || null);
    } catch (error) {
      console.error('Error loading loyalty card:', error);
      setLoyaltyCard(null);
    } finally {
      setLoadingLoyalty(false);
    }
  };

  const handleRevokeLoyaltyCard = async () => {
    if (!selectedUser || !loyaltyCard) return;

    if (!confirm(`Вы уверены, что хотите забрать карту лояльности у ${selectedUser.full_name}?`)) {
      return;
    }

    try {
      const response = await fetch(`https://functions.poehali.dev/ed127250-fe9d-4c7e-9a93-fb8b7fdc038a`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: selectedUser.id })
      });

      const data = await response.json();

      if (data.success) {
        setLoyaltyCard(null);
        alert('Карта лояльности успешно отозвана');
      } else {
        alert(data.error || 'Не удалось отозвать карту');
      }
    } catch (error) {
      console.error('Error revoking loyalty card:', error);
      alert('Ошибка при отзыве карты');
    }
  };

  const handleIssueLoyaltyCard = async () => {
    if (!selectedUser) return;
    
    if (!confirm(`Выдать карту лояльности пользователю ${selectedUser.full_name} без выполнения условий?`)) {
      return;
    }

    try {
      await onIssueLoyaltyCard(selectedUser.id);
      await loadLoyaltyCard(selectedUser.id);
      alert('Карта лояльности успешно выдана!');
    } catch (error) {
      console.error('Error issuing loyalty card:', error);
      alert('Ошибка при выдаче карты');
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setOperationType('balance');
    loadTransactions(user.id);
    loadLoyaltyCard(user.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser && amount) {
      if (operationType === 'balance') {
        await onAddBalance(selectedUser.id, parseFloat(amount), description);
      } else {
        await onAddCashback(selectedUser.id, parseFloat(amount), description);
      }
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Пользователи</CardTitle>
          <CardDescription>Список всех зарегистрированных пользователей</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map(user => (
              <div key={user.id} className="border rounded-lg overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium flex items-center gap-2 mb-1">
                      {user.full_name}
                      {user.is_admin && <Icon name="Crown" size={16} className="text-yellow-500 flex-shrink-0" />}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{user.phone}</div>
                    <div className="flex gap-3 mt-2">
                      <div className="flex items-center gap-1 text-xs">
                        <Icon name="Wallet" size={14} className="text-blue-500" />
                        <span className="font-medium">{Number(user.balance || 0).toFixed(0)}₽</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Icon name="Gift" size={14} className="text-green-500" />
                        <span className="font-medium">{Math.round(Number(user.cashback || 0))}₽</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Icon name="Calendar" size={14} />
                        <span>{new Date(user.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <div className="flex items-center gap-2 text-xs">
                      <Label className="text-muted-foreground">Админ</Label>
                      <Switch 
                        checked={user.is_admin} 
                        onCheckedChange={() => handleToggleAdmin(user)}
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUserClick(user)}
                      className="w-full sm:w-auto"
                    >
                      <Icon name="Settings" size={16} className="sm:mr-2" />
                      <span className="hidden sm:inline">Управление</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Управление пользователем</DialogTitle>
            <DialogDescription>
              {selectedUser?.full_name} ({selectedUser?.phone})
            </DialogDescription>
          </DialogHeader>

          <Tabs value={operationType} onValueChange={(v) => setOperationType(v as 'balance' | 'cashback' | 'loyalty')}>
            <TabsList className="grid w-full grid-cols-5 h-auto">
              <TabsTrigger value="balance" className="flex flex-col items-center gap-1 py-2 text-xs">
                <Icon name="Wallet" size={16} />
                <span className="hidden sm:inline">Баланс</span>
              </TabsTrigger>
              <TabsTrigger value="cashback" className="flex flex-col items-center gap-1 py-2 text-xs">
                <Icon name="Gift" size={16} />
                <span className="hidden sm:inline">Кэшбек</span>
              </TabsTrigger>
              <TabsTrigger value="loyalty" className="flex flex-col items-center gap-1 py-2 text-xs">
                <Icon name="CreditCard" size={16} />
                <span className="hidden sm:inline">Карта</span>
              </TabsTrigger>
              <TabsTrigger value="ban" className="flex flex-col items-center gap-1 py-2 text-xs">
                <Icon name="Ban" size={16} />
                <span className="hidden sm:inline">Бан</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex flex-col items-center gap-1 py-2 text-xs">
                <Icon name="Clock" size={16} />
                <span className="hidden sm:inline">История</span>
              </TabsTrigger>
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
                <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setSelectedUser(null)} className="w-full sm:w-auto">
                    Отмена
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">
                    <Icon name="Plus" size={18} className="mr-2" />
                    Начислить {amount ? `${amount}₽` : ''}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="cashback">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Текущий кэшбэк</Label>
                  <p className="text-2xl font-bold text-green-600">{Math.round(Number(selectedUser?.cashback || 0))}₽</p>
                </div>
                <div>
                  <Label htmlFor="cashback-amount">Сумма кэшбэка (₽) *</Label>
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
                    placeholder="Начисление кэшбэка администратором"
                    rows={2}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setSelectedUser(null)} className="w-full sm:w-auto">
                    Отмена
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">
                    <Icon name="Gift" size={18} className="mr-2" />
                    Начислить {amount ? `${amount}₽` : ''}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="loyalty">
              <div className="space-y-4">
                <h3 className="font-semibold">Карта лояльности</h3>
                {loadingLoyalty ? (
                  <p className="text-center text-muted-foreground py-8">Загрузка...</p>
                ) : loyaltyCard ? (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Номер карты</p>
                          <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{loyaltyCard.card_number}</p>
                        </div>
                        {loyaltyCard.is_active ? (
                          <Badge className="bg-green-500">Активна</Badge>
                        ) : (
                          <Badge variant="destructive">Отозвана</Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Выдана:</span>
                          <span className="font-medium">
                            {new Date(loyaltyCard.purchased_at).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">QR-код:</span>
                          <span className="font-mono text-xs">{loyaltyCard.qr_code.substring(0, 30)}...</span>
                        </div>
                      </div>
                    </div>

                    {loyaltyCard.is_active && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                        <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                          <Icon name="AlertTriangle" size={18} />
                          Опасная зона
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Отзыв карты лояльности деактивирует её. Пользователь потеряет доступ к кэшбэку по этой карте.
                        </p>
                        <Button 
                          variant="destructive" 
                          onClick={handleRevokeLoyaltyCard}
                          className="w-full"
                        >
                          <Icon name="Ban" size={18} className="mr-2" />
                          Забрать карту лояльности
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg space-y-4">
                    <Icon name="CreditCard" size={48} className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">У пользователя нет карты лояльности</p>
                    <Button onClick={handleIssueLoyaltyCard} className="bg-purple-600 hover:bg-purple-700">
                      <Icon name="Plus" size={18} className="mr-2" />
                      Выдать карту администратором
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ban">
              <BanUserTab userId={selectedUser?.id || 0} userName={selectedUser?.full_name || ''} />
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

                {transactions.length === 0 && !loadingTransactions ? (
                  <p className="text-center text-muted-foreground py-8">История операций пуста</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto relative">
                    {loadingTransactions && (
                      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                        <Icon name="Loader2" size={24} className="animate-spin text-muted-foreground" />
                      </div>
                    )}
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
                            {(transaction.type.includes('deposit') || transaction.type === 'cashback_used') ? '+' : '-'}
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