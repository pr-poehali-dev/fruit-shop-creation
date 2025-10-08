import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface DeliveryZone {
  id: number;
  zone_name: string;
  delivery_price: string;
  zone_color: string;
}

const API_ZONES = 'https://functions.poehali.dev/8c8e301f-2323-4f3b-85f0-14a3c210e670';

const DeliveryZoneMap = () => {
  const [zones, setZones] = useState<DeliveryZone[]>([]);

  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await fetch(API_ZONES);
        const data = await response.json();
        setZones(data.zones || []);
      } catch (error) {
        console.error('Failed to load zones:', error);
      }
    };
    
    loadZones();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Карта зон доставки — Барнаул</CardTitle>
        <CardDescription>Визуализация зон доставки с ценами</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Легенда зон */}
          <div className="flex flex-wrap gap-4">
            {zones.map((zone) => (
              <div key={zone.id} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: zone.zone_color }}
                />
                <span className="text-sm font-medium">{zone.zone_name}</span>
                <span className="text-sm text-muted-foreground">
                  {parseFloat(zone.delivery_price).toFixed(0)} ₽
                </span>
              </div>
            ))}
          </div>

          {/* SVG карта Барнаула с зонами */}
          <div className="relative w-full aspect-square max-w-2xl mx-auto border rounded-lg overflow-hidden bg-gray-50">
            <svg
              viewBox="0 0 800 800"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Река Обь */}
              <path
                d="M 550 0 Q 570 200 580 400 Q 590 600 600 800"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="40"
                opacity="0.3"
              />
              
              {/* Центральная зона (круг) */}
              {zones[0] && (
                <g>
                  <circle
                    cx="350"
                    cy="400"
                    r="120"
                    fill={zones[0].zone_color}
                    opacity="0.4"
                    stroke={zones[0].zone_color}
                    strokeWidth="3"
                  />
                  <text
                    x="350"
                    y="395"
                    textAnchor="middle"
                    className="font-bold text-2xl"
                    fill={zones[0].zone_color}
                  >
                    {zones[0].zone_name}
                  </text>
                  <text
                    x="350"
                    y="420"
                    textAnchor="middle"
                    className="text-lg"
                    fill={zones[0].zone_color}
                  >
                    {parseFloat(zones[0].delivery_price).toFixed(0)} ₽
                  </text>
                </g>
              )}

              {/* Северная зона */}
              {zones[1] && (
                <g>
                  <path
                    d="M 200 50 L 500 50 L 500 250 Q 425 260 350 280 Q 275 260 200 250 Z"
                    fill={zones[1].zone_color}
                    opacity="0.4"
                    stroke={zones[1].zone_color}
                    strokeWidth="3"
                  />
                  <text
                    x="350"
                    y="145"
                    textAnchor="middle"
                    className="font-bold text-2xl"
                    fill={zones[1].zone_color}
                  >
                    {zones[1].zone_name}
                  </text>
                  <text
                    x="350"
                    y="170"
                    textAnchor="middle"
                    className="text-lg"
                    fill={zones[1].zone_color}
                  >
                    {parseFloat(zones[1].delivery_price).toFixed(0)} ₽
                  </text>
                </g>
              )}

              {/* Южная зона */}
              {zones[2] && (
                <g>
                  <path
                    d="M 200 550 Q 275 540 350 520 Q 425 540 500 550 L 500 750 L 200 750 Z"
                    fill={zones[2].zone_color}
                    opacity="0.4"
                    stroke={zones[2].zone_color}
                    strokeWidth="3"
                  />
                  <text
                    x="350"
                    y="645"
                    textAnchor="middle"
                    className="font-bold text-2xl"
                    fill={zones[2].zone_color}
                  >
                    {zones[2].zone_name}
                  </text>
                  <text
                    x="350"
                    y="670"
                    textAnchor="middle"
                    className="text-lg"
                    fill={zones[2].zone_color}
                  >
                    {parseFloat(zones[2].delivery_price).toFixed(0)} ₽
                  </text>
                </g>
              )}

              {/* Западная зона */}
              {zones[3] && (
                <g>
                  <path
                    d="M 50 250 L 230 280 Q 230 400 230 520 L 50 550 Z"
                    fill={zones[3].zone_color}
                    opacity="0.4"
                    stroke={zones[3].zone_color}
                    strokeWidth="3"
                  />
                  <text
                    x="140"
                    y="395"
                    textAnchor="middle"
                    className="font-bold text-2xl"
                    fill={zones[3].zone_color}
                  >
                    {zones[3].zone_name}
                  </text>
                  <text
                    x="140"
                    y="420"
                    textAnchor="middle"
                    className="text-lg"
                    fill={zones[3].zone_color}
                  >
                    {parseFloat(zones[3].delivery_price).toFixed(0)} ₽
                  </text>
                </g>
              )}

              {/* Восточная зона (за рекой) */}
              {zones[4] && (
                <g>
                  <path
                    d="M 620 200 L 750 200 L 750 600 L 620 600 Z"
                    fill={zones[4].zone_color}
                    opacity="0.4"
                    stroke={zones[4].zone_color}
                    strokeWidth="3"
                  />
                  <text
                    x="685"
                    y="395"
                    textAnchor="middle"
                    className="font-bold text-2xl"
                    fill={zones[4].zone_color}
                  >
                    {zones[4].zone_name}
                  </text>
                  <text
                    x="685"
                    y="420"
                    textAnchor="middle"
                    className="text-lg"
                    fill={zones[4].zone_color}
                  >
                    {parseFloat(zones[4].delivery_price).toFixed(0)} ₽
                  </text>
                </g>
              )}

              {/* Точка центра города */}
              <circle cx="350" cy="400" r="8" fill="#ef4444" stroke="white" strokeWidth="2" />
              <text x="350" y="440" textAnchor="middle" className="text-sm font-semibold" fill="#374151">
                🌳 Питомник
              </text>
            </svg>
          </div>

          <div className="text-sm text-muted-foreground text-center">
            Карта показывает приблизительные зоны доставки. Точная стоимость может варьироваться в зависимости от адреса.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryZoneMap;
