import { useState, useEffect } from 'react';
import { CartItem, Product } from '@/types/shop';

interface UseCartProps {
  onRemoveFromCart?: (productId: number, productName: string) => void;
}

export const useCart = (props?: UseCartProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const onRemoveFromCart = props?.onRemoveFromCart;

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  useEffect(() => {
    if (cart.length === 0) {
      localStorage.removeItem('cart');
    } else {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  const MAX_QUANTITY = 99;

  const addToCart = (product: Product) => {
    const productKey = (product as any).selectedSize 
      ? `${product.id}-${(product as any).selectedSize}` 
      : `${product.id}`;
    
    const existingItem = cart.find(item => {
      const itemKey = (item.product as any).selectedSize 
        ? `${item.product.id}-${(item.product as any).selectedSize}` 
        : `${item.product.id}`;
      return itemKey === productKey;
    });
    
    if (existingItem) {
      if (existingItem.quantity >= MAX_QUANTITY) {
        return;
      }
      setCart(cart.map(item => {
        const itemKey = (item.product as any).selectedSize 
          ? `${item.product.id}-${(item.product as any).selectedSize}` 
          : `${item.product.id}`;
        return itemKey === productKey
          ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) }
          : item;
      }));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId: number, quantity: number, selectedSize?: string) => {
    if (quantity <= 0) {
      const itemToRemove = cart.find(item => {
        if (selectedSize) {
          return item.product.id === productId && (item.product as any).selectedSize === selectedSize;
        }
        return item.product.id === productId;
      });
      
      if (itemToRemove && onRemoveFromCart) {
        onRemoveFromCart(itemToRemove.product.id, itemToRemove.product.name);
      }
      
      setCart(cart.filter(item => {
        if (selectedSize) {
          return !(item.product.id === productId && (item.product as any).selectedSize === selectedSize);
        }
        return item.product.id !== productId;
      }));
    } else {
      const limitedQuantity = Math.min(quantity, MAX_QUANTITY);
      setCart(cart.map(item => {
        if (selectedSize) {
          return (item.product.id === productId && (item.product as any).selectedSize === selectedSize) 
            ? { ...item, quantity: limitedQuantity } 
            : item;
        }
        return item.product.id === productId ? { ...item, quantity: limitedQuantity } : item;
      }));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  return {
    cart,
    addToCart,
    updateCartQuantity,
    getTotalPrice,
    clearCart
  };
};