import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API_CONTENT = 'https://functions.poehali.dev/56deea36-35f7-4c07-becc-dedeaa3de78d';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
}

const BotFaqTab = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const loadFaqs = async () => {
    try {
      const response = await fetch(`${API_CONTENT}?resource=faq&include_inactive=true`);
      const data = await response.json();
      setFaqs(data.faqs || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить FAQ',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const handleSave = async (faq?: FAQ) => {
    if (!editQuestion.trim() || !editAnswer.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните вопрос и ответ',
        variant: 'destructive'
      });
      return;
    }

    try {
      const url = API_CONTENT + '?resource=faq';
      const method = faq ? 'PUT' : 'POST';
      const body = faq
        ? { id: faq.id, question: editQuestion, answer: editAnswer, sort_order: faq.sort_order, is_active: faq.is_active }
        : { question: editQuestion, answer: editAnswer, sort_order: faqs.length + 1 };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: faq ? 'FAQ обновлён' : 'FAQ добавлен' });
        setEditingId(null);
        setIsAdding(false);
        setEditQuestion('');
        setEditAnswer('');
        loadFaqs();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить этот вопрос?')) return;

    try {
      const response = await fetch(`${API_CONTENT}?resource=faq`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: 'FAQ удалён' });
        loadFaqs();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить', variant: 'destructive' });
    }
  };

  const startEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setEditQuestion('');
    setEditAnswer('');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Вопросы и ответы бота</h3>
          <p className="text-sm text-muted-foreground">Управление базой знаний чат-бота</p>
        </div>
        <Button onClick={startAdd}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить вопрос
        </Button>
      </div>

      {isAdding && (
        <Card className="p-4 space-y-3">
          <Input
            placeholder="Вопрос"
            value={editQuestion}
            onChange={(e) => setEditQuestion(e.target.value)}
          />
          <Textarea
            placeholder="Ответ"
            value={editAnswer}
            onChange={(e) => setEditAnswer(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Button onClick={() => handleSave()}>Сохранить</Button>
            <Button variant="outline" onClick={() => { setIsAdding(false); setEditQuestion(''); setEditAnswer(''); }}>
              Отмена
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {faqs.map((faq) => (
          <Card key={faq.id} className="p-4">
            {editingId === faq.id ? (
              <div className="space-y-3">
                <Input
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  placeholder="Вопрос"
                />
                <Textarea
                  value={editAnswer}
                  onChange={(e) => setEditAnswer(e.target.value)}
                  placeholder="Ответ"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button onClick={() => handleSave(faq)}>Сохранить</Button>
                  <Button variant="outline" onClick={() => setEditingId(null)}>Отмена</Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">{faq.question}</h4>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(faq)}>
                      <Icon name="Pencil" size={16} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(faq.id)}>
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BotFaqTab;
