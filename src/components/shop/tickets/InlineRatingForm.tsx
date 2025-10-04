import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface InlineRatingFormProps {
  ticketId: number;
  apiUrl: string;
  onRatingSubmitted: () => void;
}

const InlineRatingForm = ({ ticketId, apiUrl, onRatingSubmitted }: InlineRatingFormProps) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
  }, []);

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast({
        title: 'Выберите оценку',
        description: 'Пожалуйста, поставьте оценку от 1 до 5 звёзд',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rate_ticket',
          ticket_id: ticketId,
          rating: rating,
          rating_comment: ratingComment
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Спасибо за оценку!',
          description: 'Ваш отзыв очень важен для нас'
        });
        onRatingSubmitted();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить оценку',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={formRef} className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 p-4 rounded-lg border-2 border-yellow-300 dark:border-yellow-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-yellow-400 dark:bg-yellow-600 rounded-full shrink-0">
          <Icon name="Star" size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1">Оцените работу поддержки</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Администратор закрыл ваше обращение. Пожалуйста, поставьте оценку — это поможет нам стать лучше.
          </p>
          
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <Icon 
                  name="Star" 
                  size={32} 
                  className={
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-500 fill-yellow-500' 
                      : 'text-gray-300 dark:text-gray-600'
                  }
                />
              </button>
            ))}
          </div>

          {rating > 0 && (
            <div className="mb-3">
              <Textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Расскажите подробнее о вашем опыте (необязательно)"
                rows={2}
                className="bg-white dark:bg-gray-900"
              />
            </div>
          )}

          <Button 
            onClick={handleSubmitRating}
            disabled={rating === 0 || isSubmitting}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
          >
            {isSubmitting ? (
              <>
                <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Icon name="Send" size={18} className="mr-2" />
                Отправить оценку
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InlineRatingForm;