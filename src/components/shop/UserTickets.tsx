import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { User } from '@/types/shop';
import CreateTicketDialog from './tickets/CreateTicketDialog';
import TicketCard from './tickets/TicketCard';

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
  const [closedTicket, setClosedTicket] = useState<any>(null);
  const [ratedTicket, setRatedTicket] = useState<any>(null);
  
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
      
      if (data.active_ticket && data.active_ticket.status !== 'closed' && data.active_ticket.status !== 'resolved') {
        console.log('Active ticket found:', data.active_ticket);
        setActiveTicket(data.active_ticket);
        setRatedTicket(null);
        setUnreadCount(data.active_ticket.unread_count || 0);
        if (shouldScroll) {
          setTimeout(scrollToBottom, 100);
        }
      } else if (data.active_ticket && (data.active_ticket.status === 'closed' || data.active_ticket.status === 'resolved')) {
        console.log('Ticket closed, checking rating status');
        const needsRating = !data.active_ticket.rating;
        const hasRating = !!data.active_ticket.rating;
        
        if (needsRating) {
          setClosedTicket(data.active_ticket);
          setActiveTicket(data.active_ticket);
        } else if (hasRating) {
          setRatedTicket(data.active_ticket);
          setActiveTicket(null);
          setClosedTicket(null);
        }
        setUnreadCount(0);
      } else {
        console.log('No active ticket');
        setActiveTicket(null);
        setRatedTicket(null);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to load ticket:', error);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
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
          {unreadCount > 0 ? (
            <Badge variant="destructive" className="animate-pulse">
              {unreadCount} новых
            </Badge>
          ) : (activeTicket && !activeTicket.rating && (activeTicket.status === 'closed' || activeTicket.status === 'resolved')) ? (
            <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-400 animate-pulse">
              <Icon name="Star" size={12} className="mr-1" />
              Требуется оценка
            </Badge>
          ) : null}
        </div>
        
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        ) : activeTicket || ratedTicket ? (
          <TicketCard
            ticket={activeTicket || ratedTicket}
            unreadCount={unreadCount}
            statusLabels={statusLabels}
            replyMessage={replyMessage}
            onReplyChange={setReplyMessage}
            onSendReply={handleSendReply}
            onShowRating={loadActiveTicket}
            onDismiss={ratedTicket ? () => setRatedTicket(null) : undefined}
            apiUrl={API_SUPPORT}
            messagesEndRef={messagesEndRef}
          />
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

      <CreateTicketDialog
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        userId={user.id}
        apiUrl={API_SUPPORT}
        onTicketCreated={loadActiveTicket}
      />
    </>
  );
};

export default UserTickets;