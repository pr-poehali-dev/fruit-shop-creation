import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-16 py-6 pb-24 md:pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          {/* Ссылки на юридические документы */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 text-sm w-full">
            <Link 
              to="/privacy-policy" 
              className="hover:underline opacity-90 hover:opacity-100 transition text-center"
            >
              Политика конфиденциальности
            </Link>
            <span className="hidden md:inline opacity-50">•</span>
            <Link 
              to="/terms" 
              className="hover:underline opacity-90 hover:opacity-100 transition text-center"
            >
              Пользовательское соглашение
            </Link>
            <span className="hidden md:inline opacity-50">•</span>
            <Link 
              to="/delivery-and-return" 
              className="hover:underline opacity-90 hover:opacity-100 transition text-center"
            >
              Доставка и возврат
            </Link>
          </div>
          
          {/* Информация о самозанятом */}
          <div className="text-xs md:text-sm opacity-75 text-center">
            <p className="font-medium">Самозанятый Бояринцев Вадим Вячеславович</p>
            <p className="mt-1">ИНН: 222261894107</p>
          </div>
          
          {/* Копирайт */}
          <p className="flex items-center gap-2 text-xs md:text-sm opacity-75">
            <Icon name="Flower2" size={16} />
            © 2024 Питомник растений
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;