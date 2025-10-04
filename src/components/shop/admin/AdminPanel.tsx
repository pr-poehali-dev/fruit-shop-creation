import { useState } from 'react';
import { useAdminData } from './useAdminData';
import { useAdminHandlers } from './useAdminHandlers';
import AdminPanelHeader from './AdminPanelHeader';
import AdminPanelTabs from './AdminPanelTabs';
import ProductDialog from './ProductDialog';
import CategoryDialog from './CategoryDialog';
import { Product, Category } from './types';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel = ({ onClose }: AdminPanelProps) => {
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

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
    handleUpdateOrderStatus,
    handleReplyToTicket,
    handleUpdateTicketStatus,
    handleSaveSettings
  } = useAdminHandlers({
    API_PRODUCTS,
    API_CATEGORIES,
    API_AUTH,
    API_ORDERS,
    API_SUPPORT,
    API_SETTINGS,
    loadProducts,
    loadCategories,
    loadUsers,
    loadOrders,
    loadTickets,
    loadSettings,
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
          onAddProduct={() => openProductDialog()}
          onEditProduct={openProductDialog}
          onAddCategory={() => setShowCategoryDialog(true)}
          onEditCategory={(category) => {
            setEditingCategory(category);
            setShowCategoryDialog(true);
          }}
          onAddBalance={handleAddBalance}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onReplyToTicket={handleReplyToTicket}
          onUpdateTicketStatus={handleUpdateTicketStatus}
          onLoadTicket={loadSingleTicket}
          onSaveSettings={handleSaveSettings}
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
