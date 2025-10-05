import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface OrdersStatsCardProps {
  orders: any[];
}

const OrdersStatsCard = ({ orders }: OrdersStatsCardProps) => {
  const [ratingsData, setRatingsData] = useState<any[]>([]);

  useEffect(() => {
    const fetchRatings = async () => {
      const orderRatings = await Promise.all(
        orders.map(async (order) => {
          try {
            const response = await fetch(
              `https://functions.poehali.dev/91674d2e-1306-4ae6-9c23-ab0938e8ce5c?entity_type=order&entity_id=${order.id}`,
              {
                headers: {
                  'X-User-Id': order.user_id?.toString() || '1',
                },
              }
            );
            if (response.ok) {
              const data = await response.json();
              return { ...order, ratingsStats: data };
            }
          } catch (error) {
            console.error('Failed to fetch rating:', error);
          }
          return { ...order, ratingsStats: null };
        })
      );
      setRatingsData(orderRatings);
    };

    if (orders.length > 0) {
      fetchRatings();
    }
  }, [orders]);

  const allRatings = ratingsData.reduce((acc, order) => {
    if (order.ratingsStats && order.ratingsStats.total_ratings > 0) {
      for (let i = 1; i <= 5; i++) {
        acc.push(...Array(order.ratingsStats[`rating_${i}`] || 0).fill(i));
      }
    }
    return acc;
  }, []);

  const avgRating = allRatings.length > 0
    ? (allRatings.reduce((sum: number, r: number) => sum + r, 0) / allRatings.length).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = allRatings.filter((r: number) => r === star).length;
    return {
      star,
      count,
      percentage: allRatings.length > 0 
        ? Math.round((count / allRatings.length) * 100)
        : 0
    };
  });

  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const waitingRating = deliveredOrders.filter(o => {
    const orderRating = ratingsData.find(r => r.id === o.id);
    return !orderRating?.ratingsStats || orderRating.ratingsStats.total_ratings === 0;
  });

  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;

  const ordersWithComments = ratingsData.filter(o => {
    if (!o.ratingsStats || o.ratingsStats.total_ratings === 0) return false;
    
    return fetch(
      `https://functions.poehali.dev/91674d2e-1306-4ae6-9c23-ab0938e8ce5c?entity_type=order&entity_id=${o.id}`,
      {
        headers: { 'X-User-Id': o.user_id?.toString() || '1' },
      }
    ).then(r => r.json()).then(data => data.comment).catch(() => null);
  });

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="ShoppingBag" size={20} />
          Статистика оценок заказов
        </CardTitle>
        <CardDescription>Оценки качества обслуживания клиентов</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600">{totalOrders}</div>
            <div className="text-xs text-muted-foreground">Всего заказов</div>
          </div>
          
          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-600">{completedOrders}</div>
            <div className="text-xs text-muted-foreground">Доставлено</div>
          </div>
          
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-yellow-600">{avgRating}</span>
              <Icon name="Star" size={18} className="text-yellow-500 fill-yellow-500" />
            </div>
            <div className="text-xs text-muted-foreground">
              Средняя оценка {allRatings.length > 0 && `(${allRatings.length} оценок)`}
            </div>
          </div>
          
          <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="text-2xl font-bold text-orange-600">{waitingRating.length}</div>
            <div className="text-xs text-muted-foreground">
              Ждут оценки
              {waitingRating.length > 0 && (
                <div className="text-xs text-orange-600 mt-1">
                  Клиенты увидят запрос
                </div>
              )}
            </div>
          </div>
        </div>

        {allRatings.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Icon name="Star" size={16} />
              Распределение оценок
            </h4>
            <div className="space-y-2">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{star}</span>
                    <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-16 text-sm text-right">
                    <span className="font-medium">{count}</span>
                    <span className="text-muted-foreground ml-1">({percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {allRatings.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Icon name="TrendingUp" size={16} />
              Анализ качества обслуживания
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Положительные (4-5★)</span>
                  <span className="font-bold text-green-600">
                    {Math.round(
                      (allRatings.filter((r: number) => r >= 4).length / allRatings.length) * 100
                    )}%
                  </span>
                </div>
              </div>
              
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Негативные (1-2★)</span>
                  <span className="font-bold text-red-600">
                    {Math.round(
                      (allRatings.filter((r: number) => r <= 2).length / allRatings.length) * 100
                    )}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {ratingsData.filter(o => o.ratingsStats?.total_ratings > 0).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Icon name="Package" size={16} />
              Оценённые заказы ({ratingsData.filter(o => o.ratingsStats?.total_ratings > 0).length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {ratingsData
                .filter(o => o.ratingsStats?.total_ratings > 0)
                .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
                .slice(0, 10)
                .map((order) => (
                  <div key={order.id} className="p-3 bg-muted rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Заказ #{order.id}
                        </Badge>
                        <div className="flex items-center gap-0.5">
                          <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">
                            {order.ratingsStats.average_rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {order.user_name || `ID: ${order.user_id}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Сумма: {order.total_amount} ₽</span>
                      <span>{order.ratingsStats.total_ratings} {order.ratingsStats.total_ratings === 1 ? 'оценка' : 'оценок'}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersStatsCard;
