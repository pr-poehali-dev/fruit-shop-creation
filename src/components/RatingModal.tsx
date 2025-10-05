import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  entityType: string;
  entityId: number;
}

const RatingModal = ({ isOpen, onClose, userId, entityType, entityId }: RatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoveredRating(0);
      setComment('');
      setShowStats(false);
      setStatistics(null);
    }
  }, [isOpen]);

  const submitRating = async () => {
    if (rating === 0) {
      alert('Пожалуйста, выберите оценку');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('https://functions.poehali.dev/91674d2e-1306-4ae6-9c23-ab0938e8ce5c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString(),
        },
        body: JSON.stringify({
          entity_type: entityType,
          entity_id: entityId,
          rating,
          comment,
        }),
      });

      if (response.ok) {
        await fetchStatistics();
        setShowStats(true);
      } else {
        alert('Ошибка при отправке оценки');
      }
    } catch (error) {
      console.error('Failed to submit rating:', error);
      alert('Ошибка при отправке оценки');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/91674d2e-1306-4ae6-9c23-ab0938e8ce5c?entity_type=${entityType}&entity_id=${entityId}`,
        {
          headers: {
            'X-User-Id': userId.toString(),
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleClose = () => {
    setShowStats(false);
    onClose();
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Плохо';
      case 2: return 'Неудовлетворительно';
      case 3: return 'Нормально';
      case 4: return 'Хорошо';
      case 5: return 'Отлично';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {showStats ? 'Спасибо за оценку!' : 'Оцените качество обслуживания'}
          </DialogTitle>
        </DialogHeader>

        {!showStats ? (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Как вы оцениваете {entityType === 'order' ? 'этот заказ' : 'работу поддержки'}?
              </p>
              
              <div className="flex items-center justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Icon
                      name="Star"
                      size={40}
                      className={`${
                        star <= (hoveredRating || rating)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              
              {rating > 0 && (
                <p className="text-sm font-medium text-primary">
                  {getRatingText(rating)}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Комментарий (необязательно)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Расскажите подробнее о вашем опыте..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Отмена
              </Button>
              <Button onClick={submitRating} disabled={isSubmitting || rating === 0} className="flex-1">
                {isSubmitting ? 'Отправка...' : 'Отправить'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <Icon name="CheckCircle" size={48} className="mx-auto text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">
                Ваша оценка учтена!
              </p>
            </div>

            {statistics && (
              <div className="bg-accent/20 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-center">Статистика оценок</h4>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {statistics.average_rating.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon
                        key={star}
                        name="Star"
                        size={20}
                        className={`${
                          star <= Math.round(statistics.average_rating)
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    На основе {statistics.total_ratings} {statistics.total_ratings === 1 ? 'оценки' : 'оценок'}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = statistics[`rating_${star}`] || 0;
                    const percentage = statistics.total_ratings > 0 
                      ? (count / statistics.total_ratings) * 100 
                      : 0;
                    
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="w-12 text-right">{star} ★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-12 text-muted-foreground">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Button onClick={handleClose} className="w-full">
              Закрыть
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;
