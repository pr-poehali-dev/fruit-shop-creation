# Система загрузки изображений

## Обзор

Проект использует собственную систему загрузки изображений с автоматической оптимизацией на стороне сервера.

## Возможности

- ✅ Загрузка изображений любого размера
- ✅ Автоматическая оптимизация (resize + качество)
- ✅ Поддержка drag & drop
- ✅ Конвертация RGBA/PNG в JPEG
- ✅ Сохранение в Yandex Cloud Storage
- ✅ Превью перед сохранением
- ✅ Индикатор загрузки

## Backend API

**Эндпоинт:** `https://functions.poehali.dev/44df414c-694f-4079-aa96-764afeaf23e3`

### Запрос

```json
POST /
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,...",
  "max_width": 1920,
  "max_height": 1920,
  "quality": 85
}
```

### Ответ

```json
{
  "success": true,
  "url": "https://storage.yandexcloud.net/poehali-uploads/products/uuid.jpg",
  "optimized_size": "1920x1080"
}
```

## Использование компонента ImageUploader

### Базовое использование

```tsx
import ImageUploader from '@/components/ImageUploader';

function MyComponent() {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <ImageUploader
      onImageUploaded={setImageUrl}
      currentImageUrl={imageUrl}
    />
  );
}
```

### С кастомными параметрами

```tsx
<ImageUploader
  onImageUploaded={handleImageUpload}
  currentImageUrl={product.image_url}
  maxWidth={2560}
  maxHeight={1440}
  quality={90}
  showPreview={true}
  className="my-4"
/>
```

## Props компонента ImageUploader

| Prop | Тип | Default | Описание |
|------|-----|---------|----------|
| `onImageUploaded` | `(url: string) => void` | required | Callback с URL загруженного изображения |
| `currentImageUrl` | `string` | `''` | Текущий URL изображения для превью |
| `maxWidth` | `number` | `1920` | Максимальная ширина оптимизации |
| `maxHeight` | `number` | `1920` | Максимальная высота оптимизации |
| `quality` | `number` | `85` | Качество JPEG (0-100) |
| `className` | `string` | `''` | Дополнительные CSS классы |
| `showPreview` | `boolean` | `true` | Показывать превью загруженного изображения |

## Особенности оптимизации

1. **Конвертация форматов**
   - PNG с прозрачностью → JPEG с белым фоном
   - RGBA/LA → RGB
   - Поддержка EXIF ориентации

2. **Resize алгоритм**
   - Используется `Image.Resampling.LANCZOS` для высокого качества
   - Сохраняются пропорции
   - Изображения меньше лимитов не изменяются

3. **Оптимизация размера**
   - JPEG optimize=True
   - Настраиваемое качество
   - Обычно уменьшение на 60-80% без потери визуального качества

## Примеры использования

### Галерея (GalleryTab)

```tsx
<ImageUploader
  onImageUploaded={setEditImageUrl}
  currentImageUrl={editImageUrl}
  maxWidth={1920}
  maxHeight={1920}
  quality={85}
  showPreview={true}
/>
```

### Товары (будущая интеграция)

```tsx
<ImageUploader
  onImageUploaded={(url) => setProduct({ ...product, image_url: url })}
  currentImageUrl={product.image_url}
  maxWidth={800}
  maxHeight={800}
  quality={80}
/>
```

### Аватары пользователей (будущая интеграция)

```tsx
<ImageUploader
  onImageUploaded={handleAvatarUpload}
  currentImageUrl={user.avatar_url}
  maxWidth={400}
  maxHeight={400}
  quality={90}
  className="rounded-full overflow-hidden"
/>
```

## Технические детали

### Ограничения

- **Максимальный размер файла:** Ограничен только памятью Lambda (обычно до 10MB комфортно)
- **Форматы:** JPEG, PNG, WebP, GIF (конвертируются в JPEG)
- **Время загрузки:** 2-5 секунд для больших изображений

### Безопасность

- Валидация типа файла на клиенте
- PIL проверяет валидность изображения на сервере
- Генерация уникальных UUID имен
- Публичный доступ к загруженным файлам (S3 ACL: public-read)

### Хранилище

- **Провайдер:** Yandex Cloud Storage (S3-compatible)
- **Bucket:** `poehali-uploads`
- **Путь:** `products/{uuid}.jpg`
- **CDN:** Прямой доступ через storage.yandexcloud.net

## Troubleshooting

### Ошибка "Invalid image format"
- Проверьте, что файл действительно является изображением
- Попробуйте конвертировать через другой редактор

### Ошибка "Upload failed"
- Проверьте S3 credentials (S3_ACCESS_KEY, S3_SECRET_KEY)
- Убедитесь, что bucket существует и доступен

### Медленная загрузка
- Уменьшите `quality` параметр (70-80)
- Уменьшите `max_width`/`max_height`
- Оптимизируйте изображение перед загрузкой

## Roadmap

- [ ] Поддержка множественной загрузки
- [ ] Crop перед загрузкой
- [ ] Водяные знаки
- [ ] WebP вместо JPEG
- [ ] CDN интеграция
- [ ] Прогресс бар для больших файлов
