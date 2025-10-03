import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
  category_name: string;
  stock: number;
  is_active: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: Product | null;
  categories: Category[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const ProductDialog = ({ open, onOpenChange, editingProduct, categories, onSubmit }: ProductDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingProduct ? 'Редактировать товар' : 'Добавить товар'}</DialogTitle>
          <DialogDescription>Заполните информацию о товаре</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product-name">Название товара *</Label>
            <Input 
              id="product-name" 
              name="name" 
              defaultValue={editingProduct?.name} 
              required 
              placeholder="Например: Яблоня Антоновка"
            />
          </div>
          <div>
            <Label htmlFor="product-description">Описание</Label>
            <Textarea 
              id="product-description" 
              name="description" 
              defaultValue={editingProduct?.description}
              placeholder="Подробное описание товара"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="product-price">Цена (₽) *</Label>
              <Input 
                id="product-price" 
                name="price" 
                type="number" 
                step="0.01"
                defaultValue={editingProduct?.price} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="product-stock">Количество на складе *</Label>
              <Input 
                id="product-stock" 
                name="stock" 
                type="number" 
                defaultValue={editingProduct?.stock || 0} 
                required 
              />
            </div>
          </div>
          <div>
            <Label htmlFor="product-category">Категория *</Label>
            <Select name="category_id" defaultValue={editingProduct?.category_id?.toString()} required>
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="product-image">URL изображения *</Label>
            <Input 
              id="product-image" 
              name="image_url" 
              type="url"
              defaultValue={editingProduct?.image_url} 
              required 
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Вставьте ссылку на изображение (например, с Unsplash или вашего хостинга)
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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

export default ProductDialog;
