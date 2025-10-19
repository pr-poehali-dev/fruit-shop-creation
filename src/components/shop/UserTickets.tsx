import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

  const openTicketDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDialogOpen(true);
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Обращение #{selectedTicket?.ticket_number}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
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
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserTickets;