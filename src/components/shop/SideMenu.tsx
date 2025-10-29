import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import { NavigationMenu } from './sidemenu/NavigationMenu';
import { ReferralProgramCard } from './sidemenu/ReferralProgramCard';
import { InstallAppSection } from './sidemenu/InstallAppSection';
import { ContactInfoSection } from './sidemenu/ContactInfoSection';

interface User {
  id: number;
  phone: string;
  full_name: string;
  is_admin: boolean;
  balance?: number;
  cashback?: number;
}

interface SideMenuProps {
  siteSettings?: {
    site_name?: string;
    site_description?: string;
    phone?: string;
    email?: string;
    address?: string;
    work_hours?: string;
    promotions?: string;
    additional_info?: string;
    price_list_url?: string;
    logo_url?: string;
  };
  user?: User | null;
  onSectionChange: (section: string) => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const SideMenu = ({ siteSettings, user, onSectionChange }: SideMenuProps) => {
  const [open, setOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleNavigate = (section: string) => {
    onSectionChange(section);
    setOpen(false);
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-primary-foreground hover:bg-primary/90"
          title="Меню"
        >
          <Icon name="Menu" size={24} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 text-2xl" style={{ 
            fontFamily: "'Playfair Display', serif",
            color: '#2d5016'
          }}>
            {siteSettings?.logo_url ? (
              <img 
                src={siteSettings.logo_url} 
                alt="Логотип"
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <Icon name="Flower2" size={32} className="text-primary" />
            )}
            {siteSettings?.site_name || 'Питомник растений'}
            <span className="text-green-500 text-xl">🌿</span>
          </SheetTitle>
          {siteSettings?.site_description && (
            <p className="text-sm text-muted-foreground text-left">
              {siteSettings.site_description}
            </p>
          )}
        </SheetHeader>

        <div className="space-y-6">
          <NavigationMenu onNavigate={handleNavigate} />

          <Separator />

          {!isInstalled && (
            <>
              <InstallAppSection 
                isInstalled={isInstalled}
                deferredPrompt={deferredPrompt}
                onInstallClick={handleInstallApp}
              />
              <Separator />
            </>
          )}

          {isInstalled && (
            <>
              <InstallAppSection 
                isInstalled={isInstalled}
                deferredPrompt={deferredPrompt}
                onInstallClick={handleInstallApp}
              />
              <Separator />
            </>
          )}

          <ContactInfoSection siteSettings={siteSettings} />

          {user && (
            <>
              <Separator />
              <ReferralProgramCard show={!!user} userId={user?.id} />
            </>
          )}

          <div className="pt-4 pb-8">
            <p className="text-xs text-center text-muted-foreground">
              © {new Date().getFullYear()} {siteSettings?.site_name || 'Питомник растений'}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SideMenu;