import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface AuthFormsProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>, action: 'login' | 'register') => void;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onForgotPassword: () => void;
}

const AuthForms = ({ onSubmit, handlePhoneChange, onForgotPassword }: AuthFormsProps) => {
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
          <Button 
            type="button" 
            variant="link" 
            className="w-full text-sm text-muted-foreground"
            onClick={onForgotPassword}
          >
            Забыли пароль?
          </Button>
        </form>
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
      </TabsContent>
    </Tabs>
  );
};

export default AuthForms;