import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Chat, FAQ, Message } from './types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatWindowProps {
  chat: Chat | null;
  messages: Message[];
  faqs: FAQ[];
  showFaqs: boolean;
  inputMessage: string;
  setInputMessage: (value: string) => void;
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export default function ChatWindow({
  chat,
  messages,
  faqs,
  showFaqs,
  inputMessage,
  setInputMessage,
  isLoading,
  messagesEndRef,
  onClose,
  onSendMessage,
  onKeyPress,
}: ChatWindowProps) {
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
            Ожидание администратора (обычно 2-5 мин)
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
    <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-96 h-[85vh] sm:h-[600px] bg-background border sm:rounded-lg shadow-2xl flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b bg-muted/50">
        <div>
          <h3 className="font-semibold">Поддержка</h3>
          {getStatusBadge()}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {showFaqs && chat?.status === 'bot' && faqs.length > 0 && (
          <div className="space-y-2 mb-4">
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
        
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        isLoading={isLoading}
        chat={chat}
        onSendMessage={onSendMessage}
        onKeyPress={onKeyPress}
      />
    </div>
  );
}
