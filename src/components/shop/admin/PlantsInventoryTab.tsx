import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import PlantsStatsCards from './plants/PlantsStatsCards';
import PlantsTable from './plants/PlantsTable';
import PlantFormDialog from './plants/PlantFormDialog';
import { usePlantsData } from './plants/usePlantsData';

const PlantsInventoryTab = () => {
  const {
    plants,
    filteredPlants,
    isLoading,
    isUploading,
    showAddDialog,
    editingPlant,
    searchQuery,
    formData,
    setShowAddDialog,
    setEditingPlant,
    setSearchQuery,
    setFormData,
    handleFileUpload,
    handleSavePlant,
    handleDeletePlant,
    resetForm
  } = usePlantsData();

  return (
    <div className="space-y-6">
      <PlantsStatsCards plants={plants} />

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
          <PlantsTable
            plants={filteredPlants}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onEdit={setEditingPlant}
            onDelete={handleDeletePlant}
          />
        </CardContent>
      </Card>

      <PlantFormDialog
        open={showAddDialog}
        editingPlant={editingPlant}
        formData={formData}
        onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) {
            setEditingPlant(null);
            resetForm();
          }
        }}
        onFormChange={setFormData}
        onSave={handleSavePlant}
        onCancel={() => {
          setShowAddDialog(false);
          setEditingPlant(null);
          resetForm();
        }}
      />
    </div>
  );
};

export default PlantsInventoryTab;
