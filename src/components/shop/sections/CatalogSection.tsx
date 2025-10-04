import { useState } from 'react';
import ProductCard from '../ProductCard';
import ProductGalleryDialog from '../ProductGalleryDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface ProductImage {
  id?: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
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
  images?: ProductImage[];
}

interface CatalogSectionProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  favoriteIds?: Set<number>;
  onToggleFavorite?: (productId: number) => void;
  siteSettings?: any;
  isAuthenticated?: boolean;
  onShowAuth?: () => void;
}

const CatalogSection = ({ products, onAddToCart, favoriteIds, onToggleFavorite, siteSettings, isAuthenticated = false, onShowAuth }: CatalogSectionProps) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [showPumpkin, setShowPumpkin] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsGalleryOpen(true);
  };

  const categories = [
    { id: 'all', name: 'Все растения' },
    { id: 'Плодовые культуры', name: 'Плодовые' },
    { id: 'Декоративные культуры', name: 'Декоративные' },
  ];

  let filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category_name === activeCategory);

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.category_name.toLowerCase().includes(query)
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-[600px] rounded-3xl overflow-hidden group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-105 group-hover:blur-sm"
          style={{ backgroundImage: 'url(/img/d64bcbd2-3424-4fbc-8e3a-56f22a820104.jpg)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 group-hover:from-black/70 group-hover:via-black/60 group-hover:to-black/80 transition-all duration-700" />
        </div>
        
        {showPumpkin && (
          <button
            onClick={() => setShowPumpkin(false)}
            className="hidden md:block absolute top-8 right-8 z-20 text-7xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer animate-bounce hover:animate-none"
            aria-label="Новогодний декор"
          >
            🎄
          </button>
        )}
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[600px] text-center px-6 py-12">
          <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 group-hover:scale-105 transition-transform duration-500">
            <div className="inline-block">
              <div className="bg-white/10 backdrop-blur-md rounded-full p-6 mb-6">
                <Icon name="Lock" size={64} className="text-white" />
              </div>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight">
              Откройте мир прекрасных растений
            </h2>
            
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Для просмотра каталога и совершения покупок необходимо войти в аккаунт.<br />
              Получите доступ к эксклюзивным предложениям и лучшим ценам!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button 
                size="lg" 
                onClick={onShowAuth}
                className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
              >
                <Icon name="LogIn" size={24} className="mr-2" />
                Войти в аккаунт
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={onShowAuth}
                className="text-lg px-8 py-6 bg-white/10 backdrop-blur-md text-white border-white/30 hover:bg-white/20 hover:border-white/50 shadow-xl transition-all hover:scale-105"
              >
                <Icon name="UserPlus" size={24} className="mr-2" />
                Зарегистрироваться
              </Button>
            </div>
            
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-white/80">
              <div className="flex items-center gap-3 justify-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-full p-2">
                  <Icon name="ShoppingBag" size={20} />
                </div>
                <span className="text-sm font-medium">Широкий ассортимент</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-full p-2">
                  <Icon name="Truck" size={20} />
                </div>
                <span className="text-sm font-medium">Быстрая доставка</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-full p-2">
                  <Icon name="Gift" size={20} />
                </div>
                <span className="text-sm font-medium">Специальные предложения</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-4xl font-display font-bold mb-8">Каталог растений</h2>
      
      <div className="mb-6">
        <div className="relative max-w-2xl">
          <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Поиск товаров по названию, описанию или категории..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-10 py-6 text-lg rounded-full shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name="X" size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeCategory === category.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={onAddToCart}
            onViewDetails={handleViewDetails}
            isFavorite={favoriteIds?.has(product.id)}
            onToggleFavorite={onToggleFavorite}
            siteSettings={siteSettings}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Icon name="SearchX" size={64} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-xl font-medium text-muted-foreground mb-2">
            {searchQuery ? 'Ничего не найдено' : 'В этой категории пока нет товаров'}
          </p>
          {searchQuery && (
            <p className="text-sm text-muted-foreground">
              Попробуйте изменить запрос или <button onClick={() => setSearchQuery('')} className="text-primary hover:underline">очистить поиск</button>
            </p>
          )}
        </div>
      )}

      <ProductGalleryDialog
        product={selectedProduct}
        open={isGalleryOpen}
        onOpenChange={setIsGalleryOpen}
        onAddToCart={onAddToCart}
      />
    </div>
  );
};

export default CatalogSection;