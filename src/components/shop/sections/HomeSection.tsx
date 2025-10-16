import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import ProductCard from '../ProductCard';
import NewYearBanner from '../NewYearBanner';

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

interface HomeSectionProps {
  products: Product[];
  onNavigate: (section: string) => void;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  favoriteIds?: Set<number>;
  onToggleFavorite?: (productId: number) => void;
  siteSettings?: any;
  isAuthenticated?: boolean;
  onShowAuth?: () => void;
}

const HomeSection = ({ products, onNavigate, onAddToCart, onViewDetails, favoriteIds, onToggleFavorite, siteSettings, isAuthenticated, onShowAuth }: HomeSectionProps) => {
  const showNewYearBanner = siteSettings?.holiday_theme === 'new_year';
  const holidayTheme = siteSettings?.holiday_theme || 'none';
  
  const isPreorderActive = () => {
    if (!siteSettings?.preorder_enabled) return false;
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (siteSettings.preorder_start_date) {
      const startDate = new Date(siteSettings.preorder_start_date);
      startDate.setHours(0, 0, 0, 0);
      if (now < startDate) return false;
    }
    
    if (siteSettings.preorder_end_date) {
      const endDate = new Date(siteSettings.preorder_end_date);
      endDate.setHours(23, 59, 59, 999);
      if (now > endDate) return false;
    }
    
    return true;
  };
  
  const getHeroContent = () => {
    switch (holidayTheme) {
      case 'new_year':
        return {
          title: '🎄 Новогодняя распродажа! 🎅',
          subtitle: 'Успейте купить растения со скидкой до конца года',
          gradient: 'bg-gradient-to-br from-red-500/20 via-green-500/10 to-blue-500/20',
          radial: 'from-red-400/15 via-green-400/10',
          icon: 'Gift' as const
        };
      case 'halloween':
        return {
          title: '🎃 Жуткие скидки на Хэллоуин! 👻',
          subtitle: 'Создайте свой мистический сад с нашими растениями',
          gradient: 'bg-gradient-to-br from-orange-600/25 via-purple-600/15 to-black/30',
          radial: 'from-orange-500/20 via-purple-500/15',
          icon: 'Ghost' as const
        };
      case 'summer':
        return {
          title: '☀️ Летние предложения! 🌺',
          subtitle: 'Яркие растения для вашего солнечного сада',
          gradient: 'bg-gradient-to-br from-yellow-400/30 via-orange-400/20 to-pink-400/25',
          radial: 'from-yellow-300/25 via-orange-300/15',
          icon: 'Sun' as const
        };
      default:
        return {
          title: 'Ваш сад мечты начинается здесь',
          subtitle: 'Плодовые и декоративные культуры высокого качества',
          gradient: 'bg-gradient-to-br from-primary/20 via-primary/5 to-background',
          radial: 'from-primary/10',
          icon: 'Sparkles' as const
        };
    }
  };
  
  const heroContent = getHeroContent();
  
  return (
    <div className="space-y-16">
      {showNewYearBanner && <NewYearBanner />}
      
      {/* Уведомление о предзаказе */}
      {isPreorderActive() && (
        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-500">
          <div className="relative p-6 md:p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                  <Icon name="Calendar" size={32} className="text-white" />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-2xl md:text-3xl font-bold">Режим предзаказа активен! 🌱</h3>
                <p className="text-blue-100 text-base md:text-lg leading-relaxed">
                  {siteSettings?.preorder_message || 'Предзаказ на весну 2026. Доставка с марта по май 2026 года.'}
                </p>
                {(siteSettings?.preorder_start_date || siteSettings?.preorder_end_date) && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {siteSettings?.preorder_start_date && (
                      <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-medium">
                        <Icon name="CalendarCheck" size={14} />
                        С {new Date(siteSettings.preorder_start_date).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                    {siteSettings?.preorder_end_date && (
                      <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-medium">
                        <Icon name="CalendarClock" size={14} />
                        До {new Date(siteSettings.preorder_end_date).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <Button 
                onClick={() => onNavigate('catalog')} 
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-lg hover:shadow-xl transition-all flex-shrink-0"
              >
                Оформить предзаказ
                <Icon name="ArrowRight" size={18} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hero секция с градиентным фоном */}
      <section className={`relative text-center py-20 px-6 rounded-3xl overflow-hidden ${heroContent.gradient}`}>
        <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${heroContent.radial} via-transparent to-transparent`}></div>
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-primary">
            {heroContent.title}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            {heroContent.subtitle}
          </p>
          <Button size="lg" onClick={() => onNavigate('catalog')} className="text-lg shadow-xl hover:shadow-2xl transition-shadow">
            Перейти в каталог
            <Icon name={heroContent.icon} size={20} className="ml-2" />
          </Button>
        </div>
      </section>

      {/* Декоративное разделение */}
      <div className="relative py-8">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t-2 border-primary/20"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="bg-background px-6 py-2 rounded-full border-2 border-primary/20">
            <Icon name="Sparkles" size={24} className="text-primary" />
          </div>
        </div>
      </div>

      {/* Секция товаров - доступна всем */}
      <section className="bg-gradient-to-b from-transparent via-primary/5 to-transparent py-12 -mx-4 px-4 rounded-3xl">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-display font-bold mb-3 text-primary">Популярные товары</h3>
          <p className="text-muted-foreground">Выбор наших покупателей</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.slice(0, 6).map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={onAddToCart}
              onViewDetails={onViewDetails}
              isFavorite={favoriteIds?.has(product.id)}
              onToggleFavorite={onToggleFavorite}
              siteSettings={siteSettings}
              isAuthenticated={isAuthenticated}
              onShowAuth={onShowAuth}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeSection;