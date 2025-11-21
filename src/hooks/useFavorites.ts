import { useState, useEffect } from 'react';

const API_FAVORITES = 'https://functions.poehali.dev/77f82e21-01e9-4f2b-98c5-de4ef28792ad';

interface Favorite {
  id: number;
  product_id: number;
  created_at: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  slug: string;
}

export const useFavorites = (userId: number | null) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const loadFavorites = async () => {
    if (!userId) {
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_FAVORITES}?user_id=${userId}`);
      const data = await response.json();
      setFavorites(data.favorites || []);
      setFavoriteIds(new Set((data.favorites || []).map((f: Favorite) => f.product_id)));
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
      setFavoriteIds(new Set());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [userId]);

  const toggleFavorite = async (productId: number) => {
    if (!userId) return;

    const isFavorite = favoriteIds.has(productId);

    try {
      if (isFavorite) {
        await fetch(API_FAVORITES, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, product_id: productId })
        });
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        setFavorites(prev => prev.filter(f => f.product_id !== productId));
      } else {
        await fetch(API_FAVORITES, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, product_id: productId })
        });
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.add(productId);
          return newSet;
        });
        loadFavorites();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return {
    favorites,
    favoriteIds,
    isLoading,
    toggleFavorite,
    loadFavorites
  };
};