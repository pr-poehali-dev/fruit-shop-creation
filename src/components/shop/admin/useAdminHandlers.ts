import { useToast } from '@/hooks/use-toast';
import { Product, Category } from './types';

interface UseAdminHandlersProps {
  user: any;
  API_PRODUCTS: string;
  API_CATEGORIES: string;
  API_AUTH: string;
  API_ORDERS: string;
  API_SUPPORT: string;
  API_SETTINGS: string;
  loadProducts: () => void;
  loadCategories: () => void;
  loadUsers: () => void;
  loadOrders: () => void;
  loadTickets: () => void;
  loadSettings: () => void;
  onSettingsUpdate?: () => void;
  editingProduct: Product | null;
  editingCategory: Category | null;
  setShowProductDialog: (show: boolean) => void;
  setEditingProduct: (product: Product | null) => void;
  setShowCategoryDialog: (show: boolean) => void;
  setEditingCategory: (category: Category | null) => void;
}

export const useAdminHandlers = (props: UseAdminHandlersProps) => {
  const { toast } = useToast();

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>, images: any[], variants: any[], showStock: boolean, hideMainPrice: boolean = false) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const primaryImage = images.find(img => img.is_primary);
    const stockValue = formData.get('stock') as string;
    
    const productData = {
      id: props.editingProduct?.id,
      name: formData.get('name') as string,
      slug: (formData.get('name') as string).toLowerCase().replace(/\s+/g, '-'),
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      image_url: primaryImage?.image_url || images[0]?.image_url || '',
      category_id: parseInt(formData.get('category_id') as string),
      stock: stockValue && stockValue.trim() !== '' ? parseInt(stockValue) : null,
      show_stock: showStock,
      hide_main_price: hideMainPrice,
      images: images,
      variants: variants
    };

    try {
      const response = await fetch(props.API_PRODUCTS, {
        method: props.editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: props.editingProduct ? 'Товар обновлён' : 'Товар добавлен',
          description: productData.name
        });
        props.setShowProductDialog(false);
        props.setEditingProduct(null);
        props.loadProducts();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить товар',
        variant: 'destructive'
      });
    }
  };

  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const categoryData = {
      id: props.editingCategory?.id,
      name: formData.get('name') as string,
      slug: (formData.get('name') as string).toLowerCase().replace(/\s+/g, '-').replace(/[а-яА-ЯёЁ]/g, (char) => {
        const translit: Record<string, string> = {
          'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z',
          'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
          'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
          'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };
        return translit[char.toLowerCase()] || char;
      }),
      description: formData.get('description') as string
    };

    try {
      const response = await fetch(props.API_CATEGORIES, {
        method: props.editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: props.editingCategory ? 'Категория обновлена' : 'Категория добавлена',
          description: categoryData.name
        });
        props.setShowCategoryDialog(false);
        props.setEditingCategory(null);
        props.loadCategories();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить категорию',
        variant: 'destructive'
      });
    }
  };

  const handleAddBalance = async (userId: number, amount: number, description: string) => {
    try {
      const response = await fetch(props.API_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_balance',
          user_id: userId,
          amount,
          type: 'deposit',
          description: description || 'Пополнение баланса администратором'
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Баланс пополнен',
          description: `Начислено ${amount}₽`
        });
        props.loadUsers();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось начислить баланс',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось начислить баланс',
        variant: 'destructive'
      });
    }
  };

  const handleAddCashback = async (userId: number, amount: number, description: string) => {
    try {
      const isDeduct = amount < 0;
      const response = await fetch(props.API_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_cashback',
          user_id: userId,
          amount,
          type: isDeduct ? 'cashback_deduct' : 'cashback_deposit',
          description: description || (isDeduct ? 'Списание кэшбэка администратором' : 'Начисление кэшбэка администратором')
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: isDeduct ? 'Кэшбэк списан' : 'Кэшбэк начислен',
          description: `${isDeduct ? 'Списано' : 'Начислено'} ${Math.abs(amount)}₽`
        });
        props.loadUsers();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || `Не удалось ${isDeduct ? 'списать' : 'начислить'} кэшбэк`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обработать операцию',
        variant: 'destructive'
      });
    }
  };

  const handleToggleAdmin = async (userId: number, isAdmin: boolean) => {
    try {
      const response = await fetch(props.API_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_admin',
          user_id: userId,
          is_admin: isAdmin
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Права изменены',
          description: isAdmin ? 'Пользователь теперь администратор' : 'Права администратора удалены'
        });
        props.loadUsers();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось изменить права',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить права',
        variant: 'destructive'
      });
    }
  };

  const handleIssueLoyaltyCard = async (userId: number) => {
    try {
      const response = await fetch('https://functions.poehali.dev/ed127250-fe9d-4c7e-9a93-fb8b7fdc038a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId,
          admin_issue: true 
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Карта выдана',
          description: 'Карта лояльности успешно выдана администратором'
        });
        props.loadUsers();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось выдать карту',
          variant: 'destructive'
        });
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выдать карту лояльности',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string, rejectionReason?: string) => {
    try {
      const response = await fetch(props.API_ORDERS, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          order_id: orderId, 
          status,
          rejection_reason: rejectionReason 
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Статус обновлён',
          description: `Заказ #${orderId} теперь: ${status}`
        });
        props.loadOrders();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive'
      });
    }
  };

  const handleReplyToTicket = async (ticketId: number, message: string) => {
    try {
      const response = await fetch(props.API_SUPPORT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_message',
          ticket_id: ticketId,
          user_id: props.user?.id || 1,
          message,
          is_admin: true
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Ответ отправлен',
          description: 'Пользователь получит уведомление'
        });
        props.loadTickets();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить ответ',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateTicketStatus = async (ticketId: number, status: string) => {
    try {
      const response = await fetch(props.API_SUPPORT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticketId, status })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Статус обновлён',
          description: `Тикет #${ticketId} теперь: ${status}`
        });
        props.loadTickets();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive'
      });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const paymentMethods = formData.get('payment_methods') as string;
    
    const settingsData = {
      site_name: formData.get('site_name') as string,
      logo_url: formData.get('logo_url') as string,
      site_description: formData.get('site_description') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      work_hours: formData.get('work_hours') as string,
      admin_pin: formData.get('admin_pin') as string,
      loyalty_card_price: parseFloat(formData.get('loyalty_card_price') as string || '500'),
      loyalty_unlock_amount: parseFloat(formData.get('loyalty_unlock_amount') as string || '5000'),
      loyalty_cashback_percent: parseFloat(formData.get('loyalty_cashback_percent') as string || '5'),
      balance_payment_cashback_percent: parseFloat(formData.get('balance_payment_cashback_percent') as string || '5'),
      holiday_theme: formData.get('holiday_theme') as string,
      delivery_enabled: formData.get('delivery_enabled') === 'on',
      pickup_enabled: formData.get('pickup_enabled') === 'on',
      preorder_enabled: formData.get('preorder_enabled') === 'on',
      preorder_message: formData.get('preorder_message') as string,
      preorder_start_date: formData.get('preorder_start_date') as string || null,
      preorder_end_date: formData.get('preorder_end_date') as string || null,
      delivery_price: parseFloat(formData.get('delivery_price') as string || '0'),
      free_delivery_min: parseFloat(formData.get('free_delivery_min') as string || '3000'),
      courier_delivery_price: parseFloat(formData.get('courier_delivery_price') as string || '300'),
      price_list_url: formData.get('price_list_url') as string,
      promotions: formData.get('promotions') as string,
      additional_info: formData.get('additional_info') as string,
      about_title: formData.get('about_title') as string,
      about_text: formData.get('about_text') as string,
      care_title: formData.get('care_title') as string,
      care_watering_title: formData.get('care_watering_title') as string,
      care_watering_text: formData.get('care_watering_text') as string,
      care_lighting_title: formData.get('care_lighting_title') as string,
      care_lighting_text: formData.get('care_lighting_text') as string,
      care_pruning_title: formData.get('care_pruning_title') as string,
      care_pruning_text: formData.get('care_pruning_text') as string,
      delivery_title: formData.get('delivery_title') as string,
      delivery_courier_title: formData.get('delivery_courier_title') as string,
      delivery_courier_text: formData.get('delivery_courier_text') as string,
      delivery_transport_title: formData.get('delivery_transport_title') as string,
      delivery_transport_text: formData.get('delivery_transport_text') as string,
      delivery_pickup_title: formData.get('delivery_pickup_title') as string,
      delivery_pickup_text: formData.get('delivery_pickup_text') as string,
      payment_title: formData.get('payment_title') as string,
      payment_methods: paymentMethods ? paymentMethods.split('\n').filter(m => m.trim()) : []
    };

    try {
      const response = await fetch(props.API_SETTINGS, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Настройки сохранены',
          description: 'Изменения применены на сайте'
        });
        await props.loadSettings();
        if (props.onSettingsUpdate) {
          props.onSettingsUpdate();
        }
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm('Удалить заказ? Это действие нельзя отменить.')) return;
    
    try {
      const response = await fetch(props.API_ORDERS, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Заказ удалён',
          description: `Заказ #${orderId} был удалён`
        });
        props.loadOrders();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить заказ',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTicket = async (ticketId: number) => {
    if (!confirm('Удалить обращение? Это действие нельзя отменить.')) return;
    
    try {
      const response = await fetch(props.API_SUPPORT, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticketId })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Обращение удалено',
          description: `Тикет #${ticketId} был удалён`
        });
        props.loadTickets();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить обращение',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateItemStock = async (orderId: number, itemId: number, isOutOfStock: boolean) => {
    try {
      const response = await fetch(props.API_ORDERS, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          item_id: itemId,
          is_out_of_stock: isOutOfStock
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: isOutOfStock ? 'Товар отмечен как отсутствующий' : 'Товар отмечен как доступный',
          description: `Статус наличия обновлён в заказе #${orderId}`
        });
        props.loadOrders();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить наличие товара',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateItemAvailability = async (itemId: number, availableQuantity: number, availablePrice?: number) => {
    try {
      const response = await fetch(props.API_ORDERS, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          item_id: itemId,
          available_quantity: availableQuantity,
          available_price: availablePrice
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Доступность обновлена',
          description: `Установлено: ${availableQuantity} шт.${availablePrice ? ` по ${availablePrice}₽` : ''}`
        });
        props.loadOrders();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить доступность товара',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Удалить товар? Это действие нельзя отменить.')) return;
    
    try {
      const response = await fetch(props.API_PRODUCTS, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Товар удалён',
          description: 'Товар успешно удалён из каталога'
        });
        props.loadProducts();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось удалить товар',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить товар',
        variant: 'destructive'
      });
    }
  };

  return {
    handleSaveProduct,
    handleSaveCategory,
    handleAddBalance,
    handleAddCashback,
    handleToggleAdmin,
    handleIssueLoyaltyCard,
    handleUpdateOrderStatus,
    handleReplyToTicket,
    handleUpdateTicketStatus,
    handleSaveSettings,
    handleDeleteOrder,
    handleDeleteTicket,
    handleUpdateItemStock,
    handleUpdateItemAvailability,
    handleDeleteProduct
  };
};