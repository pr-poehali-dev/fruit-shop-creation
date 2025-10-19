import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface CreateTicketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userPhone?: string;
  userName?: string;
}

const CreateTicketDialog = ({ isOpen, onClose, userPhone, userName }: CreateTicketDialogProps) => {
  const [name, setName] = useState(userName || '');
  const [phone, setPhone] = useState(userPhone || '');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !category || !subject.trim() || !message.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('https://functions.poehali.dev/ad233746-6bc7-475c-9eff-4547fd9394a5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          category,
          subject: subject.trim(),
          message: message.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Обращение создано',
          description: `Номер обращения: #${data.ticket_id}. Мы свяжемся с вами в ближайшее время.`,
          duration: 5000
        });
        onClose();
        setName(userName || '');
        setPhone(userPhone || '');
        setEmail('');
        setCategory('');
        setSubject('');
        setMessage('');
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать обращение',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить обращение. Попробуйте позже.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Icon name="Ticket" size={20} />
            Создать обращение в поддержку
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Заполните форму, и наши специалисты свяжутся с вами в ближайшее время
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="name" className="text-xs sm:text-sm">
              Ваше имя <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите ваше имя"
              required
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="phone" className="text-xs sm:text-sm">
              Телефон <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (XXX) XXX-XX-XX"
              required
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="email" className="text-xs sm:text-sm">Email (необязательно)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="category" className="text-xs sm:text-sm">
              Категория <span className="text-destructive">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order" className="text-sm">Вопрос по заказу</SelectItem>
                <SelectItem value="delivery" className="text-sm">Доставка</SelectItem>
                <SelectItem value="payment" className="text-sm">Оплата</SelectItem>
                <SelectItem value="quality" className="text-sm">Качество товара</SelectItem>
                <SelectItem value="technical" className="text-sm">Технические проблемы</SelectItem>
                <SelectItem value="other" className="text-sm">Другое</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="subject" className="text-xs sm:text-sm">
              Тема обращения <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Кратко опишите проблему"
              required
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="message" className="text-xs sm:text-sm">
              Описание <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Подробно опишите вашу проблему или вопрос..."
              rows={4}
              required
              className="text-sm resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button type="submit" disabled={isLoading} className="flex-1 text-sm h-10">
              <Icon name="Send" size={16} className="mr-2" />
              {isLoading ? 'Отправка...' : 'Отправить'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="text-sm h-10">
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTicketDialog;