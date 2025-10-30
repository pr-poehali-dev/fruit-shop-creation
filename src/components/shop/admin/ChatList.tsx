import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ChatItem {
  id: number;
  user_id: number;
  status: 'bot' | 'waiting' | 'active' | 'closed';
  admin_id?: number;
  admin_name?: string;
  user_phone?: string;
  user_name?: string;
  unread_count: number;
  is_guest?: boolean;
  guest_id?: string;
}

interface ChatListProps {
  chats: ChatItem[];
  selectedChatId?: number;
  waitingCount: number;
  activeCount: number;
  onSelectChat: (chatId: number) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'bot':
      return <Badge className="bg-blue-500">🤖 Бот</Badge>;
    case 'waiting':
      return <Badge className="bg-yellow-500">⏳ Ожидает</Badge>;
    case 'active':
      return <Badge className="bg-green-500">✅ Активный</Badge>;
    case 'closed':
      return <Badge variant="secondary">❌ Закрыт</Badge>;
    default:
      return null;
  }
};

export default function ChatList({
  chats,
  selectedChatId,
  onSelectChat,
}: ChatListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Список чатов</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[600px] md:max-h-[70vh] overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`p-3 border rounded cursor-pointer hover:bg-accent transition-colors ${
                selectedChatId === chat.id ? 'bg-accent border-primary' : ''
              }`}
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="flex justify-between items-start mb-2 gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate text-sm sm:text-base">{chat.user_name || 'Пользователь'}</div>
                  {chat.user_phone && (
                    <div className="text-xs sm:text-sm text-muted-foreground truncate">{chat.user_phone}</div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {getStatusBadge(chat.status)}
                </div>
              </div>

              {chat.unread_count > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {chat.unread_count} непрочитано
                </Badge>
              )}

              {chat.admin_name && (
                <div className="text-xs text-muted-foreground mt-1">
                  Администратор: {chat.admin_name}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}