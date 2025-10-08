import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

interface ProductsTabProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
}

const ProductsTab = ({ products, onAddProduct, onEditProduct, onDeleteProduct }: ProductsTabProps) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold">Управление товарами</h2>
        <Button onClick={onAddProduct} className="w-full sm:w-auto" size="default">
          <Icon name="Plus" size={16} className="sm:mr-2" />
          <span className="hidden sm:inline">Добавить товар</span>
          <span className="sm:hidden">Добавить</span>
        </Button>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {products.map(product => (
          <Card key={product.id}>
            <CardHeader className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full sm:w-20 h-32 sm:h-20 object-cover rounded flex-shrink-0" 
                />
                <div className="flex-1 min-w-0 w-full">
                  <CardTitle className="text-base sm:text-lg">{product.name}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">{product.category_name}</CardDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">{product.price} ₽</Badge>
                    <Badge variant="outline" className="text-xs">Склад: {product.stock}</Badge>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEditProduct(product)}
                    className="flex-1 sm:flex-none"
                  >
                    <Icon name="Pencil" size={14} className="sm:mr-2" />
                    <span className="hidden sm:inline">Изменить</span>
                    <span className="sm:hidden ml-2">Редактировать</span>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => onDeleteProduct(product.id)}
                    className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Icon name="Trash2" size={14} />
                    <span className="ml-1">Удалить</span>
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

export default ProductsTab;