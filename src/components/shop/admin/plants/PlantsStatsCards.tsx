import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plant } from './types';

interface PlantsStatsCardsProps {
  plants: Plant[];
}

const PlantsStatsCards = ({ plants }: PlantsStatsCardsProps) => {
  const totalPlants = plants.length;
  const totalQuantity = plants.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const totalValue = plants.reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 0)), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Всего видов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPlants}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Всего единиц</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalQuantity}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Общая стоимость</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalValue.toFixed(2)} ₽</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlantsStatsCards;
