import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  selectedChat: ChatItem | null;
  userId: number;
  onSelectChat: (chatId: number) => void;
  onTakeChat: (chatId: number) => void;
  onCloseChat: (chatId: number) => void;
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
  selectedChat,
  userId,
  onSelectChat,
  onTakeChat,
  onCloseChat,
}: ChatListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Список чатов</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`p-3 border rounded cursor-pointer hover:bg-accent ${
                selectedChat?.id === chat.id ? 'bg-accent' : ''
              }`}
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold">{chat.user_name || 'Пользователь'}</div>
                  {chat.user_phone && (
                    <div className="text-sm text-muted-foreground">{chat.user_phone}</div>
                  )}
                </div>
                {getStatusBadge(chat.status)}
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

              <div className="flex gap-2 mt-2">
                {chat.status === 'waiting' && (
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); onTakeChat(chat.id); }}>
                    Взять в работу
                  </Button>
                )}
                {chat.status === 'active' && chat.admin_id === userId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); onCloseChat(chat.id); }}
                  >
                    Закрыть чат
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
