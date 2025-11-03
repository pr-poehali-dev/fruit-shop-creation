# Система логирования действий пользователей

## Обзор
Система автоматически логирует все действия пользователей в базу данных для последующего анализа в админ-панели.

## Что логируется

### Навигация и просмотры
- ✅ Переход между разделами сайта (home, catalog, cart, profile и т.д.)
- ✅ Просмотр деталей товара
- ✅ Клики по кнопкам

### Действия с товарами
- ✅ Добавление товара в корзину (с ценой и вариантом)
- ✅ Удаление товара из корзины
- ✅ Добавление/удаление из избранного

### Финансовые операции
- ✅ Пополнение баланса (сумма, метод)
- ✅ Списание баланса (сумма, причина)
- ✅ Обмен кэшбэка на баланс
- ✅ Покупка карты лояльности

### Заказы
- ✅ Создание заказа (сумма, количество товаров)
- ✅ Отмена заказа
- ✅ Оплата второй части предзаказа
- ✅ Оплата доставки

### Аутентификация
- ✅ Вход в систему
- ✅ Выход из системы

### Другое
- ✅ Обновление профиля
- ✅ Отправка сообщений в поддержку
- ✅ Оставление отзывов

## Как использовать

### 1. Импорт хука
```typescript
import { useUserActivityLogger } from '@/hooks/useUserActivityLogger';
```

### 2. Инициализация в компоненте
```typescript
const logger = useUserActivityLogger({ 
  userId: user?.id, 
  isAuthenticated: !!user 
});
```

### 3. Логирование действий

#### Просмотр страницы
```typescript
logger.logPageView('catalog');
```

#### Просмотр товара
```typescript
logger.logProductView(product.id, product.name);
```

#### Добавление в корзину
```typescript
logger.logAddToCart(
  product.id, 
  product.name, 
  variantId, 
  price
);
```

#### Удаление из корзины
```typescript
logger.logRemoveFromCart(product.id, product.name);
```

#### Избранное
```typescript
logger.logToggleFavorite(product.id, product.name, true); // добавление
logger.logToggleFavorite(product.id, product.name, false); // удаление
```

#### Пополнение баланса
```typescript
logger.logBalanceTopUp(amount, 'card', transactionId);
```

#### Списание баланса
```typescript
logger.logBalanceDeduct(amount, 'order_payment', orderId);
```

#### Создание заказа
```typescript
logger.logOrderCreate(orderId, totalAmount, itemsCount);
```

#### Отмена заказа
```typescript
logger.logOrderCancel(orderId);
```

#### Оплата предзаказа
```typescript
logger.logPreorderPayment(orderId, amount);
```

#### Оплата доставки
```typescript
logger.logDeliveryPayment(orderId, amount);
```

#### Обмен кэшбэка
```typescript
logger.logCashbackExchange(cashbackAmount, balanceAmount);
```

#### Покупка карты лояльности
```typescript
logger.logLoyaltyCardPurchase('Gold', 500);
```

#### Клик по кнопке
```typescript
logger.logButtonClick('checkout', 'cart_page');
```

## Где интегрировано

Логирование автоматически работает в следующих компонентах:

✅ **src/pages/Index.tsx**
- Переход между разделами
- Просмотр деталей товара
- Добавление в корзину
- Удаление из корзины (через useCart)
- Добавление/удаление избранного

✅ **src/hooks/useAuth.ts**
- Вход в систему
- Регистрация
- Выход из системы

✅ **src/hooks/useCart.ts**
- Удаление товаров из корзины (при quantity = 0)

✅ **src/components/shop/hooks/useCheckout.ts**
- Создание заказа

✅ **src/components/shop/LoyaltyCard.tsx**
- Покупка карты лояльности
- Разблокировка карты за покупки

✅ **src/components/shop/CashbackExchange.tsx**
- Обмен кэшбэка на баланс

✅ **src/components/shop/profile/OrdersTab.tsx**
- Отмена заказа

✅ **src/components/shop/profile/DeliveryPaymentDialog.tsx**
- Оплата доставки

✅ **src/components/shop/profile/SecondPaymentDialog.tsx**
- Оплата второй части предзаказа

✅ **src/components/shop/profile/ProfileHeader.tsx**
- Обновление аватара профиля

✅ **src/components/shop/profile/SettingsTab.tsx**
- Смена темы

## Просмотр логов

Логи доступны в админ-панели:
1. Откройте админ-панель
2. Перейдите на вкладку "Логи"
3. Переключитесь на "Пользователи"
4. Используйте фильтры для поиска нужных действий

### Доступные фильтры
- Все действия
- Пополнение баланса
- Списание баланса  
- Создание заказов
- Просмотры товаров
- Добавление в корзину
- Входы в систему

### Информация в логах
Каждый лог содержит:
- **Пользователь**: имя и телефон
- **Действие**: тип и описание
- **Дата и время**: когда произошло
- **Сущность**: связанный объект (товар, заказ и т.д.)
- **Метаданные**: дополнительная информация (суммы, ID и т.д.)
- **IP адрес**: откуда было выполнено действие
- **User Agent**: браузер и устройство

## Структура базы данных

Таблица `user_logs`:
```sql
- id: integer PRIMARY KEY
- user_id: integer (ссылка на users)
- action_type: varchar(50) (тип действия)
- action_description: text (описание)
- target_entity_type: varchar(50) (тип сущности: product, order, etc)
- target_entity_id: integer (ID сущности)
- metadata: jsonb (дополнительные данные)
- ip_address: varchar(45) (IP пользователя)
- user_agent: text (браузер и устройство)
- created_at: timestamp (время создания)
```

## Типы действий

```typescript
ActivityTypes = {
  PAGE_VIEW: 'page_view',
  BUTTON_CLICK: 'button_click',
  PRODUCT_VIEW: 'product_view',
  PRODUCT_ADD_TO_CART: 'product_add_to_cart',
  PRODUCT_REMOVE_FROM_CART: 'product_remove_from_cart',
  PRODUCT_ADD_TO_FAVORITES: 'product_add_to_favorites',
  PRODUCT_REMOVE_FROM_FAVORITES: 'product_remove_from_favorites',
  BALANCE_TOP_UP: 'balance_top_up',
  BALANCE_DEDUCT: 'balance_deduct',
  ORDER_CREATE: 'order_create',
  ORDER_CANCEL: 'order_cancel',
  ORDER_PREORDER_PAYMENT: 'order_preorder_payment',
  ORDER_DELIVERY_PAYMENT: 'order_delivery_payment',
  CASHBACK_EXCHANGE: 'cashback_exchange',
  LOYALTY_CARD_PURCHASE: 'loyalty_card_purchase',
  PROFILE_UPDATE: 'profile_update',
  AUTH_LOGIN: 'auth_login',
  AUTH_LOGOUT: 'auth_logout',
  SUPPORT_MESSAGE: 'support_message',
  RATING_SUBMIT: 'rating_submit',
}
```

## API

### POST /admin-get-logs
Создание нового лога
```json
{
  "type": "user",
  "action": "create",
  "user_id": 1,
  "action_type": "product_view",
  "action_description": "Просмотр товара: Яблоки",
  "target_entity_type": "product",
  "target_entity_id": 42,
  "metadata": {
    "product_name": "Яблоки",
    "price": 150.00
  }
}
```

### GET /admin-get-logs?type=user&page=1&limit=50&action_type=product_view
Получение логов с фильтрацией

## Производительность

- Логирование выполняется асинхронно (не блокирует UI)
- Ошибки логирования не влияют на работу приложения
- Все ошибки записываются в console для отладки
- Логи автоматически включают IP и User Agent

## Примеры интеграции

### В компоненте товара
```typescript
const ProductCard = ({ product }) => {
  const logger = useUserActivityLogger({ userId, isAuthenticated });
  
  const handleAddToCart = () => {
    addToCart(product);
    logger.logAddToCart(product.id, product.name, null, product.price);
  };
  
  const handleViewDetails = () => {
    setShowDetails(true);
    logger.logProductView(product.id, product.name);
  };
  
  return (
    <div onClick={handleViewDetails}>
      <h3>{product.name}</h3>
      <button onClick={handleAddToCart}>В корзину</button>
    </div>
  );
};
```

### В процессе оформления заказа
```typescript
const handleCheckout = async () => {
  const order = await createOrder();
  
  logger.logOrderCreate(
    order.id, 
    order.total_amount, 
    order.items.length
  );
  
  logger.logBalanceDeduct(
    order.total_amount,
    'order_payment',
    order.id
  );
};
```