import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import ProductCard from '@/components/ProductCard';

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
  onSectionChange: (section: string) => void;
  onAddToCart: (product: Product) => void;
}

const HomeSection = ({ products, onSectionChange, onAddToCart }: HomeSectionProps) => {
  return (
    <div className="space-y-12">
      <section className="text-center py-16 bg-gradient-to-b from-primary/10 to-transparent rounded-2xl">
        <h2 className="text-5xl font-display font-bold mb-4 text-primary">Ваш сад мечты начинается здесь</h2>
        <p className="text-xl text-muted-foreground mb-8">Плодовые и декоративные культуры высокого качества</p>
        <Button size="lg" onClick={() => onSectionChange('catalog')} className="text-lg">
          Перейти в каталог
          <Icon name="ArrowRight" size={20} className="ml-2" />
        </Button>
      </section>

      <section>
        <h3 className="text-3xl font-display font-bold mb-6 text-center">Популярные товары</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.slice(0, 6).map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeSection;
