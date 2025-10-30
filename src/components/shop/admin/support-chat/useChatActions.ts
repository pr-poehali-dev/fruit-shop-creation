import { useToast } from '@/hooks/use-toast';
import { ChatItem, ChatMessage, SUPPORT_CHAT_URL } from './types';

interface UseChatActionsProps {
  userId: number;
  userName: string;
  chats: ChatItem[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setSelectedChat: React.Dispatch<React.SetStateAction<ChatItem | null>>;
  loadChats: () => Promise<void>;
}

export const useChatActions = ({
  userId,
  userName,
  chats,
  setMessages,
  setSelectedChat,
  loadChats,
}: UseChatActionsProps) => {
  const { toast } = useToast();

  const loadChatMessages = async (chatId: number) => {
    try {
      const chat = chats.find((c) => c.id === chatId);
      if (!chat) return;

      const userIdParam = chat.is_guest ? chat.guest_id : chat.user_id;
      const response = await fetch(`${SUPPORT_CHAT_URL}?user_id=${userIdParam}&is_guest=${chat.is_guest || false}`);
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

      const userIdParam = chat.is_guest ? chat.guest_id : chat.user_id;
      const response = await fetch(`${SUPPORT_CHAT_URL}?user_id=${userIdParam}&is_guest=${chat.is_guest || false}`);
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

  const sendMessage = async (messageInput: string, selectedChat: ChatItem | null, clearInput: () => void) => {
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
      clearInput();
      loadChatMessages(selectedChat.id);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось отправить сообщение', variant: 'destructive' });
    }
  };

  const closeChat = async (chatId: number) => {
    try {
      await fetch(SUPPORT_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admin_message',
          chat_id: chatId,
          admin_id: userId,
          message: `Администратор ${userName} закрыл чат`,
        }),
      });

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

  return {
    loadChatMessages,
    loadChatMessagesSilent,
    takeChat,
    sendMessage,
    closeChat,
  };
};
