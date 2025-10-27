import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import FaqManager from './FaqManager';

const SUPPORT_CHAT_URL = 'https://functions.poehali.dev/98c69bc9-5dec-4d0e-b5d8-8abc20d4db4d';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  keywords: string[];
  is_active: boolean;
}

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

interface SupportChatTabProps {
  userId: number;
  userName: string;
  isSuperAdmin?: boolean;
}

export default function SupportChatTab({ userId, userName, isSuperAdmin = false }: SupportChatTabProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'chats' | 'faq'>('chats');
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [prevWaitingCount, setPrevWaitingCount] = useState(0);
  const [showMobileChat, setShowMobileChat] = useState(false);

  useEffect(() => {
    loadChats();
    loadFaqs();
    const interval = setInterval(() => {
      if (activeTab === 'chats') loadChats();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if (selectedChat) {
      const interval = setInterval(() => {
        loadChatMessagesSilent(selectedChat.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  const loadChats = async () => {
    try {
      const response = await fetch(`${SUPPORT_CHAT_URL}?admin_view=true`);
      const data = await response.json();
      
      const waitingChats = data.filter((c: ChatItem) => c.status === 'waiting');
      const waitingCount = waitingChats.length;
      
      if (waitingCount > prevWaitingCount && prevWaitingCount > 0) {
        toast({
          title: '🔔 Новый запрос в поддержку!',
          description: `Ожидает ${waitingCount} чат(ов)`,
          duration: 5000,
        });
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Новый запрос в поддержку', {
            body: `Ожидает ${waitingCount} чат(ов)`,
            icon: '/icon-192.png',
          });
        }
      }
      
      setPrevWaitingCount(waitingCount);
      setChats(data);
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error);
    }
  };

  const loadFaqs = async () => {
    try {
      const response = await fetch(`${SUPPORT_CHAT_URL}?faq=true`);
      const data = await response.json();
      setFaqs(data);
    } catch (error) {
      console.error('Ошибка загрузки FAQ:', error);
    }
  };

  const loadChatMessages = async (chatId: number) => {
    try {
      const chat = chats.find((c) => c.id === chatId);
      if (!chat) return;

      const userId = chat.is_guest ? chat.guest_id : chat.user_id;
      const response = await fetch(`${SUPPORT_CHAT_URL}?user_id=${userId}&is_guest=${chat.is_guest || false}`);
      const data = await response.json();
      setMessages(data.messages || []);
      setSelectedChat(chat);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    }
  };

  const loadChatMessagesSilent = async (chatId: number) => {
    try {
      const chat = chats.find((c) => c.id === chatId);
      if (!chat) return;

      const userId = chat.is_guest ? chat.guest_id : chat.user_id;
      const response = await fetch(`${SUPPORT_CHAT_URL}?user_id=${userId}&is_guest=${chat.is_guest || false}`);
      const data = await response.json();
      
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMessages = (data.messages || []).filter((m: ChatMessage) => !existingIds.has(m.id));
        if (newMessages.length > 0) {
          return [...prev, ...newMessages];
        }
        return prev;
      });
    } catch (error) {
      console.error('Ошибка обновления сообщений:', error);
    }
  };

  const takeChat = async (chatId: number) => {
    try {
      await fetch(SUPPORT_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'take_chat',
          chat_id: chatId,
          admin_id: userId,
        }),
      });
      toast({ title: 'Чат взят в работу' });
      
      await loadChats();
      
      setSelectedChat(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'active',
          admin_id: userId,
          admin_name: userName
        };
      });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось взять чат', variant: 'destructive' });
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;

    try {
      await fetch(SUPPORT_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admin_message',
          chat_id: selectedChat.id,
          admin_id: userId,
          message: messageInput.trim(),
        }),
      });
      setMessageInput('');
      loadChatMessages(selectedChat.id);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось отправить сообщение', variant: 'destructive' });
    }
  };

  const closeChat = async (chatId: number) => {
    try {
      await fetch(SUPPORT_CHAT_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          status: 'closed',
        }),
      });
      toast({ title: 'Чат закрыт' });
      setSelectedChat(null);
      loadChats();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось закрыть чат', variant: 'destructive' });
    }
  };

  const saveFaq = async (faq: { question: string; answer: string; keywords: string }) => {
    try {
      const keywords = faq.keywords.split(',').map((k) => k.trim()).filter(Boolean);
      
      await fetch(SUPPORT_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_faq',
          question: faq.question,
          answer: faq.answer,
          keywords,
        }),
      });
      
      toast({ title: 'FAQ создан' });
      loadFaqs();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось создать FAQ', variant: 'destructive' });
    }
  };

  const updateFaq = async (faq: FAQ) => {
    try {
      await fetch(SUPPORT_CHAT_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faq_id: faq.id,
          question: faq.question,
          answer: faq.answer,
          keywords: faq.keywords,
          is_active: faq.is_active,
        }),
      });
      
      toast({ title: 'FAQ обновлен' });
      loadFaqs();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить FAQ', variant: 'destructive' });
    }
  };

  const deleteFaq = async (faqId: number) => {
    try {
      await fetch(SUPPORT_CHAT_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faq_id: faqId }),
      });
      
      toast({ title: 'FAQ удален' });
      loadFaqs();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить FAQ', variant: 'destructive' });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({ title: 'Уведомления включены' });
      }
    }
  };

  const downloadChatHistory = () => {
    if (!selectedChat || messages.length === 0) {
      toast({ title: 'Нет сообщений для сохранения', variant: 'destructive' });
      return;
    }

    const chatText = messages
      .map(msg => {
        const date = new Date(msg.created_at).toLocaleString('ru-RU');
        return `[${date}] ${msg.sender_name} (${msg.sender_type}):\n${msg.message}\n`;
      })
      .join('\n---\n\n');

    const header = `Чат #${selectedChat.id} - ${selectedChat.user_name}\n`;
    const info = `Телефон: ${selectedChat.user_phone || 'не указан'}\n`;
    const status = `Статус: ${selectedChat.status}\n`;
    const admin = selectedChat.admin_name ? `Администратор: ${selectedChat.admin_name}\n` : '';
    const fullText = `${header}${info}${status}${admin}\n${'='.repeat(50)}\n\n${chatText}`;

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat_${selectedChat.id}_${selectedChat.user_name}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: 'История чата сохранена' });
  };

  const handleSelectChat = (chatId: number) => {
    loadChatMessages(chatId);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeTab === 'chats' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('chats'); setShowMobileChat(false); }}
          className="flex-1 sm:flex-none"
        >
          <Icon name="MessageSquare" size={16} className="mr-2" />
          Чаты
        </Button>
        <Button
          variant={activeTab === 'faq' ? 'default' : 'outline'}
          onClick={() => setActiveTab('faq')}
          className="flex-1 sm:flex-none"
        >
          <Icon name="HelpCircle" size={16} className="mr-2" />
          FAQ
        </Button>
        {isSuperAdmin && selectedChat && activeTab === 'chats' && (
          <Button
            variant="outline"
            onClick={downloadChatHistory}
            className="flex-1 sm:flex-none"
          >
            <Icon name="Download" size={16} className="mr-2" />
            <span className="hidden sm:inline">Сохранить переписку</span>
            <span className="sm:hidden">Сохранить</span>
          </Button>
        )}
      </div>

      {activeTab === 'chats' ? (
        <>
          <div className="hidden md:grid md:grid-cols-2 gap-4">
            <ChatList
              chats={chats}
              selectedChat={selectedChat}
              userId={userId}
              onSelectChat={handleSelectChat}
              onTakeChat={takeChat}
              onCloseChat={closeChat}
            />
            <ChatWindow
              selectedChat={selectedChat}
              messages={messages}
              messageInput={messageInput}
              userId={userId}
              onMessageInputChange={setMessageInput}
              onSendMessage={sendMessage}
            />
          </div>

          <div className="md:hidden">
            {!showMobileChat ? (
              <ChatList
                chats={chats}
                selectedChat={selectedChat}
                userId={userId}
                onSelectChat={handleSelectChat}
                onTakeChat={takeChat}
                onCloseChat={closeChat}
              />
            ) : (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={handleBackToList}
                  className="w-full"
                >
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Назад к списку
                </Button>
                <ChatWindow
                  selectedChat={selectedChat}
                  messages={messages}
                  messageInput={messageInput}
                  userId={userId}
                  onMessageInputChange={setMessageInput}
                  onSendMessage={sendMessage}
                />
              </div>
            )}
          </div>
        </>
      ) : (
        <FaqManager
          faqs={faqs}
          onSaveFaq={saveFaq}
          onUpdateFaq={updateFaq}
          onDeleteFaq={deleteFaq}
        />
      )}
    </div>
  );
}