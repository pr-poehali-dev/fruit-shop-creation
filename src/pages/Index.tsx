import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useShopData } from '@/hooks/useShopData';
import { useTicketNotifications } from '@/hooks/useTicketNotifications';
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
import CartContent from '@/components/shop/CartContent';
import ProfileContent from '@/components/shop/ProfileContent';

import { Product } from '@/types/shop';

const Index = () => {
  const { toast } = useToast();
  const { user, setUser, isRefreshingBalance, setIsRefreshingBalance, handleAuth, handleLogout } = useAuth();
  const { cart, addToCart, updateCartQuantity, getTotalPrice, clearCart } = useCart();
  const {
    products,
    orders,
    siteSettings,
    isLoading,
    loadProducts,
    loadSettings,
    loadOrders,
    refreshUserBalance,
    API_ORDERS
  } = useShopData();
  const { unreadCount } = useTicketNotifications(user);

  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [currentSection, setCurrentSection] = useState('home');

  useEffect(() => {
    if (user) {
      loadOrders(user);
    }
  }, [user]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast({
      title: 'Добавлено в корзину',
      description: product.name
    });
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
        clearCart();
        loadOrders(user);
        
        if (paymentMethod === 'balance') {
          setTimeout(() => refreshUserBalance(user, isRefreshingBalance, setIsRefreshingBalance, setUser), 500);
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

  const onAuthSuccess = (userData: any, message: string) => {
    setShowAuthDialog(false);
    toast({
      title: message,
      description: `Добро пожаловать, ${userData.full_name || userData.phone}!`
    });
  };

  const onAuthError = (error: string) => {
    toast({
      title: 'Ошибка',
      description: error,
      variant: 'destructive'
    });
  };

  const onLogout = () => {
    setCurrentSection('home');
    clearCart();
    toast({ title: 'Вы вышли из системы' });
  };

  const renderCartContent = () => (
    <CartContent
      cart={cart}
      user={user}
      updateCartQuantity={updateCartQuantity}
      getTotalPrice={getTotalPrice}
      handleCheckout={handleCheckout}
    />
  );

  const renderProfileContent = () => (
    <ProfileContent
      user={user}
      orders={orders}
      onShowAdminPanel={() => setShowAdminPanel(true)}
      onLogout={() => handleLogout(onLogout)}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      {showAdminPanel && user?.is_admin ? (
        <AdminPanel onClose={() => {
          setShowAdminPanel(false);
          loadProducts();
          loadSettings();
          setTimeout(() => refreshUserBalance(user, isRefreshingBalance, setIsRefreshingBalance, setUser), 300);
        }} />
      ) : (
        <>
          <Header 
            cart={cart}
            user={user}
            currentSection={currentSection}
            siteSettings={siteSettings}
            unreadTickets={unreadCount}
            onSectionChange={setCurrentSection}
            onShowAuth={() => setShowAuthDialog(true)}
            renderCartContent={renderCartContent}
            renderProfileContent={renderProfileContent}
          />

          <main className="container mx-auto px-4 py-8">
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Загрузка...</p>
                </div>
              </div>
            ) : (
              <>
                {currentSection === 'home' && (
                  <HomeSection 
                    products={products} 
                    onNavigate={setCurrentSection} 
                    onAddToCart={handleAddToCart} 
                  />
                )}

                {currentSection === 'catalog' && (
                  <CatalogSection products={products} onAddToCart={handleAddToCart} />
                )}

                {currentSection === 'about' && <AboutSection />}

                {currentSection === 'delivery' && <DeliverySection />}

                {currentSection === 'care' && <CareSection />}

                {currentSection === 'contacts' && <ContactsSection settings={siteSettings} />}
              </>
            )}
          </main>

          <Footer />

          <AuthDialog 
            open={showAuthDialog} 
            onOpenChange={setShowAuthDialog}
            onSubmit={(e, action) => handleAuth(e, action, onAuthSuccess, onAuthError)}
          />
        </>
      )}
    </div>
  );
};

export default Index;