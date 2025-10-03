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

interface CatalogSectionProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const CatalogSection = ({ products, onAddToCart }: CatalogSectionProps) => {
  return (
    <div>
      <h2 className="text-4xl font-display font-bold mb-8">Каталог растений</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} showStock />
        ))}
      </div>
    </div>
  );
};

export default CatalogSection;
