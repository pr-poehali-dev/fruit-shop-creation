import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plant } from './types';

interface PlantsTableProps {
  plants: Plant[];
  isLoading: boolean;
  searchQuery: string;
  onEdit: (plant: Plant) => void;
  onDelete: (plantId: number) => void;
}

const PlantsTable = ({ plants, isLoading, searchQuery, onEdit, onDelete }: PlantsTableProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  return (
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
          {plants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'Ничего не найдено' : 'Нет данных. Загрузите PDF или добавьте вручную'}
              </TableCell>
            </TableRow>
          ) : (
            plants.map((plant) => (
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
                      onClick={() => onEdit(plant)}
                    >
                      <Icon name="Pencil" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(plant.id)}
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
  );
};

export default PlantsTable;
