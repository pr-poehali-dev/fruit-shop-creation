import { useToast } from '@/hooks/use-toast';
import { Product, Category } from './types';

interface UseAdminHandlersProps {
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
  editingProduct: Product | null;
  editingCategory: Category | null;
  setShowProductDialog: (show: boolean) => void;
  setEditingProduct: (product: Product | null) => void;
  setShowCategoryDialog: (show: boolean) => void;
  setEditingCategory: (category: Category | null) => void;
}

export const useAdminHandlers = (props: UseAdminHandlersProps) => {
  const { toast } = useToast();

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>, images: any[]) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const primaryImage = images.find(img => img.is_primary);
    
    const productData = {
      id: props.editingProduct?.id,
      name: formData.get('name') as string,
      slug: (formData.get('name') as string).toLowerCase().replace(/\s+/g, '-'),
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      image_url: primaryImage?.image_url || images[0]?.image_url || '',
      category_id: parseInt(formData.get('category_id') as string),
      stock: parseInt(formData.get('stock') as string),
      images: images
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
          user_id: 1,
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
    
    const settingsData = {
      site_name: formData.get('site_name') as string,
      site_description: formData.get('site_description') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      work_hours: formData.get('work_hours') as string
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
        props.loadSettings();
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

  return {
    handleSaveProduct,
    handleSaveCategory,
    handleAddBalance,
    handleUpdateOrderStatus,
    handleReplyToTicket,
    handleUpdateTicketStatus,
    handleSaveSettings,
    handleDeleteOrder,
    handleDeleteTicket
  };
};