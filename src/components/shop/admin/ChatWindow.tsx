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
  isMobile?: boolean;
}

export default function ChatWindow({
  selectedChat,
  messages,
  messageInput,
  userId,
  onMessageInputChange,
  onSendMessage,
  isMobile = false,
}: ChatWindowProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-base sm:text-lg truncate">
          {selectedChat ? `Чат #${selectedChat.id} - ${selectedChat.user_name}` : 'Выберите чат'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        {selectedChat ? (
          <>
            <div className="flex-1 overflow-y-auto mb-4 space-y-2 border rounded p-2 sm:p-4 max-h-[calc(100vh-300px)] sm:max-h-96">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2 sm:p-3 ${
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
              <div className="flex gap-2 flex-shrink-0">
                <Input
                  value={messageInput}
                  onChange={(e) => onMessageInputChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && onSendMessage()}
                  placeholder="Сообщение..."
                  className="text-sm sm:text-base"
                />
                <Button onClick={onSendMessage} disabled={!messageInput.trim()} size="icon" className="flex-shrink-0">
                  <Icon name="Send" size={18} />
                </Button>
              </div>
            )}
            {selectedChat.status === 'waiting' && (
              <div className="text-center text-muted-foreground py-4 text-sm sm:text-base">
                Нажмите "Взять в работу" чтобы начать общение
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-muted-foreground py-10 sm:py-20 text-sm sm:text-base">
            Выберите чат из списка
          </div>
        )}
      </CardContent>
    </Card>
  );
}