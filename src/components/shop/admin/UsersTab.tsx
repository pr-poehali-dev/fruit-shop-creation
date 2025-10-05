import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import UserCard from './users/UserCard';
import UserManagementDialog from './users/UserManagementDialog';

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
  onRefreshUsers?: () => void;
}

const UsersTab = ({ users, onAddBalance, onAddCashback, onToggleAdmin, onIssueLoyaltyCard, onRefreshUsers }: UsersTabProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [operationType, setOperationType] = useState<'profile' | 'balance' | 'cashback' | 'loyalty'>('profile');
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

  useEffect(() => {
    if (selectedUser && operationType === 'history') {
      const interval = setInterval(() => {
        loadTransactions(selectedUser.id, true);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [selectedUser, operationType]);

  const loadTransactions = async (userId: number, silent = false) => {
    try {
      if (!silent) setLoadingTransactions(true);
      const response = await fetch(`https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc?action=balance&user_id=${userId}`);
      const data = await response.json();
      const allTransactions = data.transactions || [];
      
      if (allTransactions.length > 15) {
        const recentTransactions = allTransactions.slice(0, 15);
        const oldTransactionIds = allTransactions.slice(15).map((t: Transaction) => t.id);
        
        if (oldTransactionIds.length > 0) {
          fetch(`https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transaction_ids: oldTransactionIds })
          }).catch(err => console.error('Error cleaning old transactions:', err));
        }
        
        setTransactions(recentTransactions);
      } else {
        setTransactions(allTransactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      if (!silent) setLoadingTransactions(false);
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
              <UserCard
                key={user.id}
                user={user}
                onToggleAdmin={handleToggleAdmin}
                onUserClick={handleUserClick}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <UserManagementDialog
        selectedUser={selectedUser}
        operationType={operationType}
        amount={amount}
        description={description}
        transactions={transactions}
        loadingTransactions={loadingTransactions}
        loyaltyCard={loyaltyCard}
        loadingLoyalty={loadingLoyalty}
        onClose={() => setSelectedUser(null)}
        onOperationTypeChange={(v) => setOperationType(v as 'profile' | 'balance' | 'cashback' | 'loyalty')}
        onAmountChange={setAmount}
        onDescriptionChange={setDescription}
        onSubmit={handleSubmit}
        onRefreshTransactions={() => selectedUser && loadTransactions(selectedUser.id)}
        onRevokeLoyaltyCard={handleRevokeLoyaltyCard}
        onIssueLoyaltyCard={handleIssueLoyaltyCard}
        onUpdateUser={() => {
          if (selectedUser) {
            loadTransactions(selectedUser.id);
            onRefreshUsers?.();
          }
        }}
      />
    </>
  );
};

export default UsersTab;