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

interface FAQ {
  id: number;
  question: string;
  answer: string;
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
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [showFaqs, setShowFaqs] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const userId = localStorage.getItem('userId') || null;

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
      loadFaqs();
    }
  }, [isOpen, userId, guestId]);

  // Автообновление чата каждые 5 секунд
  useEffect(() => {
    if (isOpen && chat) {
      pollingIntervalRef.current = setInterval(() => {
        loadChatSilent();
      }, 5000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [isOpen, chat]);

  const loadFaqs = async () => {
    try {
      const response = await fetch(`${SUPPORT_CHAT_URL}?faq=true`);
      const data = await response.json();
      const activeFaqs = Array.isArray(data) ? data.filter((f: any) => f.is_active) : [];
      setFaqs(activeFaqs);
    } catch (error) {
      console.error('Ошибка загрузки FAQ:', error);
    }
  };

  const loadChat = async () => {
    const chatUserId = userId || guestId;
    if (!chatUserId) return;

    try {
      const isGuest = !userId;
      const response = await fetch(`${SUPPORT_CHAT_URL}?user_id=${chatUserId}&is_guest=${isGuest}`);
      const data = await response.json();
      setChat(data.chat);
      setMessages(data.messages || []);
      
      // Показываем FAQ только если статус 'bot' и нет пользовательских сообщений
      if (data.chat?.status === 'bot') {
        const hasUserMessages = (data.messages || []).some((m: Message) => m.sender_type === 'user');
        setShowFaqs(!hasUserMessages);
      } else {
        setShowFaqs(false);
      }
    } catch (error) {
      console.error('Ошибка загрузки чата:', error);
    }
  };

  // Тихое обновление без перезагрузки UI
  const loadChatSilent = async () => {
    const chatUserId = userId || guestId;
    if (!chatUserId) return;

    try {
      const isGuest = !userId;
      const response = await fetch(`${SUPPORT_CHAT_URL}?user_id=${chatUserId}&is_guest=${isGuest}`);
      const data = await response.json();
      
      // Обновляем статус чата
      setChat(prevChat => {
        if (prevChat && prevChat.status !== data.chat.status) {
          // Если перешли на оператора - скрываем FAQ
          if (data.chat.status === 'active' || data.chat.status === 'waiting') {
            setShowFaqs(false);
          }
          return data.chat;
        }
        return prevChat || data.chat;
      });
      
      // Добавляем только новые сообщения
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMessages = (data.messages || []).filter((m: Message) => !existingIds.has(m.id));
        if (newMessages.length > 0) {
          return [...prev, ...newMessages];
        }
        return prev;
      });
    } catch (error) {
      console.error('Ошибка обновления чата:', error);
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
          is_guest: !userId || chatUserId === guestId,
        }),
      });

      const data = await response.json();

      // Скрываем FAQ только если переводим на оператора
      if (data.status_changed === 'waiting') {
        setShowFaqs(false);
      }

      const newUserMessage: Message = {
        id: data.message_id,
        sender_type: 'user',
        sender_name: 'Вы',
        message: messageText,
        created_at: new Date().toISOString(),
        is_read: false,
      };

      setMessages((prev) => {
        // Проверяем, нет ли уже этого сообщения
        if (prev.some(m => m.id === data.message_id)) {
          return prev;
        }
        return [...prev, newUserMessage];
      });

      if (data.bot_response) {
        const botMessageId = data.bot_message_id || Date.now();
        const botMessage: Message = {
          id: botMessageId,
          sender_type: 'bot',
          sender_name: 'Анфиса',
          message: data.bot_response,
          created_at: new Date().toISOString(),
          is_read: true,
        };
        setMessages((prev) => {
          // Проверяем, нет ли уже этого сообщения
          if (prev.some(m => m.id === botMessageId)) {
            return prev;
          }
          return [...prev, botMessage];
        });
        
        // Если бот ответил (не перевел на оператора) - показываем FAQ через 2 секунды
        if (!data.status_changed) {
          setTimeout(() => {
            setShowFaqs(true);
          }, 2000);
        }
      }

      if (data.status_changed === 'waiting') {
        setChat((prev) => (prev ? { ...prev, status: 'waiting' } : null));
        setShowFaqs(false);
      }
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
            
            {showFaqs && chat?.status === 'bot' && faqs.length > 0 && (
              <div className="space-y-2 mt-4">
                <div className="text-sm font-semibold text-muted-foreground">Популярные вопросы:</div>
                {faqs.map((faq) => (
                  <button
                    key={faq.id}
                    onClick={() => {
                      setInputMessage(faq.question);
                    }}
                    className="w-full text-left text-sm p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    {faq.question}
                  </button>
                ))}
              </div>
            )}
            
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