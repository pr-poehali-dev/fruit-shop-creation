import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import ProductsTab from './ProductsTab';
import CategoriesTab from './CategoriesTab';
import UsersTab from './UsersTab';
import OrdersTab from './OrdersTab';
import SettingsTab from './SettingsTab';
import SupportTab from './SupportTab';
import LoyaltyScannerTab from './LoyaltyScannerTab';
import PagesTab from './PagesTab';
import OrdersStatsCard from './OrdersStatsCard';
import SupportStatsCard from './SupportStatsCard';
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
  onAddCashback: (userId: number, amount: number, description: string) => void;
  onToggleAdmin: (userId: number, isAdmin: boolean) => void;
  onIssueLoyaltyCard: (userId: number) => Promise<void>;
  onUpdateOrderStatus: (orderId: number, status: string, rejectionReason?: string) => void;
  onReplyToTicket: (ticketId: number, message: string) => void;
  onUpdateTicketStatus: (ticketId: number, status: string) => void;
  onLoadTicket: (ticketId: number) => Promise<any>;
  onSaveSettings: (e: React.FormEvent<HTMLFormElement>) => void;
  onDeleteOrder: (orderId: number) => void;
  onDeleteTicket: (ticketId: number) => void;
  onUpdateItemStock?: (orderId: number, itemId: number, isOutOfStock: boolean) => void;
  onUpdateItemAvailability?: (itemId: number, availableQuantity: number, availablePrice?: number) => void;
  onRefreshUsers?: () => void;
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
  onAddCashback,
  onToggleAdmin,
  onIssueLoyaltyCard,
  onUpdateOrderStatus,
  onReplyToTicket,
  onUpdateTicketStatus,
  onLoadTicket,
  onSaveSettings,
  onDeleteOrder,
  onDeleteTicket,
  onUpdateItemStock,
  onUpdateItemAvailability,
  onRefreshUsers
}: AdminPanelTabsProps) => {
  return (
    <Tabs defaultValue="products">
      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 h-auto">
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
        <TabsTrigger value="loyalty" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
          <Icon name="ScanLine" size={16} className="sm:mr-1" />
          <span className="hidden sm:inline">QR-Сканер</span>
        </TabsTrigger>
        <TabsTrigger value="support" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
          <Icon name="MessageCircle" size={16} className="sm:mr-1" />
          <span className="hidden sm:inline">Поддержка</span>
        </TabsTrigger>
        <TabsTrigger value="ratings" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
          <Icon name="Star" size={16} className="sm:mr-1" />
          <span className="hidden sm:inline">Оценки</span>
        </TabsTrigger>
        <TabsTrigger value="pages" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
          <Icon name="FileText" size={16} className="sm:mr-1" />
          <span className="hidden sm:inline">Страницы</span>
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
        <UsersTab 
          users={users} 
          onAddBalance={onAddBalance} 
          onAddCashback={onAddCashback}
          onToggleAdmin={onToggleAdmin}
          onIssueLoyaltyCard={onIssueLoyaltyCard}
          onRefreshUsers={onRefreshUsers}
        />
      </TabsContent>

      <TabsContent value="orders">
        <OrdersTab 
          orders={orders} 
          onUpdateStatus={onUpdateOrderStatus} 
          onDeleteOrder={onDeleteOrder}
          onUpdateItemStock={onUpdateItemStock}
          onUpdateItemAvailability={onUpdateItemAvailability}
        />
      </TabsContent>

      <TabsContent value="loyalty">
        <LoyaltyScannerTab />
      </TabsContent>

      <TabsContent value="support">
        <SupportTab 
          tickets={tickets}
          onReply={onReplyToTicket}
          onUpdateStatus={onUpdateTicketStatus}
          onLoadTicket={onLoadTicket}
          onDeleteTicket={onDeleteTicket}
        />
      </TabsContent>

      <TabsContent value="ratings">
        <div className="space-y-4">
          <OrdersStatsCard orders={orders} />
          <SupportStatsCard tickets={tickets} />
        </div>
      </TabsContent>

      <TabsContent value="pages">
        <PagesTab 
          siteSettings={siteSettings}
          onSaveSettings={onSaveSettings}
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