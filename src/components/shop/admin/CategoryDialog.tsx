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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}</DialogTitle>
          <DialogDescription>Управление категориями товаров</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category-name">Название категории</Label>
            <Input id="category-name" name="name" defaultValue={editingCategory?.name} placeholder="Плодовые культуры" required />
          </div>
          <div>
            <Label htmlFor="category-description">Описание</Label>
            <Textarea id="category-description" name="description" defaultValue={editingCategory?.description} placeholder="Фруктовые деревья и кустарники" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
            <Button type="submit">
              <Icon name="Save" size={18} className="mr-2" />
              Сохранить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
