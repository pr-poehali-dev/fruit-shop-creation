import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { User } from './types';

interface PermissionsTabProps {
  users: User[];
  currentUserId: number;
  onUpdatePermissions: (userId: number, permissions: string[], isSuperAdmin: boolean) => void;
}

const ALL_PERMISSIONS = [
  { id: 'products', label: 'Товары', icon: 'Package' },
  { id: 'categories', label: 'Категории', icon: 'FolderTree' },
  { id: 'plants', label: 'Растения', icon: 'Sprout' },
  { id: 'users', label: 'Пользователи', icon: 'Users' },
  { id: 'orders', label: 'Заказы', icon: 'ShoppingCart' },
  { id: 'delivery-zones', label: 'Зоны доставки', icon: 'MapPin' },
  { id: 'loyalty', label: 'QR-Сканер', icon: 'ScanLine' },
  { id: 'gallery', label: 'Галерея', icon: 'Image' },
  { id: 'pages', label: 'Страницы', icon: 'FileText' },
  { id: 'codes', label: 'Коды', icon: 'KeyRound' },
  { id: 'settings', label: 'Настройки', icon: 'Settings' }
];

const PermissionsTab = ({ users, currentUserId, onUpdatePermissions }: PermissionsTabProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const filteredAdmins = users.filter(user =>
    user.is_admin &&
    (user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery))
  );

  const handleEditPermissions = (user: User) => {
    setEditingUserId(user.id);
    setSelectedPermissions(user.admin_permissions || []);
    setIsSuperAdmin(user.is_super_admin || false);
  };

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAll = () => {
    setSelectedPermissions(ALL_PERMISSIONS.map(p => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedPermissions([]);
  };

  const handleSave = () => {
    if (editingUserId) {
      onUpdatePermissions(editingUserId, selectedPermissions, isSuperAdmin);
      setEditingUserId(null);
    }
  };

  const handleCancel = () => {
    setEditingUserId(null);
    setSelectedPermissions([]);
    setIsSuperAdmin(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление правами доступа</CardTitle>
        <CardDescription>
          Настройка прав администраторов к разделам панели
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Поиск администраторов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {filteredAdmins.map(user => (
            <Card key={user.id}>
              <CardContent className="p-4">
                {editingUserId === user.id ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-muted-foreground">{user.phone}</div>
                      </div>
                      {user.id === currentUserId && (
                        <Badge variant="default">Вы</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Checkbox
                        id={`super-${user.id}`}
                        checked={isSuperAdmin}
                        onCheckedChange={(checked) => setIsSuperAdmin(checked as boolean)}
                      />
                      <label htmlFor={`super-${user.id}`} className="text-sm font-medium cursor-pointer">
                        <Icon name="Crown" size={16} className="inline mr-1 text-yellow-500" />
                        Супер-администратор (полный доступ + управление правами)
                      </label>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Доступ к разделам:</label>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={handleSelectAll}
                            className="text-xs h-7"
                          >
                            Выбрать все
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={handleDeselectAll}
                            className="text-xs h-7"
                          >
                            Снять все
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ALL_PERMISSIONS.map(permission => (
                          <div key={permission.id} className="flex items-center gap-2 p-2 border rounded">
                            <Checkbox
                              id={`${user.id}-${permission.id}`}
                              checked={selectedPermissions.includes(permission.id)}
                              onCheckedChange={() => handleTogglePermission(permission.id)}
                            />
                            <label 
                              htmlFor={`${user.id}-${permission.id}`}
                              className="text-sm cursor-pointer flex items-center gap-1 flex-1"
                            >
                              <Icon name={permission.icon as any} size={14} />
                              {permission.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button onClick={handleSave} className="flex-1">
                        <Icon name="Check" size={16} className="mr-2" />
                        Сохранить
                      </Button>
                      <Button onClick={handleCancel} variant="outline" className="flex-1">
                        <Icon name="X" size={16} className="mr-2" />
                        Отмена
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{user.full_name}</div>
                        {user.is_super_admin && (
                          <Badge variant="default" className="bg-yellow-500">
                            <Icon name="Crown" size={12} className="mr-1" />
                            Супер-админ
                          </Badge>
                        )}
                        {user.id === currentUserId && (
                          <Badge variant="outline">Вы</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{user.phone}</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {user.admin_permissions && user.admin_permissions.length > 0 ? (
                          user.admin_permissions.map(perm => {
                            const permission = ALL_PERMISSIONS.find(p => p.id === perm);
                            return permission ? (
                              <Badge key={perm} variant="secondary" className="text-xs">
                                <Icon name={permission.icon as any} size={10} className="mr-1" />
                                {permission.label}
                              </Badge>
                            ) : null;
                          })
                        ) : (
                          <span className="text-xs text-muted-foreground">Нет прав доступа</span>
                        )}
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleEditPermissions(user)}
                      variant="outline"
                      size="sm"
                    >
                      <Icon name="Shield" size={16} className="mr-2" />
                      Права
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredAdmins.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="UserX" size={48} className="mx-auto mb-2 opacity-50" />
              <p>Администраторы не найдены</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionsTab;
