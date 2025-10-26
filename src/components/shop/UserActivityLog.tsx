import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface UserLog {
  id: number;
  user_id: number;
  action_type: string;
  action_description: string;
  target_entity_type?: string;
  target_entity_id?: number;
  metadata?: any;
  created_at: string;
}

interface UserActivityLogProps {
  userId: number;
}

const UserActivityLog = ({ userId }: UserActivityLogProps) => {
  const [logs, setLogs] = useState<UserLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadLogs();
  }, [userId, page]);

  const loadLogs = async () => {
    setLoading(true);
    
    const limit = 20;
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        id,
        user_id,
        action_type,
        action_description,
        target_entity_type,
        target_entity_id,
        metadata,
        created_at
      FROM user_logs
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const countQuery = `SELECT COUNT(*) as total FROM user_logs WHERE user_id = ${userId}`;
    
    try {
      const [logsResponse, countResponse] = await Promise.all([
        fetch('https://poehali.dev/api/internal/sql-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        }),
        fetch('https://poehali.dev/api/internal/sql-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: countQuery })
        })
      ]);
      
      const logsData = await logsResponse.json();
      const countData = await countResponse.json();
      
      setLogs(logsData.rows || []);
      const total = countData.rows?.[0]?.total || 0;
      setTotalPages(Math.ceil(total / limit));
    } catch (error) {
      console.error('Failed to load logs:', error);
      setLogs([]);
      setTotalPages(1);
    }
    
    setLoading(false);
  };

  const getActionIcon = (actionType: string) => {
    const icons: Record<string, string> = {
      'auth_login': 'LogIn',
      'auth_logout': 'LogOut',
      'auth_register': 'UserPlus',
      'profile_update': 'User',
      'password_change': 'Key',
      'order_create': 'ShoppingCart',
      'order_cancel': 'XCircle',
      'balance_deposit': 'Plus',
      'balance_withdraw': 'Minus',
      'loyalty_earn': 'Award',
      'loyalty_spend': 'TrendingDown',
      'favorite_add': 'Heart',
      'favorite_remove': 'HeartOff',
      'cart_add': 'ShoppingBag',
      'cart_remove': 'Trash2',
      'review_create': 'MessageSquare',
      'support_ticket': 'HelpCircle'
    };
    return icons[actionType] || 'Activity';
  };

  const getActionColor = (actionType: string) => {
    const colors: Record<string, string> = {
      'auth_login': 'text-green-600',
      'auth_logout': 'text-gray-600',
      'auth_register': 'text-blue-600',
      'profile_update': 'text-indigo-600',
      'password_change': 'text-purple-600',
      'order_create': 'text-emerald-600',
      'order_cancel': 'text-red-600',
      'balance_deposit': 'text-green-600',
      'balance_withdraw': 'text-orange-600',
      'loyalty_earn': 'text-purple-600',
      'loyalty_spend': 'text-amber-600',
      'favorite_add': 'text-pink-600',
      'favorite_remove': 'text-gray-600',
      'cart_add': 'text-blue-600',
      'cart_remove': 'text-gray-600',
      'review_create': 'text-teal-600',
      'support_ticket': 'text-yellow-600'
    };
    return colors[actionType] || 'text-gray-600';
  };

  if (loading && page === 1) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Icon name="Loader2" className="animate-spin mx-auto mb-2" size={32} />
            <p className="text-muted-foreground">Загрузка истории...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="History" size={24} />
          История активности
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="FileText" className="mx-auto mb-2 text-muted-foreground" size={48} />
            <p className="text-muted-foreground">История действий пуста</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map(log => (
              <div
                key={log.id}
                className="border rounded-lg p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`${getActionColor(log.action_type)} mt-0.5`}>
                    <Icon name={getActionIcon(log.action_type)} size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{log.action_description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(log.created_at), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                    </p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                          Подробности
                        </summary>
                        <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <Icon name="ChevronLeft" size={16} />
            </Button>
            <span className="px-4 py-2 text-sm">
              Страница {page} из {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              <Icon name="ChevronRight" size={16} />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserActivityLog;
