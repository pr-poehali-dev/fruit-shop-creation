import { useState, useRef } from 'react';
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
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (attachments.length + files.length > 5) {
      toast({
        title: 'Ограничение',
        description: 'Максимум 5 файлов',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`Файл ${file.name} слишком большой (макс 10 МБ)`);
        }

        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const base64 = event.target?.result as string;
              const response = await fetch('https://functions.poehali.dev/d33dd9f5-8e0c-4ee9-a4ea-fc2cd06d0d52', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  image: base64,
                  filename: file.name
                })
              });

              const data = await response.json();
              if (data.success) {
                resolve(data.url);
              } else {
                reject(new Error(data.error || 'Ошибка загрузки'));
              }
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = () => reject(new Error('Ошибка чтения файла'));
          reader.readAsDataURL(file);
        });
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setAttachments(prev => [...prev, ...uploadedUrls]);
      
      toast({
        title: 'Файлы загружены',
        description: `Загружено файлов: ${uploadedUrls.length}`
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось загрузить файлы',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalName = name.trim() || userName || '';
    const finalPhone = phone.trim() || userPhone || '';

    if (!finalName || !finalPhone || !category || !subject.trim() || !message.trim()) {
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
          name: finalName,
          phone: finalPhone,
          email: email.trim() || null,
          category,
          subject: subject.trim(),
          message: message.trim(),
          attachments: attachments.length > 0 ? attachments : null
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Обращение создано',
          description: `Номер обращения: ${data.ticket_number}. Мы свяжемся с вами в ближайшее время.`,
          duration: 5000
        });
        onClose();
        setName('');
        setPhone('');
        setEmail('');
        setCategory('');
        setSubject('');
        setMessage('');
        setAttachments([]);
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
              value={name || userName || ''}
              onChange={(e) => setName(e.target.value)}
              placeholder={userName || "Введите ваше имя"}
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
              value={phone || userPhone || ''}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={userPhone || "+7 (XXX) XXX-XX-XX"}
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

          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Вложения (необязательно)</Label>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || attachments.length >= 5}
                className="w-full text-sm h-9"
              >
                <Icon name="Paperclip" size={16} className="mr-2" />
                {isUploading ? 'Загрузка...' : `Прикрепить файлы (${attachments.length}/5)`}
              </Button>
              {attachments.length > 0 && (
                <div className="space-y-1">
                  {attachments.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded text-xs">
                      <Icon name="File" size={14} />
                      <span className="flex-1 truncate">Файл {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAttachment(index)}
                        className="h-6 w-6"
                      >
                        <Icon name="X" size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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