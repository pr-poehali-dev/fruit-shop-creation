export interface ProductImage {
  id?: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductVariant {
  id?: number;
  size: string;
  price: number;
  stock: number;
  sort_order: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  category_name: string;
  stock: number;
  show_stock?: boolean;
  hide_main_price?: boolean;
  is_popular?: boolean;
  images?: ProductImage[];
  variants?: ProductVariant[];
  expected_date?: string;
}

export interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: number) => void;
  siteSettings?: any;
  isAuthenticated?: boolean;
  onShowAuth?: () => void;
  userId?: number;
}
