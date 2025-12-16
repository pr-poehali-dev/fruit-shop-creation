import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Chat, FAQ, Message } from './types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const ANFISA_AVATAR = 'https://cdn.poehali.dev/projects/999e341c-34c8-439f-a5a7-6cab243ccc11/files/59961b13-48c6-4602-b9a0-5265d7c86376.jpg';

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
  const getStatusContent = () => {
    if (!chat) return null;

    switch (chat.status) {
      case 'bot':
        return (
          <div className="flex items-center gap-3">
            <img 
              src={ANFISA_AVATAR} 
              alt="Анфиса" 
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-400"
            />
            <div>
              <h3 className="font-semibold">Анфиса</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                AI-ассистент
              </div>
            </div>
          </div>
        );
      case 'waiting':
        return (
          <div className="flex items-center gap-3">
            <img 
              src={ANFISA_AVATAR} 
              alt="Анфиса" 
              className="w-10 h-10 rounded-full object-cover border-2 border-yellow-400"
            />
            <div>
              <h3 className="font-semibold">Поддержка</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                Соединяем с оператором...
              </div>
            </div>
          </div>
        );
      case 'active':
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
              {chat.admin_name?.[0] || 'A'}
            </div>
            <div>
              <h3 className="font-semibold">{chat.admin_name || 'Администратор'}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                На связи
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div>
            <h3 className="font-semibold">Поддержка</h3>
          </div>
        );
    }
  };

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-96 h-[85vh] sm:h-[600px] bg-background border sm:rounded-lg shadow-2xl flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        {getStatusContent()}
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