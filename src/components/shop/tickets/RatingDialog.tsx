import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: number;
  apiUrl: string;
  onRatingSubmitted: () => void;
}

const RatingDialog = ({ open, onOpenChange, ticketId, apiUrl, onRatingSubmitted }: RatingDialogProps) => {
  const [rating, setRating] = useState<string>('');
  const [ratingComment, setRatingComment] = useState('');
  const { toast } = useToast();

  const handleSubmitRating = async () => {
    if (!rating) return;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rate_ticket',
          ticket_id: ticketId,
          rating: parseInt(rating),
          rating_comment: ratingComment
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Спасибо за оценку!',
          description: 'Ваш отзыв очень важен для нас'
        });
        setRating('');
        setRatingComment('');
        onOpenChange(false);
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
    }
  };

  const handleClose = () => {
    if (!rating) {
      if (confirm('Вы уверены, что не хотите оценить качество поддержки? Ваше мнение поможет нам стать лучше.')) {
        setRating('');
        setRatingComment('');
        onOpenChange(false);
      }
    } else {
      setRating('');
      setRatingComment('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(openState) => {
      if (!openState) {
        handleClose();
      } else {
        onOpenChange(openState);
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Star" size={24} />
            Оценить работу поддержки
          </DialogTitle>
          <DialogDescription>
            Администратор закрыл тикет. Пожалуйста, оцените качество поддержки — это поможет нам стать лучше
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Оценка</Label>
            <RadioGroup value={rating} onValueChange={setRating} className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="flex items-center">
                  <RadioGroupItem value={String(star)} id={`star-${star}`} className="sr-only" />
                  <Label 
                    htmlFor={`star-${star}`} 
                    className="cursor-pointer hover:scale-110 transition"
                  >
                    <Icon 
                      name="Star" 
                      size={32} 
                      className={rating >= String(star) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                    />
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="rating-comment">Комментарий (необязательно)</Label>
            <Textarea
              id="rating-comment"
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Что можно улучшить?"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button 
              onClick={handleSubmitRating}
              disabled={!rating}
            >
              <Icon name="Send" size={18} className="mr-2" />
              Отправить оценку
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;