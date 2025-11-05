import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface CourierHeaderProps {
  userName: string;
}

export default function CourierHeader({ userName }: CourierHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Truck" size={28} className="text-green-600" />
          Панель курьера
        </CardTitle>
        <CardDescription>
          Добро пожаловать, {userName}!
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
