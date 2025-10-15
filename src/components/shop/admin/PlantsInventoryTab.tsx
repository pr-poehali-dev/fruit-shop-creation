import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Plant {
  id: number;
  name: string;
  latin_name?: string;
  category?: string;
  quantity: number;
  unit: string;
  price?: number;
  supplier?: string;
  location?: string;
  notes?: string;
  pdf_source?: string;
  created_at?: string;
}

const API_PLANTS = 'https://functions.poehali.dev/ff57c64d-2ef3-40a0-b0ef-d3ecc109a1fa';

const PlantsInventoryTab = () => {
  const { toast } = useToast();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    latin_name: '',
    category: '',
    quantity: 0,
    unit: 'шт',
    price: '',
    supplier: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    loadPlants();
  }, []);

  useEffect(() => {
    if (editingPlant) {
      setFormData({
        name: editingPlant.name || '',
        latin_name: editingPlant.latin_name || '',
        category: editingPlant.category || '',
        quantity: editingPlant.quantity || 0,
        unit: editingPlant.unit || 'шт',
        price: editingPlant.price?.toString() || '',
        supplier: editingPlant.supplier || '',
        location: editingPlant.location || '',
        notes: editingPlant.notes || ''
      });
      setShowAddDialog(true);
    }
  }, [editingPlant]);

  const loadPlants = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_PLANTS);
      const data = await response.json();
      setPlants(data.plants || []);
    } catch (error) {
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить список растений',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Неверный формат',
        description: 'Загрузите PDF файл',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const base64Data = base64.split(',')[1];

      try {
        const response = await fetch(API_PLANTS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'upload_pdf',
            pdf_file: base64Data,
            pdf_name: file.name
          })
        });

        const data = await response.json();
        console.log('PDF upload response:', data);

        if (data.success) {
          toast({
            title: 'Успешно загружено',
            description: data.message
          });
          loadPlants();
        } else {
          throw new Error(data.error || 'Неизвестная ошибка сервера');
        }
      } catch (error) {
        console.error('PDF upload error:', error);
        toast({
          title: 'Ошибка загрузки PDF',
          description: error instanceof Error ? error.message : 'Неизвестная ошибка',
          variant: 'destructive'
        });
      } finally {
        setIsUploading(false);
        e.target.value = '';
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSavePlant = async () => {
    if (!formData.name) {
      toast({
        title: 'Ошибка',
        description: 'Введите название растения',
        variant: 'destructive'
      });
      return;
    }

    const action = editingPlant ? 'update' : 'add';
    const payload: any = {
      action,
      plant: {
        name: formData.name,
        latin_name: formData.latin_name || null,
        category: formData.category || null,
        quantity: formData.quantity,
        unit: formData.unit,
        price: formData.price ? parseFloat(formData.price) : null,
        supplier: formData.supplier || null,
        location: formData.location || null,
        notes: formData.notes || null
      }
    };

    if (editingPlant) {
      payload.id = editingPlant.id;
    }

    try {
      const response = await fetch(API_PLANTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: editingPlant ? 'Обновлено' : 'Добавлено',
          description: `Растение ${editingPlant ? 'обновлено' : 'добавлено'} в учёт`
        });
        loadPlants();
        setShowAddDialog(false);
        setEditingPlant(null);
        resetForm();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить растение',
        variant: 'destructive'
      });
    }
  };

  const handleDeletePlant = async (plantId: number) => {
    if (!confirm('Удалить это растение из учёта?')) return;

    try {
      const response = await fetch(API_PLANTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          id: plantId
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Удалено',
          description: 'Растение удалено из учёта'
        });
        loadPlants();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить растение',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      latin_name: '',
      category: '',
      quantity: 0,
      unit: 'шт',
      price: '',
      supplier: '',
      location: '',
      notes: ''
    });
  };

  const filteredPlants = plants.filter(plant =>
    plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plant.latin_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plant.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPlants = plants.length;
  const totalQuantity = plants.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const totalValue = plants.reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 0)), 0);

  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Учёт растений</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => {
                  setEditingPlant(null);
                  resetForm();
                  setShowAddDialog(true);
                }}
                className="flex-1 sm:flex-none"
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить вручную
              </Button>
              <label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <Button variant="outline" disabled={isUploading} asChild>
                  <span className="cursor-pointer">
                    <Icon name="Upload" size={16} className="mr-2" />
                    {isUploading ? 'Загрузка...' : 'Загрузить PDF'}
                  </span>
                </Button>
              </label>
            </div>
          </div>
          <div className="mt-4">
            <Input
              placeholder="Поиск по названию, латинскому названию или категории..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Латинское название</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Количество</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Поставщик</TableHead>
                    <TableHead>Местоположение</TableHead>
                    <TableHead>Источник</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? 'Ничего не найдено' : 'Нет данных. Загрузите PDF или добавьте вручную'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPlants.map((plant) => (
                      <TableRow key={plant.id}>
                        <TableCell className="font-medium">{plant.name}</TableCell>
                        <TableCell className="text-muted-foreground italic">{plant.latin_name || '—'}</TableCell>
                        <TableCell>{plant.category || '—'}</TableCell>
                        <TableCell>{plant.quantity} {plant.unit}</TableCell>
                        <TableCell>{plant.price ? `${plant.price} ₽` : '—'}</TableCell>
                        <TableCell>{plant.supplier || '—'}</TableCell>
                        <TableCell>{plant.location || '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{plant.pdf_source || 'Вручную'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingPlant(plant)}
                            >
                              <Icon name="Pencil" size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePlant(plant.id)}
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) {
          setEditingPlant(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlant ? 'Редактировать растение' : 'Добавить растение'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Название *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Роза садовая"
                />
              </div>
              <div>
                <Label>Латинское название</Label>
                <Input
                  value={formData.latin_name}
                  onChange={(e) => setFormData({ ...formData, latin_name: e.target.value })}
                  placeholder="Rosa spp."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Категория</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Цветы"
                />
              </div>
              <div>
                <Label>Поставщик</Label>
                <Input
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="ООО Растения"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Количество</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Единица</Label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="шт"
                />
              </div>
              <div>
                <Label>Цена (₽)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="350.00"
                />
              </div>
            </div>

            <div>
              <Label>Местоположение</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Склад А, полка 3"
              />
            </div>

            <div>
              <Label>Примечания</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Дополнительная информация..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingPlant(null);
                  resetForm();
                }}
              >
                Отмена
              </Button>
              <Button onClick={handleSavePlant}>
                {editingPlant ? 'Обновить' : 'Добавить'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlantsInventoryTab;