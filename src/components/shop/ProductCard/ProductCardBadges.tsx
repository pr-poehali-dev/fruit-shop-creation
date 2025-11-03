import Icon from '@/components/ui/icon';
import { Product } from './types';

interface ProductCardBadgesProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite?: (productId: number) => void;
  onFavoriteClick: (e: React.MouseEvent) => void;
}

const ProductCardBadges = ({ 
  product, 
  isFavorite, 
  onToggleFavorite, 
  onFavoriteClick 
}: ProductCardBadgesProps) => {
  return (
    <>
      {product.is_popular && (
        <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-lg shadow-lg text-xs font-bold flex items-center gap-1">
          <Icon name="Star" size={14} className="fill-white" />
          Популярный
        </div>
      )}
      {product.stock !== null && product.stock <= 0 && (
        <div className={`absolute ${product.is_popular ? 'top-12' : 'top-2'} left-2 z-10 bg-red-500 text-white px-3 py-1.5 rounded-lg shadow-lg text-xs font-semibold`}>
          <div className="flex flex-col gap-0.5">
            <span>Нет в наличии</span>
            {product.expected_date && (
              <span className="text-[10px] opacity-90">
                Ожидается {new Date(product.expected_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </span>
            )}
          </div>
        </div>
      )}
      {onToggleFavorite && (
        <button
          onClick={onFavoriteClick}
          className="absolute top-2 right-2 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all hover:scale-110"
        >
          <Icon 
            name="Heart" 
            size={20} 
            className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}
          />
        </button>
      )}
    </>
  );
};

export default ProductCardBadges;
