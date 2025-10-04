import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCategory: Category | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

const CategoryDialog = ({ open, onOpenChange, editingCategory, onSubmit, onCancel }: CategoryDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg p-4 sm:p-6 gap-3 sm:gap-4">
        <DialogHeader className="pr-6">
          <DialogTitle className="text-lg sm:text-xl">{editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">Управление категориями товаров</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <Label htmlFor="category-name" className="text-sm">Название категории</Label>
            <Input 
              id="category-name" 
              name="name" 
              defaultValue={editingCategory?.name} 
              placeholder="Плодовые культуры" 
              required 
              className="mt-1 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="category-description" className="text-sm">Описание</Label>
            <Textarea 
              id="category-description" 
              name="description" 
              defaultValue={editingCategory?.description} 
              placeholder="Фруктовые деревья и кустарники"
              className="mt-1 text-sm resize-none"
              rows={3}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-end pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Отмена
            </Button>
            <Button 
              type="submit"
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;