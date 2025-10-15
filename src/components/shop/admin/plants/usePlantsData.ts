import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Plant, PlantFormData, API_PLANTS, API_UPLOAD_PDF } from './types';

export const usePlantsData = () => {
  const { toast } = useToast();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: 'Файл слишком большой',
        description: `Максимальный размер файла: ${maxSizeMB}MB. Попробуйте сжать PDF или разбить на части.`,
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const reader = new FileReader();
    
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 50);
        setUploadProgress(progress);
      }
    };
    
    reader.onload = async () => {
      try {
        setUploadProgress(50);
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        
        console.log('Uploading PDF:', file.name, 'Size:', Math.round(base64Data.length / 1024), 'KB');
        setUploadProgress(60);
        
        const response = await fetch(API_UPLOAD_PDF, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: base64Data
          })
        });

        setUploadProgress(80);
        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error:', errorText);
          throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const data = await response.json();
        setUploadProgress(90);
        console.log('PDF upload response:', data);

        if (data.plants && data.plants.length > 0) {
          for (const plantData of data.plants) {
            const saveResponse = await fetch(API_PLANTS, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'add',
                plant: {
                  name: plantData.name,
                  latin_name: plantData.latin_name || '',
                  category: plantData.category || '',
                  quantity: plantData.stock || 0,
                  unit: 'шт',
                  price: plantData.price || 0,
                  supplier: '',
                  location: '',
                  notes: `Размер: ${plantData.size || 'не указан'}`,
                  pdf_source: file.name
                }
              })
            });

            if (!saveResponse.ok) {
              console.error('Failed to save plant:', plantData.name);
            }
          }

          setUploadProgress(100);
          toast({
            title: 'Успешно загружено',
            description: `Добавлено растений: ${data.plants.length}`
          });
          await loadPlants();
        } else {
          throw new Error('В PDF не найдено данных о растениях');
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
        setUploadProgress(0);
        if (e.target) e.target.value = '';
      }
    };
    
    reader.onerror = () => {
      toast({
        title: 'Ошибка чтения файла',
        description: 'Не удалось прочитать PDF файл',
        variant: 'destructive'
      });
      setIsUploading(false);
      setUploadProgress(0);
      if (e.target) e.target.value = '';
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
    uploadProgress,
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