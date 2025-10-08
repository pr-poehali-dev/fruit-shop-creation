import { useState, useEffect } from 'react';
import { Product, Category, User } from './types';

const API_PRODUCTS = 'https://functions.poehali.dev/5ae817c6-e62e-40c6-8e34-18ffac2d3cfc';
const API_CATEGORIES = 'https://functions.poehali.dev/0a62d37c-9fd0-4ff3-9b5b-2c881073d3ac';
const API_SETTINGS = 'https://functions.poehali.dev/9b1ac59e-93b6-41de-8974-a7f58d4ffaf9';
const API_AUTH = 'https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc';
const API_ORDERS = 'https://functions.poehali.dev/b35bef37-8423-4939-b43b-0fb565cc8853';
const API_SUPPORT = 'https://functions.poehali.dev/a833bb69-e590-4a5f-a513-450a69314192';

export const useAdminData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({});

  const loadProducts = async () => {
    try {
      const response = await fetch(API_PRODUCTS);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(API_CATEGORIES);
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch(`${API_SETTINGS}?t=${Date.now()}`);
      const data = await response.json();
      setSiteSettings(data.settings || {});
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_AUTH}?action=users`);
      const data = await response.json();
      console.log('Users loaded:', data.users?.length || 0);
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch(`${API_ORDERS}?all=true`);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const loadTickets = async () => {
    try {
      const response = await fetch(`${API_SUPPORT}?all=true`);
      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    }
  };

  const loadSingleTicket = async (ticketId: number) => {
    try {
      const response = await fetch(`${API_SUPPORT}?ticket_id=${ticketId}`);
      const data = await response.json();
      return data.ticket;
    } catch (error) {
      console.error('Failed to load ticket:', error);
      return null;
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadSettings();
    loadUsers();
    loadOrders();
    loadTickets();
  }, []);

  return {
    products,
    categories,
    users,
    orders,
    tickets,
    siteSettings,
    loadProducts,
    loadCategories,
    loadSettings,
    loadUsers,
    loadOrders,
    loadTickets,
    loadSingleTicket,
    API_PRODUCTS,
    API_CATEGORIES,
    API_SETTINGS,
    API_AUTH,
    API_ORDERS,
    API_SUPPORT
  };
};