import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  phone: string;
  full_name: string;
  is_admin: boolean;
  balance?: number;
  cashback?: number;
  created_at: string;
}

interface UserCardProps {
  user: User;
  onToggleAdmin: (user: User) => void;
  onUserClick: (user: User) => void;
}

const UserCard = ({ user, onToggleAdmin, onUserClick }: UserCardProps) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-medium flex items-center gap-2 mb-1">
            {user.full_name}
            {user.is_admin && <Icon name="Crown" size={16} className="text-yellow-500 flex-shrink-0" />}
          </div>
          <div className="text-sm text-muted-foreground truncate">{user.phone}</div>
          <div className="flex gap-3 mt-2">
            <div className="flex items-center gap-1 text-xs">
              <Icon name="Wallet" size={14} className="text-blue-500" />
              <span className="font-medium">{Number(user.balance || 0).toFixed(0)}₽</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Icon name="Gift" size={14} className="text-green-500" />
              <span className="font-medium">{Math.round(Number(user.cashback || 0))}₽</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Icon name="Calendar" size={14} />
              <span>{new Date(user.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
          <div className="flex items-center gap-2 text-xs">
            <Label className="text-muted-foreground">Админ</Label>
            <Switch 
              checked={user.is_admin} 
              onCheckedChange={() => onToggleAdmin(user)}
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUserClick(user)}
            className="w-full sm:w-auto"
          >
            <Icon name="Settings" size={16} className="sm:mr-2" />
            <span className="hidden sm:inline">Управление</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
