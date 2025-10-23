import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

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

interface TicketCardProps {
  ticket: Ticket;
  onOpen: (ticket: Ticket) => void;
  getStatusBadgeVariant: (status: string) => "destructive" | "default" | "outline" | "secondary";
  getPriorityIcon: (priority: string) => string;
}

const TicketCard = ({ ticket, onOpen, getStatusBadgeVariant, getPriorityIcon }: TicketCardProps) => {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
      onClick={() => onOpen(ticket)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{ticket.subject}</CardTitle>
              <Icon name={getPriorityIcon(ticket.priority)} size={16} className="text-muted-foreground" />
            </div>
            <CardDescription className="flex items-center gap-2 text-xs">
              <span>#{ticket.ticket_number}</span>
              <span>•</span>
              <span>{ticket.name}</span>
            </CardDescription>
          </div>
          <Badge variant={getStatusBadgeVariant(ticket.status)}>
            {ticket.status_text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {ticket.message}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Icon name="Tag" size={14} />
              <span>{ticket.category}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="Calendar" size={14} />
              <span>{new Date(ticket.created_at).toLocaleDateString('ru-RU')}</span>
            </div>
          </div>
          {ticket.assigned_admin_id && (
            <div className="flex items-center gap-1 text-primary">
              <Icon name="User" size={14} />
              <span>{ticket.admin_name}</span>
            </div>
          )}
        </div>
        {ticket.rating && (
          <div className="flex items-center gap-1 pt-2 border-t">
            <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium">{ticket.rating}/5</span>
            {ticket.rating_comment && (
              <span className="text-xs text-muted-foreground ml-2 line-clamp-1">
                {ticket.rating_comment}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketCard;
