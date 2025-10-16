import { useState, useEffect } from 'react';
import { useAdminData } from './useAdminData';
import { useAdminHandlers } from './useAdminHandlers';
import AdminPanelHeader from './AdminPanelHeader';
import AdminPanelTabs from './AdminPanelTabs';
import ProductDialog from './ProductDialog';
import CategoryDialog from './CategoryDialog';
import AdminPinDialog from './AdminPinDialog';
import { Product, Category } from './types';

interface AdminPanelProps {
  user: any;
  onClose: () => void;
  onSettingsUpdate?: () => void;
}

const AdminPanel = ({ user, onClose, onSettingsUpdate }: AdminPanelProps) => {
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(true);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    const verified = localStorage.getItem('admin_pin_verified');
    const expiry = localStorage.getItem('admin_pin_expiry');
    
    if (verified === 'true' && expiry) {
      const expiryTime = parseInt(expiry, 10);
      if (Date.now() < expiryTime) {
        setIsPinVerified(true);
        setShowPinDialog(false);
      }
    }
  }, []);

  const {
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
  } = useAdminData();

  const {
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
  } = useAdminHandlers({
    user,
    API_PRODUCTS,
    API_CATEGORIES,
    API_AUTH,
    API_ORDERS,
    API_SUPPORT,
    API_SETTINGS,
    siteSettings,
    loadProducts,
    loadCategories,
    loadUsers,
    loadOrders,
    loadTickets,
    loadSettings,
    onSettingsUpdate,
    editingProduct,
    editingCategory,
    setShowProductDialog,
    setEditingProduct,
    setShowCategoryDialog,
    setEditingCategory
  });

  const openProductDialog = (product?: Product) => {
    setEditingProduct(product || null);
    setShowProductDialog(true);
  };

  const handlePinSuccess = () => {
    setIsPinVerified(true);
    setShowPinDialog(false);
  };

  const handlePinCancel = () => {
    onClose();
  };

  if (!isPinVerified) {
    return (
      <AdminPinDialog
        open={showPinDialog}
        onSuccess={handlePinSuccess}
        onCancel={handlePinCancel}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <AdminPanelHeader onClose={onClose} />

        <AdminPanelTabs
          products={products}
          categories={categories}
          users={users}
          orders={orders}
          tickets={tickets}
          siteSettings={siteSettings}
          userId={user.id}
          onAddProduct={() => openProductDialog()}
          onEditProduct={openProductDialog}
          onDeleteProduct={handleDeleteProduct}
          onAddCategory={() => setShowCategoryDialog(true)}
          onEditCategory={(category) => {
            setEditingCategory(category);
            setShowCategoryDialog(true);
          }}
          onAddBalance={handleAddBalance}
          onAddCashback={handleAddCashback}
          onToggleAdmin={handleToggleAdmin}
          onIssueLoyaltyCard={handleIssueLoyaltyCard}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onReplyToTicket={handleReplyToTicket}
          onUpdateTicketStatus={handleUpdateTicketStatus}
          onLoadTicket={loadSingleTicket}
          onSaveSettings={handleSaveSettings}
          onDeleteOrder={handleDeleteOrder}
          onDeleteTicket={handleDeleteTicket}
          onUpdateItemStock={handleUpdateItemStock}
          onUpdateItemAvailability={handleUpdateItemAvailability}
          onRefreshUsers={loadUsers}
          onRefreshTickets={loadTickets}
        />
      </div>

      <ProductDialog 
        open={showProductDialog}
        onOpenChange={setShowProductDialog}
        editingProduct={editingProduct}
        categories={categories}
        onSubmit={handleSaveProduct}
      />

      <CategoryDialog 
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        editingCategory={editingCategory}
        onSubmit={handleSaveCategory}
        onCancel={() => {
          setShowCategoryDialog(false);
          setEditingCategory(null);
        }}
      />
    </div>
  );
};

export default AdminPanel;