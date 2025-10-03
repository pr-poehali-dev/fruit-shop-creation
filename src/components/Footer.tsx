import Icon from '@/components/ui/icon';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-16 py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="flex items-center justify-center gap-2 text-sm">
          <Icon name="Flower2" size={20} />
          © 2024 Питомник растений. Все права защищены.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
