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
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
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
    loadTickets(statusFilter);
  }, [userId, statusFilter]);

  const openTicketDialog = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
    setAdminNotes('');
    setNewComment('');
    setIsDialogOpen(true);
    await loadComments(ticket.id);
  };

  const handleUpdateStatus = async () => {
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
          status: newStatus,
          admin_notes: adminNotes || undefined
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Тикет обновлён'
        });
        loadTickets(statusFilter);
        setIsDialogOpen(false);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить тикет',
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
          description: 'Комментарий добавлен'
        });
        setNewComment('');
        await loadComments(selectedTicket.id);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить комментарий',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'new': return 'destructive';
      case 'open': return 'default';
      case 'in_progress': return 'secondary';
      case 'resolved': return 'outline';
      case 'closed': return 'outline';
      default: return 'default';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'normal': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Обращения в поддержку</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Фильтр" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="new">Новые</SelectItem>
            <SelectItem value="open">Открытые</SelectItem>
            <SelectItem value="in_progress">В обработке</SelectItem>
            <SelectItem value="resolved">Решено</SelectItem>
            <SelectItem value="closed">Закрыто</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => openTicketDialog(ticket)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">#{ticket.ticket_number} - {ticket.subject}</CardTitle>
                  <CardDescription>{ticket.name} • {ticket.phone}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant={getStatusBadgeVariant(ticket.status)}>
                    {ticket.status_text}
                  </Badge>
                  <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">{ticket.message}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Icon name="Calendar" size={14} />
                  {new Date(ticket.created_at).toLocaleDateString('ru-RU')}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Tag" size={14} />
                  {ticket.category}
                </span>
                {ticket.attachments && ticket.attachments.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Icon name="Paperclip" size={14} />
                    {ticket.attachments.length}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {tickets.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Нет обращений
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Обращение #{selectedTicket?.ticket_number}</DialogTitle>
            <DialogDescription>
              {selectedTicket?.name} • {selectedTicket?.phone}
              {selectedTicket?.email && ` • ${selectedTicket.email}`}
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Детали</TabsTrigger>
                <TabsTrigger value="comments">Комментарии ({comments.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="space-y-2">
                  <Label>Тема</Label>
                  <p className="text-sm font-medium">{selectedTicket.subject}</p>
                </div>

                <div className="space-y-2">
                  <Label>Описание</Label>
                  <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Категория</Label>
                    <p className="text-sm">{selectedTicket.category}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Приоритет</Label>
                    <Badge variant={getPriorityBadgeVariant(selectedTicket.priority)}>
                      {selectedTicket.priority}
                    </Badge>
                  </div>
                </div>

                {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Вложения</Label>
                    <div className="space-y-2">
                      {selectedTicket.attachments.map((url, idx) => (
                        <a 
                          key={idx} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 bg-muted rounded hover:bg-muted/80 text-sm"
                        >
                          <Icon name="File" size={16} />
                          Файл {idx + 1}
                          <Icon name="ExternalLink" size={14} className="ml-auto" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="status">Статус</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Новое</SelectItem>
                      <SelectItem value="open">Открыто</SelectItem>
                      <SelectItem value="in_progress">В обработке</SelectItem>
                      <SelectItem value="resolved">Решено</SelectItem>
                      <SelectItem value="closed">Закрыто</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedTicket.rating && (
                  <div className="space-y-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <Label>Оценка от пользователя</Label>
                    <div className="flex items-center gap-1">
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

                <div className="space-y-2">
                  <Label htmlFor="adminNotes">Заметки администратора</Label>
                  <Textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Внутренние заметки..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleUpdateStatus} disabled={isLoading} className="w-full">
                  <Icon name="Save" size={16} className="mr-2" />
                  {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </TabsContent>

              <TabsContent value="comments" className="space-y-4">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-3 rounded-lg ${
                        comment.is_admin ? 'bg-primary/10 ml-8' : 'bg-muted mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {comment.is_admin && <Icon name="Shield" size={14} className="inline mr-1" />}
                          {comment.author_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleString('ru-RU')}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      Комментариев пока нет
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newComment">Добавить комментарий</Label>
                  <Textarea
                    id="newComment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Напишите ответ клиенту..."
                    rows={3}
                  />
                  <Button onClick={handleAddComment} disabled={isLoading || !newComment.trim()} className="w-full">
                    <Icon name="Send" size={16} className="mr-2" />
                    {isLoading ? 'Отправка...' : 'Отправить'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportTicketsTab;