import { Message } from './types';

interface ChatMessageProps {
  message: Message;
}

const ANFISA_AVATAR = 'https://cdn.poehali.dev/projects/999e341c-34c8-439f-a5a7-6cab243ccc11/files/59961b13-48c6-4602-b9a0-5265d7c86376.jpg';

export default function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.sender_type === 'bot' && message.sender_name === 'Анфиса';
  
  return (
    <div
      className={`flex gap-2 ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {/* Аватарка слева для бота/админа */}
      {message.sender_type !== 'user' && (
        <div className="flex-shrink-0">
          {isBot ? (
            <img 
              src={ANFISA_AVATAR} 
              alt="Анфиса" 
              className="w-8 h-8 rounded-full object-cover border-2 border-blue-300"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
              {message.sender_name?.[0] || 'A'}
            </div>
          )}
        </div>
      )}

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