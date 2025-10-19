import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface FAQ {
  keywords: string[];
  question: string;
  answer: string;
}

interface UserTicket {
  id: number;
  ticket_number: string;
  subject: string;
  status: string;
  status_text?: string;
  created_at: string;
}

const faqs: FAQ[] = [
  {
    keywords: ['доставка', 'доставить', 'привезти', 'доставят', 'привозите'],
    question: 'Как работает доставка?',
    answer: 'Мы доставляем цветы по всему городу. Стоимость и время доставки зависят от вашего района. При оформлении заказа вы увидите точную стоимость и доступное время.'
  },
  {
    keywords: ['оплата', 'оплатить', 'платить', 'карта', 'наличные', 'способ'],
    question: 'Как можно оплатить заказ?',
    answer: 'Принимаем оплату банковской картой онлайн, наличными или картой курьеру при получении. Онлайн-оплата защищена банком.'
  },
  {
    keywords: ['время', 'работаете', 'график', 'часы', 'открыты', 'закрыты'],
    question: 'Когда вы работаете?',
    answer: 'Мы работаем ежедневно с 9:00 до 21:00. Заказы принимаем круглосуточно через сайт.'
  },
  {
    keywords: ['свежесть', 'свежие', 'качество', 'завяли', 'увядшие'],
    question: 'Насколько свежие цветы?',
    answer: 'Все цветы свежие, поступают напрямую от поставщиков. Гарантируем свежесть не менее 5-7 дней при правильном уходе. Если цветы завянут раньше - вернём деньги.'
  },
  {
    keywords: ['возврат', 'вернуть', 'обмен', 'не понравилось', 'не подошли'],
    question: 'Можно ли вернуть заказ?',
    answer: 'Если букет не соответствует описанию или цветы несвежие - вернём деньги или заменим букет. Свяжитесь с нами в течение 24 часов после получения.'
  },
  {
    keywords: ['бонусы', 'кэшбэк', 'скидка', 'баллы', 'накопить'],
    question: 'Как работают бонусы?',
    answer: 'С каждого заказа начисляется кэшбэк 5% на баланс. Бонусами можно оплатить до 50% следующего заказа. Накопленные бонусы не сгорают.'
  },
  {
    keywords: ['заказать', 'оформить', 'купить', 'выбрать', 'каталог'],
    question: 'Как сделать заказ?',
    answer: 'Выберите букет в каталоге, добавьте в корзину, укажите адрес и время доставки, оплатите. После оплаты с вами свяжется флорист для подтверждения.'
  },
  {
    keywords: ['тикет', 'обращение', 'заявка', 'мои обращения', 'статус'],
    question: 'Мои обращения',
    answer: 'SHOW_TICKETS'
  }
];

interface SupportChatBotProps {
  onCreateTicket: () => void;
  userId?: number;
}

const SupportChatBot = ({ onCreateTicket, userId }: SupportChatBotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [userTickets, setUserTickets] = useState<UserTicket[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage('Здравствуйте! 👋 Я бот-помощник. Задайте вопрос о доставке, оплате, работе магазина или создайте обращение в поддержку.');
      if (userId) {
        loadUserTickets();
      }
    }
  }, [isOpen, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUserTickets = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`https://functions.poehali.dev/c2c15ef8-454e-4315-bff3-7109e95d5f3d?user_id=${userId}`);
      const data = await response.json();
      if (data.success && data.tickets) {
        setUserTickets(data.tickets);
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
    }
  };

  const addBotMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isBot: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const findAnswer = (userText: string): string | null => {
    const normalizedText = userText.toLowerCase();
    
    for (const faq of faqs) {
      if (faq.keywords.some(keyword => normalizedText.includes(keyword))) {
        return faq.answer;
      }
    }
    
    return null;
  };

  const handleTicketClick = (ticketNumber: string) => {
    setInputValue(ticketNumber);
    handleSend();
  };

  const showTickets = () => {
    if (userTickets.length === 0) {
      addBotMessage('У вас пока нет обращений. Хотите создать новое?');
    } else {
      const ticketsText = userTickets.map(t => 
        `#${t.ticket_number} - ${t.subject} (${t.status_text || t.status})`
      ).join('\n');
      addBotMessage(`Ваши обращения:\n\n${ticketsText}\n\nНажмите на обращение ниже, чтобы узнать подробности:`);
    }
  };

  const checkTicketNumber = async (text: string) => {
    const ticketMatch = text.match(/T\d{6}|#T\d{6}/i);
    if (!ticketMatch) return false;

    const ticketNumber = ticketMatch[0].replace('#', '').toUpperCase();
    
    try {
      const response = await fetch(`https://functions.poehali.dev/c2c15ef8-454e-4315-bff3-7109e95d5f3d?ticket_number=${ticketNumber}`);
      const data = await response.json();
      
      if (data.success && data.ticket) {
        const t = data.ticket;
        const createdDate = new Date(t.created_at).toLocaleDateString('ru-RU');
        
        let messageText = 
          `Обращение #${t.ticket_number}\n\n` +
          `📋 Тема: ${t.subject}\n` +
          `📌 Статус: ${t.status_text}\n` +
          `📅 Создано: ${createdDate}\n` +
          `👤 Имя: ${t.name}\n\n` +
          `Описание: ${t.message}`;
        
        if (t.attachments && t.attachments.length > 0) {
          messageText += `\n\n📎 Вложения: ${t.attachments.length} файл(ов)`;
        }
        
        addBotMessage(messageText);
        return true;
      } else {
        addBotMessage(`Обращение ${ticketNumber} не найдено. Проверьте номер и попробуйте снова.`);
        return true;
      }
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
      return false;
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);
    
    const isTicketNumber = await checkTicketNumber(inputValue);
    if (isTicketNumber) {
      setInputValue('');
      return;
    }

    const answer = findAnswer(inputValue);

    setTimeout(() => {
      if (answer === 'SHOW_TICKETS') {
        showTickets();
      } else if (answer) {
        addBotMessage(answer);
        setTimeout(() => {
          addBotMessage('Есть ещё вопросы? Или могу помочь создать обращение в поддержку.');
        }, 1000);
      } else {
        addBotMessage('К сожалению, я не нашёл ответ на ваш вопрос. Хотите создать обращение в поддержку? Наши специалисты ответят вам в ближайшее время.');
      }
    }, 500);

    setInputValue('');
  };

  const handleQuickQuestion = (question: string) => {
    const faq = faqs.find(f => f.question === question);
    if (faq) {
      addUserMessage(question);
      setTimeout(() => {
        if (faq.answer === 'SHOW_TICKETS') {
          showTickets();
        } else {
          addBotMessage(faq.answer);
        }
      }, 500);
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 h-12 w-12 sm:h-14 sm:w-14 sm:bottom-6 sm:right-6 rounded-full shadow-lg z-50"
          size="icon"
        >
          <Icon name="MessageCircle" size={24} />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-0 right-0 left-0 sm:bottom-6 sm:right-6 sm:left-auto w-full sm:w-96 h-[100dvh] sm:h-[600px] shadow-2xl z-50 flex flex-col sm:rounded-lg rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4 border-b px-4 py-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Icon name="Bot" size={20} />
              Помощник
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <Icon name="X" size={20} />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-3 sm:p-4 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-3 sm:mb-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 py-2 sm:px-4 ${
                      msg.isBot
                        ? 'bg-muted text-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{msg.text}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {msg.timestamp.toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))}
              
              {userTickets.length > 0 && messages.some(m => m.text.includes('Ваши обращения:')) && (
                <div className="space-y-2 mb-3">
                  {userTickets.map((ticket) => (
                    <Button
                      key={ticket.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleTicketClick(ticket.ticket_number)}
                      className="w-full text-xs h-auto py-2 px-3 whitespace-normal text-left justify-start"
                    >
                      <div className="flex flex-col items-start gap-1 w-full">
                        <span className="font-medium">#{ticket.ticket_number}</span>
                        <span className="text-muted-foreground line-clamp-1">{ticket.subject}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
              <div className="mb-3 sm:mb-4 space-y-2">
                <p className="text-xs text-muted-foreground mb-2">Популярные вопросы:</p>
                {faqs.slice(0, userId ? 4 : 3).map((faq, idx) => {
                  if (faq.answer === 'SHOW_TICKETS' && !userId) return null;
                  return (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left h-auto py-2 px-3"
                      onClick={() => handleQuickQuestion(faq.question)}
                    >
                      <span className="text-xs">{faq.question}</span>
                    </Button>
                  );
                })}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Напишите ваш вопрос..."
                  className="flex-1 text-sm"
                />
                <Button onClick={handleSend} size="icon" className="h-10 w-10 shrink-0">
                  <Icon name="Send" size={18} />
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs sm:text-sm h-9"
                onClick={onCreateTicket}
              >
                <Icon name="Ticket" size={16} className="mr-2" />
                Создать обращение
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default SupportChatBot;