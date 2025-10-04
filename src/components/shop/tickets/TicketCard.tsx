import { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import InlineRatingForm from './InlineRatingForm';

interface TicketCardProps {
  ticket: any;
  unreadCount: number;
  statusLabels: Record<string, string>;
  replyMessage: string;
  onReplyChange: (value: string) => void;
  onSendReply: () => void;
  onShowRating: () => void;
  onDismiss?: () => void;
  apiUrl?: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const TicketCard = ({
  ticket,
  unreadCount,
  statusLabels,
  replyMessage,
  onReplyChange,
  onSendReply,
  onShowRating,
  onDismiss,
  apiUrl,
  messagesEndRef
}: TicketCardProps) => {
  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved';

  return (
    <Card 
      className={`cursor-pointer hover:bg-accent/50 transition ${unreadCount > 0 ? 'border-primary shadow-sm' : ''}`}
      onClick={() => {}}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm">#{ticket.id} {ticket.subject}</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs mt-1">
              {new Date(ticket.created_at).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </CardDescription>
          </div>
          <Badge variant={isClosed ? 'secondary' : 'outline'} className="text-xs shrink-0">
            {statusLabels[ticket.status] || ticket.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {ticket?.messages?.filter((m: any) => m && m.id && m.message).map((msg: any) => (
            <div 
              key={msg.id} 
              className={`p-3 rounded-lg ${msg.is_admin ? 'bg-primary/10 ml-4' : 'bg-muted mr-4'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-medium">
                  {msg.is_admin ? '👨‍💼 Администратор' : '👤 Вы'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(msg.created_at).toLocaleString('ru-RU', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {!isClosed && (
          <div className="mt-4 pt-4 border-t">
            <Textarea
              value={replyMessage}
              onChange={(e) => onReplyChange(e.target.value)}
              placeholder="Введите ваше сообщение"
              rows={2}
              className="mb-2"
            />
            <Button 
              onClick={onSendReply} 
              size="sm"
              className="w-full"
              disabled={!replyMessage.trim()}
            >
              <Icon name="Send" size={16} className="mr-2" />
              Отправить
            </Button>
          </div>
        )}
        
        {isClosed && (
          <div className="mt-4 space-y-3 border-t pt-4">
            <div className="bg-muted p-3 rounded-lg text-sm text-center font-medium">
              Тикет {ticket.status === 'closed' ? 'закрыт' : 'решён'}
            </div>
            {ticket.rating ? (
              <>
                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">Ваша оценка: {ticket.rating}/5</span>
                  </div>
                  {ticket.rating_comment && (
                    <p className="text-xs text-muted-foreground">{ticket.rating_comment}</p>
                  )}
                </div>
                {onDismiss && (
                  <Button 
                    onClick={onDismiss}
                    className="w-full"
                    variant="outline"
                    size="sm"
                  >
                    <Icon name="X" size={16} className="mr-2" />
                    Убрать тикет
                  </Button>
                )}
              </>
            ) : (
              apiUrl ? (
                <InlineRatingForm
                  ticketId={ticket.id}
                  apiUrl={apiUrl}
                  onRatingSubmitted={onShowRating}
                />
              ) : (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 p-4 rounded-lg border-2 border-yellow-300 dark:border-yellow-800">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-yellow-400 dark:bg-yellow-600 rounded-full">
                      <Icon name="Star" size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">Оцените работу поддержки</h4>
                      <p className="text-xs text-muted-foreground">
                        Ваше мнение поможет нам стать лучше. Пожалуйста, поставьте оценку от 1 до 5 звёзд.
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={onShowRating}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                    size="lg"
                  >
                    <Icon name="Star" size={18} className="mr-2" />
                    Оценить сейчас
                  </Button>
                </div>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketCard;