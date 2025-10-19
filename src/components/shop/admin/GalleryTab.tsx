import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API_CONTENT = 'https://functions.poehali.dev/56deea36-35f7-4c07-becc-dedeaa3de78d';
const API_UPLOAD = 'https://functions.poehali.dev/84f6df49-00f5-43fd-b66e-f0f01f32e21d';

interface GalleryImage {
  id: number;
  image_url: string;
  title: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

const GalleryTab = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const loadImages = async () => {
    try {
      const response = await fetch(`${API_CONTENT}?resource=gallery&include_inactive=true`);
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить галерею',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(API_UPLOAD, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.url) {
        setEditImageUrl(data.url);
        toast({ title: 'Успешно', description: 'Изображение загружено' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить изображение', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (image?: GalleryImage) => {
    if (!editTitle.trim() || !editImageUrl.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название и загрузите изображение',
        variant: 'destructive'
      });
      return;
    }

    try {
      const url = API_CONTENT + '?resource=gallery';
      const method = image ? 'PUT' : 'POST';
      const body = image
        ? { id: image.id, image_url: editImageUrl, title: editTitle, description: editDescription, sort_order: image.sort_order, is_active: image.is_active }
        : { image_url: editImageUrl, title: editTitle, description: editDescription, sort_order: images.length + 1 };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: image ? 'Изображение обновлено' : 'Изображение добавлено' });
        setEditingId(null);
        setIsAdding(false);
        setEditTitle('');
        setEditDescription('');
        setEditImageUrl('');
        loadImages();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить это изображение из галереи?')) return;

    try {
      const response = await fetch(`${API_CONTENT}?resource=gallery`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: 'Изображение удалено' });
        loadImages();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить', variant: 'destructive' });
    }
  };

  const startEdit = (image: GalleryImage) => {
    setEditingId(image.id);
    setEditTitle(image.title);
    setEditDescription(image.description);
    setEditImageUrl(image.image_url);
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
    setEditImageUrl('');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Управление галереей</h3>
          <p className="text-sm text-muted-foreground">Добавляйте и редактируйте фотографии галереи</p>
        </div>
        <Button onClick={startAdd}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить фото
        </Button>
      </div>

      {isAdding && (
        <Card className="p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">Загрузить изображение</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={isUploading}
            />
            {isUploading && <p className="text-sm text-muted-foreground mt-1">Загрузка...</p>}
            {editImageUrl && (
              <img src={editImageUrl} alt="Preview" className="mt-2 h-32 object-cover rounded" />
            )}
          </div>
          <Input
            placeholder="Название"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <Textarea
            placeholder="Описание"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={2}
          />
          <div className="flex gap-2">
            <Button onClick={() => handleSave()} disabled={!editImageUrl}>Сохранить</Button>
            <Button variant="outline" onClick={() => { setIsAdding(false); setEditTitle(''); setEditDescription(''); setEditImageUrl(''); }}>
              Отмена
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            {editingId === image.id ? (
              <div className="p-4 space-y-3">
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={isUploading}
                  />
                  {editImageUrl && (
                    <img src={editImageUrl} alt="Preview" className="mt-2 h-32 w-full object-cover rounded" />
                  )}
                </div>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Название"
                />
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Описание"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSave(image)}>Сохранить</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Отмена</Button>
                </div>
              </div>
            ) : (
              <>
                <img src={image.image_url} alt={image.title} className="w-full h-48 object-cover" />
                <div className="p-3">
                  <h4 className="font-medium text-sm mb-1">{image.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{image.description}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(image)}>
                      <Icon name="Pencil" size={14} className="mr-1" />
                      Изменить
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(image.id)}>
                      <Icon name="Trash2" size={14} className="mr-1" />
                      Удалить
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GalleryTab;
