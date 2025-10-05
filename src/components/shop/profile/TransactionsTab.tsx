import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Transaction {
  id: number;
  user_id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

interface TransactionsTabProps {
  userId: number;
}

const TransactionsTab = ({ userId }: TransactionsTabProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [userId]);

  const loadTransactions = async () => {
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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return 'ArrowDownToLine';
      case 'withdraw': return 'ArrowUpFromLine';
      case 'cashback_deposit': 
      case 'cashback_earned': return 'Gift';
      case 'cashback_used': return 'Wallet';
      case 'cashback_exchange': return 'ArrowLeftRight';
      case 'cashback_cancelled': return 'XCircle';
      case 'purchase':
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
      case 'cashback_exchange':
        return 'text-green-600';
      case 'withdraw':
      case 'order_payment':
      case 'purchase':
      case 'cashback_cancelled':
        return 'text-red-600';
      default: 
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-3 mt-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">История операций</h3>
        <Button 
          size="sm" 
          variant="outline"
          onClick={loadTransactions}
          disabled={loadingTransactions}
        >
          <Icon name="RefreshCw" size={16} className="mr-2" />
          Обновить
        </Button>
      </div>
      
      {loadingTransactions ? (
        <p className="text-center text-muted-foreground py-4">Загрузка...</p>
      ) : transactions.length === 0 ? (
        <p className="text-sm text-muted-foreground">История операций пуста</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {transactions.slice(0, 20).map(transaction => (
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
                  {transaction.type === 'deposit' && 'Пополнение'}
                  {transaction.type === 'withdraw' && 'Списание'}
                  {transaction.type === 'cashback_deposit' && 'Кэшбек'}
                  {transaction.type === 'cashback_earned' && 'Кэшбек'}
                  {transaction.type === 'cashback_used' && 'Использование кэшбэка'}
                  {transaction.type === 'order_payment' && 'Оплата заказа'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionsTab;
