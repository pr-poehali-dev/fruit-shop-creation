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
          <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-950 via-green-800 to-teal-700">
            <div className="absolute inset-0">
              <div className="sun"></div>
              <div className="leaf leaf-1"></div>
              <div className="leaf leaf-2"></div>
              <div className="leaf leaf-3"></div>
              <div className="leaf leaf-4"></div>
              <div className="leaf leaf-5"></div>
              <div className="leaf leaf-6"></div>
              <div className="leaf leaf-7"></div>
              <div className="leaf leaf-8"></div>
              <div className="tree tree-1"></div>
              <div className="tree tree-2"></div>
              <div className="tree tree-3"></div>
              <div className="tree tree-4"></div>
              <div className="flower flower-1"></div>
              <div className="flower flower-2"></div>
              <div className="flower flower-3"></div>
              <div className="flower flower-4"></div>
              <div className="butterfly butterfly-1"></div>
              <div className="butterfly butterfly-2"></div>
              <div className="cloud cloud-1"></div>
              <div className="cloud cloud-2"></div>
              <div className="cloud cloud-3"></div>
              <div className="grass"></div>
              <div className="bird bird-1"></div>
              <div className="bird bird-2"></div>
            </div>
            <div className="relative z-10 flex flex-col justify-center p-8 text-white">
              <h2 className="text-3xl font-bold mb-4 drop-shadow-lg">Питомник растений</h2>
              <p className="text-lg opacity-90 drop-shadow">Качественные саженцы для вашего сада</p>
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
          .sun {
            position: absolute;
            top: 8%;
            right: 10%;
            width: 70px;
            height: 70px;
            background: radial-gradient(circle, rgba(255, 220, 100, 0.9), rgba(255, 180, 50, 0.6));
            border-radius: 50%;
            box-shadow: 0 0 30px rgba(255, 220, 100, 0.5);
            animation: pulse 3s ease-in-out infinite;
          }
          
          .leaf {
            position: absolute;
            width: 30px;
            height: 30px;
            background: rgba(134, 239, 172, 0.7);
            border-radius: 50% 0;
            animation: float 6s ease-in-out infinite;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          
          .leaf-1 { top: 10%; left: 10%; animation-delay: 0s; }
          .leaf-2 { top: 30%; left: 80%; animation-delay: 1s; background: rgba(187, 247, 208, 0.7); }
          .leaf-3 { top: 50%; left: 20%; animation-delay: 2s; }
          .leaf-4 { top: 70%; left: 70%; animation-delay: 3s; background: rgba(167, 243, 208, 0.7); }
          .leaf-5 { top: 20%; left: 50%; animation-delay: 4s; }
          .leaf-6 { top: 80%; left: 40%; animation-delay: 5s; background: rgba(110, 231, 183, 0.7); }
          .leaf-7 { top: 60%; left: 85%; animation-delay: 2.5s; }
          .leaf-8 { top: 35%; left: 15%; animation-delay: 3.5s; background: rgba(134, 239, 172, 0.8); }
          
          .tree {
            position: absolute;
            bottom: 0;
            width: 60px;
            height: 120px;
            background: linear-gradient(to top, rgba(6, 78, 59, 0.5), rgba(52, 211, 153, 0.4));
            border-radius: 50% 50% 0 0;
            animation: sway 4s ease-in-out infinite;
          }
          
          .tree::before {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 12px;
            height: 35px;
            background: rgba(92, 64, 51, 0.7);
            border-radius: 2px;
          }
          
          .tree-1 { left: 10%; animation-delay: 0s; }
          .tree-2 { left: 35%; height: 100px; animation-delay: 1s; }
          .tree-3 { left: 65%; height: 140px; animation-delay: 0.5s; }
          .tree-4 { left: 85%; height: 110px; animation-delay: 1.5s; }
          
          .flower {
            position: absolute;
            bottom: 40px;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(255, 182, 193, 0.9), rgba(255, 105, 180, 0.7));
            border-radius: 50%;
            animation: bloom 3s ease-in-out infinite;
          }
          
          .flower::before {
            content: '';
            position: absolute;
            bottom: -15px;
            left: 50%;
            transform: translateX(-50%);
            width: 2px;
            height: 15px;
            background: rgba(34, 139, 34, 0.6);
          }
          
          .flower-1 { left: 20%; animation-delay: 0s; }
          .flower-2 { left: 40%; animation-delay: 1s; background: radial-gradient(circle, rgba(255, 255, 150, 0.9), rgba(255, 215, 0, 0.7)); }
          .flower-3 { left: 60%; animation-delay: 2s; background: radial-gradient(circle, rgba(221, 160, 221, 0.9), rgba(218, 112, 214, 0.7)); }
          .flower-4 { left: 80%; animation-delay: 1.5s; background: radial-gradient(circle, rgba(255, 182, 193, 0.9), rgba(255, 105, 180, 0.7)); }
          
          .butterfly {
            position: absolute;
            width: 18px;
            height: 15px;
            animation: fly 8s ease-in-out infinite;
          }
          
          .butterfly::before,
          .butterfly::after {
            content: '';
            position: absolute;
            width: 8px;
            height: 12px;
            background: radial-gradient(ellipse, rgba(255, 200, 100, 0.8), rgba(255, 150, 50, 0.6));
            border-radius: 50% 50% 0 50%;
            animation: flutter 0.3s ease-in-out infinite;
          }
          
          .butterfly::before {
            left: 0;
            transform-origin: right center;
          }
          
          .butterfly::after {
            right: 0;
            transform: scaleX(-1);
            transform-origin: left center;
          }
          
          .butterfly-1 { top: 25%; left: 30%; animation-delay: 0s; }
          .butterfly-2 { top: 55%; left: 70%; animation-delay: 3s; }
          
          .cloud {
            position: absolute;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50px;
            animation: drift 25s linear infinite;
            box-shadow: 0 2px 10px rgba(255,255,255,0.1);
          }
          
          .cloud-1 {
            top: 12%;
            left: -120px;
            width: 90px;
            height: 35px;
          }
          
          .cloud-2 {
            top: 35%;
            left: -180px;
            width: 110px;
            height: 45px;
            animation-delay: 10s;
          }
          
          .cloud-3 {
            top: 50%;
            left: -150px;
            width: 80px;
            height: 30px;
            animation-delay: 18s;
          }
          
          .grass {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 50px;
            background: linear-gradient(to top, rgba(34, 139, 34, 0.4), transparent);
          }
          
          .bird {
            position: absolute;
            width: 20px;
            height: 8px;
            animation: birdFly 15s linear infinite;
          }
          
          .bird::before,
          .bird::after {
            content: '';
            position: absolute;
            width: 10px;
            height: 2px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 2px;
            animation: wingFlap 0.5s ease-in-out infinite;
          }
          
          .bird::before {
            left: 0;
            transform: rotate(-20deg);
            transform-origin: right center;
          }
          
          .bird::after {
            right: 0;
            transform: rotate(20deg);
            transform-origin: left center;
          }
          
          .bird-1 { top: 18%; left: -30px; animation-delay: 2s; }
          .bird-2 { top: 28%; left: -50px; animation-delay: 8s; }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.05); opacity: 1; }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-15px) rotate(90deg); }
            50% { transform: translateY(-25px) rotate(180deg); }
            75% { transform: translateY(-15px) rotate(270deg); }
          }
          
          @keyframes sway {
            0%, 100% { transform: rotate(-1deg); }
            50% { transform: rotate(2deg); }
          }
          
          @keyframes bloom {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }
          
          @keyframes fly {
            0% { transform: translate(0, 0); }
            25% { transform: translate(50px, -30px); }
            50% { transform: translate(100px, 10px); }
            75% { transform: translate(50px, 40px); }
            100% { transform: translate(0, 0); }
          }
          
          @keyframes flutter {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-15deg); }
          }
          
          @keyframes drift {
            0% { left: -150px; }
            100% { left: 110%; }
          }
          
          @keyframes birdFly {
            0% { left: -50px; }
            100% { left: 110%; }
          }
          
          @keyframes wingFlap {
            0%, 100% { transform: rotate(-20deg); }
            50% { transform: rotate(-40deg); }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;