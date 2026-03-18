import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSidebarTouch } from '@/hooks/useSidebarTouch';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import PaymentDetailsModal from '@/components/payments/PaymentDetailsModal';
import ApprovedPaymentDetailsModal from '@/components/payments/ApprovedPaymentDetailsModal';
import { API_ENDPOINTS } from '@/config/api';
import { formatDateTime } from '@/lib/dateUtils';

interface AuditLog {
  id: number;
  entity_type: string;
  entity_id: number;
  action: string;
  user_id: number;
  username: string;
  changed_fields: Record<string, { old: unknown; new: unknown }> | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const AuditLogs = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dictionariesOpen, setDictionariesOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  
  const {
    menuOpen,
    setMenuOpen,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useSidebarTouch();
  
  // Filters
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [selectedApprovedPaymentId, setSelectedApprovedPaymentId] = useState<number | null>(null);
  const [deletingLogId, setDeletingLogId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;

    const loadLogs = async () => {
      try {
        const params = new URLSearchParams({
          ...(entityTypeFilter && entityTypeFilter !== 'all' && { entity_type: entityTypeFilter }),
          ...(actionFilter && actionFilter !== 'all' && { action: actionFilter }),
        });

        const response = await fetch(`${API_ENDPOINTS.main}?endpoint=audit-logs&${params}`, {
          headers: { 'X-Auth-Token': token },
        });

        const data = await response.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить историю изменений',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [token, entityTypeFilter, actionFilter, toast]);

  const handlePaymentClick = (entityType: string, entityId: number) => {
    if (entityType === 'payment') {
      setSelectedPaymentId(entityId);
    } else if (entityType === 'approved_payment') {
      setSelectedApprovedPaymentId(entityId);
    }
  };

  const handleDeleteLog = async (logId: number) => {
    if (!confirm('Удалить эту запись из истории?')) return;
    
    setDeletingLogId(logId);
    try {
      const response = await fetch(`${API_ENDPOINTS.main}?endpoint=audit-logs&id=${logId}`, {
        method: 'DELETE',
        headers: { 'X-Auth-Token': token || '' },
      });

      if (!response.ok) throw new Error('Failed to delete log');

      setLogs(logs.filter(log => log.id !== logId));
      toast({
        title: 'Успешно',
        description: 'Запись удалена из истории',
      });
    } catch (err) {
      console.error('Failed to delete log:', err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить запись',
        variant: 'destructive',
      });
    } finally {
      setDeletingLogId(null);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return 'Plus';
      case 'updated': return 'Edit';
      case 'deleted': return 'Trash2';
      case 'approved': return 'Check';
      case 'rejected': return 'X';
      case 'submitted': return 'Send';
      default: return 'Activity';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'text-green-400';
      case 'updated': return 'text-blue-400';
      case 'deleted': return 'text-red-400';
      case 'approved': return 'text-green-500';
      case 'rejected': return 'text-red-500';
      case 'submitted': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: 'Создан',
      updated: 'Изменён',
      deleted: 'Удалён',
      approved: 'Согласован',
      rejected: 'Отклонён',
      submitted: 'Отправлен на согласование',
    };
    return labels[action] || action;
  };

  const getEntityTypeLabel = (entityType: string) => {
    const labels: Record<string, string> = {
      payment: 'Платёж',
      category: 'Категория',
      user: 'Пользователь',
      service: 'Сервис',
      contractor: 'Контрагент',
      legal_entity: 'Юр. лицо',
    };
    return labels[entityType] || entityType;
  };

  const filteredLogs = logs.filter(log => {
    if (userFilter && !log.username?.toLowerCase().includes(userFilter.toLowerCase())) {
      return false;
    }
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        log.username?.toLowerCase().includes(searchLower) ||
        log.entity_type?.toLowerCase().includes(searchLower) ||
        log.action?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="flex min-h-screen">
      <PaymentsSidebar
        menuOpen={menuOpen}
        dictionariesOpen={dictionariesOpen}
        setDictionariesOpen={setDictionariesOpen}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
      />

      <main className="flex-1 lg:ml-64 bg-background min-h-screen overflow-x-hidden max-w-full">
        <div className="p-4 sm:p-6 space-y-6">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 text-white hover:bg-white/5 rounded-lg transition-colors mb-4"
          >
            <Icon name="Menu" size={24} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">История изменений</h1>
            <p className="text-sm md:text-base text-muted-foreground">Все действия в системе</p>
          </div>

          <Card className="border-white/5 bg-card">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 relative">
                  <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Тип объекта" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="payment">Платежи</SelectItem>
                    <SelectItem value="category">Категории</SelectItem>
                    <SelectItem value="user">Пользователи</SelectItem>
                    <SelectItem value="service">Сервисы</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Действие" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все действия</SelectItem>
                    <SelectItem value="created">Создание</SelectItem>
                    <SelectItem value="updated">Изменение</SelectItem>
                    <SelectItem value="deleted">Удаление</SelectItem>
                    <SelectItem value="approved">Согласование</SelectItem>
                    <SelectItem value="rejected">Отклонение</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  <p className="mt-4 text-muted-foreground">Загрузка...</p>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">История изменений пуста</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ${getActionColor(log.action)}`}>
                          <Icon name={getActionIcon(log.action)} size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <button
                                onClick={() => (log.entity_type === 'payment' || log.entity_type === 'approved_payment') && handlePaymentClick(log.entity_type, log.entity_id)}
                                className={`font-medium text-left ${
                                  (log.entity_type === 'payment' || log.entity_type === 'approved_payment') 
                                    ? 'hover:text-primary cursor-pointer underline decoration-transparent hover:decoration-current transition-colors' 
                                    : ''
                                }`}
                              >
                                {getEntityTypeLabel(log.entity_type)} #{log.entity_id}
                              </button>
                              <p className="text-sm text-muted-foreground">
                                {getActionLabel(log.action)} • {log.username || 'Система'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDateTime(log.created_at)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteLog(log.id)}
                                disabled={deletingLogId === log.id}
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500"
                              >
                                {deletingLogId === log.id ? (
                                  <Icon name="Loader2" size={16} className="animate-spin" />
                                ) : (
                                  <Icon name="Trash2" size={16} />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          {log.changed_fields && Object.keys(log.changed_fields).length > 0 && (
                            <div className="mt-3 space-y-2">
                              {Object.entries(log.changed_fields).map(([field, values]) => (
                                <div key={field} className="text-sm">
                                  <span className="text-muted-foreground">{field}:</span>{' '}
                                  <span className="text-red-400 line-through">{JSON.stringify(values.old)}</span>
                                  {' → '}
                                  <span className="text-green-400">{JSON.stringify(values.new)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {log.metadata?.comment && (
                            <div className="mt-2 text-sm text-muted-foreground italic">
                              💬 {log.metadata.comment}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {selectedPaymentId && (
        <PaymentDetailsModal
          paymentId={selectedPaymentId}
          onClose={() => setSelectedPaymentId(null)}
        />
      )}

      {selectedApprovedPaymentId && (
        <ApprovedPaymentDetailsModal
          paymentId={selectedApprovedPaymentId}
          onClose={() => setSelectedApprovedPaymentId(null)}
        />
      )}
    </div>
  );
};

export default AuditLogs;