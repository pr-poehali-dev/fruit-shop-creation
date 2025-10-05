import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Icon from '@/components/ui/icon';
import NotificationsDropdown from './NotificationsDropdown';

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
  user: User | null;
  cart: CartItem[];
  currentSection: string;
  onSectionChange: (section: string) => void;
  onShowAuth: () => void;
  onShowCart: () => void;
  onShowProfile: () => void;
  onRatingRequest?: (entityType: string, entityId: number) => void;
}

const Header = ({ user, cart, currentSection, onSectionChange, onShowAuth, onShowCart, onShowProfile, onRatingRequest }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="Flower2" size={32} />
          <h1 className="text-2xl font-display font-bold">Питомник растений</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => onSectionChange('home')} className="hover:opacity-80 transition">Главная</button>
          <button onClick={() => onSectionChange('catalog')} className="hover:opacity-80 transition">Каталог</button>
          <button onClick={() => onSectionChange('about')} className="hover:opacity-80 transition">О нас</button>
          <button onClick={() => onSectionChange('delivery')} className="hover:opacity-80 transition">Доставка</button>
          <button onClick={() => onSectionChange('care')} className="hover:opacity-80 transition">Уход</button>
          <button onClick={() => onSectionChange('contacts')} className="hover:opacity-80 transition">Контакты</button>
        </nav>

        <div className="flex items-center gap-3">
          {user && onRatingRequest && (
            <NotificationsDropdown userId={user.id} onRatingRequest={onRatingRequest} />
          )}
          
          <Button variant="ghost" size="icon" className="relative text-primary-foreground hover:bg-primary/90" onClick={onShowCart}>
            <Icon name="ShoppingCart" size={24} />
            {cart.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-accent">
                {cart.length}
              </Badge>
            )}
          </Button>

          {user ? (
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/90" onClick={onShowProfile}>
              <Icon name="User" size={24} />
            </Button>
          ) : (
            <Button variant="secondary" onClick={onShowAuth}>
              Войти
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;