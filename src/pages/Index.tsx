import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useShopData } from '@/hooks/useShopData';
import { useFavorites } from '@/hooks/useFavorites';
import { useCheckout } from '@/components/shop/hooks/useCheckout';
import { useAdminAuth } from '@/components/shop/hooks/useAdminAuth';
import { getBackgroundStyle } from '@/components/shop/utils/themeHelpers';
import Header from '@/components/shop/Header';
import AuthDialog from '@/components/shop/AuthDialog';
import Footer from '@/components/shop/Footer';
import AdminPanel from '@/components/shop/admin/AdminPanel';
import CartContent from '@/components/shop/CartContent';
import ProfileContent from '@/components/shop/ProfileContent';
import ProductGalleryDialog from '@/components/shop/ProductGalleryDialog';
import HolidayThemeRenderer from '@/components/shop/HolidayThemeRenderer';
import MainContent from '@/components/shop/MainContent';
import MaintenancePage from '@/components/MaintenancePage';
import { Product } from '@/types/shop';

const Index = () => {
  const { toast } = useToast();
  const { user, setUser, isRefreshingBalance, setIsRefreshingBalance, handleAuth, handleDirectLogin, handleLogout, banInfo, clearBanInfo } = useAuth();
  const { cart, addToCart, updateCartQuantity, getTotalPrice, clearCart } = useCart();
  const {
    products,
    categories,
    orders,
    siteSettings,
    isLoading,
    loadProducts,
    loadSettings,
    loadOrders,
    refreshUserBalance,
    API_ORDERS
  } = useShopData();
  const { favorites, favoriteIds, toggleFavorite } = useFavorites(user?.id || null);

  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [currentSection, setCurrentSection] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductGalleryOpen, setIsProductGalleryOpen] = useState(false);

  const { handleCheckout } = useCheckout({
    user,
    cart,
    getTotalPrice,
    clearCart,
    loadOrders,
    refreshUserBalance,
    isRefreshingBalance,
    setIsRefreshingBalance,
    setUser,
    setShowAuthDialog,
    siteSettings,
    API_ORDERS
  });

  const {
    requiresAdminCode,
    pendingAdminUser,
    adminCodeError,
    onAuthSuccess,
    onAuthError,
    handleAdminCodeVerify,
    resetAdminAuth
  } = useAdminAuth({ setUser, setShowAuthDialog });

  useEffect(() => {
    if (user) {
      loadOrders(user);
      setShowAuthDialog(false);
    }
  }, [user]);

  useEffect(() => {
    const isMaintenanceActive = checkScheduledMaintenance();
    
    if (isMaintenanceActive && user && !user.is_admin) {
      handleLogout(() => {
        toast({
          title: 'Технические работы',
          description: 'Сайт закрыт на техническое обслуживание',
          variant: 'destructive'
        });
      });
    }
  }, [siteSettings?.is_maintenance_mode, siteSettings?.auto_maintenance_enabled, user]);

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

  const renderProfileContent = () => (
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
    />
  );

  const handleMaintenanceAdminLogin = async (phone: string, password: string) => {
    const authSuccess = (userData: any, message: string, requiresCode?: boolean) => {
      if (!userData.is_admin) {
        toast({
          title: 'Доступ запрещён',
          description: 'Только администраторы могут войти во время технических работ',
          variant: 'destructive'
        });
        handleLogout(() => {});
        return;
      }
      
      if (requiresCode) {
        onAuthSuccess(userData, message, requiresCode);
      } else {
        toast({
          title: 'Добро пожаловать!',
          description: 'Вы успешно вошли как администратор',
        });
      }
    };

    const authError = (error: string) => {
      toast({
        title: 'Ошибка входа',
        description: error,
        variant: 'destructive'
      });
    };

    await handleDirectLogin(phone, password, authSuccess, authError, true);
  };

  const checkScheduledMaintenance = () => {
    if (!siteSettings?.auto_maintenance_enabled) {
      return siteSettings?.is_maintenance_mode;
    }

    const now = new Date();
    const startTime = siteSettings.maintenance_start_time ? new Date(siteSettings.maintenance_start_time) : null;
    const endTime = siteSettings.maintenance_end_time ? new Date(siteSettings.maintenance_end_time) : null;

    if (startTime && endTime) {
      const isInMaintenanceWindow = now >= startTime && now <= endTime;
      return isInMaintenanceWindow;
    }

    return siteSettings?.is_maintenance_mode;
  };

  const isMaintenanceActive = checkScheduledMaintenance();

  if (isMaintenanceActive && !user?.is_admin) {
    return (
      <MaintenancePage
        reason={siteSettings?.maintenance_reason || 'Сайт временно закрыт на техническое обслуживание'}
        onAdminLogin={handleMaintenanceAdminLogin}
      />
    );
  }

  return (
    <div className={`min-h-screen ${getBackgroundStyle(siteSettings?.holiday_theme)} relative`}>
      <HolidayThemeRenderer theme={siteSettings?.holiday_theme} />

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
            favoritesCount={favorites.length}
            onSectionChange={setCurrentSection}
            onShowAuth={() => setShowAuthDialog(true)}
            renderCartContent={renderCartContent}
            renderProfileContent={renderProfileContent}
            onNotificationClick={(notification) => {
              refreshUserBalance(user, setUser, setIsRefreshingBalance);
              loadOrders();
              
              if (notification.type === 'payment' && notification.entity_type === 'order' && notification.entity_id) {
                const order = orders.find(o => o.id === notification.entity_id);
                if (order && order.is_preorder && order.status === 'processing') {
                  setCurrentSection('profile');
                }
              }
            }}
          />

          <main className="container mx-auto px-4 py-8">
            <MainContent
              isLoading={isLoading}
              currentSection={currentSection}
              products={products}
              categories={categories}
              favorites={favorites}
              favoriteIds={favoriteIds}
              siteSettings={siteSettings}
              isAuthenticated={!!user}
              onSectionChange={setCurrentSection}
              onAddToCart={handleAddToCart}
              onViewDetails={handleViewDetails}
              onToggleFavorite={toggleFavorite}
              onShowAuth={() => setShowAuthDialog(true)}
            />
          </main>

          <Footer />

          <ProductGalleryDialog
            product={selectedProduct}
            open={isProductGalleryOpen}
            onOpenChange={setIsProductGalleryOpen}
            onAddToCart={handleAddToCart}
            isAuthenticated={!!user}
            onShowAuth={() => setShowAuthDialog(true)}
          />

          <AuthDialog
            open={showAuthDialog}
            onOpenChange={(open) => {
              setShowAuthDialog(open);
              if (!open) {
                resetAdminAuth();
              }
            }}
            onSubmit={(e, action) => handleAuth(e, action, onAuthSuccess, onAuthError)}
            banInfo={banInfo}
            requiresAdminCode={requiresAdminCode}
            pendingAdminUser={pendingAdminUser || undefined}
            onAdminCodeVerify={handleAdminCodeVerify}
            adminCodeError={adminCodeError}
            onBanExpired={clearBanInfo}
          />
        </>
      )}
    </div>
  );
};

export default Index;