import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import ProductsTab from './ProductsTab';
import CategoriesTab from './CategoriesTab';
import UsersTab from './UsersTab';
import OrdersTab from './OrdersTab';
import SettingsTab from './SettingsTab';
import SupportTab from './SupportTab';
import { Product, Category, User } from './types';

interface AdminPanelTabsProps {
  products: Product[];
  categories: Category[];
  users: User[];
  orders: any[];
  tickets: any[];
  siteSettings: any;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onAddBalance: (userId: number, amount: number, description: string) => void;
  onUpdateOrderStatus: (orderId: number, status: string, rejectionReason?: string) => void;
  onReplyToTicket: (ticketId: number, message: string) => void;
  onUpdateTicketStatus: (ticketId: number, status: string) => void;
  onLoadTicket: (ticketId: number) => Promise<any>;
  onSaveSettings: (e: React.FormEvent<HTMLFormElement>) => void;
}

const AdminPanelTabs = ({
  products,
  categories,
  users,
  orders,
  tickets,
  siteSettings,
  onAddProduct,
  onEditProduct,
  onAddCategory,
  onEditCategory,
  onAddBalance,
  onUpdateOrderStatus,
  onReplyToTicket,
  onUpdateTicketStatus,
  onLoadTicket,
  onSaveSettings
}: AdminPanelTabsProps) => {
  return (
    <Tabs defaultValue="products">
      <TabsList className="grid w-full grid-cols-6 h-auto">
        <TabsTrigger value="products" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
          <Icon name="Package" size={16} className="sm:mr-1" />
          <span className="hidden sm:inline">Товары</span>
        </TabsTrigger>
        <TabsTrigger value="categories" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
          <Icon name="FolderTree" size={16} className="sm:mr-1" />
          <span className="hidden sm:inline">Категории</span>
        </TabsTrigger>
        <TabsTrigger value="users" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
          <Icon name="Users" size={16} className="sm:mr-1" />
          <span className="hidden sm:inline">Пользователи</span>
        </TabsTrigger>
        <TabsTrigger value="orders" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
          <Icon name="ShoppingCart" size={16} className="sm:mr-1" />
          <span className="hidden sm:inline">Заказы</span>
        </TabsTrigger>
        <TabsTrigger value="support" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
          <Icon name="MessageCircle" size={16} className="sm:mr-1" />
          <span className="hidden sm:inline">Поддержка</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
          <Icon name="Settings" size={16} className="sm:mr-1" />
          <span className="hidden sm:inline">Настройки</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="products">
        <ProductsTab 
          products={products}
          onAddProduct={onAddProduct}
          onEditProduct={onEditProduct}
        />
      </TabsContent>

      <TabsContent value="categories">
        <CategoriesTab 
          categories={categories}
          onAddCategory={onAddCategory}
          onEditCategory={onEditCategory}
        />
      </TabsContent>

      <TabsContent value="users">
        <UsersTab users={users} onAddBalance={onAddBalance} />
      </TabsContent>

      <TabsContent value="orders">
        <OrdersTab orders={orders} onUpdateStatus={onUpdateOrderStatus} />
      </TabsContent>

      <TabsContent value="support">
        <SupportTab 
          tickets={tickets}
          onReply={onReplyToTicket}
          onUpdateStatus={onUpdateTicketStatus}
          onLoadTicket={onLoadTicket}
        />
      </TabsContent>

      <TabsContent value="settings">
        <SettingsTab 
          siteSettings={siteSettings}
          onSaveSettings={onSaveSettings}
        />
      </TabsContent>
    </Tabs>
  );
};

export default AdminPanelTabs;
