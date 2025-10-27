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

interface ArchivedChat {
  id: number;
  chat_id: number;
  user_name: string;
  user_phone?: string;
  admin_name?: string;
  closed_at: string;
  messages_json: string;
}

export default function SupportChatTab({ userId, userName, isSuperAdmin = false }: SupportChatTabProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'chats' | 'faq' | 'archive'>('chats');
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [prevWaitingCount, setPrevWaitingCount] = useState(0);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [archivedChats, setArchivedChats] = useState<ArchivedChat[]>([]);
  const [selectedArchive, setSelectedArchive] = useState<ArchivedChat | null>(null);

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
      toast({ title: 'Чат закрыт и сохранён в архив' });
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



  const handleSelectChat = (chatId: number) => {
    loadChatMessages(chatId);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  const loadArchivedChats = async () => {
    try {
      const response = await fetch(`${SUPPORT_CHAT_URL}?archive=true`);
      const data = await response.json();
      setArchivedChats(data);
    } catch (error) {
      console.error('Ошибка загрузки архива:', error);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить архив', variant: 'destructive' });
    }
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
        {isSuperAdmin && (
          <Button
            variant={activeTab === 'archive' ? 'default' : 'outline'}
            onClick={() => { setActiveTab('archive'); loadArchivedChats(); }}
            className="flex-1 sm:flex-none"
          >
            <Icon name="Archive" size={16} className="mr-2" />
            Архив
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
      ) : activeTab === 'faq' ? (
        <FaqManager
          faqs={faqs}
          onSaveFaq={saveFaq}
          onUpdateFaq={updateFaq}
          onDeleteFaq={deleteFaq}
        />
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Архив чатов</h3>
          {archivedChats.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-muted/20">
              <Icon name="Archive" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Архив пуст</p>
            </div>
          ) : (
            <div className="space-y-2">
              {archivedChats.map((archive) => (
                <div
                  key={archive.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedArchive(selectedArchive?.id === archive.id ? null : archive)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">{archive.user_name}</div>
                      {archive.user_phone && (
                        <div className="text-sm text-muted-foreground">{archive.user_phone}</div>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>Чат #{archive.chat_id}</div>
                      <div>{new Date(archive.closed_at).toLocaleDateString('ru-RU')}</div>
                    </div>
                  </div>
                  {archive.admin_name && (
                    <div className="text-sm text-muted-foreground mb-2">
                      Администратор: {archive.admin_name}
                    </div>
                  )}
                  
                  {selectedArchive?.id === archive.id && (
                    <div className="mt-4 pt-4 border-t space-y-3 max-h-96 overflow-y-auto">
                      {JSON.parse(archive.messages_json).map((msg: any, idx: number) => (
                        <div
                          key={idx}
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
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}