import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface AdminLog {
  id: number;
  admin_id: number;
  admin_name: string;
  admin_phone: string;
  action_type: string;
  action_description: string;
  target_user_id?: number;
  target_user_name?: string;
  target_user_phone?: string;
  target_entity_type?: string;
  target_entity_id?: number;
  metadata?: any;
  created_at: string;
}

const LogsTab = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLogs();
  }, [page, filterType]);

  const loadLogs = async () => {
    setLoading(true);
    
    const limit = 50;
    const offset = (page - 1) * limit;
    
    const whereClause = filterType !== 'all' ? `AND al.action_type = '${filterType}'` : '';
    
    const query = `
      SELECT 
        al.id,
        al.admin_id,
        au.full_name as admin_name,
        au.phone as admin_phone,
        al.action_type,
        al.action_description,
        al.target_user_id,
        tu.full_name as target_user_name,
        tu.phone as target_user_phone,
        al.target_entity_type,
        al.target_entity_id,
        al.metadata,
        al.created_at
      FROM admin_logs al
      LEFT JOIN users au ON al.admin_id = au.id
      LEFT JOIN users tu ON al.target_user_id = tu.id
      WHERE 1=1 ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const countQuery = `SELECT COUNT(*) as total FROM admin_logs al WHERE 1=1 ${whereClause}`;
    
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
      'user_update': 'UserCog',
      'balance_add': 'Plus',
      'balance_subtract': 'Minus',
      'loyalty_add': 'Award',
      'loyalty_subtract': 'TrendingDown',
      'order_update': 'ShoppingCart',
      'product_update': 'Package',
      'settings_update': 'Settings',
      'admin_grant': 'Shield',
      'admin_revoke': 'ShieldOff',
      'permissions_update': 'Key'
    };
    return icons[actionType] || 'Activity';
  };

  const getActionColor = (actionType: string) => {
    const colors: Record<string, string> = {
      'user_update': 'text-blue-600',
      'balance_add': 'text-green-600',
      'balance_subtract': 'text-red-600',
      'loyalty_add': 'text-purple-600',
      'loyalty_subtract': 'text-orange-600',
      'order_update': 'text-indigo-600',
      'product_update': 'text-teal-600',
      'settings_update': 'text-gray-600',
      'admin_grant': 'text-emerald-600',
      'admin_revoke': 'text-rose-600',
      'permissions_update': 'text-amber-600'
    };
    return colors[actionType] || 'text-gray-600';
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      log.admin_name?.toLowerCase().includes(search) ||
      log.admin_phone?.toLowerCase().includes(search) ||
      log.target_user_name?.toLowerCase().includes(search) ||
      log.target_user_phone?.toLowerCase().includes(search) ||
      log.action_description?.toLowerCase().includes(search)
    );
  });

  const actionTypes = [
    { value: 'all', label: 'Все действия' },
    { value: 'user_update', label: 'Изменения пользователей' },
    { value: 'balance_add', label: 'Пополнение баланса' },
    { value: 'balance_subtract', label: 'Списание баланса' },
    { value: 'loyalty_add', label: 'Начисление баллов' },
    { value: 'loyalty_subtract', label: 'Списание баллов' },
    { value: 'order_update', label: 'Изменения заказов' },
    { value: 'permissions_update', label: 'Изменения прав' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="ScrollText" size={24} />
            Логи действий администраторов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Поиск по администратору, пользователю или действию..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Tabs value={filterType} onValueChange={setFilterType} className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-2 sm:grid-cols-4">
                  {actionTypes.slice(0, 4).map(type => (
                    <TabsTrigger key={type.value} value={type.value} className="text-xs">
                      {type.label.split(' ')[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <Icon name="Loader2" className="animate-spin mx-auto mb-2" size={32} />
                <p className="text-muted-foreground">Загрузка логов...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="FileText" className="mx-auto mb-2 text-muted-foreground" size={48} />
                <p className="text-muted-foreground">Логи не найдены</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map(log => (
                  <div
                    key={log.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`${getActionColor(log.action_type)} mt-1`}>
                        <Icon name={getActionIcon(log.action_type)} size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{log.action_description}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Icon name="User" size={12} />
                                {log.admin_name} ({log.admin_phone})
                              </span>
                              {log.target_user_name && (
                                <>
                                  <span>→</span>
                                  <span className="flex items-center gap-1">
                                    <Icon name="UserCheck" size={12} />
                                    {log.target_user_name} ({log.target_user_phone})
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(log.created_at), 'dd MMM yyyy, HH:mm', { locale: ru })}
                          </span>
                        </div>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                              Подробности
                            </summary>
                            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
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
              <div className="flex justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
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
                  disabled={page === totalPages}
                >
                  <Icon name="ChevronRight" size={16} />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsTab;