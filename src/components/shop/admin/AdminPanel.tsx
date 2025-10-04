import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import ProductsTab from './ProductsTab';
import CategoriesTab from './CategoriesTab';
import UsersTab from './UsersTab';
import OrdersTab from './OrdersTab';
import SettingsTab from './SettingsTab';
import ProductDialog from './ProductDialog';
import CategoryDialog from './CategoryDialog';

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

  const handleAddBalance = async (userId: number, amount: number, description: string) => {
    try {
      const response = await fetch(API_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_balance',
          user_id: userId,
          amount,
          type: 'deposit',
          description: description || 'Пополнение баланса администратором'
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Баланс пополнен',
          description: `Начислено ${amount}₽`
        });
        loadUsers();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось начислить баланс',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось начислить баланс',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string, rejectionReason?: string) => {
    try {
      const response = await fetch(API_ORDERS, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          order_id: orderId, 
          status,
          rejection_reason: rejectionReason 
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Статус обновлён',
          description: `Заказ #${orderId} теперь: ${status}`
        });
        loadOrders();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
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
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Icon name="Shield" size={24} className="text-primary sm:w-8 sm:h-8" />
            <h1 className="text-xl sm:text-3xl font-display font-bold">Админ-панель</h1>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="sm:h-10">
            <Icon name="X" size={18} className="sm:mr-2" />
            <span className="hidden sm:inline">Закрыть</span>
          </Button>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="products" className="text-xs sm:text-sm px-2 py-2">
              <Icon name="Package" size={16} className="sm:mr-1" />
              <span className="hidden sm:inline">Товары</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs sm:text-sm px-2 py-2">
              <Icon name="FolderTree" size={16} className="sm:mr-1" />
              <span className="hidden sm:inline">Категории</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm px-2 py-2">
              <Icon name="Users" size={16} className="sm:mr-1" />
              <span className="hidden sm:inline">Пользователи</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs sm:text-sm px-2 py-2">
              <Icon name="ShoppingCart" size={16} className="sm:mr-1" />
              <span className="hidden sm:inline">Заказы</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm px-2 py-2">
              <Icon name="Settings" size={16} className="sm:mr-1" />
              <span className="hidden sm:inline">Настройки</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsTab 
              products={products}
              onAddProduct={() => openProductDialog()}
              onEditProduct={openProductDialog}
            />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesTab 
              categories={categories}
              onAddCategory={() => setShowCategoryDialog(true)}
              onEditCategory={(category) => {
                setEditingCategory(category);
                setShowCategoryDialog(true);
              }}
            />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab users={users} onAddBalance={handleAddBalance} />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersTab orders={orders} onUpdateStatus={handleUpdateOrderStatus} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab 
              siteSettings={siteSettings}
              onSaveSettings={handleSaveSettings}
            />
          </TabsContent>
        </Tabs>
      </div>

      <ProductDialog 
        open={showProductDialog}
        onOpenChange={setShowProductDialog}
        editingProduct={editingProduct}
        categories={categories}
        onSubmit={handleSaveProduct}
      />

      <CategoryDialog 
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        editingCategory={editingCategory}
        onSubmit={handleSaveCategory}
        onCancel={() => {
          setShowCategoryDialog(false);
          setEditingCategory(null);
        }}
      />
    </div>
  );
};

export default AdminPanel;