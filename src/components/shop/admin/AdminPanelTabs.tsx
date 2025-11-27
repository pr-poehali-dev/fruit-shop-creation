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
import CourierManagement from './CourierManagement';
import StatisticsTab from './StatisticsTab';
import ReferralStatsTab from './ReferralStatsTab';
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
    hasPermission('support'),
    hasPermission('couriers'),
    isSuperAdmin,
    isSuperAdmin,
    isSuperAdmin,
    isSuperAdmin
  ].filter(Boolean).length;

  return (
    <Tabs defaultValue="products">
      <TabsList className="flex w-full overflow-x-auto h-auto flex-nowrap gap-1 p-1 bg-background/50 backdrop-blur-sm">
        {hasPermission('products') && (
          <TabsTrigger value="products" className="flex-col gap-1 px-3 py-2 min-w-[70px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Package" size={20} className="shrink-0" />
            <span className="text-[10px] sm:text-xs leading-tight">Товары</span>
          </TabsTrigger>
        )}
        {hasPermission('categories') && (
          <TabsTrigger value="categories" className="flex-col gap-1 px-3 py-2 min-w-[70px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="FolderTree" size={20} className="shrink-0" />
            <span className="text-[10px] sm:text-xs leading-tight">Категории</span>
          </TabsTrigger>
        )}
        {hasPermission('plants') && (
          <TabsTrigger value="plants" className="flex-col gap-1 px-3 py-2 min-w-[70px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Sprout" size={20} className="shrink-0" />
            <span className="text-[10px] sm:text-xs leading-tight">Растения</span>
          </TabsTrigger>
        )}
        {hasPermission('users') && (
          <TabsTrigger value="users" className="flex-col gap-1 px-2 py-2 min-w-[70px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Users" size={20} className="shrink-0" />
            <span className="text-[10px] sm:text-xs leading-tight text-center">Пользователи</span>
          </TabsTrigger>
        )}
        {hasPermission('orders') && (
          <TabsTrigger value="orders" className="flex-col gap-1 px-3 py-2 min-w-[70px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="ShoppingCart" size={20} className="shrink-0" />
            <span className="text-[10px] sm:text-xs leading-tight">Заказы</span>
          </TabsTrigger>
        )}
        {isSuperAdmin && (
          <TabsTrigger value="referrals" className="flex-col gap-1 px-3 py-2 min-w-[70px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="UserPlus" size={20} className="shrink-0" />
            <span className="text-[10px] sm:text-xs leading-tight">Рефералы</span>
          </TabsTrigger>
        )}
        {hasPermission('delivery-zones') && (
          <TabsTrigger value="delivery-zones" className="flex-col gap-1 px-3 py-2 min-w-[70px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="MapPin" size={20} className="shrink-0" />
            <span className="text-[10px] sm:text-xs leading-tight">Зоны</span>
          </TabsTrigger>
        )}
        {hasPermission('loyalty') && (
          <TabsTrigger value="loyalty" className="flex-col gap-1 px-2 py-2 min-w-[70px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="ScanLine" size={20} className="shrink-0" />
            <span className="text-[10px] sm:text-xs leading-tight text-center">QR-Сканер</span>
          </TabsTrigger>
        )}
        {hasPermission('gallery') && (
          <TabsTrigger value="gallery" className="flex-col gap-1 px-3 py-2 min-w-[70px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Image" size={20} className="shrink-0" />
            <span className="text-[10px] sm:text-xs leading-tight">Галерея</span>
          </TabsTrigger>
        )}
        {hasPermission('pages') && (
          <TabsTrigger value="pages" className="flex-col gap-1 px-3 py-2 min-w-[70px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="FileText" size={20} className="shrink-0" />
            <span className="text-[10px] sm:text-xs leading-tight">Страницы</span>
          </TabsTrigger>
        )}
        {hasPermission('codes') && (
          <TabsTrigger value="codes" className="flex-col gap-1 px-3 py-2 min-w-[70px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="KeyRound" size={20} className="shrink-0" />
            <span className="text-[10px] sm:text-xs leading-tight">Коды</span>
          </TabsTrigger>
        )}
        {hasPermission('settings') && (
          <TabsTrigger value="settings" className="flex-col gap-1 px-2 py-2 min-w-[70px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Settings" size={20} className="shrink-0" />
            <span className="text-[10px] sm:text-xs leading-tight text-center">Настройки</span>
          </TabsTrigger>
        )}
        {isSuperAdmin && (
          <TabsTrigger value="permissions" className="flex-col gap-1 px-3 py-2 min-w-[70px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Shield" size={20} className="shrink-0" />
            <span className="text-[10px] sm:text-xs leading-tight">Права</span>
          </TabsTrigger>
        )}
        {isSuperAdmin && (
          <TabsTrigger value="logs" className="flex-col gap-1 px-3 py-2 min-w-[70px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="ScrollText" size={20} className="shrink-0" />
            <span className="text-[10px] sm:text-xs leading-tight">Логи</span>
          </TabsTrigger>
        )}
        {hasPermission('support') && (
          <TabsTrigger value="support-chat" className="flex-col gap-1 px-2 py-2 min-w-[70px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="MessageCircle" size={20} className="shrink-0" />
            <span className="text-[10px] sm:text-xs leading-tight text-center">Поддержка</span>
          </TabsTrigger>
        )}
        {hasPermission('couriers') && (
          <TabsTrigger value="couriers" className="flex-col gap-1 px-3 py-2 min-w-[70px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Truck" size={20} className="shrink-0" />
            <span className="text-[10px] sm:text-xs leading-tight">Курьеры</span>
          </TabsTrigger>
        )}
        {isSuperAdmin && (
          <TabsTrigger value="statistics" className="flex-col gap-1 px-2 py-2 min-w-[70px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="BarChart3" size={20} className="shrink-0" />
            <span className="text-[10px] sm:text-xs leading-tight text-center">Статистика</span>
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

      {hasPermission('support') && (
        <TabsContent value="support-chat">
          <SupportChatTab 
            userId={userId}
            userName={currentUser?.full_name || 'Администратор'}
            isSuperAdmin={isSuperAdmin}
          />
        </TabsContent>
      )}

      {hasPermission('couriers') && (
        <TabsContent value="couriers">
          <CourierManagement />
        </TabsContent>
      )}

      {isSuperAdmin && (
        <TabsContent value="statistics">
          <StatisticsTab />
        </TabsContent>
      )}

      {isSuperAdmin && (
        <TabsContent value="referrals">
          <ReferralStatsTab />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default AdminPanelTabs;