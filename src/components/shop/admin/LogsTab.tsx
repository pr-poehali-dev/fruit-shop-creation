import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import funcUrls from '../../../../backend/func2url.json';

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

interface UserLog {
  id: number;
  user_id: number;
  user_name: string;
  user_phone: string;
  action_type: string;
  action_description: string;
  target_entity_type?: string;
  target_entity_id?: number;
  metadata?: any;
  created_at: string;
}

const LogsTab = () => {
  const [logType, setLogType] = useState<'admin' | 'user'>('admin');
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [userLogs, setUserLogs] = useState<UserLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setPage(1);
  }, [logType]);

  useEffect(() => {
    loadLogs();
  }, [page, filterType, logType]);

  const loadLogs = async () => {
    setLoading(true);
    
    const params = new URLSearchParams({
      type: logType,
      page: page.toString(),
      limit: '50'
    });
    
    if (filterType !== 'all') {
      params.append('action_type', filterType);
    }
    
    try {
      const logsUrl = funcUrls['admin-get-logs'];
      const response = await fetch(`${logsUrl}?${params.toString()}`);
      const data = await response.json();
      
      if (logType === 'admin') {
        setAdminLogs(data.logs || []);
      } else {
        setUserLogs(data.logs || []);
      }
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to load logs:', error);
      if (logType === 'admin') {
        setAdminLogs([]);
      } else {
        setUserLogs([]);
      }
      setTotalPages(1);
    }
    
    setLoading(false);
  };

  const getActionIcon = (actionType: string) => {
    const icons: Record<string, string> = {
      'user_update': 'UserCog',
      'balance_add': 'Plus',
      'balance_subtract': 'Minus',
      'balance_deduct': 'Minus',
      'loyalty_add': 'Award',
      'loyalty_subtract': 'TrendingDown',
      'order_update': 'ShoppingCart',
      'order_create': 'ShoppingBag',
      'order_cancel': 'XCircle',
      'order_preorder_payment': 'CreditCard',
      'order_delivery_payment': 'Truck',
      'product_update': 'Package',
      'settings_update': 'Settings',
      'admin_grant': 'Shield',
      'admin_revoke': 'ShieldOff',
      'permissions_update': 'Key',
      'cashback_exchange': 'ArrowLeftRight',
      'loyalty_card_purchase': 'CreditCard',
      'order_payment': 'Wallet',
      'balance_top_up': 'ArrowUp',
      'theme_change': 'Palette',
      'page_view': 'Eye',
      'button_click': 'MousePointerClick',
      'product_view': 'Eye',
      'view_product': 'Eye',
      'add_to_cart': 'ShoppingCart',
      'product_add_to_cart': 'ShoppingCart',
      'product_remove_from_cart': 'Trash2',
      'add_to_favorites': 'Heart',
      'product_add_to_favorites': 'Heart',
      'remove_from_favorites': 'HeartOff',
      'product_remove_from_favorites': 'HeartOff',
      'auth_login': 'LogIn',
      'auth_logout': 'LogOut',
      'support_message': 'MessageCircle',
      'rating_submit': 'Star',
      'profile_update': 'User'
    };
    return icons[actionType] || 'Activity';
  };

  const getActionColor = (actionType: string) => {
    const colors: Record<string, string> = {
      'user_update': 'text-blue-600 dark:text-blue-400',
      'balance_add': 'text-green-600 dark:text-green-400',
      'balance_subtract': 'text-red-600 dark:text-red-400',
      'balance_deduct': 'text-red-600 dark:text-red-400',
      'balance_top_up': 'text-green-600 dark:text-green-400',
      'loyalty_add': 'text-purple-600 dark:text-purple-400',
      'loyalty_subtract': 'text-orange-600 dark:text-orange-400',
      'order_update': 'text-indigo-600 dark:text-indigo-400',
      'order_create': 'text-blue-600 dark:text-blue-400',
      'order_cancel': 'text-red-600 dark:text-red-400',
      'order_preorder_payment': 'text-green-600 dark:text-green-400',
      'order_delivery_payment': 'text-green-600 dark:text-green-400',
      'product_update': 'text-teal-600 dark:text-teal-400',
      'settings_update': 'text-gray-600 dark:text-gray-400',
      'admin_grant': 'text-emerald-600 dark:text-emerald-400',
      'admin_revoke': 'text-rose-600 dark:text-rose-400',
      'permissions_update': 'text-amber-600 dark:text-amber-400',
      'cashback_exchange': 'text-green-600 dark:text-green-400',
      'loyalty_card_purchase': 'text-purple-600 dark:text-purple-400',
      'order_payment': 'text-blue-600 dark:text-blue-400',
      'theme_change': 'text-slate-600 dark:text-slate-400',
      'page_view': 'text-cyan-600 dark:text-cyan-400',
      'button_click': 'text-slate-600 dark:text-slate-400',
      'product_view': 'text-cyan-600 dark:text-cyan-400',
      'view_product': 'text-cyan-600 dark:text-cyan-400',
      'add_to_cart': 'text-indigo-600 dark:text-indigo-400',
      'product_add_to_cart': 'text-indigo-600 dark:text-indigo-400',
      'product_remove_from_cart': 'text-red-600 dark:text-red-400',
      'add_to_favorites': 'text-pink-600 dark:text-pink-400',
      'product_add_to_favorites': 'text-pink-600 dark:text-pink-400',
      'remove_from_favorites': 'text-gray-600 dark:text-gray-400',
      'product_remove_from_favorites': 'text-gray-600 dark:text-gray-400',
      'auth_login': 'text-green-600 dark:text-green-400',
      'auth_logout': 'text-gray-600 dark:text-gray-400',
      'support_message': 'text-blue-600 dark:text-blue-400',
      'rating_submit': 'text-yellow-600 dark:text-yellow-400',
      'profile_update': 'text-blue-600 dark:text-blue-400'
    };
    return colors[actionType] || 'text-gray-600 dark:text-gray-400';
  };

  const filteredAdminLogs = adminLogs.filter(log => {
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

  const filteredUserLogs = userLogs.filter(log => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      log.user_name?.toLowerCase().includes(search) ||
      log.user_phone?.toLowerCase().includes(search) ||
      log.action_description?.toLowerCase().includes(search)
    );
  });

  const actionTypes = [
    { value: 'all', label: 'Все действия' },
    { value: 'balance_add', label: 'Пополнение' },
    { value: 'balance_deduct', label: 'Списание' },
    { value: 'order_create', label: 'Заказы' },
    { value: 'product_view', label: 'Просмотры' },
    { value: 'product_add_to_cart', label: 'В корзину' },
    { value: 'auth_login', label: 'Входы' }
  ];

  return (
    <div className="space-y-6">
      <Tabs value={logType} onValueChange={(v) => setLogType(v as 'admin' | 'user')}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="admin">Админы</TabsTrigger>
          <TabsTrigger value="user">Пользователи</TabsTrigger>
        </TabsList>

        <TabsContent value="admin">
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
            ) : filteredAdminLogs.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="FileText" className="mx-auto mb-2 text-muted-foreground" size={48} />
                <p className="text-muted-foreground">Логи не найдены</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAdminLogs.map(log => (
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
    </TabsContent>

    <TabsContent value="user">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Users" size={24} />
            Логи действий пользователей
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Поиск по пользователю или действию..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <Icon name="Loader2" className="animate-spin mx-auto mb-2" size={32} />
                <p className="text-muted-foreground">Загрузка логов...</p>
              </div>
            ) : filteredUserLogs.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="FileText" className="mx-auto mb-2 text-muted-foreground" size={48} />
                <p className="text-muted-foreground">Логи не найдены</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUserLogs.map(log => (
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
                                {log.user_name} ({log.user_phone})
                              </span>
                              {log.target_entity_type && log.target_entity_id && (
                                <>
                                  <span>→</span>
                                  <span className="flex items-center gap-1">
                                    <Icon name="Target" size={12} />
                                    {log.target_entity_type} #{log.target_entity_id}
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
    </TabsContent>
  </Tabs>
  </div>
  );
};

export default LogsTab;