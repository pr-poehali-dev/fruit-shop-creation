import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

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
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Flower2" size={32} />
            <h1 className="text-2xl font-display font-bold">Питомник растений</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => setCurrentSection('home')} className="hover:opacity-80 transition">Главная</button>
            <button onClick={() => setCurrentSection('catalog')} className="hover:opacity-80 transition">Каталог</button>
            <button onClick={() => setCurrentSection('about')} className="hover:opacity-80 transition">О нас</button>
            <button onClick={() => setCurrentSection('delivery')} className="hover:opacity-80 transition">Доставка</button>
            <button onClick={() => setCurrentSection('care')} className="hover:opacity-80 transition">Уход</button>
            <button onClick={() => setCurrentSection('contacts')} className="hover:opacity-80 transition">Контакты</button>
          </nav>

          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-primary-foreground hover:bg-primary/90">
                  <Icon name="ShoppingCart" size={24} />
                  {cart.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-accent">
                      {cart.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle>Корзина</SheetTitle>
                </SheetHeader>
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
                        <Button className="w-full" onClick={() => handleCheckout('card')}>
                          <Icon name="CreditCard" size={18} className="mr-2" />
                          Оплатить картой
                        </Button>
                        <Button className="w-full" variant="outline" onClick={() => handleCheckout('cash')}>
                          <Icon name="Wallet" size={18} className="mr-2" />
                          Наличными при получении
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {user ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/90">
                    <Icon name="User" size={24} />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Профиль</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <div>
                      <Label>Телефон</Label>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                    <div>
                      <Label>Имя</Label>
                      <p className="font-medium">{user.full_name || 'Не указано'}</p>
                    </div>
                    {user.is_admin && (
                      <Badge variant="secondary">Администратор</Badge>
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
                </SheetContent>
              </Sheet>
            ) : (
              <Button variant="secondary" onClick={() => setShowAuthDialog(true)}>
                Войти
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentSection === 'home' && (
          <div className="space-y-12">
            <section className="text-center py-16 bg-gradient-to-b from-primary/10 to-transparent rounded-2xl">
              <h2 className="text-5xl font-display font-bold mb-4 text-primary">Ваш сад мечты начинается здесь</h2>
              <p className="text-xl text-muted-foreground mb-8">Плодовые и декоративные культуры высокого качества</p>
              <Button size="lg" onClick={() => setCurrentSection('catalog')} className="text-lg">
                Перейти в каталог
                <Icon name="ArrowRight" size={20} className="ml-2" />
              </Button>
            </section>

            <section>
              <h3 className="text-3xl font-display font-bold mb-6 text-center">Популярные товары</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.slice(0, 6).map(product => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover" />
                    <CardHeader>
                      <CardTitle className="font-display">{product.name}</CardTitle>
                      <CardDescription>{product.category_name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                      <p className="text-2xl font-bold mt-3 text-primary">{product.price} ₽</p>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={() => addToCart(product)}>
                        <Icon name="ShoppingCart" size={18} className="mr-2" />
                        В корзину
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        )}

        {currentSection === 'catalog' && (
          <div>
            <h2 className="text-4xl font-display font-bold mb-8">Каталог растений</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover" />
                  <CardHeader>
                    <CardTitle className="font-display">{product.name}</CardTitle>
                    <CardDescription>{product.category_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-2xl font-bold text-primary">{product.price} ₽</p>
                      <Badge variant="secondary">В наличии: {product.stock}</Badge>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => addToCart(product)}>
                      <Icon name="ShoppingCart" size={18} className="mr-2" />
                      В корзину
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentSection === 'about' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl font-display font-bold mb-6">О нас</h2>
            <p className="text-lg">Мы — семейный питомник растений с многолетним опытом выращивания плодовых и декоративных культур.</p>
            <p className="text-lg">Наша миссия — помочь вам создать сад вашей мечты с качественными и здоровыми растениями.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card className="text-center">
                <CardHeader>
                  <Icon name="Award" size={48} className="mx-auto text-primary" />
                  <CardTitle>Качество</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Все растения проходят строгий контроль качества</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <Icon name="Truck" size={48} className="mx-auto text-primary" />
                  <CardTitle>Доставка</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Бережная доставка по всей России</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <Icon name="Heart" size={48} className="mx-auto text-primary" />
                  <CardTitle>Поддержка</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Консультации по уходу за растениями</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentSection === 'delivery' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-display font-bold mb-6">Доставка и оплата</h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Package" size={24} />
                    Способы доставки
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold">Курьерская доставка</h4>
                    <p className="text-sm text-muted-foreground">По Москве и области — 500 ₽</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Транспортная компания</h4>
                    <p className="text-sm text-muted-foreground">По России — рассчитывается индивидуально</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Самовывоз</h4>
                    <p className="text-sm text-muted-foreground">Бесплатно из питомника</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="CreditCard" size={24} />
                    Способы оплаты
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon name="Check" size={18} className="text-primary" />
                    <span>Банковская карта онлайн</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Check" size={18} className="text-primary" />
                    <span>Наличные при получении</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Check" size={18} className="text-primary" />
                    <span>Банковский перевод</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentSection === 'care' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-display font-bold mb-6">Уход за растениями</h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Droplets" size={24} />
                    Полив
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Регулярный полив особенно важен в первый год после посадки. Летом поливайте растения обильно, но не допускайте застоя воды.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Sun" size={24} />
                    Освещение
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Большинство плодовых культур предпочитают солнечные места. Декоративные растения могут расти в полутени.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Scissors" size={24} />
                    Обрезка
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Регулярная обрезка помогает формировать крону и стимулирует рост. Проводите обрезку ранней весной или поздней осенью.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentSection === 'contacts' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-display font-bold mb-6">Контакты</h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Icon name="MapPin" size={24} className="text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Адрес питомника</h4>
                    <p className="text-muted-foreground">Московская область, г. Пушкино, ул. Садовая, 15</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Phone" size={24} className="text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Телефон</h4>
                    <p className="text-muted-foreground">+7 (495) 123-45-67</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Mail" size={24} className="text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Email</h4>
                    <p className="text-muted-foreground">info@plantsnursery.ru</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Clock" size={24} className="text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Режим работы</h4>
                    <p className="text-muted-foreground">Пн-Вс: 9:00 - 19:00</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="bg-primary text-primary-foreground mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="flex items-center justify-center gap-2 text-sm">
            <Icon name="Flower2" size={20} />
            © 2024 Питомник растений. Все права защищены.
          </p>
        </div>
      </footer>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Вход и регистрация</DialogTitle>
            <DialogDescription>Войдите или создайте новый аккаунт</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={(e) => handleAuth(e, 'login')} className="space-y-4">
                <div>
                  <Label htmlFor="login-phone">Телефон</Label>
                  <Input id="login-phone" name="phone" type="tel" placeholder="+7 (999) 123-45-67" required />
                </div>
                <div>
                  <Label htmlFor="login-password">Пароль</Label>
                  <Input id="login-password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full">Войти</Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={(e) => handleAuth(e, 'register')} className="space-y-4">
                <div>
                  <Label htmlFor="register-phone">Телефон</Label>
                  <Input id="register-phone" name="phone" type="tel" placeholder="+7 (999) 123-45-67" required />
                </div>
                <div>
                  <Label htmlFor="register-name">Имя</Label>
                  <Input id="register-name" name="full_name" placeholder="Иван Иванов" />
                </div>
                <div>
                  <Label htmlFor="register-password">Пароль</Label>
                  <Input id="register-password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full">Зарегистрироваться</Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
