import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import TicketsTabs from './support/TicketsTabs';
import TicketDetailsDialog from './support/TicketDetailsDialog';

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

  const getStatusBadgeVariant = (status: string): "destructive" | "default" | "outline" | "secondary" => {
    switch (status) {
      case 'new': return 'destructive';
      case 'in_progress': return 'default';
      case 'resolved': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityIcon = (priority: string): string => {
    switch (priority) {
      case 'high': return 'AlertCircle';
      case 'normal': return 'Clock';
      case 'low': return 'Info';
      default: return 'Clock';
    }
  };

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

      <TicketsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tickets={tickets}
        newTicketsCount={newTicketsCount}
        inProgressCount={inProgressCount}
        resolvedCount={resolvedCount}
        onTicketOpen={openTicketDialog}
        getStatusBadgeVariant={getStatusBadgeVariant}
        getPriorityIcon={getPriorityIcon}
      />

      <TicketDetailsDialog
        ticket={selectedTicket}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        comments={comments}
        newComment={newComment}
        setNewComment={setNewComment}
        isLoading={isLoading}
        onAssignToMe={handleAssignToMe}
        onUpdateStatus={handleUpdateStatus}
        onAddComment={handleAddComment}
        userId={userId}
        getStatusBadgeVariant={getStatusBadgeVariant}
        getPriorityIcon={getPriorityIcon}
      />
    </div>
  );
};

export default SupportTicketsTab;
