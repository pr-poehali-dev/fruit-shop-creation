import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SUPPORT_CHAT_URL = 'https://functions.poehali.dev/98c69bc9-5dec-4d0e-b5d8-8abc20d4db4d';

interface Message {
  id: number;
  sender_type: 'user' | 'bot' | 'admin';
  sender_name: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface Chat {
  id: number;
  status: 'bot' | 'waiting' | 'active' | 'closed';
  admin_id?: number;
  admin_name?: string;
}

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(() => {
    const chatClosed = sessionStorage.getItem('supportChatClosed');
    return chatClosed !== 'true';
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      let storedGuestId = localStorage.getItem('guestChatId');
      if (!storedGuestId) {
        storedGuestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('guestChatId', storedGuestId);
      }
      setGuestId(storedGuestId);
    }
  }, [userId]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('supportChatClosed', 'true');
  };

  const handleOpen = () => {
    setIsOpen(true);
    sessionStorage.removeItem('supportChatClosed');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && (userId || guestId) && !chat) {
      loadChat();
    }
  }, [isOpen, userId, guestId]);

  const loadChat = async () => {
    const chatUserId = userId || guestId;
    if (!chatUserId) return;

    try {
      const response = await fetch(`${SUPPORT_CHAT_URL}?user_id=${chatUserId}&is_guest=${!userId}`);
      const data = await response.json();
      setChat(data.chat);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Ошибка загрузки чата:', error);
    }
  };

  const sendMessage = async () => {
    const chatUserId = userId || guestId;
    if (!inputMessage.trim() || !chat || !chatUserId) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(SUPPORT_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          user_id: chatUserId,
          chat_id: chat.id,
          message: messageText,
          is_guest: !userId,
        }),
      });

      const data = await response.json();

      const newUserMessage: Message = {
        id: data.message_id,
        sender_type: 'user',
        sender_name: 'Вы',
        message: messageText,
        created_at: new Date().toISOString(),
        is_read: false,
      };

      setMessages((prev) => [...prev, newUserMessage]);

      if (data.bot_response) {
        const botMessage: Message = {
          id: Date.now(),
          sender_type: 'bot',
          sender_name: 'Анфиса',
          message: data.bot_response,
          created_at: new Date().toISOString(),
          is_read: true,
        };
        setMessages((prev) => [...prev, botMessage]);
      }

      if (data.status_changed === 'waiting') {
        setChat((prev) => (prev ? { ...prev, status: 'waiting' } : null));
      }

      setTimeout(loadChat, 2000);
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusBadge = () => {
    if (!chat) return null;

    switch (chat.status) {
      case 'bot':
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Бот Анфиса
          </div>
        );
      case 'waiting':
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            Ожидание администратора...
          </div>
        );
      case 'active':
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {chat.admin_name || 'Администратор'}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
          aria-label="Открыть чат поддержки"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-background border rounded-lg shadow-2xl flex flex-col z-50">
          <div className="flex items-center justify-between p-4 border-b bg-muted/50">
            <div>
              <h3 className="font-semibold">Поддержка</h3>
              {getStatusBadge()}
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X size={20} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.sender_type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : msg.sender_type === 'bot'
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                      : 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100'
                  }`}
                >
                  {msg.sender_type !== 'user' && (
                    <div className="text-xs font-semibold mb-1">{msg.sender_name}</div>
                  )}
                  <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Введите сообщение..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <Button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
                <Send size={20} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}