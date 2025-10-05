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

interface TransactionHistoryTabProps {
  transactions: Transaction[];
  loadingTransactions: boolean;
  onRefresh: () => void;
}

const TransactionHistoryTab = ({
  transactions,
  loadingTransactions,
  onRefresh
}: TransactionHistoryTabProps) => {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">История операций</h3>
        <Button 
          size="sm" 
          variant="outline"
          onClick={onRefresh}
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
  );
};

export default TransactionHistoryTab;
