import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Ticket {
  id: number;
  ticket_number: string;
  user_id: number;
  name: string;
  phone: string;
  email?: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  status_text: string;
  priority: string;
  created_at: string;
  updated_at?: string;
  assigned_admin_id?: number;
  assigned_at?: string;
  admin_name?: string;
  attachments?: string[];
  rating?: number;
  rating_comment?: string;
}

interface Comment {
  id: number;
  comment: string;
  is_admin: boolean;
  created_at: string;
  author_name: string;
}

interface SupportTicketsTabProps {
  userId: number;
}

const SupportTicketsTab = ({ userId }: SupportTicketsTabProps) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('new');
  const { toast } = useToast();

  const loadTickets = async (status?: string) => {
    try {
      const url = status && status !== 'all'
        ? `https://functions.poehali.dev/c2c15ef8-454e-4315-bff3-7109e95d5f3d?admin=true&status=${status}`
        : 'https://functions.poehali.dev/c2c15ef8-454e-4315-bff3-7109e95d5f3d?admin=true';
      
      const response = await fetch(url, {
        headers: { 'X-User-Id': userId.toString() }
      });
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
    }
  };

  const loadComments = async (ticketId: number) => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/c2c15ef8-454e-4315-bff3-7109e95d5f3d?comments=true&ticket_id=${ticketId}`
      );
      const data = await response.json();
      
      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  useEffect(() => {
    loadTickets(activeTab);
  }, [userId, activeTab]);

  const openTicketDialog = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setNewComment('');
    setIsDialogOpen(true);
    await loadComments(ticket.id);
  };

  const handleAssignToMe = async () => {
    if (!selectedTicket) return;

    setIsLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/c2c15ef8-454e-4315-bff3-7109e95d5f3d', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString()
        },
        body: JSON.stringify({
          ticket_id: selectedTicket.id,
          action: 'assign_to_me'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Тикет взят в работу'
        });
        loadTickets(activeTab);
        setIsDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось взять тикет',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedTicket) return;

    setIsLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/c2c15ef8-454e-4315-bff3-7109e95d5f3d', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString()
        },
        body: JSON.stringify({
          ticket_id: selectedTicket.id,
          status: newStatus
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Статус обновлён'
        });
        loadTickets(activeTab);
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !newComment.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/c2c15ef8-454e-4315-bff3-7109e95d5f3d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString()
        },
        body: JSON.stringify({
          ticket_id: selectedTicket.id,
          comment: newComment
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Ответ отправлен'
        });
        setNewComment('');
        await loadComments(selectedTicket.id);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить ответ',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'new': return 'destructive';
      case 'in_progress': return 'default';
      case 'resolved': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return 'AlertCircle';
      case 'normal': return 'Clock';
      case 'low': return 'Info';
      default: return 'Clock';
    }
  };

  const filteredTickets = tickets;

  const newTicketsCount = tickets.filter(t => t.status === 'new').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Тикеты поддержки</h2>
          <p className="text-muted-foreground mt-1">Управление обращениями клиентов</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="new" className="flex flex-col gap-1 py-3">
            <div className="flex items-center gap-2">
              <Icon name="Bell" size={16} />
              <span>Новые</span>
            </div>
            {newTicketsCount > 0 && (
              <Badge variant="destructive" className="rounded-full px-2 py-0 text-xs">
                {newTicketsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="flex flex-col gap-1 py-3">
            <div className="flex items-center gap-2">
              <Icon name="Clock" size={16} />
              <span>В работе</span>
            </div>
            {inProgressCount > 0 && (
              <Badge variant="secondary" className="rounded-full px-2 py-0 text-xs">
                {inProgressCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex flex-col gap-1 py-3">
            <div className="flex items-center gap-2">
              <Icon name="CheckCircle2" size={16} />
              <span>Решено</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex flex-col gap-1 py-3">
            <div className="flex items-center gap-2">
              <Icon name="List" size={16} />
              <span>Все</span>
            </div>
            <Badge variant="outline" className="rounded-full px-2 py-0 text-xs">
              {tickets.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Icon name="Inbox" size={48} className="text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Нет тикетов</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredTickets.map((ticket) => (
                <Card 
                  key={ticket.id} 
                  className="cursor-pointer hover:shadow-md transition-all border-l-4"
                  style={{
                    borderLeftColor: ticket.status === 'new' ? 'hsl(var(--destructive))' : 
                                    ticket.status === 'in_progress' ? 'hsl(var(--primary))' : 
                                    'hsl(var(--muted))'
                  }}
                  onClick={() => openTicketDialog(ticket)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            #{ticket.ticket_number}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(ticket.status)}>
                            {ticket.status_text}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{ticket.subject}</CardTitle>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Icon name="User" size={14} />
                            {ticket.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Phone" size={14} />
                            {ticket.phone}
                          </span>
                          {ticket.email && (
                            <span className="flex items-center gap-1">
                              <Icon name="Mail" size={14} />
                              {ticket.email}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Icon name={getPriorityIcon(ticket.priority)} 
                              size={20} 
                              className={ticket.priority === 'high' ? 'text-destructive' : 'text-muted-foreground'} 
                        />
                        {ticket.assigned_admin_id && (
                          <Badge variant="secondary" className="text-xs">
                            <Icon name="UserCheck" size={12} className="mr-1" />
                            {ticket.admin_name || 'Назначен'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{ticket.message}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Icon name="Calendar" size={12} />
                          {new Date(ticket.created_at).toLocaleDateString('ru-RU')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Tag" size={12} />
                          {ticket.category}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono">#{selectedTicket?.ticket_number}</Badge>
              {selectedTicket?.subject}
            </DialogTitle>
            <DialogDescription>
              <div className="flex flex-wrap gap-3 mt-2">
                <span className="flex items-center gap-1">
                  <Icon name="User" size={14} />
                  {selectedTicket?.name}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Phone" size={14} />
                  {selectedTicket?.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Calendar" size={14} />
                  {selectedTicket && new Date(selectedTicket.created_at).toLocaleString('ru-RU')}
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex gap-2">
              {!selectedTicket?.assigned_admin_id && selectedTicket?.status === 'new' && (
                <Button onClick={handleAssignToMe} disabled={isLoading} className="flex-1">
                  <Icon name="UserCheck" size={16} className="mr-2" />
                  Взять в работу
                </Button>
              )}
              
              <Select 
                value={selectedTicket?.status} 
                onValueChange={handleUpdateStatus}
                disabled={isLoading}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Новое</SelectItem>
                  <SelectItem value="in_progress">В работе</SelectItem>
                  <SelectItem value="resolved">Решено</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm">Описание проблемы</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{selectedTicket?.message}</p>
              </CardContent>
            </Card>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="MessageSquare" size={18} />
                История переписки ({comments.length})
              </h4>
              <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Нет комментариев</p>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`flex gap-3 ${comment.is_admin ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`rounded-lg p-3 max-w-[80%] ${
                          comment.is_admin 
                            ? 'bg-primary text-primary-foreground ml-auto' 
                            : 'bg-muted'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Icon 
                              name={comment.is_admin ? 'Shield' : 'User'} 
                              size={14} 
                            />
                            <span className="text-xs font-medium">
                              {comment.author_name}
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

            <div className="space-y-3">
              <Label>Ответить клиенту</Label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Введите ваш ответ..."
                rows={4}
                disabled={isLoading}
              />
              <Button 
                onClick={handleAddComment} 
                disabled={isLoading || !newComment.trim()}
                className="w-full"
              >
                <Icon name="Send" size={16} className="mr-2" />
                Отправить ответ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportTicketsTab;
