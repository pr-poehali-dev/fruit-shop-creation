import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface QuickRatingBarProps {
  ticketId: number;
  apiUrl: string;
  onRatingSubmitted: () => void;
}

const QuickRatingBar = ({ ticketId, apiUrl, onRatingSubmitted }: QuickRatingBarProps) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [showComment, setShowComment] = useState(false);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
    <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/40 dark:to-orange-950/40 border-t-2 border-yellow-400 dark:border-yellow-600 p-3 shadow-lg backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon name="Star" size={18} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold">Оцените обращение:</span>
          </div>
          <div className="flex gap-1 justify-center sm:justify-end">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110 focus:outline-none active:scale-95"
                disabled={isSubmitting}
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
        </div>

        {rating > 0 && !showComment && (
          <div className="flex gap-2">
            <Button
              onClick={handleSubmitRating}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              size="sm"
            >
              {isSubmitting ? 'Отправка...' : 'Отправить оценку'}
            </Button>
            <Button
              onClick={() => setShowComment(true)}
              variant="outline"
              size="sm"
            >
              <Icon name="MessageSquare" size={16} />
            </Button>
          </div>
        )}

        {rating > 0 && showComment && (
          <div className="space-y-2">
            <Textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Расскажите подробнее о вашем опыте (необязательно)"
              rows={2}
              className="bg-white dark:bg-gray-900 text-sm"
            />
            <Button
              onClick={handleSubmitRating}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              size="sm"
            >
              {isSubmitting ? 'Отправка...' : 'Отправить оценку'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickRatingBar;