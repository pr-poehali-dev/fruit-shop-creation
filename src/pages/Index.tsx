import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useShopData } from '@/hooks/useShopData';
import { useTicketNotifications } from '@/hooks/useTicketNotifications';
import { useFavorites } from '@/hooks/useFavorites';
import Header from '@/components/shop/Header';
import AuthDialog from '@/components/shop/AuthDialog';
import Footer from '@/components/shop/Footer';
import HomeSection from '@/components/shop/sections/HomeSection';
import CatalogSection from '@/components/shop/sections/CatalogSection';
import FavoritesSection from '@/components/shop/sections/FavoritesSection';
import AboutSection from '@/components/shop/sections/AboutSection';
import DeliverySection from '@/components/shop/sections/DeliverySection';
import CareSection from '@/components/shop/sections/CareSection';
import ContactsSection from '@/components/shop/sections/ContactsSection';
import AdminPanel from '@/components/shop/admin/AdminPanel';
import CartContent from '@/components/shop/CartContent';
import ProfileContent from '@/components/shop/ProfileContent';
import ProductGalleryDialog from '@/components/shop/ProductGalleryDialog';
import NewYearBackground from '@/components/NewYearBackground';
import HalloweenTheme from '@/components/HalloweenTheme';
import SummerTheme from '@/components/SummerTheme';
import RatingModal from '@/components/RatingModal';

import { Product } from '@/types/shop';

const Index = () => {
  const { toast } = useToast();
  const { user, setUser, isRefreshingBalance, setIsRefreshingBalance, handleAuth, handleLogout, banInfo } = useAuth();
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
  const { unreadCount, needsRating } = useTicketNotifications(user);
  const { favorites, favoriteIds, toggleFavorite } = useFavorites(user?.id || null);

  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [currentSection, setCurrentSection] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductGalleryOpen, setIsProductGalleryOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingEntityType, setRatingEntityType] = useState('');
  const [ratingEntityId, setRatingEntityId] = useState(0);
  const [requiresAdminCode, setRequiresAdminCode] = useState(false);
  const [pendingAdminUser, setPendingAdminUser] = useState<{ id: number; full_name: string } | null>(null);
  const [adminCodeError, setAdminCodeError] = useState('');

  useEffect(() => {
    if (user) {
      loadOrders(user);
      setShowAuthDialog(false);
    }
  }, [user]);



  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast({
      title: 'Добавлено в корзину',
      description: product.name
    });
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsProductGalleryOpen(true);
  };

  const handleCheckout = async (paymentMethod: string, deliveryType: string = 'pickup') => {
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Пожалуйста, войдите в аккаунт для оформления заказа',
        variant: 'destructive'
      });
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

    const basePrice = getTotalPrice();
    let deliveryPrice = 0;
    
    if (deliveryType === 'delivery') {
      const freeDeliveryMin = parseFloat(siteSettings?.free_delivery_min || 0);
      const isFreeDelivery = freeDeliveryMin > 0 && basePrice >= freeDeliveryMin;
      
      if (!isFreeDelivery) {
        const baseDeliveryPrice = parseFloat(siteSettings?.delivery_price || 0);
        const courierDeliveryPrice = parseFloat(siteSettings?.courier_delivery_price || 0);
        deliveryPrice = baseDeliveryPrice + courierDeliveryPrice;
      }
    }
    
    const totalAmount = basePrice + deliveryPrice;

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
      const deliveryAddress = deliveryType === 'pickup' 
        ? `Самовывоз: ${siteSettings?.address || 'Адрес не указан'}` 
        : 'Доставка (адрес уточняется)';
        
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
          delivery_address: deliveryAddress,
          delivery_type: deliveryType,
          cashback_percent: siteSettings?.balance_payment_cashback_percent || 5
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Заказ оформлен!',
          description: paymentMethod === 'balance' 
            ? `Заказ #${data.order_id}. Начислен кэшбэк ${siteSettings?.balance_payment_cashback_percent || 5}%!` 
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

  const onAuthSuccess = (userData: any, message: string, requiresCode?: boolean) => {
    console.log('✅ onAuthSuccess called:', { userData, message, requiresCode });
    if (requiresCode) {
      console.log('🔐 Setting requiresAdminCode to TRUE');
      setRequiresAdminCode(true);
      setPendingAdminUser({ id: userData.id, full_name: userData.full_name });
      setAdminCodeError('');
      console.log('📋 State updated:', { requiresAdminCode: true, pendingAdminUser: { id: userData.id, full_name: userData.full_name } });
    } else {
      setShowAuthDialog(false);
      setRequiresAdminCode(false);
      setPendingAdminUser(null);
      toast({
        title: message,
        description: `Добро пожаловать, ${userData.full_name || userData.phone}!`
      });
    }
  };

  const onAuthError = (error: string) => {
    toast({
      title: 'Ошибка',
      description: error,
      variant: 'destructive'
    });
  };

  const handleAdminCodeVerify = async (code: string) => {
    if (!pendingAdminUser) return;

    try {
      const API_AUTH = 'https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc';
      const response = await fetch(API_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_code',
          user_id: pendingAdminUser.id,
          login_code: code
        })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setShowAuthDialog(false);
        setRequiresAdminCode(false);
        setPendingAdminUser(null);
        setAdminCodeError('');
        toast({
          title: 'Доступ разрешён',
          description: `Добро пожаловать в админку, ${data.user.full_name}!`
        });
      } else {
        setAdminCodeError(data.error || 'Неверный код');
      }
    } catch (error) {
      setAdminCodeError('Не удалось проверить код');
    }
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
      siteSettings={siteSettings}
    />
  );

  const renderProfileContent = (scrollToSupport: boolean = false) => (
    <ProfileContent
      user={user}
      orders={orders}
      siteSettings={siteSettings}
      onShowAdminPanel={() => setShowAdminPanel(true)}
      onLogout={() => handleLogout(onLogout)}
      onBalanceUpdate={() => {
        refreshUserBalance(user, setUser, setIsRefreshingBalance);
        loadOrders();
      }}
      onUserUpdate={(updatedUser) => setUser(updatedUser)}
      scrollToSupport={scrollToSupport}
    />
  );

  const getBackgroundStyle = () => {
    const theme = siteSettings?.holiday_theme || 'none';
    switch (theme) {
      case 'new_year':
        return 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50';
      case 'halloween':
        return 'bg-gradient-to-br from-purple-900 via-gray-900 to-orange-900';
      case 'summer':
        return 'bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50';
      default:
        return 'bg-background';
    }
  };

  const renderHolidayTheme = () => {
    const theme = siteSettings?.holiday_theme || 'none';
    switch (theme) {
      case 'new_year':
        return <NewYearBackground />;
      case 'halloween':
        return <HalloweenTheme />;
      case 'summer':
        return <SummerTheme />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${getBackgroundStyle()} relative`}>
      {renderHolidayTheme()}
      
      {showAdminPanel && user?.is_admin ? (
        <AdminPanel 
          user={user}
          onClose={() => {
            setShowAdminPanel(false);
            loadProducts();
            loadSettings();
            setTimeout(() => refreshUserBalance(user, isRefreshingBalance, setIsRefreshingBalance, setUser), 300);
          }}
        />
      ) : (
        <>
          <Header 
            cart={cart}
            user={user}
            currentSection={currentSection}
            siteSettings={siteSettings}
            unreadTickets={unreadCount}
            needsRating={needsRating}
            favoritesCount={favorites.length}
            onSectionChange={setCurrentSection}
            onShowAuth={() => setShowAuthDialog(true)}
            renderCartContent={renderCartContent}
            renderProfileContent={renderProfileContent}
            onRatingRequest={(entityType: string, entityId: number) => {
              setRatingEntityType(entityType);
              setRatingEntityId(entityId);
              setRatingModalOpen(true);
            }}
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
                    onViewDetails={handleViewDetails}
                    favoriteIds={favoriteIds}
                    onToggleFavorite={toggleFavorite}
                    siteSettings={siteSettings}
                    isAuthenticated={!!user}
                    onShowAuth={() => setShowAuthDialog(true)}
                  />
                )}

                {currentSection === 'catalog' && (
                  <CatalogSection 
                    products={products} 
                    onAddToCart={handleAddToCart}
                    favoriteIds={favoriteIds}
                    onToggleFavorite={toggleFavorite}
                    siteSettings={siteSettings}
                    isAuthenticated={!!user}
                    onShowAuth={() => setShowAuthDialog(true)}
                  />
                )}

                {currentSection === 'favorites' && (
                  <FavoritesSection 
                    favorites={favorites} 
                    onAddToCart={handleAddToCart}
                    favoriteIds={favoriteIds}
                    onToggleFavorite={toggleFavorite}
                    siteSettings={siteSettings}
                    onClose={() => setCurrentSection('catalog')}
                  />
                )}

                {currentSection === 'about' && <AboutSection siteSettings={siteSettings} />}

                {currentSection === 'delivery' && <DeliverySection siteSettings={siteSettings} />}

                {currentSection === 'care' && <CareSection siteSettings={siteSettings} />}

                {currentSection === 'contacts' && <ContactsSection settings={siteSettings} />}
              </>
            )}
          </main>

          <Footer />

          <ProductGalleryDialog
            product={selectedProduct}
            open={isProductGalleryOpen}
            onOpenChange={setIsProductGalleryOpen}
            onAddToCart={handleAddToCart}
          />

          <AuthDialog 
            open={showAuthDialog} 
            onOpenChange={(open) => {
              setShowAuthDialog(open);
              if (!open) {
                setRequiresAdminCode(false);
                setPendingAdminUser(null);
                setAdminCodeError('');
              }
            }}
            onSubmit={(e, action) => handleAuth(e, action, onAuthSuccess, onAuthError)}
            banInfo={banInfo}
            requiresAdminCode={requiresAdminCode}
            pendingAdminUser={pendingAdminUser || undefined}
            onAdminCodeVerify={handleAdminCodeVerify}
            adminCodeError={adminCodeError}
          />

          {user && (
            <RatingModal
              isOpen={ratingModalOpen}
              onClose={() => setRatingModalOpen(false)}
              userId={user.id}
              entityType={ratingEntityType}
              entityId={ratingEntityId}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Index;