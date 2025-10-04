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
  category_id: number;
  category_name: string;
  stock: number;
  is_active: boolean;
  show_stock?: boolean;
  hide_main_price?: boolean;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface User {
  id: number;
  phone: string;
  full_name: string;
  is_admin: boolean;
  created_at: string;
}