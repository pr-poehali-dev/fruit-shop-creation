import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface SupportStatsCardProps {
  tickets: any[];
}

const SupportStatsCard = ({ tickets }: SupportStatsCardProps) => {
  const ratedTickets = tickets.filter(t => t.rating);
  const closedTickets = tickets.filter(t => t.status === 'closed' || t.status === 'resolved');
  const waitingRating = closedTickets.filter(t => !t.rating);
  
  const avgRating = ratedTickets.length > 0
    ? (ratedTickets.reduce((sum, t) => sum + t.rating, 0) / ratedTickets.length).toFixed(1)
    : '0.0';
  
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: ratedTickets.filter(t => t.rating === star).length,
    percentage: ratedTickets.length > 0 
      ? Math.round((ratedTickets.filter(t => t.rating === star).length / ratedTickets.length) * 100)
      : 0
  }));

  const totalTickets = tickets.length;
  const activeTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="BarChart3" size={20} />
          Статистика поддержки
        </CardTitle>
        <CardDescription>Общая информация по тикетам и оценкам</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600">{totalTickets}</div>
            <div className="text-xs text-muted-foreground">Всего тикетов</div>
          </div>
          
          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-600">{activeTickets}</div>
            <div className="text-xs text-muted-foreground">Активных</div>
          </div>
          
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-yellow-600">{avgRating}</span>
              <Icon name="Star" size={18} className="text-yellow-500 fill-yellow-500" />
            </div>
            <div className="text-xs text-muted-foreground">
              Средняя оценка {ratedTickets.length > 0 && `(${ratedTickets.length} оценок)`}
            </div>
          </div>
          
          <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="text-2xl font-bold text-orange-600">{waitingRating.length}</div>
            <div className="text-xs text-muted-foreground">
              Ждут оценки
              {waitingRating.length > 0 && (
                <div className="text-xs text-orange-600 mt-1">
                  Пользователи увидят запрос
                </div>
              )}
            </div>
          </div>
        </div>

        {ratedTickets.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Icon name="Star" size={16} />
              Распределение оценок
            </h4>
            <div className="space-y-2">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{star}</span>
                    <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-16 text-sm text-right">
                    <span className="font-medium">{count}</span>
                    <span className="text-muted-foreground ml-1">({percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {ratedTickets.filter(t => t.rating_comment).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Icon name="MessageSquare" size={16} />
              Последние отзывы ({ratedTickets.filter(t => t.rating_comment).length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {ratedTickets
                .filter(t => t.rating_comment)
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                .slice(0, 5)
                .map(ticket => (
                  <div key={ticket.id} className="p-3 bg-muted rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{ticket.id}
                        </Badge>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: ticket.rating }).map((_, i) => (
                            <Icon key={i} name="Star" size={12} className="text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {ticket.user_name}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {ticket.subject}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      "{ticket.rating_comment}"
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupportStatsCard;