import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const CareSection = () => {
  return (
    <div className="max-w-3xl mx-auto px-2">
      <h2 className="text-2xl sm:text-4xl font-display font-bold mb-4 sm:mb-6">Уход за растениями</h2>
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Droplets" size={24} />
              Полив
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base">Регулярный полив особенно важен в первый год после посадки. Летом поливайте растения обильно, но не допускайте застоя воды.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Sun" size={24} />
              Освещение
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base">Большинство плодовых культур предпочитают солнечные места. Декоративные растения могут расти в полутени.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Scissors" size={24} />
              Обрезка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base">Регулярная обрезка помогает формировать крону и стимулирует рост. Проводите обрезку ранней весной или поздней осенью.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CareSection;