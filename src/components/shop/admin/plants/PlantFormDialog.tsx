import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plant, PlantFormData } from './types';

interface PlantFormDialogProps {
  open: boolean;
  editingPlant: Plant | null;
  formData: PlantFormData;
  onOpenChange: (open: boolean) => void;
  onFormChange: (data: PlantFormData) => void;
  onSave: () => void;
  onCancel: () => void;
}

const PlantFormDialog = ({
  open,
  editingPlant,
  formData,
  onOpenChange,
  onFormChange,
  onSave,
  onCancel
}: PlantFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                placeholder="Роза садовая"
              />
            </div>
            <div>
              <Label>Латинское название</Label>
              <Input
                value={formData.latin_name}
                onChange={(e) => onFormChange({ ...formData, latin_name: e.target.value })}
                placeholder="Rosa spp."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Категория</Label>
              <Input
                value={formData.category}
                onChange={(e) => onFormChange({ ...formData, category: e.target.value })}
                placeholder="Цветы"
              />
            </div>
            <div>
              <Label>Поставщик</Label>
              <Input
                value={formData.supplier}
                onChange={(e) => onFormChange({ ...formData, supplier: e.target.value })}
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
                onChange={(e) => onFormChange({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Единица</Label>
              <Input
                value={formData.unit}
                onChange={(e) => onFormChange({ ...formData, unit: e.target.value })}
                placeholder="шт"
              />
            </div>
            <div>
              <Label>Цена (₽)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => onFormChange({ ...formData, price: e.target.value })}
                placeholder="350.00"
              />
            </div>
          </div>

          <div>
            <Label>Местоположение</Label>
            <Input
              value={formData.location}
              onChange={(e) => onFormChange({ ...formData, location: e.target.value })}
              placeholder="Склад А, полка 3"
            />
          </div>

          <div>
            <Label>Примечания</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => onFormChange({ ...formData, notes: e.target.value })}
              placeholder="Дополнительная информация..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Отмена
            </Button>
            <Button onClick={onSave}>
              {editingPlant ? 'Обновить' : 'Добавить'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlantFormDialog;
