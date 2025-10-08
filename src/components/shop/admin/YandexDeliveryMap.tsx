import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface DeliveryZone {
  id: number;
  zone_name: string;
  delivery_price: string;
  zone_color: string;
}

interface YandexDeliveryMapProps {
  zones: DeliveryZone[];
  nurseryAddress?: string;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

const YandexDeliveryMap = ({ zones, nurseryAddress = 'Барнаул, Спортивная 84' }: YandexDeliveryMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMapScript = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/9b1ac59e-93b6-41de-8974-a7f58d4ffaf9?api_key=yandex_maps');
        const data = await response.json();
        const apiKey = data.api_key;
        
        if (!apiKey) {
          setError('API ключ Яндекс Карт не настроен. Добавьте YANDEX_MAPS_API_KEY в секреты проекта.');
          setIsLoading(false);
          return;
        }

        const existingScript = document.querySelector(`script[src*="api-maps.yandex.ru"]`);
        
        if (!existingScript) {
          const script = document.createElement('script');
          script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
          script.async = true;
          script.onload = () => initMap();
          script.onerror = () => {
            setError('Не удалось загрузить Яндекс Карты');
            setIsLoading(false);
          };
          document.head.appendChild(script);
        } else {
          if (window.ymaps) {
            initMap();
          } else {
            window.addEventListener('load', initMap);
          }
        }
      } catch (err) {
        setError('Не удалось получить API ключ');
        setIsLoading(false);
      }
    };

    loadMapScript();

    return () => {
      if (map) {
        map.destroy();
      }
    };
  }, [nurseryAddress]);

  useEffect(() => {
    if (map && zones.length > 0) {
      updateZones();
    }
  }, [zones, map]);

  const initMap = () => {
    if (!window.ymaps || !mapRef.current) return;

    window.ymaps.ready(() => {
      try {
        window.ymaps.geocode(nurseryAddress, {
          results: 1
        }).then((res: any) => {
          const firstGeoObject = res.geoObjects.get(0);
          const coords = firstGeoObject.geometry.getCoordinates();

          const newMap = new window.ymaps.Map(mapRef.current, {
            center: coords,
            zoom: 12,
            controls: ['zoomControl', 'fullscreenControl']
          });

          const placemark = new window.ymaps.Placemark(coords, {
            balloonContent: `<strong>🌿 Питомник</strong><br>${nurseryAddress}`,
            iconContent: '🌿'
          }, {
            preset: 'islands#greenStretchyIcon'
          });

          newMap.geoObjects.add(placemark);
          setMap(newMap);
          setIsLoading(false);
        }).catch((err: any) => {
          console.error('Geocoding error:', err);
          setError('Не удалось найти адрес на карте');
          setIsLoading(false);
        });
      } catch (err) {
        console.error('Map init error:', err);
        setError('Ошибка инициализации карты');
        setIsLoading(false);
      }
    });
  };

  const updateZones = () => {
    if (!map || !window.ymaps) return;

    map.geoObjects.each((obj: any) => {
      if (obj.properties && obj.properties.get('type') === 'zone') {
        map.geoObjects.remove(obj);
      }
    });

    zones.forEach((zone) => {
      window.ymaps.geocode(`Барнаул ${zone.zone_name}`, {
        results: 1
      }).then((res: any) => {
        const firstGeoObject = res.geoObjects.get(0);
        const coords = firstGeoObject.geometry.getCoordinates();
        const bounds = firstGeoObject.properties.get('boundedBy');

        const circle = new window.ymaps.Circle([coords, 2000], {
          type: 'zone',
          balloonContent: `<strong>${zone.zone_name}</strong><br>Стоимость доставки: ${parseFloat(zone.delivery_price).toFixed(0)} ₽`
        }, {
          fillColor: zone.zone_color || '#FF000066',
          strokeColor: zone.zone_color || '#FF0000',
          strokeOpacity: 0.8,
          strokeWidth: 2,
          fillOpacity: 0.3
        });

        map.geoObjects.add(circle);
      }).catch((err: any) => {
        console.error(`Failed to geocode zone ${zone.zone_name}:`, err);
      });
    });
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Map" size={20} />
            Карта доставки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-200 rounded-lg">
            <Icon name="AlertCircle" size={20} />
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Map" size={20} />
          Карта доставки
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center h-96 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon name="Loader2" size={20} className="animate-spin" />
              <span>Загрузка карты...</span>
            </div>
          </div>
        )}
        
        <div ref={mapRef} className={`h-96 rounded-lg ${isLoading ? 'hidden' : ''}`} />

        {zones.length > 0 && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Icon name="MapPin" size={16} />
              Зоны доставки:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {zones.map((zone) => (
                <div key={zone.id} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: zone.zone_color }}
                  />
                  <span>{zone.zone_name} — {parseFloat(zone.delivery_price).toFixed(0)} ₽</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default YandexDeliveryMap;