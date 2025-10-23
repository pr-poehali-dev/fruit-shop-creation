import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import TicketCard from './TicketCard';

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

interface TicketsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  tickets: Ticket[];
  newTicketsCount: number;
  inProgressCount: number;
  resolvedCount: number;
  onTicketOpen: (ticket: Ticket) => void;
  getStatusBadgeVariant: (status: string) => "destructive" | "default" | "outline" | "secondary";
  getPriorityIcon: (priority: string) => string;
}

const TicketsTabs = ({
  activeTab,
  onTabChange,
  tickets,
  newTicketsCount,
  inProgressCount,
  resolvedCount,
  onTicketOpen,
  getStatusBadgeVariant,
  getPriorityIcon
}: TicketsTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
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
            <Badge variant="default" className="rounded-full px-2 py-0 text-xs">
              {inProgressCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="resolved" className="flex flex-col gap-1 py-3">
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle" size={16} />
            <span>Решённые</span>
          </div>
          {resolvedCount > 0 && (
            <Badge variant="outline" className="rounded-full px-2 py-0 text-xs">
              {resolvedCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="all" className="flex flex-col gap-1 py-3">
          <div className="flex items-center gap-2">
            <Icon name="List" size={16} />
            <span>Все</span>
          </div>
          {tickets.length > 0 && (
            <Badge variant="secondary" className="rounded-full px-2 py-0 text-xs">
              {tickets.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="new" className="mt-6">
        <div className="grid gap-4 md:grid-cols-2">
          {tickets.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Новых тикетов нет</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onOpen={onTicketOpen}
                getStatusBadgeVariant={getStatusBadgeVariant}
                getPriorityIcon={getPriorityIcon}
              />
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="in_progress" className="mt-6">
        <div className="grid gap-4 md:grid-cols-2">
          {tickets.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Нет тикетов в работе</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onOpen={onTicketOpen}
                getStatusBadgeVariant={getStatusBadgeVariant}
                getPriorityIcon={getPriorityIcon}
              />
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="resolved" className="mt-6">
        <div className="grid gap-4 md:grid-cols-2">
          {tickets.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Нет решённых тикетов</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onOpen={onTicketOpen}
                getStatusBadgeVariant={getStatusBadgeVariant}
                getPriorityIcon={getPriorityIcon}
              />
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="all" className="mt-6">
        <div className="grid gap-4 md:grid-cols-2">
          {tickets.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Тикетов нет</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onOpen={onTicketOpen}
                getStatusBadgeVariant={getStatusBadgeVariant}
                getPriorityIcon={getPriorityIcon}
              />
            ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default TicketsTabs;
