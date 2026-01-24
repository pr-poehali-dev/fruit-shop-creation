import { useEffect, useState, useRef } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: number;
  user_id: number;
  message: string;
  created_at: string;
  is_read: boolean;
  full_name: string;
  avatar: string;
}

export default function AdminTeamChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc?action=admin_chat&user_id=${user.id}&limit=100`,
        {
          headers: {
            'X-User-Id': user.id.toString()
          }
        }
      );
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
        const unread = data.messages.filter((m: Message) => !m.is_read && m.user_id !== user.id).length;
        setUnreadCount(unread);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch('https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString()
        },
        body: JSON.stringify({
          action: 'send_admin_message',
          user_id: user.id,
          message: newMessage
        })
      });

      const data = await response.json();
      if (data.message) {
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsRead = async () => {
    try {
      await fetch('https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString()
        },
        body: JSON.stringify({
          action: 'mark_chat_read',
          user_id: user.id
        })
      });
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      markAsRead();
      scrollToBottom();
    }
  }, [isOpen]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-[9999]"
      >
        <MessageSquare size={24} />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {unreadCount}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-card border rounded-lg shadow-2xl flex flex-col z-[9999]">
      <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} />
          <h3 className="font-semibold">Чат команды</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary-foreground/20">
          <X size={20} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquare size={48} className="mx-auto mb-2 opacity-30" />
            <p>Нет сообщений</p>
            <p className="text-sm">Начните общение с командой</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.user_id === user.id;
            return (
              <div key={msg.id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                <div className="text-xl flex-shrink-0">
                  {msg.avatar && !msg.avatar.startsWith('http') ? msg.avatar : '👤'}
                </div>
                <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  {!isOwn && (
                    <p className="text-xs text-muted-foreground mb-1">{msg.full_name}</p>
                  )}
                  <div className={`rounded-lg px-3 py-2 ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="text-sm break-words">{msg.message}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{formatTime(msg.created_at)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-muted/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Написать сообщение..."
            className="flex-1 px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            size="icon"
            className="flex-shrink-0"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}