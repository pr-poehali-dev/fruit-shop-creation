import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import CartSheet from '@/components/CartSheet';
import ProfileSheet from '@/components/ProfileSheet';
import AuthDialog from '@/components/AuthDialog';
import Footer from '@/components/Footer';
import HomeSection from '@/components/sections/HomeSection';
import CatalogSection from '@/components/sections/CatalogSection';
import AboutSection from '@/components/sections/AboutSection';
import DeliverySection from '@/components/sections/DeliverySection';
import CareSection from '@/components/sections/CareSection';
import ContactsSection from '@/components/sections/ContactsSection';

interface User {
  id: number;
  phone: string;
  full_name: string;
  is_admin: boolean;
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
  const [showCartSheet, setShowCartSheet] = useState(false);
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const [currentSection, setCurrentSection] = useState('home');
  const { toast } = useToast();

  const API_AUTH = 'https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc';
  const API_PRODUCTS = 'https://functions.poehali.dev/5ae817c6-e62e-40c6-8e34-18ffac2d3cfc';
  const API_ORDERS = 'https://functions.poehali.dev/b35bef37-8423-4939-b43b-0fb565cc8853';

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
  }, []);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

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
    setShowProfileSheet(false);
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

  const handleCheckout = async (paymentMethod: string) => {
    if (!user) {
      setShowCartSheet(false);
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
          description: `Номер заказа: ${data.order_id}`
        });
        setCart([]);
        setShowCartSheet(false);
        loadOrders();
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось оформить заказ',
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

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user}
        cart={cart}
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        onShowAuth={() => setShowAuthDialog(true)}
        onShowCart={() => setShowCartSheet(true)}
        onShowProfile={() => setShowProfileSheet(true)}
      />

      <main className="container mx-auto px-4 py-8">
        {currentSection === 'home' && (
          <HomeSection 
            products={products}
            onSectionChange={setCurrentSection}
            onAddToCart={addToCart}
          />
        )}

        {currentSection === 'catalog' && (
          <CatalogSection 
            products={products}
            onAddToCart={addToCart}
          />
        )}

        {currentSection === 'about' && <AboutSection />}
        {currentSection === 'delivery' && <DeliverySection />}
        {currentSection === 'care' && <CareSection />}
        {currentSection === 'contacts' && <ContactsSection />}
      </main>

      <Footer />

      <CartSheet 
        open={showCartSheet}
        onOpenChange={setShowCartSheet}
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        onCheckout={handleCheckout}
      />

      {user && (
        <ProfileSheet 
          open={showProfileSheet}
          onOpenChange={setShowProfileSheet}
          user={user}
          orders={orders}
          onLogout={handleLogout}
        />
      )}

      <AuthDialog 
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onAuth={handleAuth}
      />
    </div>
  );
};

export default Index;
