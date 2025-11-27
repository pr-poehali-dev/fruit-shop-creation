import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logUserAction } from '@/utils/userLogger';
import ProductCardBadges from './ProductCard/ProductCardBadges';
import ProductCardImage from './ProductCard/ProductCardImage';
import ProductCardPricing from './ProductCard/ProductCardPricing';
import ProductCardFooter from './ProductCard/ProductCardFooter';
import { ProductCardProps, ProductVariant } from './ProductCard/types';

const ProductCard = ({ product, onAddToCart, onViewDetails, isFavorite = false, onToggleFavorite, siteSettings, isAuthenticated = false, onShowAuth, userId }: ProductCardProps) => {
  const primaryImage = product.images?.find(img => img.is_primary)?.image_url || product.image_url;
  const hasMultipleImages = product.images && product.images.length > 1;
  const hasVariants = product.variants && product.variants.length > 0;
  const showStock = product.show_stock !== false;
  const hideMainPrice = product.hide_main_price && hasVariants && product.variants!.length >= 2;
  const isNewYear = siteSettings?.holiday_theme === 'new_year';
  const isHalloween = siteSettings?.holiday_theme === 'halloween';

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onShowAuth?.();
      return;
    }
    if (onToggleFavorite) {
      onToggleFavorite(product.id);
      if (userId) {
        await logUserAction(
          userId,
          isFavorite ? 'remove_from_favorites' : 'add_to_favorites',
          `${isFavorite ? 'Удаление из' : 'Добавление в'} избранное: ${product.name}`,
          'product',
          product.id,
          { product_name: product.name, price: product.price }
        );
      }
    }
  };

  const handleAddVariantToCart = async (e: React.MouseEvent, variant: ProductVariant) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onShowAuth?.();
      return;
    }
    const productWithVariant = {
      ...product,
      price: variant.price,
      stock: variant.stock,
      selectedSize: variant.size
    };
    onAddToCart(productWithVariant);
    if (userId) {
      await logUserAction(
        userId,
        'add_to_cart',
        `Добавление в корзину: ${product.name} (${variant.size})`,
        'product',
        product.id,
        { product_name: product.name, variant: variant.size, price: variant.price }
      );
    }
  };

  const handleAddToCartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onShowAuth?.();
      return;
    }
    onAddToCart(product);
    if (userId) {
      await logUserAction(
        userId,
        'add_to_cart',
        `Добавление в корзину: ${product.name}`,
        'product',
        product.id,
        { product_name: product.name, price: product.price }
      );
    }
  };

  return (
    <Card className={`overflow-hidden transition-all relative group ${isHalloween ? 'halloween-card hover:shadow-[0_0_30px_rgba(255,120,0,0.5)] border-2 border-orange-500/30' : 'hover:shadow-lg hover:scale-[1.02]'}`}>
      {isNewYear && <div className="snow-cap"></div>}
      {isHalloween && (
        <>
          <div className="halloween-glow"></div>
          <div className="halloween-corner halloween-corner-tl">🕷️</div>
          <div className="halloween-corner halloween-corner-tr">🦇</div>
        </>
      )}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg"></div>
      <div className="relative">
        <ProductCardBadges
          product={product}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onFavoriteClick={handleFavoriteClick}
        />
        <ProductCardImage
          product={product}
          primaryImage={primaryImage}
          hasMultipleImages={hasMultipleImages}
          onViewDetails={onViewDetails}
          userId={userId}
          isAuthenticated={isAuthenticated}
          onLogAction={logUserAction}
        />
      </div>
      <CardHeader>
        <CardTitle className="font-display">{product.name}</CardTitle>
        <CardDescription>{product.category_name}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <ProductCardPricing
          product={product}
          hideMainPrice={hideMainPrice}
          showStock={showStock}
          hasVariants={hasVariants}
          onAddVariantToCart={handleAddVariantToCart}
        />
      </CardContent>
      <ProductCardFooter
        product={product}
        hideMainPrice={hideMainPrice}
        onAddToCartClick={handleAddToCartClick}
      />
    </Card>
  );
};

export default ProductCard;