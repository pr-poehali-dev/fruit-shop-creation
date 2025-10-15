import HomeSection from '@/components/shop/sections/HomeSection';
import CatalogSection from '@/components/shop/sections/CatalogSection';
import FavoritesSection from '@/components/shop/sections/FavoritesSection';
import AboutSection from '@/components/shop/sections/AboutSection';
import DeliverySection from '@/components/shop/sections/DeliverySection';
import CareSection from '@/components/shop/sections/CareSection';
import ContactsSection from '@/components/shop/sections/ContactsSection';
import { Product } from '@/types/shop';

interface MainContentProps {
  isLoading: boolean;
  currentSection: string;
  products: Product[];
  favorites: Product[];
  favoriteIds: Set<number>;
  siteSettings: any;
  isAuthenticated: boolean;
  onSectionChange: (section: string) => void;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onToggleFavorite: (productId: number) => void;
  onShowAuth: () => void;
}

const MainContent = ({
  isLoading,
  currentSection,
  products,
  favorites,
  favoriteIds,
  siteSettings,
  isAuthenticated,
  onSectionChange,
  onAddToCart,
  onViewDetails,
  onToggleFavorite,
  onShowAuth
}: MainContentProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentSection === 'home' && (
        <HomeSection
          products={products}
          onNavigate={onSectionChange}
          onAddToCart={onAddToCart}
          onViewDetails={onViewDetails}
          favoriteIds={favoriteIds}
          onToggleFavorite={onToggleFavorite}
          siteSettings={siteSettings}
          isAuthenticated={isAuthenticated}
          onShowAuth={onShowAuth}
        />
      )}

      {currentSection === 'catalog' && (
        <CatalogSection
          products={products}
          onAddToCart={onAddToCart}
          favoriteIds={favoriteIds}
          onToggleFavorite={onToggleFavorite}
          siteSettings={siteSettings}
          isAuthenticated={isAuthenticated}
          onShowAuth={onShowAuth}
        />
      )}

      {currentSection === 'favorites' && (
        <FavoritesSection
          favorites={favorites}
          onAddToCart={onAddToCart}
          favoriteIds={favoriteIds}
          onToggleFavorite={onToggleFavorite}
          siteSettings={siteSettings}
          onClose={() => onSectionChange('catalog')}
        />
      )}

      {currentSection === 'about' && <AboutSection siteSettings={siteSettings} />}

      {currentSection === 'delivery' && <DeliverySection siteSettings={siteSettings} />}

      {currentSection === 'care' && <CareSection siteSettings={siteSettings} />}

      {currentSection === 'contacts' && <ContactsSection settings={siteSettings} />}
    </>
  );
};

export default MainContent;
