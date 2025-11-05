import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="ShieldAlert" size={24} className="text-red-500" />
            Доступ запрещён
          </CardTitle>
          <CardDescription>
            У вас нет прав курьера. Обратитесь к администратору.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
