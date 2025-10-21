import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { User } from '@/types/shop';

interface MyTicketsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
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
  category: string;
}

interface Comment {
  id: number;
  comment: string;
  is_admin: boolean;
  created_at: string;
  author_name: string;
}

const MyTicketsDialog = ({ open, onOpenChange, user }: MyTicketsDialogProps) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const API_USER_TICKETS = 'https://functions.poehali.dev/c2c15ef8-454e-4315-bff3-7109e95d5f3d';

  const loadTickets = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_USER_TICKETS}?user_id=${user.id}`);
      const data = await response.json();

      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить тикеты',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async (ticketId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_USER_TICKETS}?comments=true&ticket_id=${ticketId}`);
      const data = await response.json();

      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить переписку',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && user) {
      loadTickets();
    }
  }, [open, user]);

  const handleSelectTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    await loadComments(ticket.id);
  };

  const handleBack = () => {
    setSelectedTicket(null);
    setComments([]);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'new': return 'destructive';
      case 'in_progress': return 'default';
      case 'resolved': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedTicket ? (
              <>
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  <Icon name="ArrowLeft" size={18} />
                </Button>
                <Badge variant="outline" className="font-mono text-xs">
                  #{selectedTicket.ticket_number}
                </Badge>
                {selectedTicket.subject}
              </>
            ) : (
              <>
                <Icon name="Inbox" size={24} />
                Мои обращения
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {selectedTicket 
              ? 'История переписки по вашему обращению' 
              : 'Все ваши обращения в поддержку'
            }
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
          </div>
        ) : selectedTicket ? (
          <div className="space-y-4">
            <Card className="bg-muted/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Описание проблемы</CardTitle>
                  <Badge variant={getStatusBadgeVariant(selectedTicket.status)}>
                    {selectedTicket.status_text}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {new Date(selectedTicket.created_at).toLocaleString('ru-RU')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
              </CardContent>
            </Card>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <Icon name="MessageSquare" size={16} />
                Переписка ({comments.length})
              </h4>
              <ScrollArea className="h-[350px] rounded-md border p-4">
                <div className="space-y-3">
                  {comments.length === 0 ? (
                    <div className="text-center py-8">
                      <Icon name="MessageCircle" size={32} className="mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Пока нет ответов от поддержки
                      </p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`flex gap-2 ${comment.is_admin ? '' : 'flex-row-reverse'}`}
                      >
                        <div className={`rounded-lg p-3 max-w-[85%] ${
                          comment.is_admin 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Icon 
                              name={comment.is_admin ? 'Shield' : 'User'} 
                              size={12} 
                            />
                            <span className="text-xs font-medium">
                              {comment.is_admin ? 'Поддержка' : 'Вы'}
                            </span>
                            <span className="text-xs opacity-70">
                              {new Date(comment.created_at).toLocaleString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {selectedTicket.status === 'resolved' && (
              <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <CardContent className="pt-4 flex items-center gap-2 text-sm">
                  <Icon name="CheckCircle2" size={18} className="text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-300">
                    Тикет решён. Если проблема не решена, создайте новое обращение.
                  </span>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            {tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Icon name="Inbox" size={48} className="text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">Нет обращений</p>
                <p className="text-sm text-muted-foreground">
                  У вас пока нет обращений в поддержку
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <Card 
                    key={ticket.id}
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() => handleSelectTicket(ticket)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              #{ticket.ticket_number}
                            </Badge>
                            <Badge variant={getStatusBadgeVariant(ticket.status)} className="text-xs">
                              {ticket.status_text}
                            </Badge>
                          </div>
                          <CardTitle className="text-base">{ticket.subject}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {new Date(ticket.created_at).toLocaleDateString('ru-RU')}
                          </CardDescription>
                        </div>
                        <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {ticket.message}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MyTicketsDialog;
