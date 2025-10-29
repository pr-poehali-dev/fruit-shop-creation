import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface NavigationMenuProps {
  onNavigate: (section: string) => void;
}

export const NavigationMenu = ({ onNavigate }: NavigationMenuProps) => {
  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
        Навигация
      </h3>
      <nav className="space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start text-base h-12"
          onClick={() => onNavigate('home')}
        >
          <Icon name="Home" size={20} className="mr-3" />
          Главная
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-base h-12"
          onClick={() => onNavigate('catalog')}
        >
          <Icon name="ShoppingBag" size={20} className="mr-3" />
          Каталог
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-base h-12"
          onClick={() => onNavigate('about')}
        >
          <Icon name="Info" size={20} className="mr-3" />
          О нас
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-base h-12"
          onClick={() => onNavigate('delivery')}
        >
          <Icon name="Truck" size={20} className="mr-3" />
          Доставка
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-base h-12"
          onClick={() => onNavigate('care')}
        >
          <Icon name="Sprout" size={20} className="mr-3" />
          Уход за растениями
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-base h-12"
          onClick={() => onNavigate('contacts')}
        >
          <Icon name="Phone" size={20} className="mr-3" />
          Контакты
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-base h-12"
          onClick={() => onNavigate('gallery')}
        >
          <Icon name="Images" size={20} className="mr-3" />
          Галерея
        </Button>
      </nav>
    </div>
  );
};
