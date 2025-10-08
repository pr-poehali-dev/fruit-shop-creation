import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API_ZONES = 'https://functions.poehali.dev/8c8e301f-2323-4f3b-85f0-14a3c210e670';

interface DeliveryZone {
  id: number;
  zone_name: string;
  delivery_price: string;
  is_active: boolean;
}

const DeliveryZonesTab = () => {
  const { toast } = useToast();
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(false);
  const [newZone, setNewZone] = useState({ zone_name: '', delivery_price: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadZones = async () => {
    try {
      const response = await fetch(API_ZONES);
      const data = await response.json();
      setZones(data.zones || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить зоны доставки',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(API_ZONES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zone_name: newZone.zone_name,
          delivery_price: parseFloat(newZone.delivery_price)
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Зона доставки добавлена'
        });
        setNewZone({ zone_name: '', delivery_price: '' });
        loadZones();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить зону',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateZone = async (zone: DeliveryZone) => {
    setLoading(true);

    try {
      const response = await fetch(API_ZONES, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: zone.id,
          zone_name: zone.zone_name,
          delivery_price: parseFloat(zone.delivery_price)
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Зона доставки обновлена'
        });
        setEditingId(null);
        loadZones();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить зону',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteZone = async (id: number) => {
    if (!confirm('Удалить эту зону доставки?')) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_ZONES}?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Зона доставки удалена'
        });
        loadZones();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить зону',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Добавить зону доставки</CardTitle>
          <CardDescription>Создайте новую зону с указанием стоимости доставки</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddZone} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zone-name">Название зоны</Label>
                <Input
                  id="zone-name"
                  placeholder="Например: Центр, Север, Юг"
                  value={newZone.zone_name}
                  onChange={(e) => setNewZone({ ...newZone, zone_name: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="zone-price">Стоимость доставки (₽)</Label>
                <Input
                  id="zone-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="300"
                  value={newZone.delivery_price}
                  onChange={(e) => setNewZone({ ...newZone, delivery_price: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить зону
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Существующие зоны доставки</CardTitle>
          <CardDescription>Управление зонами и ценами доставки</CardDescription>
        </CardHeader>
        <CardContent>
          {zones.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Зоны доставки не созданы. Добавьте первую зону выше.
            </p>
          ) : (
            <div className="space-y-3">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  {editingId === zone.id ? (
                    <>
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <Input
                          value={zone.zone_name}
                          onChange={(e) =>
                            setZones(zones.map((z) =>
                              z.id === zone.id ? { ...z, zone_name: e.target.value } : z
                            ))
                          }
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={zone.delivery_price}
                          onChange={(e) =>
                            setZones(zones.map((z) =>
                              z.id === zone.id ? { ...z, delivery_price: e.target.value } : z
                            ))
                          }
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateZone(zone)}
                        disabled={loading}
                      >
                        <Icon name="Check" size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          loadZones();
                        }}
                        disabled={loading}
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="font-semibold">{zone.zone_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {parseFloat(zone.delivery_price).toFixed(2)} ₽
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(zone.id)}
                        disabled={loading}
                      >
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteZone(zone.id)}
                        disabled={loading}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryZonesTab;
