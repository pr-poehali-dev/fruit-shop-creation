import { Card, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';

interface EarningsStats {
  total_deliveries: number;
  total_earned: number;
  paid_out: number;
  pending: number;
}

interface CourierStatsProps {
  stats: EarningsStats;
}

export default function CourierStats({ stats }: CourierStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Всего доставок</CardDescription>
          <CardTitle className="text-3xl">{stats.total_deliveries}</CardTitle>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Заработано</CardDescription>
          <CardTitle className="text-3xl text-green-600">{stats.total_earned}₽</CardTitle>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>К выплате</CardDescription>
          <CardTitle className="text-3xl text-orange-600">{stats.pending}₽</CardTitle>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Выплачено</CardDescription>
          <CardTitle className="text-3xl text-gray-600">{stats.paid_out}₽</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
