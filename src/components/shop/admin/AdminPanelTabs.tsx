import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import ProductsTab from './ProductsTab';
import CategoriesTab from './CategoriesTab';
import UsersTab from './UsersTab';
import OrdersTab from './OrdersTab';
import SettingsTab from './SettingsTab';
import LoyaltyScannerTab from './LoyaltyScannerTab';
import PagesTab from './PagesTab';
import CodesTab from './CodesTab';
import DeliveryZonesTab from './DeliveryZonesTab';
import PlantsInventoryTab from './PlantsInventoryTab';
import PermissionsTab from './PermissionsTab';
import GalleryTab from './GalleryTab';
import LogsTab from './LogsTab';
import SupportChatTab from './SupportChatTab';
import OrdersStatsCard from './OrdersStatsCard';
import { Product, Category, User } from './types';

interface AdminPanelTabsProps {
  products: Product[];
  categories: Category[];
  users: User[];
  orders: any[];
  siteSettings: any;
  userId: number;
  currentUser: User;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  onAddBalance: (userId: number, amount: number, description: string) => void;
  onAddCashback: (userId: number, amount: number, description: string) => void;
  onToggleAdmin: (userId: number, isAdmin: boolean) => void;
  onIssueLoyaltyCard: (userId: number) => Promise<void>;
  onUpdateOrderStatus: (orderId: number, status: string, rejectionReason?: string) => void;
  onSaveSettings: (e: React.FormEvent<HTMLFormElement>) => void;
  onDeleteOrder: (orderId: number) => void;
  onUpdateItemStock?: (orderId: number, itemId: number, isOutOfStock: boolean) => void;
  onUpdateItemAvailability?: (itemId: number, availableQuantity: number, availablePrice?: number) => void;
  onRefreshUsers?: () => void;
  onUpdatePermissions: (userId: number, permissions: string[], isSuperAdmin: boolean) => void;
}

const AdminPanelTabs = ({
  products,
  categories,
  users,
  orders,
  siteSettings,
  userId,
  currentUser,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
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
  onRefreshUsers,
  onUpdatePermissions
}: AdminPanelTabsProps) => {
  const isSuperAdmin = currentUser?.is_super_admin || false;
  const userPermissions = currentUser?.admin_permissions || [];

  const hasPermission = (permission: string) => {
    return isSuperAdmin || userPermissions.includes(permission);
  };

  const visibleTabsCount = [
    hasPermission('products'),
    hasPermission('categories'),
    hasPermission('plants'),
    hasPermission('users'),
    hasPermission('orders'),
    hasPermission('delivery-zones'),
    hasPermission('loyalty'),
    hasPermission('gallery'),
    hasPermission('pages'),
    hasPermission('codes'),
    hasPermission('settings'),
    isSuperAdmin,
    isSuperAdmin,
    isSuperAdmin
  ].filter(Boolean).length;

  return (
    <Tabs defaultValue="products">
      <TabsList className={`grid w-full grid-cols-4 lg:grid-cols-${Math.min(visibleTabsCount, 12)} h-auto`}>
        {hasPermission('products') && (
          <TabsTrigger value="products" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
            <Icon name="Package" size={16} className="sm:mr-1" />
            <span className="hidden sm:inline">Товары</span>
          </TabsTrigger>
        )}
        {hasPermission('categories') && (
          <TabsTrigger value="categories" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
            <Icon name="FolderTree" size={16} className="sm:mr-1" />
            <span className="hidden sm:inline">Категории</span>
          </TabsTrigger>
        )}
        {hasPermission('plants') && (
          <TabsTrigger value="plants" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
            <Icon name="Sprout" size={16} className="sm:mr-1" />
            <span className="hidden sm:inline">Растения</span>
          </TabsTrigger>
        )}
        {hasPermission('users') && (
          <TabsTrigger value="users" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
            <Icon name="Users" size={16} className="sm:mr-1" />
            <span className="hidden sm:inline">Пользователи</span>
          </TabsTrigger>
        )}
        {hasPermission('orders') && (
          <TabsTrigger value="orders" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
            <Icon name="ShoppingCart" size={16} className="sm:mr-1" />
            <span className="hidden sm:inline">Заказы</span>
          </TabsTrigger>
        )}
        {hasPermission('delivery-zones') && (
          <TabsTrigger value="delivery-zones" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
            <Icon name="MapPin" size={16} className="sm:mr-1" />
            <span className="hidden sm:inline">Зоны</span>
          </TabsTrigger>
        )}
        {hasPermission('loyalty') && (
          <TabsTrigger value="loyalty" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
            <Icon name="ScanLine" size={16} className="sm:mr-1" />
            <span className="hidden sm:inline">QR-Сканер</span>
          </TabsTrigger>
        )}
        {hasPermission('gallery') && (
          <TabsTrigger value="gallery" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
            <Icon name="Image" size={16} className="sm:mr-1" />
            <span className="hidden sm:inline">Галерея</span>
          </TabsTrigger>
        )}
        {hasPermission('pages') && (
          <TabsTrigger value="pages" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
            <Icon name="FileText" size={16} className="sm:mr-1" />
            <span className="hidden sm:inline">Страницы</span>
          </TabsTrigger>
        )}
        {hasPermission('codes') && (
          <TabsTrigger value="codes" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
            <Icon name="KeyRound" size={16} className="sm:mr-1" />
            <span className="hidden sm:inline">Коды</span>
          </TabsTrigger>
        )}
        {hasPermission('settings') && (
          <TabsTrigger value="settings" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
            <Icon name="Settings" size={16} className="sm:mr-1" />
            <span className="hidden sm:inline">Настройки</span>
          </TabsTrigger>
        )}
        {isSuperAdmin && (
          <TabsTrigger value="permissions" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
            <Icon name="Shield" size={16} className="sm:mr-1" />
            <span className="hidden sm:inline">Права</span>
          </TabsTrigger>
        )}
        {isSuperAdmin && (
          <TabsTrigger value="logs" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
            <Icon name="ScrollText" size={16} className="sm:mr-1" />
            <span className="hidden sm:inline">Логи</span>
          </TabsTrigger>
        )}
        {isSuperAdmin && (
          <TabsTrigger value="support-chat" className="text-xs sm:text-sm px-1 sm:px-2 py-2">
            <Icon name="MessageCircle" size={16} className="sm:mr-1" />
            <span className="hidden sm:inline">Поддержка</span>
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="products">
        <ProductsTab 
          products={products}
          onAddProduct={onAddProduct}
          onEditProduct={onEditProduct}
          onDeleteProduct={onDeleteProduct}
        />
      </TabsContent>

      <TabsContent value="categories">
        <CategoriesTab 
          categories={categories}
          onAddCategory={onAddCategory}
          onEditCategory={onEditCategory}
          onDeleteCategory={onDeleteCategory}
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

      <TabsContent value="plants">
        <PlantsInventoryTab />
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



      <TabsContent value="gallery">
        <GalleryTab />
      </TabsContent>


      <TabsContent value="pages">
        <PagesTab 
          siteSettings={siteSettings}
          onSaveSettings={onSaveSettings}
        />
      </TabsContent>

      <TabsContent value="delivery-zones">
        <DeliveryZonesTab />
      </TabsContent>

      <TabsContent value="codes">
        <CodesTab userId={userId} />
      </TabsContent>

      <TabsContent value="settings">
        <SettingsTab 
          siteSettings={siteSettings}
          onSaveSettings={onSaveSettings}
        />
      </TabsContent>

      {isSuperAdmin && (
        <TabsContent value="permissions">
          <PermissionsTab
            users={users}
            currentUserId={userId}
            onUpdatePermissions={onUpdatePermissions}
          />
        </TabsContent>
      )}

      {isSuperAdmin && (
        <TabsContent value="logs">
          <LogsTab />
        </TabsContent>
      )}

      {isSuperAdmin && (
        <TabsContent value="support-chat">
          <SupportChatTab 
            userId={userId}
            userName={currentUser?.full_name || 'Администратор'}
            isSuperAdmin={isSuperAdmin}
          />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default AdminPanelTabs;