import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>, action: 'login' | 'register') => void;
  onGoogleLogin?: () => void;
}

const AuthDialog = ({ open, onOpenChange, onSubmit, onGoogleLogin }: AuthDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Вход и регистрация</DialogTitle>
          <DialogDescription>Войдите или создайте новый аккаунт</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Вход</TabsTrigger>
            <TabsTrigger value="register">Регистрация</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={(e) => onSubmit(e, 'login')} className="space-y-4">
              <div>
                <Label htmlFor="login-phone">Телефон</Label>
                <Input id="login-phone" name="phone" type="tel" placeholder="+7 (999) 123-45-67" required />
              </div>
              <div>
                <Label htmlFor="login-password">Пароль</Label>
                <Input id="login-password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">Войти</Button>
              
              {onGoogleLogin && (
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Для администраторов</span>
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={onGoogleLogin}
                  >
                    <Icon name="Chrome" size={18} className="mr-2" />
                    Войти через Google
                  </Button>
                </>
              )}
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={(e) => onSubmit(e, 'register')} className="space-y-4">
              <div>
                <Label htmlFor="register-phone">Телефон</Label>
                <Input id="register-phone" name="phone" type="tel" placeholder="+7 (999) 123-45-67" required />
              </div>
              <div>
                <Label htmlFor="register-name">Имя</Label>
                <Input id="register-name" name="full_name" placeholder="Иван Иванов" />
              </div>
              <div>
                <Label htmlFor="register-password">Пароль</Label>
                <Input id="register-password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">Зарегистрироваться</Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;