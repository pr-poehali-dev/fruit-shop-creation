import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface SiteSettings {
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
}

interface ContactInfoSectionProps {
  siteSettings?: SiteSettings;
}

export const ContactInfoSection = ({ siteSettings }: ContactInfoSectionProps) => {
  return (
    <>
      {siteSettings?.price_list_url && (
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
            >
              <Icon name="FileText" size={20} className="mr-3" />
              Прайс-лист
            </Button>
          </a>
        </div>
      )}

      {(siteSettings?.phone || siteSettings?.email || siteSettings?.address || siteSettings?.work_hours) && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Контакты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {siteSettings?.phone && (
                <div className="flex items-start gap-3">
                  <Icon name="Phone" size={18} className="text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Телефон</p>
                    <a href={`tel:${siteSettings.phone}`} className="text-muted-foreground hover:text-primary">
                      {siteSettings.phone}
                    </a>
                  </div>
                </div>
              )}
              {siteSettings?.email && (
                <div className="flex items-start gap-3">
                  <Icon name="Mail" size={18} className="text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href={`mailto:${siteSettings.email}`} className="text-muted-foreground hover:text-primary break-all">
                      {siteSettings.email}
                    </a>
                  </div>
                </div>
              )}
              {siteSettings?.address && (
                <div className="flex items-start gap-3">
                  <Icon name="MapPin" size={18} className="text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Адрес</p>
                    <p className="text-muted-foreground">{siteSettings.address}</p>
                  </div>
                </div>
              )}
              {siteSettings?.work_hours && (
                <div className="flex items-start gap-3">
                  <Icon name="Clock" size={18} className="text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Режим работы</p>
                    <p className="text-muted-foreground whitespace-pre-line">{siteSettings.work_hours}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {siteSettings?.promotions && (
        <div>
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon name="Sparkles" size={20} className="text-amber-600 dark:text-amber-400" />
                Акции
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-line">{siteSettings.promotions}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {siteSettings?.additional_info && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Дополнительная информация</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-line text-muted-foreground">{siteSettings.additional_info}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
