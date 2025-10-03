import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

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

interface User {
  id: number;
  phone: string;
  full_name: string;
  is_admin: boolean;
  created_at: string;
}

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel = ({ onClose }: AdminPanelProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  const API_PRODUCTS = 'https://functions.poehali.dev/5ae817c6-e62e-40c6-8e34-18ffac2d3cfc';

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch(API_PRODUCTS);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadCategories = async () => {
    setCategories([
      { id: 1, name: 'Плодовые культуры', slug: 'fruit-plants', description: 'Фруктовые деревья и кустарники' },
      { id: 2, name: 'Декоративные культуры', slug: 'decorative-plants', description: 'Декоративные растения для сада' },
      { id: 3, name: 'Цветы', slug: 'flowers', description: 'Садовые и комнатные цветы' },
      { id: 4, name: 'Саженцы', slug: 'seedlings', description: 'Молодые саженцы растений' }
    ]);
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const productData = {
      id: editingProduct?.id,
      name: formData.get('name') as string,
      slug: (formData.get('name') as string).toLowerCase().replace(/\s+/g, '-'),
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      image_url: formData.get('image_url') as string,
      category_id: parseInt(formData.get('category_id') as string),
      stock: parseInt(formData.get('stock') as string)
    };

    try {
      const response = await fetch(API_PRODUCTS, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: editingProduct ? 'Товар обновлён' : 'Товар добавлен',
          description: productData.name
        });
        setShowProductDialog(false);
        setEditingProduct(null);
        loadProducts();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить товар',
        variant: 'destructive'
      });
    }
  };

  const openProductDialog = (product?: Product) => {
    setEditingProduct(product || null);
    setShowProductDialog(true);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Icon name="Shield" size={32} className="text-primary" />
            <h1 className="text-3xl font-display font-bold">Панель администратора</h1>
          </div>
          <Button variant="outline" onClick={onClose}>
            <Icon name="X" size={20} className="mr-2" />
            Закрыть
          </Button>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Товары</TabsTrigger>
            <TabsTrigger value="categories">Категории</TabsTrigger>
            <TabsTrigger value="settings">Настройки сайта</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Управление товарами</h2>
              <Button onClick={() => openProductDialog()}>
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
                      <Button variant="outline" size="sm" onClick={() => openProductDialog(product)}>
                        <Icon name="Pencil" size={16} className="mr-2" />
                        Изменить
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Категории</h2>
              <Button onClick={() => setShowCategoryDialog(true)}>
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
                      <Button variant="outline" size="sm" onClick={() => {
                        setEditingCategory(category);
                        setShowCategoryDialog(true);
                      }}>
                        <Icon name="Pencil" size={16} className="mr-2" />
                        Изменить
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Информация о сайте</CardTitle>
                <CardDescription>Настройте основную информацию</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="site-name">Название питомника</Label>
                  <Input id="site-name" defaultValue="Питомник растений" />
                </div>
                <div>
                  <Label htmlFor="site-description">Описание</Label>
                  <Textarea id="site-description" defaultValue="Плодовые и декоративные культуры высокого качества" />
                </div>
                <div>
                  <Label htmlFor="site-phone">Телефон</Label>
                  <Input id="site-phone" defaultValue="+7 (495) 123-45-67" />
                </div>
                <div>
                  <Label htmlFor="site-email">Email</Label>
                  <Input id="site-email" type="email" defaultValue="info@plantsnursery.ru" />
                </div>
                <div>
                  <Label htmlFor="site-address">Адрес</Label>
                  <Input id="site-address" defaultValue="Московская область, г. Пушкино, ул. Садовая, 15" />
                </div>
                <Button>
                  <Icon name="Save" size={18} className="mr-2" />
                  Сохранить изменения
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Редактировать товар' : 'Добавить товар'}</DialogTitle>
            <DialogDescription>Заполните информацию о товаре</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProduct} className="space-y-4">
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
              <Button type="button" variant="outline" onClick={() => setShowProductDialog(false)}>
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

      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}</DialogTitle>
            <DialogDescription>Управление категориями товаров</DialogDescription>
          </DialogHeader>
          <form className="space-y-4">
            <div>
              <Label htmlFor="category-name">Название категории</Label>
              <Input id="category-name" defaultValue={editingCategory?.name} placeholder="Плодовые культуры" />
            </div>
            <div>
              <Label htmlFor="category-description">Описание</Label>
              <Textarea id="category-description" defaultValue={editingCategory?.description} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => {
                setShowCategoryDialog(false);
                setEditingCategory(null);
              }}>
                Отмена
              </Button>
              <Button type="submit">Сохранить</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
