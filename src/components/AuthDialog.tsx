import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuth: (e: React.FormEvent<HTMLFormElement>, action: 'login' | 'register') => void;
}

const AuthDialog = ({ open, onOpenChange, onAuth }: AuthDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 max-w-4xl">
        <div className="relative flex min-h-[600px]">
          <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gradient-to-br from-green-900 via-green-700 to-emerald-600">
            <div className="absolute inset-0">
              <div className="leaf leaf-1"></div>
              <div className="leaf leaf-2"></div>
              <div className="leaf leaf-3"></div>
              <div className="leaf leaf-4"></div>
              <div className="leaf leaf-5"></div>
              <div className="leaf leaf-6"></div>
              <div className="tree tree-1"></div>
              <div className="tree tree-2"></div>
              <div className="tree tree-3"></div>
              <div className="cloud cloud-1"></div>
              <div className="cloud cloud-2"></div>
            </div>
            <div className="relative z-10 flex flex-col justify-center p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Питомник растений</h2>
              <p className="text-lg opacity-90">Качественные саженцы для вашего сада</p>
            </div>
          </div>
          <div className="w-full md:w-1/2 p-8 bg-white">
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
            <form onSubmit={(e) => onAuth(e, 'login')} className="space-y-4">
              <div>
                <Label htmlFor="login-phone">Телефон</Label>
                <Input id="login-phone" name="phone" type="tel" placeholder="+7 (999) 123-45-67" required />
              </div>
              <div>
                <Label htmlFor="login-password">Пароль</Label>
                <Input id="login-password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">Войти</Button>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={(e) => onAuth(e, 'register')} className="space-y-4">
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
          </div>
        </div>
        <style>{`
          .leaf {
            position: absolute;
            width: 30px;
            height: 30px;
            background: rgba(134, 239, 172, 0.6);
            border-radius: 50% 0;
            animation: float 6s ease-in-out infinite;
          }
          
          .leaf-1 { top: 10%; left: 10%; animation-delay: 0s; }
          .leaf-2 { top: 30%; left: 80%; animation-delay: 1s; }
          .leaf-3 { top: 50%; left: 20%; animation-delay: 2s; }
          .leaf-4 { top: 70%; left: 70%; animation-delay: 3s; }
          .leaf-5 { top: 20%; left: 50%; animation-delay: 4s; }
          .leaf-6 { top: 80%; left: 40%; animation-delay: 5s; }
          
          .tree {
            position: absolute;
            bottom: 0;
            width: 60px;
            height: 120px;
            background: linear-gradient(to top, rgba(21, 94, 117, 0.3), rgba(52, 211, 153, 0.2));
            border-radius: 50% 50% 0 0;
            animation: sway 4s ease-in-out infinite;
          }
          
          .tree::before {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 10px;
            height: 30px;
            background: rgba(92, 64, 51, 0.5);
          }
          
          .tree-1 { left: 15%; animation-delay: 0s; }
          .tree-2 { left: 45%; height: 100px; animation-delay: 1s; }
          .tree-3 { left: 75%; height: 140px; animation-delay: 0.5s; }
          
          .cloud {
            position: absolute;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 50px;
            animation: drift 20s linear infinite;
          }
          
          .cloud-1 {
            top: 15%;
            left: -100px;
            width: 80px;
            height: 30px;
          }
          
          .cloud-2 {
            top: 40%;
            left: -150px;
            width: 100px;
            height: 40px;
            animation-delay: 10s;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          @keyframes sway {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(2deg); }
          }
          
          @keyframes drift {
            0% { left: -100px; }
            100% { left: 100%; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;