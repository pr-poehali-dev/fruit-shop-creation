import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

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
}

export default function SupportChatTab({ userId, userName }: SupportChatTabProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'chats' | 'faq'>('chats');
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', keywords: '' });
  const [prevWaitingCount, setPrevWaitingCount] = useState(0);

  useEffect(() => {
    loadChats();
    loadFaqs();
    const interval = setInterval(() => {
      if (activeTab === 'chats') loadChats();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Автообновление сообщений открытого чата каждые 5 секунд
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
      
      // Добавляем только новые сообщения
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
      
      // Сразу обновляем список чатов и selectedChat
      await loadChats();
      
      // Обновляем selectedChat из обновленного списка чатов
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

  const saveFaq = async () => {
    try {
      const keywords = newFaq.keywords.split(',').map((k) => k.trim()).filter(Boolean);
      
      await fetch(SUPPORT_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_faq',
          question: newFaq.question,
          answer: newFaq.answer,
          keywords,
        }),
      });
      
      toast({ title: 'FAQ создан' });
      setNewFaq({ question: '', answer: '', keywords: '' });
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
      setEditingFaq(null);
      loadFaqs();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить FAQ', variant: 'destructive' });
    }
  };

  const toggleFaqStatus = async (faq: FAQ) => {
    await updateFaq({ ...faq, is_active: !faq.is_active });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'chats' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('chats')}
        >
          <Icon name="MessageCircle" size={16} className="mr-2" />
          Чаты поддержки
        </Button>
        <Button
          variant={activeTab === 'faq' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('faq')}
        >
          <Icon name="HelpCircle" size={16} className="mr-2" />
          FAQ для Анфисы
        </Button>
      </div>

      {activeTab === 'chats' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Активные чаты ({chats.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-muted ${
                    selectedChat?.id === chat.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => loadChatMessages(chat.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium">{chat.user_name || chat.user_phone}</div>
                    {chat.unread_count > 0 && (
                      <Badge variant="destructive">{chat.unread_count}</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {chat.status === 'waiting' && '⏳ Ожидает'}
                    {chat.status === 'active' && `✅ ${chat.admin_name}`}
                    {chat.status === 'bot' && '🤖 Анфиса'}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {selectedChat
                    ? `Чат с ${selectedChat.user_name || selectedChat.user_phone}`
                    : 'Выберите чат'}
                </CardTitle>
                {selectedChat && (
                  <div className="flex gap-2">
                    {selectedChat.status === 'waiting' && (
                      <Button size="sm" onClick={() => takeChat(selectedChat.id)}>
                        Взять в работу
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => closeChat(selectedChat.id)}
                    >
                      Закрыть чат
                    </Button>
                  </div>
                )}
              </div>
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
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        placeholder="Введите сообщение..."
                      />
                      <Button onClick={sendMessage} disabled={!messageInput.trim()}>
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
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Добавить новый FAQ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Вопрос"
                value={newFaq.question}
                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
              />
              <Textarea
                placeholder="Ответ"
                value={newFaq.answer}
                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                rows={3}
              />
              <Input
                placeholder="Ключевые слова через запятую"
                value={newFaq.keywords}
                onChange={(e) => setNewFaq({ ...newFaq, keywords: e.target.value })}
              />
              <Button onClick={saveFaq}>Создать FAQ</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Существующие FAQ ({faqs.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.id} className="border rounded-lg p-4">
                  {editingFaq?.id === faq.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editingFaq.question}
                        onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                      />
                      <Textarea
                        value={editingFaq.answer}
                        onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                        rows={3}
                      />
                      <Input
                        value={editingFaq.keywords.join(', ')}
                        onChange={(e) =>
                          setEditingFaq({
                            ...editingFaq,
                            keywords: e.target.value.split(',').map((k) => k.trim()),
                          })
                        }
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => updateFaq(editingFaq)}>Сохранить</Button>
                        <Button variant="outline" onClick={() => setEditingFaq(null)}>
                          Отмена
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold">{faq.question}</div>
                        <Badge variant={faq.is_active ? 'default' : 'secondary'}>
                          {faq.is_active ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">{faq.answer}</div>
                      <div className="text-xs text-muted-foreground mb-3">
                        Ключевые слова: {faq.keywords.join(', ')}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingFaq(faq)}>
                          Редактировать
                        </Button>
                        <Button
                          size="sm"
                          variant={faq.is_active ? 'destructive' : 'default'}
                          onClick={() => toggleFaqStatus(faq)}
                        >
                          {faq.is_active ? 'Деактивировать' : 'Активировать'}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}