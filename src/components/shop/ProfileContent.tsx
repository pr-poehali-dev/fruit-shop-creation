import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { User, Order } from '@/types/shop';
import LoyaltyCard from './LoyaltyCard';
import CashbackExchange from './CashbackExchange';
import ProfileHeader from './profile/ProfileHeader';
import OrdersTab from './profile/OrdersTab';
import TransactionsTab from './profile/TransactionsTab';
import SettingsTab from './profile/SettingsTab';

interface ProfileContentProps {
  user: User | null;
  orders: Order[];
  siteSettings?: any;
  onShowAdminPanel: () => void;
  onLogout: () => void;
  onBalanceUpdate: () => void;
  onUserUpdate: (updatedUser: User) => void;

}

const ProfileContent = ({ user, orders, siteSettings, onShowAdminPanel, onLogout, onBalanceUpdate, onUserUpdate }: ProfileContentProps) => {
  const [hasLoyaltyCard, setHasLoyaltyCard] = useState(false);
  const [isLoadingCard, setIsLoadingCard] = useState(true);



  useEffect(() => {
    const checkLoyaltyCard = async () => {
      if (!user) {
        setIsLoadingCard(false);
        return;
      }
      
      try {
        const response = await fetch(`https://functions.poehali.dev/ed127250-fe9d-4c7e-9a93-fb8b7fdc038a?action=get_card&user_id=${user.id}`);
        const data = await response.json();
        setHasLoyaltyCard(!!data.card);
      } catch (error) {
        console.error('Failed to check loyalty card:', error);
        setHasLoyaltyCard(false);
      } finally {
        setIsLoadingCard(false);
      }
    };

    checkLoyaltyCard();
  }, [user]);

  return (
    <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 px-2 sm:px-0">
      <ProfileHeader user={user} siteSettings={siteSettings} onShowAdminPanel={onShowAdminPanel} onUserUpdate={onUserUpdate} />

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className={`grid w-full ${hasLoyaltyCard ? 'grid-cols-5' : 'grid-cols-4'} gap-0.5 sm:gap-1 h-9 sm:h-10`}>
          <TabsTrigger value="orders" className="text-[11px] sm:text-sm px-1 sm:px-2 data-[state=active]:text-xs sm:data-[state=active]:text-sm">Заказы</TabsTrigger>
          {hasLoyaltyCard && (
            <TabsTrigger value="cashback" className="text-[11px] sm:text-sm px-1 sm:px-2 data-[state=active]:text-xs sm:data-[state=active]:text-sm">Обмен</TabsTrigger>
          )}
          <TabsTrigger value="loyalty" className="text-[11px] sm:text-sm px-1 sm:px-2 data-[state=active]:text-xs sm:data-[state=active]:text-sm">Карта</TabsTrigger>
          <TabsTrigger value="transactions" className="text-[11px] sm:text-sm px-1 sm:px-2 data-[state=active]:text-xs sm:data-[state=active]:text-sm">История</TabsTrigger>
          <TabsTrigger value="settings" className="text-[11px] sm:text-sm px-1 sm:px-2 data-[state=active]:text-xs sm:data-[state=active]:text-sm">
            <Icon name="Settings" size={14} className="sm:w-4 sm:h-4" />
          </TabsTrigger>
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

        {hasLoyaltyCard && (
          <TabsContent value="cashback" className="space-y-2 sm:space-y-3 mt-4 sm:mt-6">
            {user && (
              <CashbackExchange
                userCashback={user.cashback || 0}
                userId={user.id}
                onExchangeSuccess={onBalanceUpdate}
              />
            )}
          </TabsContent>
        )}

        <TabsContent value="loyalty" className="space-y-2 sm:space-y-3 mt-4 sm:mt-6">
          <h3 className="font-semibold text-sm sm:text-base">Карта лояльности</h3>
          {user && (
            <LoyaltyCard 
              userId={user.id} 
              userBalance={user.balance || 0}
              onBalanceUpdate={() => {
                onBalanceUpdate();
                setIsLoadingCard(true);
                setTimeout(async () => {
                  try {
                    const response = await fetch(`https://functions.poehali.dev/ed127250-fe9d-4c7e-9a93-fb8b7fdc038a?action=get_card&user_id=${user.id}`);
                    const data = await response.json();
                    setHasLoyaltyCard(!!data.card);
                  } catch (error) {
                    console.error('Failed to check loyalty card:', error);
                  } finally {
                    setIsLoadingCard(false);
                  }
                }, 500);
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="transactions">
          {user && <TransactionsTab userId={user.id} />}
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab user={user} onUserUpdate={onUserUpdate} />
        </TabsContent>
      </Tabs>
      
      <Separator className="my-3 sm:my-4" />
      
      <Button variant="destructive" className="w-full text-sm sm:text-base h-10 sm:h-11" onClick={onLogout}>
        <Icon name="LogOut" size={16} className="mr-2 sm:w-[18px] sm:h-[18px]" />
        Выйти
      </Button>
    </div>
  );
};

export default ProfileContent;