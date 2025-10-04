import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Icon from '@/components/ui/icon';
import SideMenu from './SideMenu';
import SnowEffect from './SnowEffect';

interface User {
  id: number;
  phone: string;
  full_name: string;
  is_admin: boolean;
}

interface CartItem {
  product: {
    id: number;
    name: string;
    price: number;
    image_url: string;
  };
  quantity: number;
}

interface HeaderProps {
  cart: CartItem[];
  user: User | null;
  currentSection: string;
  siteSettings?: { site_name?: string };
  unreadTickets?: number;
  needsRating?: boolean;
  favoritesCount?: number;
  onSectionChange: (section: string) => void;
  onShowAuth: () => void;
  renderCartContent: () => React.ReactNode;
  renderProfileContent: (scrollToSupport?: boolean) => React.ReactNode;
}

const Header = ({ 
  cart, 
  user, 
  currentSection, 
  siteSettings,
  unreadTickets = 0,
  needsRating = false,
  favoritesCount = 0,
  onSectionChange, 
  onShowAuth,
  renderCartContent,
  renderProfileContent
}: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-primary-foreground shadow-md overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      <SnowEffect />
      
      <div className="absolute top-2 right-8 sm:right-16 md:right-24 lg:right-32 flex gap-3 opacity-90 animate-pulse">
        <div className="text-4xl sm:text-5xl" style={{ animation: 'swing 3s ease-in-out infinite' }}>🎄</div>
        <div className="text-3xl sm:text-4xl" style={{ animation: 'swing 3s ease-in-out 0.5s infinite' }}>✨</div>
        <div className="text-2xl sm:text-3xl" style={{ animation: 'swing 3s ease-in-out 1s infinite' }}>🎁</div>
      </div>
      
      <div className="absolute top-1 left-1/4 flex gap-2 opacity-60">
        <div className="text-xl">❄️</div>
        <div className="text-xl" style={{ animation: 'twinkle 2s ease-in-out infinite' }}>⛄</div>
      </div>
      
      <style>{`
        @keyframes swing {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
      
      <div className="container mx-auto px-4 py-3 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <SideMenu siteSettings={siteSettings} onSectionChange={onSectionChange} />
          <button 
            onClick={() => onSectionChange('home')} 
            className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition"
          >
            <img 
              src="https://cdn.poehali.dev/files/9bed5f24-da93-4601-95e2-818c0e5e31a4.jpg" 
              alt="Логотип Славный Сад" 
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover"
            />
            <h1 className="text-lg sm:text-2xl font-display font-extrabold tracking-tight drop-shadow-md">
              {siteSettings?.site_name || 'Питомник растений'}
            </h1>
          </button>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => onSectionChange('home')} className="hover:opacity-80 transition">Главная</button>
          <button onClick={() => onSectionChange('catalog')} className="hover:opacity-80 transition">Каталог</button>
          <button onClick={() => onSectionChange('about')} className="hover:opacity-80 transition">О нас</button>
          <button onClick={() => onSectionChange('delivery')} className="hover:opacity-80 transition">Доставка</button>
          <button onClick={() => onSectionChange('care')} className="hover:opacity-80 transition">Уход</button>
          <button onClick={() => onSectionChange('contacts')} className="hover:opacity-80 transition">Контакты</button>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {user && needsRating && (
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative text-primary-foreground hover:bg-primary/90"
                  title="Требуется оценить тикет"
                >
                  <Icon name="Bell" size={24} />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-orange-500">
                    1
                  </Badge>
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Оцените обращение</SheetTitle>
                </SheetHeader>
                {renderProfileContent(true)}
              </SheetContent>
            </Sheet>
          )}

          {user && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-primary-foreground hover:bg-primary/90 w-12 h-12 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border-2 border-red-200/30 backdrop-blur-sm transition-all hover:scale-110 snow-icon-button"
              onClick={() => onSectionChange('favorites')}
            >
              <Icon name="Heart" size={28} />
              {favoritesCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 text-white font-bold shadow-lg animate-pulse">
                  {favoritesCount}
                </Badge>
              )}
              <div className="icon-snow-sparkle">❄️</div>
            </Button>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-primary-foreground hover:bg-primary/90 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-500/20 hover:from-yellow-500/30 hover:to-amber-500/30 border-2 border-yellow-200/30 backdrop-blur-sm transition-all hover:scale-110 snow-icon-button">
                <Icon name="ShoppingCart" size={28} />
                {cart.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-gradient-to-br from-yellow-500 to-amber-600 text-white font-bold shadow-lg animate-pulse">
                    {cart.length}
                  </Badge>
                )}
                <div className="icon-snow-sparkle">✨</div>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Корзина</SheetTitle>
              </SheetHeader>
              {renderCartContent()}
            </SheetContent>
          </Sheet>

          {user ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-primary-foreground hover:bg-primary/90 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border-2 border-blue-200/30 backdrop-blur-sm transition-all hover:scale-110 snow-icon-button">
                  <Icon name="User" size={28} />
                  {unreadTickets > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 text-white font-bold shadow-lg animate-pulse">
                      {unreadTickets}
                    </Badge>
                  )}
                  <div className="icon-snow-sparkle">🎅</div>
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Профиль</SheetTitle>
                </SheetHeader>
                {renderProfileContent()}
              </SheetContent>
            </Sheet>
          ) : (
            <Button variant="secondary" onClick={onShowAuth}>
              Войти
            </Button>
          )}
        </div>
      </div>
      
      <style>{`
        .snow-icon-button {
          position: relative;
          overflow: visible;
        }
        
        .icon-snow-sparkle {
          position: absolute;
          top: -8px;
          left: -8px;
          font-size: 14px;
          animation: sparkle-rotate 3s ease-in-out infinite;
          pointer-events: none;
          filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.8));
        }
        
        @keyframes sparkle-rotate {
          0%, 100% { 
            transform: rotate(0deg) scale(1); 
            opacity: 0.8;
          }
          50% { 
            transform: rotate(20deg) scale(1.2); 
            opacity: 1;
          }
        }
        
        .snow-icon-button::before {
          content: '';
          position: absolute;
          top: -3px;
          left: 0;
          right: 0;
          height: 10px;
          background: linear-gradient(to bottom, 
            rgba(255, 255, 255, 0.6) 0%, 
            rgba(240, 249, 255, 0.3) 50%, 
            transparent 100%
          );
          border-radius: 50%;
          pointer-events: none;
          z-index: 10;
        }
        
        .snow-icon-button:hover::before {
          height: 14px;
          background: linear-gradient(to bottom, 
            rgba(255, 255, 255, 0.8) 0%, 
            rgba(240, 249, 255, 0.5) 50%, 
            transparent 100%
          );
        }
      `}</style>
    </header>
  );
};

export default Header;