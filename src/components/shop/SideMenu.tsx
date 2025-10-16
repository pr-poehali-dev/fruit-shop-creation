import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';

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
  onSectionChange: (section: string) => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const SideMenu = ({ siteSettings, onSectionChange }: SideMenuProps) => {
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
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Навигация
            </h3>
            <nav className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-base h-12"
                onClick={() => handleNavigate('home')}
              >
                <Icon name="Home" size={20} className="mr-3" />
                Главная
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-base h-12"
                onClick={() => handleNavigate('catalog')}
              >
                <Icon name="ShoppingBag" size={20} className="mr-3" />
                Каталог
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-base h-12"
                onClick={() => handleNavigate('about')}
              >
                <Icon name="Info" size={20} className="mr-3" />
                О нас
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-base h-12"
                onClick={() => handleNavigate('delivery')}
              >
                <Icon name="Truck" size={20} className="mr-3" />
                Доставка
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-base h-12"
                onClick={() => handleNavigate('care')}
              >
                <Icon name="Sprout" size={20} className="mr-3" />
                Уход за растениями
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-base h-12"
                onClick={() => handleNavigate('contacts')}
              >
                <Icon name="Phone" size={20} className="mr-3" />
                Контакты
              </Button>
            </nav>
          </div>

          <Separator />

          {!isInstalled && (
            <>
              <div>
                {deferredPrompt ? (
                  <>
                    <Button
                      variant="default"
                      className="w-full h-12 text-base bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90"
                      onClick={handleInstallApp}
                    >
                      <Icon name="Smartphone" size={20} className="mr-3" />
                      Установить приложение
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Быстрый доступ с главного экрана
                    </p>
                  </>
                ) : (
                  <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <Icon name="Smartphone" size={24} className="text-primary flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm mb-2">Установить приложение</p>
                          <p className="text-xs text-muted-foreground mb-2">
                            1. Нажмите на меню браузера (⋮)<br/>
                            2. Выберите "Установить приложение"<br/>
                            3. Готово!
                          </p>
                          <a 
                            href="/install-app.html" 
                            target="_blank"
                            className="text-xs text-primary hover:underline"
                          >
                            Подробная инструкция →
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              <Separator />
            </>
          )}

          {isInstalled && (
            <>
              <div>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <Icon name="CheckCircle2" size={24} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm text-green-900 dark:text-green-100">Приложение установлено</p>
                        <p className="text-xs text-green-700 dark:text-green-300">Спасибо за установку!</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Separator />
            </>
          )}


          {siteSettings?.price_list_url && (
            <>
              <div>
                <a 
                  href={siteSettings.price_list_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button 
                    variant="default" 
                    className="w-full h-12 text-base"
                    onClick={() => setOpen(false)}
                  >
                    <Icon name="Download" size={20} className="mr-3" />
                    Скачать прайс-лист
                  </Button>
                </a>
              </div>
              <Separator />
            </>
          )}

          {siteSettings?.promotions && (
            <div>
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon name="Sparkles" size={20} className="text-primary" />
                    Акции
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-line">{siteSettings.promotions}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {siteSettings?.promotions && <Separator />}

          {siteSettings?.additional_info && (
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon name="Info" size={20} className="text-primary" />
                    Важная информация
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-line">{siteSettings.additional_info}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {siteSettings?.additional_info && <Separator />}

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              О нас
            </h3>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Award" size={20} className="text-primary" />
                  Наши преимущества
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" size={18} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Качественные растения</p>
                    <p className="text-xs text-muted-foreground">Строгий контроль на всех этапах</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" size={18} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Быстрая доставка</p>
                    <p className="text-xs text-muted-foreground">По всей России</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" size={18} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Консультации</p>
                    <p className="text-xs text-muted-foreground">Помощь по уходу за растениями</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {(siteSettings?.phone || siteSettings?.email || siteSettings?.address) && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Контакты
                </h3>
                <div className="space-y-3">
                  {siteSettings.phone && (
                    <a 
                      href={`tel:${siteSettings.phone}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <Icon name="Phone" size={20} className="text-primary flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Телефон</p>
                        <p className="font-medium">{siteSettings.phone}</p>
                      </div>
                    </a>
                  )}
                  {siteSettings.email && (
                    <a 
                      href={`mailto:${siteSettings.email}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <Icon name="Mail" size={20} className="text-primary flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium break-all">{siteSettings.email}</p>
                      </div>
                    </a>
                  )}
                  {siteSettings.address && (
                    <div className="flex items-start gap-3 p-3 rounded-lg">
                      <Icon name="MapPin" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Адрес</p>
                        <p className="font-medium">{siteSettings.address}</p>
                      </div>
                    </div>
                  )}
                  {siteSettings.work_hours && (
                    <div className="flex items-start gap-3 p-3 rounded-lg">
                      <Icon name="Clock" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Режим работы</p>
                        <p className="font-medium">{siteSettings.work_hours}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SideMenu;