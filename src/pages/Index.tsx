import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/shop/Header';
import AuthDialog from '@/components/shop/AuthDialog';
import Footer from '@/components/shop/Footer';
import HomeSection from '@/components/shop/sections/HomeSection';
import CatalogSection from '@/components/shop/sections/CatalogSection';
import AboutSection from '@/components/shop/sections/AboutSection';
import DeliverySection from '@/components/shop/sections/DeliverySection';
import CareSection from '@/components/shop/sections/CareSection';
import ContactsSection from '@/components/shop/sections/ContactsSection';
import AdminPanel from '@/components/shop/admin/AdminPanel';

interface User {
  id: number;
  phone: string;
  full_name: string;
  is_admin: boolean;
  balance?: number;
  cashback?: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  category_name: string;
  stock: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Order {
  id: number;
  total_amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [currentSection, setCurrentSection] = useState('home');
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  const { toast } = useToast();

  const API_AUTH = 'https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc';
  const API_PRODUCTS = 'https://functions.poehali.dev/5ae817c6-e62e-40c6-8e34-18ffac2d3cfc';
  const API_ORDERS = 'https://functions.poehali.dev/b35bef37-8423-4939-b43b-0fb565cc8853';
  const API_SETTINGS = 'https://functions.poehali.dev/9b1ac59e-93b6-41de-8974-a7f58d4ffaf9';

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    
    loadProducts();
    loadSettings();
  }, []);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const refreshUserBalance = async () => {
    if (!user || isRefreshingBalance) return;
    
    setIsRefreshingBalance(true);
    try {
      const response = await fetch(`${API_AUTH}?action=balance&user_id=${user.id}`);
      const data = await response.json();
      
      const updatedUser = {
        ...user,
        balance: data.balance,
        cashback: data.cashback
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    } finally {
      setIsRefreshingBalance(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const loadProducts = async () => {
    try {
      const response = await fetch(API_PRODUCTS);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
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

  const loadOrders = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_ORDERS}?user_id=${user.id}`);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>, action: 'login' | 'register') => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch(API_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          phone: formData.get('phone'),
          password: formData.get('password'),
          full_name: formData.get('full_name') || ''
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setShowAuthDialog(false);
        toast({
          title: action === 'login' ? 'Вы вошли в систему' : 'Регистрация успешна',
          description: `Добро пожаловать, ${data.user.full_name || data.user.phone}!`
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить операцию',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({ title: 'Вы вышли из системы' });
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    
    toast({
      title: 'Добавлено в корзину',
      description: product.name
    });
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.product.id !== productId));
    } else {
      setCart(cart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const handleCheckout = async (paymentMethod: string) => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    if (cart.length === 0) {
      toast({
        title: 'Корзина пуста',
        description: 'Добавьте товары в корзину',
        variant: 'destructive'
      });
      return;
    }

    const totalAmount = getTotalPrice();

    if (paymentMethod === 'balance') {
      if (!user.balance || user.balance < totalAmount) {
        toast({
          title: 'Недостаточно средств',
          description: `На балансе ${user.balance?.toFixed(2) || 0}₽, требуется ${totalAmount}₽`,
          variant: 'destructive'
        });
        return;
      }
    }

    try {
      const response = await fetch(API_ORDERS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          items: cart.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price
          })),
          payment_method: paymentMethod,
          delivery_address: 'Адрес доставки'
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Заказ оформлен!',
          description: paymentMethod === 'balance' 
            ? `Заказ #${data.order_id}. Начислен кэшбек 5%!` 
            : `Номер заказа: ${data.order_id}`
        });
        setCart([]);
        loadOrders();
        
        if (paymentMethod === 'balance') {
          setTimeout(() => refreshUserBalance(), 500);
        }
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось оформить заказ',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось оформить заказ',
        variant: 'destructive'
      });
    }
  };

  const renderCartContent = () => (
    <div className="mt-6 space-y-4">
      {cart.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Корзина пуста</p>
      ) : (
        <>
          {cart.map(item => (
            <div key={item.product.id} className="flex gap-4 items-center">
              <img src={item.product.image_url} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1">
                <h4 className="font-medium">{item.product.name}</h4>
                <p className="text-sm text-muted-foreground">{item.product.price} ₽</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}>
                  <Icon name="Minus" size={16} />
                </Button>
                <span className="w-8 text-center">{item.quantity}</span>
                <Button size="icon" variant="outline" onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}>
                  <Icon name="Plus" size={16} />
                </Button>
              </div>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Итого:</span>
            <span>{getTotalPrice()} ₽</span>
          </div>
          <div className="space-y-2">
            {user && (
              <Button className="w-full" variant="default" onClick={() => handleCheckout('balance')}>
                <Icon name="Wallet" size={18} className="mr-2" />
                Оплатить балансом ({(user.balance || 0).toFixed(2)}₽)
              </Button>
            )}
            <Button className="w-full" onClick={() => handleCheckout('card')}>
              <Icon name="CreditCard" size={18} className="mr-2" />
              Оплатить картой
            </Button>
            <Button className="w-full" variant="outline" onClick={() => handleCheckout('cash')}>
              <Icon name="Coins" size={18} className="mr-2" />
              Наличными при получении
            </Button>
          </div>
        </>
      )}
    </div>
  );

  const renderProfileContent = () => (
    <div className="mt-6 space-y-4">
      <div>
        <Label>Телефон</Label>
        <p className="font-medium">{user?.phone}</p>
      </div>
      <div>
        <Label>Имя</Label>
        <p className="font-medium">{user?.full_name || 'Не указано'}</p>
      </div>
      
      <Separator />
      
      <div className="bg-muted p-4 rounded-lg space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Баланс:</span>
          <span className="text-lg font-bold">{user?.balance?.toFixed(2) || '0.00'}₽</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Кэшбек:</span>
          <span className="text-lg font-semibold text-green-600">{user?.cashback?.toFixed(2) || '0.00'}₽</span>
        </div>
        {user && user.cashback && user.cashback > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Кэшбек 5% начисляется при оплате заказа балансом
          </p>
        )}
      </div>
      
      {user?.is_admin && (
        <>
          <Badge variant="secondary">Администратор</Badge>
          <Button className="w-full" variant="default" onClick={() => setShowAdminPanel(true)}>
            <Icon name="Settings" size={18} className="mr-2" />
            Панель администратора
          </Button>
        </>
      )}
      <Separator />
      <div>
        <h3 className="font-semibold mb-3">История заказов</h3>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Заказов пока нет</p>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Заказ #{order.id}</CardTitle>
                  <CardDescription className="text-xs">
                    {new Date(order.created_at).toLocaleDateString('ru-RU')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">{order.total_amount} ₽</p>
                  <Badge variant="outline" className="mt-2">{order.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Button variant="destructive" className="w-full" onClick={handleLogout}>Выйти</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {showAdminPanel && user?.is_admin ? (
        <AdminPanel onClose={() => {
          setShowAdminPanel(false);
          loadProducts();
          loadSettings();
          setTimeout(() => refreshUserBalance(), 300);
        }} />
      ) : (
        <>
          <Header 
            cart={cart}
            user={user}
            currentSection={currentSection}
            siteSettings={siteSettings}
            onSectionChange={setCurrentSection}
            onShowAuth={() => setShowAuthDialog(true)}
            renderCartContent={renderCartContent}
            renderProfileContent={renderProfileContent}
          />

          <main className="container mx-auto px-4 py-8">
            {currentSection === 'home' && (
              <HomeSection 
                products={products} 
                onNavigate={setCurrentSection} 
                onAddToCart={addToCart} 
              />
            )}

            {currentSection === 'catalog' && (
              <CatalogSection products={products} onAddToCart={addToCart} />
            )}

            {currentSection === 'about' && <AboutSection />}

            {currentSection === 'delivery' && <DeliverySection />}

            {currentSection === 'care' && <CareSection />}

            {currentSection === 'contacts' && <ContactsSection settings={siteSettings} />}
          </main>

          <Footer />

          <AuthDialog 
            open={showAuthDialog} 
            onOpenChange={setShowAuthDialog}
            onSubmit={handleAuth}
          />
        </>
      )}
    </div>
  );
};

export default Index;