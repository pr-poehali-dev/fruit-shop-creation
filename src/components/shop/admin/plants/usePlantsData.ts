import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Plant, PlantFormData, API_PLANTS } from './types';

export const usePlantsData = () => {
  const { toast } = useToast();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<PlantFormData>({
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      console.log('Loading plants from:', API_PLANTS);
      const response = await fetch(API_PLANTS);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Plants data:', data);
      setPlants(data.plants || []);
    } catch (error) {
      console.error('Load plants error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить список растений';
      toast({
        title: 'Ошибка загрузки',
        description: errorMessage,
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
        console.log('Uploading PDF:', file.name, 'Size:', Math.round(base64Data.length / 1024), 'KB');
        
        const response = await fetch(API_PLANTS, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'upload_pdf',
            pdf_file: base64Data,
            pdf_name: file.name
          })
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error:', errorText);
          throw new Error(`Ошибка сервера: ${response.status}`);
        }

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

    reader.onerror = () => {
      toast({
        title: 'Ошибка чтения файла',
        description: 'Не удалось прочитать PDF файл',
        variant: 'destructive'
      });
      setIsUploading(false);
      e.target.value = '';
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

  return {
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
  };
};