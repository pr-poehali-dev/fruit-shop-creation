import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

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
  };
  onSectionChange: (section: string) => void;
}

const SideMenu = ({ siteSettings, onSectionChange }: SideMenuProps) => {
  const [open, setOpen] = useState(false);

  const handleNavigate = (section: string) => {
    onSectionChange(section);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-primary-foreground hover:bg-primary/90 w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border-2 border-green-200/30 backdrop-blur-sm transition-all hover:scale-110 snow-menu-button relative"
          title="Меню"
        >
          <Icon name="Menu" size={28} />
          <div className="menu-snow-sparkle">🎄</div>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none"></div>
        <div className="menu-snowflakes">
          <div className="menu-snowflake" style={{ left: '10%', animationDelay: '0s' }}>❄️</div>
          <div className="menu-snowflake" style={{ left: '30%', animationDelay: '1s' }}>❄️</div>
          <div className="menu-snowflake" style={{ left: '50%', animationDelay: '2s' }}>❄️</div>
          <div className="menu-snowflake" style={{ left: '70%', animationDelay: '0.5s' }}>❄️</div>
          <div className="menu-snowflake" style={{ left: '90%', animationDelay: '1.5s' }}>❄️</div>
        </div>
        <SheetHeader className="mb-6 relative z-10">
          <SheetTitle className="flex items-center gap-2 text-2xl">
            <span className="text-3xl">🎄</span>
            {siteSettings?.site_name || 'Питомник растений'}
            <span className="text-2xl">✨</span>
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
            <nav className="space-y-1 relative z-10">
              <Button
                variant="ghost"
                className="w-full justify-start text-base h-12 bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-blue-100/50 shadow-sm menu-nav-button"
                onClick={() => handleNavigate('home')}
              >
                <Icon name="Home" size={20} className="mr-3" />
                Главная
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-base h-12 bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-blue-100/50 shadow-sm menu-nav-button"
                onClick={() => handleNavigate('catalog')}
              >
                <Icon name="ShoppingBag" size={20} className="mr-3" />
                Каталог
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-base h-12 bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-blue-100/50 shadow-sm menu-nav-button"
                onClick={() => handleNavigate('about')}
              >
                <Icon name="Info" size={20} className="mr-3" />
                О нас
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-base h-12 bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-blue-100/50 shadow-sm menu-nav-button"
                onClick={() => handleNavigate('delivery')}
              >
                <Icon name="Truck" size={20} className="mr-3" />
                Доставка
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-base h-12 bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-blue-100/50 shadow-sm menu-nav-button"
                onClick={() => handleNavigate('care')}
              >
                <Icon name="Sprout" size={20} className="mr-3" />
                Уход за растениями
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-base h-12 bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-blue-100/50 shadow-sm menu-nav-button"
                onClick={() => handleNavigate('contacts')}
              >
                <Icon name="Phone" size={20} className="mr-3" />
                Контакты
              </Button>
            </nav>
          </div>

          <Separator />

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
        
        <style>{`
          .snow-menu-button {
            position: relative;
            overflow: visible;
          }
          
          .menu-snow-sparkle {
            position: absolute;
            top: -8px;
            left: -8px;
            font-size: 16px;
            animation: sparkle-rotate 3s ease-in-out infinite;
            pointer-events: none;
            filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.8));
          }
          
          .snow-menu-button::before {
            content: '';
            position: absolute;
            top: -3px;
            left: 0;
            right: 0;
            height: 10px;
            background: linear-gradient(to bottom, 
              rgba(255, 255, 255, 0.6) 0%, 
              rgba(240, 249, 255, 0.3) 50%, 
              transparent 100%
            );
            border-radius: 50%;
            pointer-events: none;
            z-index: 10;
          }
          
          .snow-menu-button:hover::before {
            height: 14px;
            background: linear-gradient(to bottom, 
              rgba(255, 255, 255, 0.8) 0%, 
              rgba(240, 249, 255, 0.5) 50%, 
              transparent 100%
            );
          }
          
          .menu-snowflakes {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            overflow: hidden;
            z-index: 1;
          }
          
          .menu-snowflake {
            position: absolute;
            top: -20px;
            font-size: 1.2rem;
            animation: menu-fall 8s linear infinite;
            opacity: 0.6;
          }
          
          @keyframes menu-fall {
            0% {
              top: -20px;
              transform: translateX(0) rotate(0deg);
            }
            100% {
              top: 100%;
              transform: translateX(50px) rotate(360deg);
            }
          }
          
          .menu-nav-button {
            position: relative;
            overflow: hidden;
          }
          
          .menu-nav-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(to bottom, 
              rgba(255, 255, 255, 0.5) 0%, 
              rgba(240, 249, 255, 0.2) 50%, 
              transparent 100%
            );
            border-radius: 0 0 50% 50% / 0 0 100% 100%;
            pointer-events: none;
          }
          
          .menu-nav-button:hover::before {
            height: 8px;
            background: linear-gradient(to bottom, 
              rgba(255, 255, 255, 0.7) 0%, 
              rgba(240, 249, 255, 0.4) 50%, 
              transparent 100%
            );
          }
        `}</style>
      </SheetContent>
    </Sheet>
  );
};

export default SideMenu;