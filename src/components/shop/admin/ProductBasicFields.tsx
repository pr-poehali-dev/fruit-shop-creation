import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

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
  show_stock?: boolean;
}

interface ProductBasicFieldsProps {
  editingProduct: Product | null;
  categories: Category[];
  showStock: boolean;
  onShowStockChange: (checked: boolean) => void;
  variantsCount: number;
  hideMainPrice: boolean;
  onHideMainPriceChange: (checked: boolean) => void;
}

const ProductBasicFields = ({ editingProduct, categories, showStock, onShowStockChange, variantsCount, hideMainPrice, onHideMainPriceChange }: ProductBasicFieldsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="product-name" className="text-sm">Название товара *</Label>
        <Input 
          id="product-name" 
          name="name" 
          defaultValue={editingProduct?.name} 
          required 
          placeholder="Например: Яблоня Антоновка"
          className="mt-1 text-sm"
        />
      </div>
      <div>
        <Label htmlFor="product-description" className="text-sm">Описание</Label>
        <Textarea 
          id="product-description" 
          name="description" 
          defaultValue={editingProduct?.description}
          placeholder="Подробное описание товара"
          rows={3}
          className="mt-1 text-sm resize-none"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <Label htmlFor="product-price" className="text-sm">Цена (₽) *</Label>
          <Input 
            id="product-price" 
            name="price" 
            type="number" 
            step="0.01"
            defaultValue={editingProduct?.price} 
            required
            className="mt-1 text-sm"
          />
        </div>
        <div>
          <Label htmlFor="product-stock" className="text-sm">Количество на складе</Label>
          <Input 
            id="product-stock" 
            name="stock" 
            type="number" 
            defaultValue={editingProduct?.stock || ''} 
            placeholder="Не указано - всегда в наличии"
            className="mt-1 text-sm"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="product-category" className="text-sm">Категория *</Label>
        <Select name="category_id" defaultValue={editingProduct?.category_id?.toString()} required>
          <SelectTrigger className="mt-1">
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

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="show-stock"
            checked={showStock}
            onChange={(e) => onShowStockChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="show-stock" className="text-sm cursor-pointer">
            Показывать количество на складе покупателям
          </Label>
        </div>
        
        {variantsCount >= 2 && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hide-main-price"
              checked={hideMainPrice}
              onChange={(e) => onHideMainPriceChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="hide-main-price" className="text-sm cursor-pointer">
              Скрыть основную цену (показывать только цены вариантов)
            </Label>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductBasicFields;