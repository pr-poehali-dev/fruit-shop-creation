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
}

const HomeSection = ({ products, onNavigate, onAddToCart, onViewDetails, favoriteIds, onToggleFavorite, siteSettings }: HomeSectionProps) => {
  const showNewYearBanner = siteSettings?.holiday_theme === 'new_year';
  const holidayTheme = siteSettings?.holiday_theme || 'none';
  
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

      {/* Секция товаров */}
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
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeSection;