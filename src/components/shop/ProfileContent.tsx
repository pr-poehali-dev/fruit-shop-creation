import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { User, Order } from '@/types/shop';
import UserTickets from './UserTickets';
import LoyaltyCard from './LoyaltyCard';
import CashbackExchange from './CashbackExchange';
import ProfileHeader from './profile/ProfileHeader';
import OrdersTab from './profile/OrdersTab';
import TransactionsTab from './profile/TransactionsTab';

interface ProfileContentProps {
  user: User | null;
  orders: Order[];
  onShowAdminPanel: () => void;
  onLogout: () => void;
  onBalanceUpdate: () => void;
  scrollToSupport?: boolean;
}

const ProfileContent = ({ user, orders, onShowAdminPanel, onLogout, onBalanceUpdate, scrollToSupport = false }: ProfileContentProps) => {
  const supportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollToSupport && supportRef.current) {
      setTimeout(() => {
        supportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [scrollToSupport]);

  return (
    <div className="mt-6 space-y-4">
      <ProfileHeader user={user} onShowAdminPanel={onShowAdminPanel} />

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-4 gap-1">
          <TabsTrigger value="orders" className="text-xs sm:text-sm px-1 sm:px-2">Заказы</TabsTrigger>
          <TabsTrigger value="cashback" className="text-xs sm:text-sm px-1 sm:px-2">Обмен</TabsTrigger>
          <TabsTrigger value="loyalty" className="text-xs sm:text-sm px-1 sm:px-2">Карта</TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs sm:text-sm px-1 sm:px-2">История</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          {user && (
            <OrdersTab 
              orders={orders} 
              userId={user.id}
              onOrderUpdate={onBalanceUpdate}
            />
          )}
        </TabsContent>

        <TabsContent value="cashback" className="space-y-3 mt-6">
          {user && (
            <CashbackExchange
              userCashback={user.cashback || 0}
              userId={user.id}
              onExchangeSuccess={onBalanceUpdate}
            />
          )}
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-3 mt-6">
          <h3 className="font-semibold">Карта лояльности</h3>
          {user && (
            <LoyaltyCard 
              userId={user.id} 
              userBalance={user.balance || 0}
              onBalanceUpdate={onBalanceUpdate}
            />
          )}
        </TabsContent>

        <TabsContent value="transactions">
          {user && <TransactionsTab userId={user.id} />}
        </TabsContent>
      </Tabs>
      
      <Separator />
      
      <div ref={supportRef}>
        <UserTickets user={user} />
      </div>
      
      <Separator className="my-4" />
      
      <Button variant="destructive" className="w-full" onClick={onLogout}>
        <Icon name="LogOut" size={18} className="mr-2" />
        Выйти
      </Button>
    </div>
  );
};

export default ProfileContent;
