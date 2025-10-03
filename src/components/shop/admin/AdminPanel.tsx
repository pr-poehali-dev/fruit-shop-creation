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
  const [orders, setOrders] = useState<any[]>([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [siteSettings, setSiteSettings] = useState<any>({});
  const { toast } = useToast();

  const API_PRODUCTS = 'https://functions.poehali.dev/5ae817c6-e62e-40c6-8e34-18ffac2d3cfc';
  const API_CATEGORIES = 'https://functions.poehali.dev/0a62d37c-9fd0-4ff3-9b5b-2c881073d3ac';
  const API_SETTINGS = 'https://functions.poehali.dev/9b1ac59e-93b6-41de-8974-a7f58d4ffaf9';
  const API_AUTH = 'https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc';
  const API_ORDERS = 'https://functions.poehali.dev/b35bef37-8423-4939-b43b-0fb565cc8853';

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadSettings();
    loadUsers();
    loadOrders();
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
    try {
      const response = await fetch(API_CATEGORIES);
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch(API_SETTINGS);
      const data = await response.json();
      setSiteSettings(data.settings || {});
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(API_AUTH);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch(`${API_ORDERS}?all=true`);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
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

  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const categoryData = {
      id: editingCategory?.id,
      name: formData.get('name') as string,
      slug: (formData.get('name') as string).toLowerCase().replace(/\s+/g, '-').replace(/[а-яА-ЯёЁ]/g, (char) => {
        const translit: Record<string, string> = {
          'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z',
          'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
          'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
          'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };
        return translit[char.toLowerCase()] || char;
      }),
      description: formData.get('description') as string
    };

    try {
      const response = await fetch(API_CATEGORIES, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: editingCategory ? 'Категория обновлена' : 'Категория добавлена',
          description: categoryData.name
        });
        setShowCategoryDialog(false);
        setEditingCategory(null);
        loadCategories();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить категорию',
        variant: 'destructive'
      });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const settingsData = {
      site_name: formData.get('site_name') as string,
      site_description: formData.get('site_description') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      work_hours: formData.get('work_hours') as string
    };

    try {
      const response = await fetch(API_SETTINGS, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Настройки сохранены',
          description: 'Изменения применены на сайте'
        });
        loadSettings();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        variant: 'destructive'
      });
    }
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="products">Товары</TabsTrigger>
            <TabsTrigger value="categories">Категории</TabsTrigger>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="orders">Заказы</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
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
              <CardContent>
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div>
                    <Label htmlFor="site-name">Название питомника</Label>
                    <Input id="site-name" name="site_name" defaultValue={siteSettings.site_name || 'Питомник растений'} required />
                  </div>
                  <div>
                    <Label htmlFor="site-description">Описание</Label>
                    <Textarea id="site-description" name="site_description" defaultValue={siteSettings.site_description || 'Плодовые и декоративные культуры высокого качества'} rows={3} />
                  </div>
                  <div>
                    <Label htmlFor="site-phone">Телефон</Label>
                    <Input id="site-phone" name="phone" defaultValue={siteSettings.phone || '+7 (495) 123-45-67'} />
                  </div>
                  <div>
                    <Label htmlFor="site-email">Email</Label>
                    <Input id="site-email" name="email" type="email" defaultValue={siteSettings.email || 'info@plantsnursery.ru'} />
                  </div>
                  <div>
                    <Label htmlFor="site-address">Адрес</Label>
                    <Input id="site-address" name="address" defaultValue={siteSettings.address || 'Московская область, г. Пушкино, ул. Садовая, 15'} />
                  </div>
                  <div>
                    <Label htmlFor="work-hours">Режим работы</Label>
                    <Input id="work-hours" name="work_hours" defaultValue={siteSettings.work_hours || 'Пн-Вс: 9:00 - 19:00'} />
                  </div>
                  <Button type="submit">
                    <Icon name="Save" size={18} className="mr-2" />
                    Сохранить изменения
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Пользователи</CardTitle>
                <CardDescription>Список всех зарегистрированных пользователей</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {users.map(user => (
                    <div key={user.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-muted-foreground">{user.phone}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Баланс: {user.balance || 0}₽ | Кэшбек: {user.cashback || 0}₽
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.is_admin && <Badge>Админ</Badge>}
                        <Badge variant="outline">{new Date(user.created_at).toLocaleDateString()}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Заказы</CardTitle>
                <CardDescription>Все заказы пользователей</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">Заказ #{order.id}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.user_name} ({order.user_phone})
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(order.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{order.total_amount}₽</div>
                          <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Способ оплаты:</div>
                        <div className="text-muted-foreground">
                          {order.payment_method === 'balance' ? 'Баланс' : order.payment_method === 'card' ? 'Карта' : 'При получении'}
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Адрес доставки:</div>
                        <div className="text-muted-foreground">{order.delivery_address}</div>
                      </div>
                      {order.items && order.items.length > 0 && (
                        <div className="text-sm">
                          <div className="font-medium">Товары:</div>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {order.items.filter(i => i.product_name).map((item: any, idx: number) => (
                              <li key={idx}>
                                {item.product_name} x{item.quantity} = {item.price * item.quantity}₽
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <div>
              <Label htmlFor="category-name">Название категории</Label>
              <Input id="category-name" name="name" defaultValue={editingCategory?.name} placeholder="Плодовые культуры" required />
            </div>
            <div>
              <Label htmlFor="category-description">Описание</Label>
              <Textarea id="category-description" name="description" defaultValue={editingCategory?.description} placeholder="Фруктовые деревья и кустарники" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => {
                setShowCategoryDialog(false);
                setEditingCategory(null);
              }}>
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
    </div>
  );
};

export default AdminPanel;