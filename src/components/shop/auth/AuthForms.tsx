import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AuthFormsProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>, action: 'login' | 'register') => void;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGoogleLogin?: () => void;
}

const AuthForms = ({ onSubmit, handlePhoneChange, onGoogleLogin }: AuthFormsProps) => {
  return (
    <Tabs defaultValue="login">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Вход</TabsTrigger>
        <TabsTrigger value="register">Регистрация</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <form onSubmit={(e) => onSubmit(e, 'login')} className="space-y-4" autoComplete="on">
          <div>
            <Label htmlFor="login-phone">Телефон</Label>
            <Input 
              id="login-phone" 
              name="phone" 
              type="tel" 
              placeholder="+7 (999) 123-45-67" 
              defaultValue="+7"
              onChange={handlePhoneChange}
              onFocus={(e) => {
                if (e.target.value === '') e.target.value = '+7';
              }}
              autoComplete="username"
              required 
            />
          </div>
          <div>
            <Label htmlFor="login-password">Пароль</Label>
            <Input id="login-password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <Button type="submit" className="w-full">Войти</Button>
        </form>
        {onGoogleLogin && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">или</span>
              </div>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={onGoogleLogin}
            >
              <Icon name="Chrome" className="mr-2" size={18} />
              Войти через Google
            </Button>
          </>
        )}
      </TabsContent>
      <TabsContent value="register">
        <form onSubmit={(e) => onSubmit(e, 'register')} className="space-y-4" autoComplete="on">
          <div>
            <Label htmlFor="register-phone">Телефон</Label>
            <Input 
              id="register-phone" 
              name="phone" 
              type="tel" 
              placeholder="+7 (999) 123-45-67" 
              defaultValue="+7"
              onChange={handlePhoneChange}
              onFocus={(e) => {
                if (e.target.value === '') e.target.value = '+7';
              }}
              autoComplete="username"
              required 
            />
          </div>
          <div>
            <Label htmlFor="register-name">Имя</Label>
            <Input id="register-name" name="full_name" placeholder="Иван Иванов" autoComplete="name" />
          </div>
          <div>
            <Label htmlFor="register-password">Пароль</Label>
            <Input id="register-password" name="password" type="password" autoComplete="new-password" required />
          </div>
          <Button type="submit" className="w-full">Зарегистрироваться</Button>
        </form>
        {onGoogleLogin && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">или</span>
              </div>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={onGoogleLogin}
            >
              <Icon name="Chrome" className="mr-2" size={18} />
              Войти через Google
            </Button>
          </>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default AuthForms;