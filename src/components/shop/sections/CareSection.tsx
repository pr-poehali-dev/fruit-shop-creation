import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface CareSectionProps {
  siteSettings?: any;
}

const CareSection = ({ siteSettings }: CareSectionProps) => {
  return (
    <div className="max-w-3xl mx-auto px-2">
      <h2 className="text-2xl sm:text-4xl font-display font-bold mb-4 sm:mb-6">
        {siteSettings?.care_title || 'Уход за растениями'}
      </h2>
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Droplets" size={24} />
              {siteSettings?.care_watering_title || 'Полив'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base whitespace-pre-line">
              {siteSettings?.care_watering_text || 'Регулярный полив особенно важен в первый год после посадки. Летом поливайте растения обильно, но не допускайте застоя воды.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Sun" size={24} />
              {siteSettings?.care_lighting_title || 'Освещение'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base whitespace-pre-line">
              {siteSettings?.care_lighting_text || 'Большинство плодовых культур предпочитают солнечные места. Декоративные растения могут расти в полутени.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Scissors" size={24} />
              {siteSettings?.care_pruning_title || 'Обрезка'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base whitespace-pre-line">
              {siteSettings?.care_pruning_text || 'Регулярная обрезка помогает формировать крону и стимулирует рост. Проводите обрезку ранней весной или поздней осенью.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CareSection;