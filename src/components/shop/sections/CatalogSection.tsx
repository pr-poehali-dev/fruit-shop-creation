import { useState } from 'react';
import ProductCard from '../ProductCard';
import ProductGalleryDialog from '../ProductGalleryDialog';

interface ProductImage {
  id?: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  category_name: string;
  stock: number;
  images?: ProductImage[];
}

interface CatalogSectionProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  favoriteIds?: Set<number>;
  onToggleFavorite?: (productId: number) => void;
}

const CatalogSection = ({ products, onAddToCart, favoriteIds, onToggleFavorite }: CatalogSectionProps) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsGalleryOpen(true);
  };

  const categories = [
    { id: 'all', name: 'Все растения' },
    { id: 'Плодовые культуры', name: 'Плодовые' },
    { id: 'Декоративные культуры', name: 'Декоративные' },
  ];

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category_name === activeCategory);

  return (
    <div>
      <h2 className="text-4xl font-display font-bold mb-8">Каталог растений</h2>
      
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeCategory === category.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={onAddToCart}
            onViewDetails={handleViewDetails}
            isFavorite={favoriteIds?.has(product.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          В этой категории пока нет товаров
        </p>
      )}

      <ProductGalleryDialog
        product={selectedProduct}
        open={isGalleryOpen}
        onOpenChange={setIsGalleryOpen}
        onAddToCart={onAddToCart}
      />
    </div>
  );
};

export default CatalogSection;