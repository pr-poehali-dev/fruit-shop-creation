import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface CategoriesTabProps {
  categories: Category[];
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
}

const CategoriesTab = ({ categories, onAddCategory, onEditCategory, onDeleteCategory }: CategoriesTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Категории</h2>
        <Button onClick={onAddCategory}>
          <Icon name="Plus" size={18} className="mr-2" />
          Добавить категорию
        </Button>
      </div>

      <div className="grid gap-4">
        {categories.map(category => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                  <Badge variant="outline" className="mt-2">slug: {category.slug}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEditCategory(category)}>
                    <Icon name="Pencil" size={16} className="mr-2" />
                    Изменить
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDeleteCategory(category)}>
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Удалить
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CategoriesTab;