import { useState } from 'react';
import ProductCard from '../ProductCard';
import ProductGalleryDialog from '../ProductGalleryDialog';
import Icon from '@/components/ui/icon';

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

interface Favorite {
  id: number;
  product_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  slug: string;
}

interface FavoritesSectionProps {
  favorites: Favorite[];
  onAddToCart: (product: Product) => void;
  favoriteIds: Set<number>;
  onToggleFavorite: (productId: number) => void;
  siteSettings?: any;
}

const FavoritesSection = ({ favorites, onAddToCart, favoriteIds, onToggleFavorite, siteSettings }: FavoritesSectionProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsGalleryOpen(true);
  };

  const convertToProduct = (fav: Favorite): Product => ({
    id: fav.product_id,
    name: fav.name,
    slug: fav.slug,
    description: fav.description,
    price: fav.price,
    image_url: fav.image_url,
    category_name: '',
    stock: 0
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Icon name="Heart" size={32} className="text-red-500" />
        <h2 className="text-4xl font-display font-bold">Избранное</h2>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <Icon name="Heart" size={64} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Избранное пусто</h3>
          <p className="text-muted-foreground">
            Добавляйте товары в избранное, нажимая на ❤️ на карточках товаров
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(fav => {
            const product = convertToProduct(fav);
            return (
              <ProductCard 
                key={fav.id} 
                product={product} 
                onAddToCart={onAddToCart}
                onViewDetails={handleViewDetails}
                isFavorite={favoriteIds.has(fav.product_id)}
                onToggleFavorite={onToggleFavorite}
                siteSettings={siteSettings}
              />
            );
          })}
        </div>
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

export default FavoritesSection;