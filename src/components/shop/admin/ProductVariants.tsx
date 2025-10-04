import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';

interface ProductVariant {
  id?: number;
  size: string;
  price: number;
  stock: number;
  sort_order: number;
}

interface ProductVariantsProps {
  variants: ProductVariant[];
  newVariantSize: string;
  newVariantPrice: string;
  newVariantStock: string;
  onAddVariant: () => void;
  onRemoveVariant: (index: number) => void;
  onMoveVariant: (index: number, direction: 'up' | 'down') => void;
  onNewVariantSizeChange: (value: string) => void;
  onNewVariantPriceChange: (value: string) => void;
  onNewVariantStockChange: (value: string) => void;
}

const ProductVariants = ({
  variants,
  newVariantSize,
  newVariantPrice,
  newVariantStock,
  onAddVariant,
  onRemoveVariant,
  onMoveVariant,
  onNewVariantSizeChange,
  onNewVariantPriceChange,
  onNewVariantStockChange
}: ProductVariantsProps) => {
  return (
    <div>
      <Label className="text-sm">Размеры и цены (необязательно)</Label>
      <div className="space-y-2 sm:space-y-3 mt-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input 
            type="text"
            value={newVariantSize}
            onChange={(e) => onNewVariantSizeChange(e.target.value)}
            placeholder="Размер (например: 50-70 см)"
            className="text-sm flex-1"
          />
          <Input 
            type="number"
            value={newVariantPrice}
            onChange={(e) => onNewVariantPriceChange(e.target.value)}
            placeholder="Цена"
            className="text-sm w-full sm:w-32"
          />
          <Input 
            type="number"
            value={newVariantStock}
            onChange={(e) => onNewVariantStockChange(e.target.value)}
            placeholder="Склад (не указано = в наличии)"
            className="text-sm w-full sm:w-32"
          />
          <Button 
            type="button" 
            onClick={onAddVariant}
            className="w-full sm:w-auto"
          >
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить
          </Button>
        </div>
        
        {variants.length > 0 && (
          <div className="grid gap-2 max-h-[200px] overflow-y-auto">
            {variants.map((variant, index) => (
              <Card key={index} className="p-2 sm:p-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{variant.size}</p>
                    <p className="text-xs text-muted-foreground">
                      {variant.price}₽ • Склад: {variant.stock != null ? `${variant.stock} шт` : 'в наличии'}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onMoveVariant(index, 'up')}
                      disabled={index === 0}
                      className="h-8 w-8"
                    >
                      <Icon name="ChevronUp" size={14} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onMoveVariant(index, 'down')}
                      disabled={index === variants.length - 1}
                      className="h-8 w-8"
                    >
                      <Icon name="ChevronDown" size={14} />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => onRemoveVariant(index)}
                      className="h-8 w-8"
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductVariants;