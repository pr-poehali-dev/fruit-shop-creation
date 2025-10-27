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
      const isGuest = !userId;  // Если нет userId - значит гость
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
      const isGuest = !userId;  // Если нет userId - значит гость
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

    // Оптимистичное обновление - показываем сообщение сразу
    const tempId = Date.now();
    const optimisticMessage: Message = {
      id: tempId,
      sender_type: 'user',
      sender_name: 'Вы',
      message: messageText,
      created_at: new Date().toISOString(),
      is_read: false,
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const response = await fetch(SUPPORT_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          user_id: chatUserId,
          chat_id: chat.id,
          message: messageText,
          is_guest: !userId,  // Просто проверяем есть ли userId
        }),
      });

      const data = await response.json();

      // Скрываем FAQ только если переводим на оператора
      if (data.status_changed === 'waiting') {
        setShowFaqs(false);
      }

      // Заменяем временное сообщение на настоящее с ID от сервера
      setMessages((prev) => 
        prev.map(msg => msg.id === tempId ? { ...msg, id: data.message_id } : msg)
      );

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
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-96 h-[85vh] sm:h-[600px] bg-background border sm:rounded-lg shadow-2xl flex flex-col z-50">
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

          <div className="p-4 border-t space-y-3">
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
            <a
              href="https://vk.com/sad_mehti"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.07 0H8.93C3.33 0 0 3.33 0 8.93v6.14C0 20.67 3.33 24 8.93 24h6.14c5.6 0 8.93-3.33 8.93-8.93V8.93C24 3.33 20.67 0 15.07 0zm3.5 17.28c-.68 0-1.33-.42-2.42-1.52-.85-.86-1.22-1.08-1.61-1.08-.5 0-.54.07-.54 1.03v1.27c0 .34-.11.54-.85.54-1.29 0-2.72-.76-3.73-2.17-1.52-2.05-1.94-3.6-1.94-3.92 0-.24.07-.46.43-.46h1.46c.33 0 .45.15.58.5.65 1.94 1.74 3.64 2.19 3.64.17 0 .24-.08.24-.5v-1.94c-.06-1.05-.62-1.14-.62-1.51 0-.2.16-.39.42-.39h2.3c.28 0 .38.15.38.48v2.6c0 .28.12.38.21.38.17 0 .31-.1.62-.41 1-.1 1.77-1.84 2.38-3.59.09-.27.26-.52.64-.52h1.46c.44 0 .53.23.44.54-.18.9-2.08 3.79-2.11 3.85-.14.23-.19.33 0 .61.14.2.61.6 1 1.07.62.68 1.09 1.25 1.22 1.65.13.4-.07.6-.5.6z"/>
              </svg>
              Мы ВКонтакте
            </a>
          </div>
        </div>
      )}

      {!isOpen && (
        <>
          <Button
            onClick={handleOpen}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
            size="icon"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
          
          <a
            href="https://vk.com/sad_mehti"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-[#0077FF] hover:bg-[#0066DD] shadow-lg hover:scale-110 transition-all flex items-center justify-center z-50"
            aria-label="ВКонтакте"
          >
            <svg className="h-7 w-7 text-white" viewBox="0 0 48 48" fill="currentColor">
              <path d="M25.2,32.9h2.4c0,0,0.7-0.1,1.1-0.5c0.3-0.4,0.3-1.1,0.3-1.1s0-3.3,1.5-3.8c1.5-0.5,3.4,3.2,5.4,4.6c1.5,1.1,2.7,0.8,2.7,0.8l5.4-0.1c0,0,2.8-0.2,1.5-2.4c-0.1-0.2-0.8-1.7-4.2-4.8c-3.5-3.2-3-2.7,1.2-8.3c2.5-3.4,3.6-5.5,3.2-6.4c-0.3-0.8-2.4-0.6-2.4-0.6l-6.1,0c0,0-0.5-0.1-0.8,0.1c-0.3,0.2-0.5,0.7-0.5,0.7s-0.9,2.4-2.1,4.5c-2.5,4.3-3.5,4.5-3.9,4.2c-0.9-0.6-0.7-2.3-0.7-3.5c0-3.8,0.6-5.4-1.1-5.8c-0.6-0.1-1-0.2-2.4-0.2c-1.8,0-3.4,0-4.2,0.4c-0.6,0.3-1,0.9-0.7,0.9c0.3,0,1.1,0.2,1.5,0.8c0.5,0.7,0.5,2.4,0.5,2.4s0.3,4.5-0.7,5.1c-0.7,0.4-1.6-0.4-3.6-4.4c-1-2-1.8-4.3-1.8-4.3s-0.1-0.5-0.4-0.7c-0.4-0.3-0.9-0.4-0.9-0.4l-5.8,0c0,0-0.9,0-1.2,0.4c-0.3,0.3-0.0,1,0,1s4.3,10.1,9.2,15.2C19.7,32.7,25.2,32.9,25.2,32.9z"/>
            </svg>
          </a>
        </>
      )}
    </>
  );
}