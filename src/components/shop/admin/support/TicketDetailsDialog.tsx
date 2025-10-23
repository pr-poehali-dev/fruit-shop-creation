import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import CommentsList from './CommentsList';

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

interface TicketDetailsDialogProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  newComment: string;
  setNewComment: (value: string) => void;
  isLoading: boolean;
  onAssignToMe: () => void;
  onUpdateStatus: (status: string) => void;
  onAddComment: () => void;
  userId: number;
  getStatusBadgeVariant: (status: string) => "destructive" | "default" | "outline" | "secondary";
  getPriorityIcon: (priority: string) => string;
}

const TicketDetailsDialog = ({
  ticket,
  isOpen,
  onClose,
  comments,
  newComment,
  setNewComment,
  isLoading,
  onAssignToMe,
  onUpdateStatus,
  onAddComment,
  userId,
  getStatusBadgeVariant,
  getPriorityIcon
}: TicketDetailsDialogProps) => {
  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl flex items-center gap-2">
                {ticket.subject}
                <Icon name={getPriorityIcon(ticket.priority)} size={20} className="text-muted-foreground" />
              </DialogTitle>
              <DialogDescription className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">Тикет #{ticket.ticket_number}</span>
                  <span>•</span>
                  <Badge variant={getStatusBadgeVariant(ticket.status)}>
                    {ticket.status_text}
                  </Badge>
                </div>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Клиент</Label>
              <p className="font-medium">{ticket.name}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Телефон</Label>
              <p className="font-medium">{ticket.phone}</p>
            </div>
            {ticket.email && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="font-medium">{ticket.email}</p>
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Категория</Label>
              <p className="font-medium">{ticket.category}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Создан</Label>
              <p className="font-medium">
                {new Date(ticket.created_at).toLocaleString('ru-RU')}
              </p>
            </div>
            {ticket.assigned_admin_id && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Назначен</Label>
                <p className="font-medium flex items-center gap-2">
                  <Icon name="User" size={14} />
                  {ticket.admin_name}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Описание проблемы</Label>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{ticket.message}</p>
            </div>
          </div>

          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="space-y-2">
              <Label>Прикреплённые файлы</Label>
              <div className="grid grid-cols-2 gap-2">
                {ticket.attachments.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 border rounded hover:bg-muted/50 transition-colors"
                  >
                    <Icon name="Paperclip" size={16} />
                    <span className="text-sm truncate">Файл {index + 1}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {ticket.rating && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                <Label>Оценка клиента: {ticket.rating}/5</Label>
              </div>
              {ticket.rating_comment && (
                <p className="text-sm text-muted-foreground">{ticket.rating_comment}</p>
              )}
            </div>
          )}

          <div className="space-y-3">
            <Label>История переписки</Label>
            <CommentsList comments={comments} />
          </div>

          <div className="space-y-3">
            <Label htmlFor="new-comment">Ответ администратора</Label>
            <Textarea
              id="new-comment"
              placeholder="Введите ответ клиенту..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
            />
            <Button
              onClick={onAddComment}
              disabled={isLoading || !newComment.trim()}
              className="w-full"
            >
              <Icon name="Send" size={16} className="mr-2" />
              Отправить ответ
            </Button>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            {!ticket.assigned_admin_id && (
              <Button
                onClick={onAssignToMe}
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                <Icon name="UserPlus" size={16} className="mr-2" />
                Взять в работу
              </Button>
            )}

            <div className="flex-1">
              <Select
                value={ticket.status}
                onValueChange={onUpdateStatus}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Новый</SelectItem>
                  <SelectItem value="in_progress">В работе</SelectItem>
                  <SelectItem value="resolved">Решён</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailsDialog;
