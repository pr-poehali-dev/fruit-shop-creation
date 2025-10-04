import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Форма создания
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadActiveTicket = async (shouldScroll: boolean = true) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      setIsSyncing(true);
      const response = await fetch(`${API_SUPPORT}?user_id=${user.id}`);
      const data = await response.json();
      console.log('Support response:', data);
      
      if (data.active_ticket) {
        console.log('Active ticket found:', data.active_ticket);
        setActiveTicket(data.active_ticket);
        setUnreadCount(data.active_ticket.unread_count || 0);
        if (shouldScroll) {
          setTimeout(scrollToBottom, 100);
        }
      } else {
        console.log('No active ticket');
        setActiveTicket(null);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to load ticket:', error);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо войти в систему',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(API_SUPPORT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_ticket',
          user_id: user.id,
          subject,
          message,
          priority
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Обращение создано',
          description: 'Администратор свяжется с вами в ближайшее время'
        });
        setSubject('');
        setMessage('');
        setPriority('medium');
        setShowCreateForm(false);
        await loadActiveTicket();
      } else {
        throw new Error(data.error || 'Ошибка создания');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось создать обращение',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !activeTicket) return;

    try {
      const response = await fetch(API_SUPPORT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_message',
          ticket_id: activeTicket.id,
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
        await loadActiveTicket();
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
    loadActiveTicket();
    
    const interval = setInterval(() => loadActiveTicket(false), 10000);
    
    return () => clearInterval(interval);
  }, [user]);

  if (!user) {
    console.log('UserTickets: No user');
    return null;
  }

  console.log('UserTickets render - user:', user.id, 'activeTicket:', activeTicket, 'isLoading:', isLoading);

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Техподдержка</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {unreadCount} новых
            </Badge>
          )}
        </div>
        
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        ) : activeTicket ? (
          <Card 
            className={`cursor-pointer hover:bg-accent/50 transition ${unreadCount > 0 ? 'border-primary shadow-sm' : ''}`}
            onClick={() => {}}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm">#{activeTicket.id} {activeTicket.subject}</CardTitle>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs mt-1">
                    {new Date(activeTicket.created_at).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </CardDescription>
                </div>
                <Badge variant={activeTicket.status === 'resolved' || activeTicket.status === 'closed' ? 'secondary' : 'outline'} className="text-xs shrink-0">
                  {statusLabels[activeTicket.status] || activeTicket.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {activeTicket?.messages?.filter((m: any) => m && m.id && m.message).map((msg: any) => (
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
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              {activeTicket.status !== 'closed' && activeTicket.status !== 'resolved' && (
                <div className="mt-4 pt-4 border-t">
                  <Textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Введите ваше сообщение"
                    rows={2}
                    className="mb-2"
                  />
                  <Button 
                    onClick={handleSendReply} 
                    size="sm"
                    className="w-full"
                    disabled={!replyMessage.trim()}
                  >
                    <Icon name="Send" size={16} className="mr-2" />
                    Отправить
                  </Button>
                </div>
              )}
              
              {(activeTicket.status === 'closed' || activeTicket.status === 'resolved') && (
                <div className="bg-muted p-3 rounded-lg text-sm text-center mt-4">
                  Тикет {activeTicket.status === 'closed' ? 'закрыт' : 'решён'}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Нужна помощь?</CardTitle>
              <CardDescription className="text-xs">
                Создайте обращение в техподдержку
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="w-full"
                variant="outline"
              >
                <Icon name="MessageCircle" size={18} className="mr-2" />
                Создать обращение
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="MessageCircle" size={24} />
              Создать обращение
            </DialogTitle>
            <DialogDescription>
              Опишите вашу проблему или вопрос
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <Label htmlFor="subject">Тема обращения</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Кратко опишите проблему"
                required
              />
            </div>

            <div>
              <Label htmlFor="priority">Приоритет</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="message">Сообщение</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Подробно опишите вашу проблему"
                rows={5}
                required
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" size={18} className="mr-2" />
                    Отправить
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserTickets;