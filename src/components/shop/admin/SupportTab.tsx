import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface SupportTabProps {
  tickets: any[];
  onReply: (ticketId: number, message: string) => void;
  onUpdateStatus: (ticketId: number, status: string) => void;
  onLoadTicket: (ticketId: number) => Promise<any>;
}

const statusLabels: Record<string, string> = {
  'open': '🟢 Открыт',
  'in_progress': '🟡 В работе',
  'resolved': '✅ Решён',
  'closed': '⚫ Закрыт'
};

const priorityLabels: Record<string, string> = {
  'low': 'Низкий',
  'medium': 'Средний',
  'high': 'Высокий'
};

const SupportTab = ({ tickets, onReply, onUpdateStatus, onLoadTicket }: SupportTabProps) => {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!selectedTicket) return;
    
    const interval = setInterval(() => {
      handleOpenTicket(selectedTicket, false);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [selectedTicket?.id]);

  const handleOpenTicket = async (ticket: any, shouldScroll: boolean = true) => {
    try {
      setIsSyncing(true);
      const fullTicket = await onLoadTicket(ticket.id);
      setSelectedTicket(fullTicket);
      setNewStatus(fullTicket.status);
      if (shouldScroll) {
        setTimeout(scrollToBottom, 100);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSendReply = () => {
    if (replyMessage.trim() && selectedTicket) {
      onReply(selectedTicket.id, replyMessage);
      setReplyMessage('');
      setTimeout(() => {
        handleOpenTicket(selectedTicket);
        setTimeout(scrollToBottom, 100);
      }, 500);
    }
  };

  const handleUpdateStatus = () => {
    if (selectedTicket && newStatus) {
      onUpdateStatus(selectedTicket.id, newStatus);
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'resolved': return 'default';
      case 'closed': return 'secondary';
      case 'in_progress': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Обращения в поддержку</CardTitle>
          <CardDescription>Все тикеты от пользователей</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground">Обращений пока нет</p>
            ) : (
              tickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  className="p-3 sm:p-4 border rounded-lg space-y-2 cursor-pointer hover:bg-accent/50 transition"
                  onClick={() => handleOpenTicket(ticket)}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm sm:text-base">#{ticket.id} {ticket.subject}</span>
                        <Badge variant={getStatusBadgeVariant(ticket.status)} className="text-xs">
                          {statusLabels[ticket.status] || ticket.status}
                        </Badge>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {ticket.user_name} ({ticket.user_phone})
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {priorityLabels[ticket.priority]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{ticket.message}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl h-[85vh] sm:h-auto sm:max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="MessageCircle" size={24} />
              Тикет #{selectedTicket?.id}: {selectedTicket?.subject}
              {isSyncing && (
                <Icon name="RefreshCw" size={16} className="ml-2 animate-spin text-muted-foreground" />
              )}
            </DialogTitle>
            <DialogDescription>
              От {selectedTicket?.user_name} ({selectedTicket?.user_phone})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Badge variant={getStatusBadgeVariant(selectedTicket?.status)}>
                {statusLabels[selectedTicket?.status] || selectedTicket?.status}
              </Badge>
              <span className={`text-sm font-medium ${getPriorityColor(selectedTicket?.priority)}`}>
                Приоритет: {priorityLabels[selectedTicket?.priority]}
              </span>
            </div>

            <div>
              <Label>Статус тикета</Label>
              <div className="flex gap-2 mt-2">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">🟢 Открыт</SelectItem>
                    <SelectItem value="in_progress">🟡 В работе</SelectItem>
                    <SelectItem value="resolved">✅ Решён</SelectItem>
                    <SelectItem value="closed">⚫ Закрыт</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleUpdateStatus} size="sm">
                  <Icon name="Save" size={16} className="mr-1" />
                  Сохранить
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">История сообщений</h4>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {selectedTicket?.messages?.filter((m: any) => m && m.id && m.message).length > 0 ? (
                  selectedTicket.messages.filter((m: any) => m && m.id && m.message).map((msg: any) => (
                  <div 
                    key={msg.id} 
                    className={`p-3 rounded-lg ${msg.is_admin ? 'bg-primary/10 ml-4' : 'bg-muted mr-4'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-medium">
                        {msg.is_admin ? '👨‍💼 Администратор' : '👤 Пользователь'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleString('ru-RU', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Нет сообщений
                  </p>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
            <Label htmlFor="reply">Ваш ответ</Label>
            <Textarea
              id="reply"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Введите ответ пользователю"
              rows={2}
              className="mt-2"
            />
            <Button 
              onClick={handleSendReply} 
              className="mt-2 w-full sm:w-auto"
              disabled={!replyMessage.trim()}
            >
              <Icon name="Send" size={18} className="mr-2" />
              Отправить ответ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SupportTab;