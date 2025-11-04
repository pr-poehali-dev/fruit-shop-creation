import { Message } from './types';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
      className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          message.sender_type === 'user'
            ? 'bg-primary text-primary-foreground'
            : message.sender_type === 'bot'
            ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
            : 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100'
        }`}
      >
        {message.sender_type !== 'user' && (
          <div className="text-xs font-semibold mb-1">{message.sender_name}</div>
        )}
        <div className="text-sm whitespace-pre-wrap">{message.message}</div>
        <div className="text-xs opacity-70 mt-1">
          {new Date(message.created_at).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}
