import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ChatMessage {
  id: number;
  sender_type: 'user' | 'bot' | 'admin';
  sender_name: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

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

interface ChatWindowProps {
  selectedChat: ChatItem | null;
  messages: ChatMessage[];
  messageInput: string;
  userId: number;
  onMessageInputChange: (value: string) => void;
  onSendMessage: () => void;
}

export default function ChatWindow({
  selectedChat,
  messages,
  messageInput,
  userId,
  onMessageInputChange,
  onSendMessage,
}: ChatWindowProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          {selectedChat ? `Чат #${selectedChat.id} - ${selectedChat.user_name}` : 'Выберите чат'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedChat ? (
          <>
            <div className="h-96 overflow-y-auto mb-4 space-y-2 border rounded p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.sender_type === 'admin'
                        ? 'bg-primary text-primary-foreground'
                        : msg.sender_type === 'bot'
                        ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1">{msg.sender_name}</div>
                    <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {new Date(msg.created_at).toLocaleString('ru-RU')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {(selectedChat.status === 'active' && selectedChat.admin_id === userId) && (
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => onMessageInputChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && onSendMessage()}
                  placeholder="Введите сообщение..."
                />
                <Button onClick={onSendMessage} disabled={!messageInput.trim()}>
                  <Icon name="Send" size={20} />
                </Button>
              </div>
            )}
            {selectedChat.status === 'waiting' && (
              <div className="text-center text-muted-foreground py-4">
                Нажмите "Взять в работу" чтобы начать общение
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-muted-foreground py-20">
            Выберите чат из списка слева
          </div>
        )}
      </CardContent>
    </Card>
  );
}
