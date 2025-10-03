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
}

const ProductsTab = ({ products, onAddProduct, onEditProduct }: ProductsTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Управление товарами</h2>
        <Button onClick={onAddProduct}>
          <Icon name="Plus" size={18} className="mr-2" />
          Добавить товар
        </Button>
      </div>

      <div className="grid gap-4">
        {products.map(product => (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <img src={product.image_url} alt={product.name} className="w-20 h-20 object-cover rounded" />
                  <div>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>{product.category_name}</CardDescription>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{product.price} ₽</Badge>
                      <Badge variant="outline">Склад: {product.stock}</Badge>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => onEditProduct(product)}>
                  <Icon name="Pencil" size={16} className="mr-2" />
                  Изменить
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductsTab;
