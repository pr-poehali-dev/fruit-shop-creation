import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AdminPanelHeaderProps {
  onClose: () => void;
}

const AdminPanelHeader = ({ onClose }: AdminPanelHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4 sm:mb-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <Icon name="Shield" size={24} className="text-primary sm:w-8 sm:h-8" />
        <h1 className="text-xl sm:text-3xl font-display font-bold">Админ-панель</h1>
      </div>
      <Button variant="outline" size="sm" onClick={onClose} className="sm:h-10">
        <Icon name="X" size={18} className="sm:mr-2" />
        <span className="hidden sm:inline">Закрыть</span>
      </Button>
    </div>
  );
};

export default AdminPanelHeader;
