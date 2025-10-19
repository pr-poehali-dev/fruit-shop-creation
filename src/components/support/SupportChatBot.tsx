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
    keywords: ['открытка', 'записка', 'поздравление', 'текст', 'пожелание'],
    question: 'Можно ли добавить открытку?',
    answer: 'Да, при оформлении заказа можно указать текст поздравления. Мы бесплатно добавим открытку с вашими словами.'
  },
  {
    keywords: ['фото', 'картинка', 'как выглядит', 'показать', 'посмотреть'],
    question: 'Букет будет точно как на фото?',
    answer: 'Мы максимально придерживаемся фотографий, но состав может немного отличаться в зависимости от сезона. Всегда согласовываем замены с клиентом.'
  },
  {
    keywords: ['контакты', 'связаться', 'телефон', 'написать', 'позвонить'],
    question: 'Как с вами связаться?',
    answer: 'Напишите нам через форму обратной связи или позвоните по телефону +7 (XXX) XXX-XX-XX. Отвечаем в течение 15 минут в рабочее время.'
  }
];

interface SupportChatBotProps {
  onCreateTicket: () => void;
}

const SupportChatBot = ({ onCreateTicket }: SupportChatBotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage('Здравствуйте! 👋 Я бот-помощник. Задайте вопрос о доставке, оплате, работе магазина или создайте обращение в поддержку.');
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleSend = () => {
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);
    const answer = findAnswer(inputValue);

    setTimeout(() => {
      if (answer) {
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
        addBotMessage(faq.answer);
      }, 500);
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <Icon name="MessageCircle" size={24} />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="Bot" size={20} />
              Помощник
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <Icon name="X" size={20} />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.isBot
                        ? 'bg-muted text-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {msg.timestamp.toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
              <div className="mb-4 space-y-2">
                <p className="text-xs text-muted-foreground mb-2">Популярные вопросы:</p>
                {faqs.slice(0, 3).map((faq, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2 px-3"
                    onClick={() => handleQuickQuestion(faq.question)}
                  >
                    <span className="text-xs">{faq.question}</span>
                  </Button>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Напишите ваш вопрос..."
                  className="flex-1"
                />
                <Button onClick={handleSend} size="icon">
                  <Icon name="Send" size={18} />
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full"
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
