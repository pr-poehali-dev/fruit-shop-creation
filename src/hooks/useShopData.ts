import { useState, useEffect } from 'react';
import { Product, Order, User } from '@/types/shop';

const API_AUTH = 'https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc';
const API_PRODUCTS = 'https://functions.poehali.dev/5ae817c6-e62e-40c6-8e34-18ffac2d3cfc';
const API_ORDERS = 'https://functions.poehali.dev/b35bef37-8423-4939-b43b-0fb565cc8853';
const API_SETTINGS = 'https://functions.poehali.dev/9b1ac59e-93b6-41de-8974-a7f58d4ffaf9';
const API_CATEGORIES = 'https://functions.poehali.dev/0a62d37c-9fd0-4ff3-9b5b-2c881073d3ac';

const fetchWithRetry = async (url: string, retries = 5, delay = 800) => {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        mode: 'cors',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      if (response.ok) return response;
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Max retries reached');
};

export const useShopData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      const response = await fetchWithRetry(API_PRODUCTS);
      const data = await response.json();
      console.log('Products loaded:', data.products?.length || 0);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetchWithRetry(API_CATEGORIES);
      const data = await response.json();
      console.log('Categories loaded:', data.categories?.length || 0);
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetchWithRetry(`${API_SETTINGS}?t=${Date.now()}`);
      const data = await response.json();
      console.log('Settings loaded:', data.settings);
      setSiteSettings(data.settings || {});
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSiteSettings({
        site_name: 'Питомник растений',
        site_description: 'Плодовые и декоративные культуры',
        phone: '+7 (495) 123-45-67',
        email: 'info@plantsnursery.ru'
      });
    }
  };

  const loadOrders = async (user: User | null) => {
    if (!user) {
      setOrders([]);
      return;
    }
    try {
      const response = await fetchWithRetry(`${API_ORDERS}?user_id=${user.id}`);
      const data = await response.json();
      console.log('Orders loaded:', data.orders?.length || 0);
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    }
  };

  const refreshUserBalance = async (
    user: User | null,
    isRefreshingBalance: boolean,
    setIsRefreshingBalance: (value: boolean) => void,
    setUser: (user: User) => void
  ) => {
    if (!user || isRefreshingBalance) return;

    setIsRefreshingBalance(true);
    try {
      const response = await fetchWithRetry(`${API_AUTH}?action=balance&user_id=${user.id}`);
      const data = await response.json();

      const updatedUser = {
        ...user,
        balance: data.balance,
        cashback: data.cashback
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    } finally {
      setIsRefreshingBalance(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadError(null);
        await Promise.all([loadProducts(), loadCategories(), loadSettings()]);
      } catch (error) {
        console.error('Critical load error:', error);
        setLoadError('Не удалось загрузить данные. Проверьте подключение к интернету.');
      } finally {
        console.log('Setting isLoading to false');
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return {
    products,
    categories,
    orders,
    siteSettings,
    isLoading,
    loadError,
    loadProducts,
    loadSettings,
    loadOrders,
    refreshUserBalance,
    API_AUTH,
    API_ORDERS
  };
};