import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-16 py-6 pb-24 md:pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          {/* Ссылки на юридические документы */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm w-full">
            <Link 
              to="/privacy-policy" 
              className="hover:underline opacity-90 hover:opacity-100 transition text-center whitespace-nowrap"
            >
              Политика конфиденциальности
            </Link>
            <span className="opacity-50">•</span>
            <Link 
              to="/terms" 
              className="hover:underline opacity-90 hover:opacity-100 transition text-center whitespace-nowrap"
            >
              Пользовательское соглашение
            </Link>
            <span className="opacity-50">•</span>
            <Link 
              to="/delivery-and-return" 
              className="hover:underline opacity-90 hover:opacity-100 transition text-center whitespace-nowrap"
            >
              Доставка и возврат
            </Link>
          </div>
          
          {/* Информация о самозанятом и копирайт */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs md:text-sm opacity-75 text-center">
            <span className="font-medium whitespace-nowrap">Самозанятый Бояринцев Вадим Вячеславович</span>
            <span className="opacity-50">•</span>
            <span className="whitespace-nowrap">ИНН: 222261894107</span>
            <span className="opacity-50">•</span>
            <p className="flex items-center gap-2 whitespace-nowrap">
              <Icon name="Flower2" size={16} />
              © 2024 Питомник растений
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;