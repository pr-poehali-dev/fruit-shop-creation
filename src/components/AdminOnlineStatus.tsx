import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

interface Admin {
  id: number;
  full_name: string;
  avatar: string;
  is_online: boolean;
  last_seen: string | null;
}

export default function AdminOnlineStatus() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchAdmins = async () => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc?action=admin_online&user_id=${user.id}`,
        {
          headers: {
            'X-User-Id': user.id.toString()
          }
        }
      );
      const data = await response.json();
      if (data.admins) {
        setAdmins(data.admins);
      }
    } catch (error) {
      console.error('Error fetching admin online status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async () => {
    try {
      await fetch('https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString()
        },
        body: JSON.stringify({
          action: 'update_admin_status',
          user_id: user.id
        })
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  useEffect(() => {
    fetchAdmins();
    updateStatus();

    const statusInterval = setInterval(updateStatus, 60000);
    const fetchInterval = setInterval(fetchAdmins, 10000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(fetchInterval);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="text-primary" />
          <h3 className="font-semibold">Команда онлайн</h3>
        </div>
        <p className="text-sm text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  const onlineAdmins = admins.filter(a => a.is_online);
  const offlineAdmins = admins.filter(a => !a.is_online);

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return 'Никогда не был онлайн';
    
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ч назад`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} д назад`;
  };

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Users size={20} className="text-primary" />
        <h3 className="font-semibold">Команда онлайн</h3>
        <span className="ml-auto text-sm text-muted-foreground">
          {onlineAdmins.length} из {admins.length}
        </span>
      </div>

      <div className="space-y-3">
        {onlineAdmins.length > 0 && (
          <div>

            <div className="space-y-2">
              {onlineAdmins.map(admin => (
                <div key={admin.id} className="flex items-center gap-3 p-2 rounded-lg bg-green-500/10">
                  <div className="relative">
                    <div className="text-2xl">{admin.avatar}</div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{admin.full_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {offlineAdmins.length > 0 && (
          <div>

            <div className="space-y-2">
              {offlineAdmins.map(admin => (
                <div key={admin.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <div className="relative">
                    <div className="text-2xl opacity-60">{admin.avatar}</div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-muted-foreground rounded-full border-2 border-card"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate opacity-80">{admin.full_name}</p>
                    <p className="text-xs text-muted-foreground">{formatLastSeen(admin.last_seen)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}