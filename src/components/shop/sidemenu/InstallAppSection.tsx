import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallAppSectionProps {
  isInstalled: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  onInstallClick: () => void;
}

export const InstallAppSection = ({ isInstalled, deferredPrompt, onInstallClick }: InstallAppSectionProps) => {
  if (isInstalled) {
    return (
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
    );
  }

  return (
    <div>
      {deferredPrompt ? (
        <>
          <Button
            variant="default"
            className="w-full h-12 text-base bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90"
            onClick={onInstallClick}
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
  );
};
