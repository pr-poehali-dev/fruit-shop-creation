# Интеграция с СберБанк QR API

## Текущее состояние
✅ QR-код для оплаты добавлен в интерфейс
✅ Backend функции для проверки платежей созданы
⏳ Автоматическая проверка через API СберБанка (требует подключения)

## Функции

### 1. sber-payment-check
**URL:** https://functions.poehali.dev/a3b83a92-22e8-47cb-84cf-74e55cb9da7d

Ручное подтверждение оплаты администратором:
```bash
POST /
{
  "action": "manual_confirm",
  "user_id": 123,
  "amount": 1000,
  "payment_type": "deposit"  // или "order"
}
```

### 2. sber-webhook
**URL:** https://functions.poehali.dev/cdc4847a-d461-4a7c-958b-a2f14e6ee6f1

Webhook для автоматических уведомлений от СберБанка:
```bash
POST /
{
  "payment_id": "sber_123",
  "status": "success",
  "amount": 1000,
  "user_id": 123,
  "order_id": 456  // опционально
}
```

## Что нужно для автоматической интеграции

### Шаг 1: Получить доступ к API СберБанка
1. Зарегистрироваться в СберБизнес
2. Подключить QR-код для приёма платежей
3. Получить API credentials (merchant_id, secret_key)

### Шаг 2: Добавить секреты в проект
```bash
SBER_MERCHANT_ID=ваш_merchant_id
SBER_SECRET_KEY=ваш_secret_key
```

### Шаг 3: Модифицировать sber-payment-check
Добавить автоматическую проверку статуса платежа через API:
```python
import requests

sber_api_url = "https://api.sberbank.ru/prod/qr/order/v3/status"
headers = {
    "Authorization": f"Bearer {api_token}",
    "Content-Type": "application/json"
}
response = requests.post(sber_api_url, json={
    "tid": merchant_id,
    "order_id": order_id
})
```

### Шаг 4: Настроить webhook
1. В личном кабинете СберБизнес указать webhook URL:
   `https://functions.poehali.dev/cdc4847a-d461-4a7c-958b-a2f14e6ee6f1`
2. Добавить проверку подписи запроса для безопасности

## Временное решение (текущее)
Сейчас используется **ручное подтверждение**:
1. Клиент сканирует QR и переводит деньги
2. Пишет в поддержку с подтверждением
3. Администратор вручную зачисляет средства через админ-панель

## Документация API
- [СберБанк QR API](https://developer.sberbank.ru/doc/v1/acquiring/sberpay-qr)
- [Интеграция webhook](https://developer.sberbank.ru/doc/v1/acquiring/notifications)
