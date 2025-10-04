import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { User } from '@/types/shop';

interface UserTicketsProps {
  user: User | null;
}

const API_SUPPORT = 'https://functions.poehali.dev/a833bb69-e590-4a5f-a513-450a69314192';

const statusLabels: Record<string, string> = {
  'open': '🟢 Открыт',
  'in_progress': '🟡 В работе',
  'resolved': '✅ Решён',
  'closed': '⚫ Закрыт'
};

const UserTickets = ({ user }: UserTicketsProps) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadTickets = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_SUPPORT}?user_id=${user.id}`);
      const data = await response.json();
      setTickets(data.tickets || []);
      setTotalUnread(data.total_unread || 0);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTicketDetails = async (ticketId: number) => {
    try {
      const response = await fetch(`${API_SUPPORT}?ticket_id=${ticketId}&mark_as_read=true`);
      const data = await response.json();
      console.log('Loaded ticket details:', data.ticket);
      console.log('Messages:', data.ticket?.messages);
      setSelectedTicket(data.ticket);
      await loadTickets();
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error loading ticket:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить тикет',
        variant: 'destructive'
      });
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    try {
      const response = await fetch(API_SUPPORT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_message',
          ticket_id: selectedTicket.id,
          user_id: user?.id,
          message: replyMessage,
          is_admin: false
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Сообщение отправлено',
          description: 'Ваш ответ добавлен в тикет'
        });
        setReplyMessage('');
        await loadTicketDetails(selectedTicket.id);
        setTimeout(scrollToBottom, 100);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadTickets();
    
    const interval = setInterval(loadTickets, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'resolved': return 'default';
      case 'closed': return 'secondary';
      case 'in_progress': return 'outline';
      default: return 'outline';
    }
  };

  if (!user) return null;

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Мои обращения в поддержку</h3>
          {totalUnread > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {totalUnread} новых
            </Badge>
          )}
        </div>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        ) : tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">Обращений пока нет</p>
        ) : (
          <div className="space-y-3">
            {tickets.map(ticket => (
              <Card 
                key={ticket.id}
                className={`cursor-pointer hover:bg-accent/50 transition ${ticket.unread_count > 0 ? 'border-primary shadow-sm' : ''}`}
                onClick={() => loadTicketDetails(ticket.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm">#{ticket.id} {ticket.subject}</CardTitle>
                        {ticket.unread_count > 0 && (
                          <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                            {ticket.unread_count}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs mt-1">
                        {new Date(ticket.created_at).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusBadgeVariant(ticket.status)} className="text-xs shrink-0">
                      {statusLabels[ticket.status] || ticket.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground line-clamp-2">{ticket.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl h-[85vh] sm:h-auto sm:max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="MessageCircle" size={24} />
              Тикет #{selectedTicket?.id}: {selectedTicket?.subject}
            </DialogTitle>
            <DialogDescription>
              <Badge variant={getStatusBadgeVariant(selectedTicket?.status)} className="mt-2">
                {statusLabels[selectedTicket?.status] || selectedTicket?.status}
              </Badge>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-y-auto">
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">История переписки</h4>
              <div className="space-y-3">
                {selectedTicket?.messages?.filter((m: any) => m && m.id && m.message).length > 0 ? (
                  selectedTicket.messages.filter((m: any) => m && m.id && m.message).map((msg: any) => (
                  <div 
                    key={msg.id} 
                    className={`p-3 rounded-lg ${msg.is_admin ? 'bg-primary/10 ml-4' : 'bg-muted mr-4'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-medium">
                        {msg.is_admin ? '👨‍💼 Администратор' : '👤 Вы'}
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

          </div>

          {selectedTicket?.status !== 'closed' && selectedTicket?.status !== 'resolved' && (
            <div className="border-t pt-4 mt-4 bg-background sticky bottom-0">
              <Label htmlFor="user-reply">Ваш ответ</Label>
              <Textarea
                id="user-reply"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Введите ваше сообщение"
                rows={2}
                className="mt-2"
              />
              <Button 
                onClick={handleSendReply} 
                className="mt-2 w-full sm:w-auto"
                disabled={!replyMessage.trim()}
              >
                <Icon name="Send" size={18} className="mr-2" />
                Отправить
              </Button>
            </div>
          )}

          {(selectedTicket?.status === 'closed' || selectedTicket?.status === 'resolved') && (
            <div className="bg-muted p-3 rounded-lg text-sm text-center border-t mt-4">
              Этот тикет {selectedTicket?.status === 'closed' ? 'закрыт' : 'решён'}
            </div>
          )
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserTickets;