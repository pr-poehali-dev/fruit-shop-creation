import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface ReferralProgramCardProps {
  show: boolean;
}

export const ReferralProgramCard = ({ show }: ReferralProgramCardProps) => {
  if (!show) return null;

  return (
    <div>
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800 relative overflow-hidden">
        <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
          В разработке
        </div>
        <CardHeader className="pb-3 pr-24">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon name="Users" size={20} className="text-amber-600 dark:text-amber-400" />
            Реферальная программа
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <p className="font-semibold flex items-start gap-2">
              <Icon name="Gift" size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <span>Как это работает:</span>
            </p>
            <ul className="space-y-1.5 text-xs text-muted-foreground ml-6">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">1.</span>
                <span>Поделитесь своей уникальной реферальной ссылкой с друзьями</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">2.</span>
                <span>Друг регистрируется по вашей ссылке в магазине</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">3.</span>
                <span>После первого заказа друга вы получаете <strong className="text-amber-700 dark:text-amber-500">500 ₽</strong> на баланс</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">4.</span>
                <span>Используйте бонусы для оплаты любых заказов</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3 border border-amber-300 dark:border-amber-700">
            <p className="text-xs text-center font-medium text-amber-800 dark:text-amber-200">
              💰 Приглашайте друзей и зарабатывайте по 500 ₽ за каждого!
            </p>
            <p className="text-[10px] text-center text-amber-700 dark:text-amber-300 mt-1">
              Без ограничений по количеству рефералов
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
