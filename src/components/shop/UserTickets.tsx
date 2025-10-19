import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { User } from '@/types/shop';
import SupportDialog from './SupportDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UserTicketsProps {
  user: User | null;
}

interface Message {
  id: number;
  message: string;
  is_admin: boolean;
  created_at: string;
}

interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  message: string;
  status: string;
  status_text: string;
  priority: string;
  created_at: string;
  updated_at?: string;
  messages?: Message[];
  rating?: number;
  rating_comment?: string;
  attachments?: string[];
}

const API_TICKETS = 'https://functions.poehali.dev/c2c15ef8-454e-4315-bff3-7109e95d5f3d';

const statusColors: Record<string, string> = {
  'new': 'destructive',
  'open': 'default',
  'in_progress': 'secondary',
  'resolved': 'outline',
  'closed': 'outline'
};

const UserTickets = ({ user }: UserTicketsProps) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const { toast } = useToast();

  const loadTickets = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_TICKETS}?user_id=${user.id}`);
      const data = await response.json();
      
      if (data.success && data.tickets) {
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить обращения',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openTicketDialog = async (ticket: Ticket) => {
    try {
      const response = await fetch(`${API_TICKETS}?ticket_id=${ticket.id}`);
      const data = await response.json();
      
      if (data.success && data.ticket) {
        setSelectedTicket(data.ticket);
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error('Failed to load ticket details:', error);
      setSelectedTicket(ticket);
      setIsDialogOpen(true);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    setIsSendingReply(true);
    try {
      const response = await fetch(API_TICKETS, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': user!.id.toString()
        },
        body: JSON.stringify({
          action: 'add_message',
          ticket_id: selectedTicket.id,
          message: replyMessage,
          is_admin: false
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Сообщение отправлено',
          description: 'Ваш ответ добавлен в обращение'
        });
        setReplyMessage('');
        await openTicketDialog(selectedTicket);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive'
      });
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!selectedTicket || rating === 0) return;

    setIsSubmittingRating(true);
    try {
      const response = await fetch(`${API_TICKETS}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user!.id.toString()
        },
        body: JSON.stringify({
          ticket_id: selectedTicket.id,
          rating,
          rating_comment: ratingComment
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Спасибо за оценку!',
          description: 'Ваш отзыв поможет нам стать лучше'
        });
        setIsDialogOpen(false);
        await loadTickets();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить оценку',
        variant: 'destructive'
      });
    } finally {
      setIsSubmittingRating(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [user]);

  if (!user) return null;

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Мои обращения</h3>
          <Button
            onClick={() => setShowCreateDialog(true)}
            size="sm"
          >
            <Icon name="Plus" size={16} className="mr-1" />
            Создать
          </Button>
        </div>
        
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Icon name="Loader2" size={24} className="mx-auto animate-spin" />
            </CardContent>
          </Card>
        ) : tickets.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Нет обращений</CardTitle>
              <CardDescription className="text-xs">
                У вас пока нет обращений в поддержку
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="w-full"
                variant="outline"
              >
                <Icon name="MessageCircle" size={18} className="mr-2" />
                Создать первое обращение
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => openTicketDialog(ticket)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-medium">#{ticket.ticket_number}</CardTitle>
                    <Badge variant={statusColors[ticket.status] as any}>
                      {ticket.status_text}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs line-clamp-1">{ticket.subject}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-2">{ticket.message}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Icon name="Calendar" size={12} />
                    {new Date(ticket.created_at).toLocaleDateString('ru-RU')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <SupportDialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) loadTickets();
        }}
        user={user}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Обращение #{selectedTicket?.ticket_number}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={statusColors[selectedTicket.status] as any}>
                      {selectedTicket.status_text}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(selectedTicket.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <h4 className="font-semibold">{selectedTicket.subject}</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="User" size={14} />
                      <span className="text-xs font-medium">Вы</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(selectedTicket.created_at).toLocaleString('ru-RU')}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
                    {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <Label className="text-xs">Вложения:</Label>
                        <div className="space-y-1">
                          {selectedTicket.attachments.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-background rounded hover:bg-muted/80 text-xs transition-colors"
                            >
                              <Icon name="Paperclip" size={14} />
                              Файл {idx + 1}
                              <Icon name="ExternalLink" size={12} className="ml-auto" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedTicket.messages && selectedTicket.messages.length > 0 && (
                    selectedTicket.messages.map((msg) => (
                      <div key={msg.id} className={`p-4 rounded-lg ${msg.is_admin ? 'bg-blue-50 dark:bg-blue-950' : 'bg-muted'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name={msg.is_admin ? 'HeadphonesIcon' : 'User'} size={14} />
                          <span className="text-xs font-medium">{msg.is_admin ? 'Поддержка' : 'Вы'}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(msg.created_at).toLocaleString('ru-RU')}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {(selectedTicket.status === 'resolved' || selectedTicket.status === 'closed') && !selectedTicket.rating && (
                <div className="border-t pt-4 mt-4 space-y-3">
                  <Label>Оцените качество поддержки</Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Icon
                          name="Star"
                          size={32}
                          className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Расскажите о вашем опыте (необязательно)"
                    rows={3}
                  />
                  <Button 
                    onClick={handleSubmitRating} 
                    disabled={rating === 0 || isSubmittingRating}
                    className="w-full"
                  >
                    <Icon name="Send" size={16} className="mr-2" />
                    {isSubmittingRating ? 'Отправка...' : 'Отправить оценку'}
                  </Button>
                </div>
              )}

              {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex gap-2">
                    <Input
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Написать сообщение..."
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                    />
                    <Button 
                      onClick={handleSendReply} 
                      disabled={!replyMessage.trim() || isSendingReply}
                      size="icon"
                    >
                      <Icon name="Send" size={18} />
                    </Button>
                  </div>
                </div>
              )}

              {selectedTicket.rating && (
                <div className="border-t pt-4 mt-4 bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg">
                  <Label>Ваша оценка</Label>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon
                        key={star}
                        name="Star"
                        size={20}
                        className={star <= (selectedTicket.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium">{selectedTicket.rating} / 5</span>
                  </div>
                  {selectedTicket.rating_comment && (
                    <p className="text-sm text-muted-foreground mt-2">{selectedTicket.rating_comment}</p>
                  )}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserTickets;