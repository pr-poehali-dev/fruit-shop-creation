import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-16 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-2 text-sm">
            <Icon name="Flower2" size={20} />
            © 2024 Питомник растений. Все права защищены.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link 
              to="/privacy-policy" 
              className="hover:underline opacity-90 hover:opacity-100 transition"
            >
              Политика конфиденциальности
            </Link>
            <span className="hidden md:inline">•</span>
            <Link 
              to="/terms" 
              className="hover:underline opacity-90 hover:opacity-100 transition"
            >
              Пользовательское соглашение
            </Link>
            <span className="hidden md:inline">•</span>
            <Link 
              to="/delivery-and-return" 
              className="hover:underline opacity-90 hover:opacity-100 transition"
            >
              Доставка и возврат
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;