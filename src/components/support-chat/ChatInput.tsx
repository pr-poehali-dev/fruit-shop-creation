import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Chat } from './types';

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (value: string) => void;
  isLoading: boolean;
  chat: Chat | null;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export default function ChatInput({
  inputMessage,
  setInputMessage,
  isLoading,
  chat,
  onSendMessage,
  onKeyPress,
}: ChatInputProps) {
  const getInputPlaceholder = () => {
    if (!chat) return 'Введите сообщение...';
    
    if (chat.status === 'active' && chat.admin_name) {
      return `Пишете ${chat.admin_name}...`;
    }
    
    return 'Введите сообщение...';
  };

  const getStatusInfo = () => {
    if (!chat) return null;

    if (chat.status === 'active' && chat.admin_name) {
      return (
        <div className="text-xs text-green-600 dark:text-green-400 text-center">
          ✓ {chat.admin_name} подключился к чату
        </div>
      );
    }

    if (chat.status === 'waiting') {
      return (
        <div className="text-xs text-yellow-600 dark:text-yellow-400 text-center">
          ⏳ Администратор ещё не подключился. Среднее время ожидания: 2-5 минут
        </div>
      );
    }

    return null;
  };

  return (
    <div className="p-4 border-t space-y-2">
      {getStatusInfo()}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={getInputPlaceholder()}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isLoading}
        />
        <Button onClick={onSendMessage} disabled={isLoading || !inputMessage.trim()}>
          <Send size={20} />
        </Button>
      </div>
      <a
        href="https://vk.com/sad_mehti"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-sm text-[#0077FF] hover:text-[#0066DD] transition-colors font-medium py-2"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
          <path d="M15.07 0H8.93C3.33 0 0 3.33 0 8.93v6.14C0 20.67 3.33 24 8.93 24h6.14c5.6 0 8.93-3.33 8.93-8.93V8.93C24 3.33 20.67 0 15.07 0zm3.5 17.28c-.68 0-1.33-.42-2.42-1.52-.85-.86-1.22-1.08-1.61-1.08-.5 0-.54.07-.54 1.03v1.27c0 .34-.11.54-.85.54-1.29 0-2.72-.76-3.73-2.17-1.52-2.05-1.94-3.6-1.94-3.92 0-.24.07-.46.43-.46h1.46c.33 0 .45.15.58.5.65 1.94 1.74 3.64 2.19 3.64.17 0 .24-.08.24-.5v-1.94c-.06-1.05-.62-1.14-.62-1.51 0-.2.16-.39.42-.39h2.3c.28 0 .38.15.38.48v2.6c0 .28.12.38.21.38.17 0 .31-.1.62-.41 1-.1 1.77-1.84 2.38-3.59.09-.27.26-.52.64-.52h1.46c.44 0 .53.23.44.54-.18.9-2.08 3.79-2.11 3.85-.14.23-.19.33 0 .61.14.2.61.6 1 1.07.62.68 1.09 1.25 1.22 1.65.13.4-.07.6-.5.6z"/>
        </svg>
        <span className="leading-none">Мы ВКонтакте</span>
      </a>
    </div>
  );
}
