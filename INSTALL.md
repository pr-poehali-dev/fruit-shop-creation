# Установка сайта на свой сервер

## Что потребуется

- Сервер или VPS с **Ubuntu 24.04 LTS** (Noble Numbat)
- 2 ГБ RAM минимум (рекомендуется 4 ГБ)
- 20 ГБ диска
- Открытые порты: 80, 443 (HTTPS), 9000, 9001 (хранилище фото)

---

## Шаг 1. Установка Docker

Войдите на сервер по SSH и выполните **одну команду** — она всё сделает автоматически:

```bash
curl -fsSL https://get.docker.com | sh
```

> Если вы подключены как **root** (в строке написано `root@...`) — этого достаточно, root уже имеет все права.  
> Если вы обычный пользователь — выполните дополнительно: `sudo usermod -aG docker $USER` и перелогиньтесь.

Проверьте что всё установилось:
```bash
docker --version
docker compose version
```

Ожидаемый вывод:
```
Docker version 26.x.x, build ...
Docker Compose version v2.x.x
```

---

## Шаг 2. Скачать код проекта

**Вариант А — через GitHub (рекомендуется):**

В панели poehali.dev нажмите **Скачать → Подключить GitHub**, затем на сервере:

```bash
git clone https://github.com/ВАШ_АККАУНТ/ВАШ_РЕПОЗИТОРИЙ.git myshop
cd myshop
```

**Вариант Б — скачать архив:**

В панели poehali.dev нажмите **Скачать → Скачать код**, загрузите на сервер и распакуйте.

---

## Шаг 3. Настройка

Скопируйте файл с настройками:

```bash
cp .env.example .env
nano .env
```

Заполните обязательные поля:

| Параметр | Что написать |
|----------|-------------|
| `POSTGRES_PASSWORD` | Любой сложный пароль (придумайте сами) |
| `MINIO_ROOT_PASSWORD` | Любой сложный пароль для хранилища фото |
| `SERVER_HOST` | IP вашего сервера или домен (без http://) |

Для онлайн-оплаты (Alfabank/СБП) добавьте `ALFABANK_API_TOKEN`.  
Для Telegram-уведомлений о заказах — `TELEGRAM_BOT_TOKEN` и `ADMIN_TELEGRAM_CHAT_ID`.

Сохраните файл: `Ctrl+O`, затем `Ctrl+X`.

---

## Шаг 4. Перенос данных из поехали.dev

> Пропустите этот шаг если запускаете сайт с нуля (без данных).

### 4.1 Экспорт на вашем компьютере

Установите Python-зависимости:
```bash
pip install psycopg2-binary boto3
```

Откройте **поехали.dev → Секреты** и скопируйте значения:
- `DATABASE_URL`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `MAIN_DB_SCHEMA`

Запустите экспорт (из папки проекта):
```bash
DATABASE_URL="postgresql://..." \
AWS_ACCESS_KEY_ID="..." \
AWS_SECRET_ACCESS_KEY="..." \
MAIN_DB_SCHEMA="t_p..._..." \
python docker/export-from-poehali.py
```

Скрипт создаст папку `export/` с:
- `export/database.sql` — все данные (товары, заказы, пользователи, настройки)
- `export/files/` — все фотографии товаров

### 4.2 Перенос на сервер

```bash
# Копируем папку export/ на сервер
scp -r export/ user@ВАШ_IP:~/myshop/
```

### 4.3 Импорт на сервере

Сначала запустите Docker (следующий шаг), затем вернитесь и выполните:

```bash
cd ~/myshop
pip install psycopg2-binary boto3
python docker/import-to-server.py
```

Скрипт спросит подтверждение и перенесёт все данные и фото в локальную базу и хранилище.

---

## Шаг 5. Запуск

**Без домена (по IP-адресу):**
```bash
docker compose up -d --build
```

**С доменом + автоматический HTTPS (Let's Encrypt):**

Сначала добавьте в `.env`:
```
DOMAIN=myshop.ru
ACME_EMAIL=you@email.com
VITE_API_BASE_URL=https://myshop.ru/api
```

Затем запустите с профилем https:
```bash
docker compose --profile https up -d --build
```

Traefik автоматически получит SSL-сертификат и настроит HTTPS.  
Сертификат обновляется автоматически каждые 90 дней.

Проверьте что всё работает:
```bash
docker compose ps
```

Все сервисы должны иметь статус `running`.

---

## Шаг 6. Открыть сайт

- Без домена: `http://ВАШ_IP`
- С доменом: `https://ВАШ_ДОМЕН`

---

## Управление файлами / фотографиями

Фотографии товаров хранятся в MinIO.  
Веб-интерфейс для управления: `http://ВАШ_IP:9001`

- Логин: значение `MINIO_ROOT_USER` из `.env` (по умолчанию `minioadmin`)
- Пароль: значение `MINIO_ROOT_PASSWORD` из `.env`

---

## Обновление сайта

После изменений в коде:

```bash
git pull
docker compose up -d --build
# или с HTTPS:
docker compose --profile https up -d --build
```

---

## Полезные команды

```bash
# Посмотреть статус
docker compose ps

# Логи всего
docker compose logs -f

# Логи только backend
docker compose logs -f backend

# Остановить
docker compose down

# Перезапустить
docker compose restart

# Полный сброс (ВНИМАНИЕ: удалит все данные БД и фото!)
docker compose down -v
```

---

## Настройка Alfabank (онлайн-оплата)

1. Войдите в личный кабинет Alfabank
2. Получите API-токен в разделе настроек интеграции
3. Добавьте токен в `.env`: `ALFABANK_API_TOKEN=ваш_токен`
4. Перезапустите: `docker compose restart backend`

В настройках Alfabank укажите URL возврата:  
`https://ВАШ_ДОМЕН/payment/success`

---

## Настройка Telegram-уведомлений

1. Напишите @BotFather в Telegram → `/newbot` → получите токен
2. Добавьте бота в нужный чат
3. Узнайте ID чата: напишите в чат любое сообщение, затем откройте:  
   `https://api.telegram.org/botВАШ_ТОКЕН/getUpdates`
4. Найдите `"chat":{"id":ЧИСЛО}` — это и есть `ADMIN_TELEGRAM_CHAT_ID`
5. Добавьте в `.env` и перезапустите backend

---

## Если что-то не работает

**Сайт не открывается:**
```bash
docker compose logs frontend
docker compose logs backend
```

**HTTPS не работает / сертификат не выдаётся:**
```bash
docker compose logs traefik
```
Убедитесь что:
- DNS домена указывает на IP сервера
- Порты 80 и 443 открыты в файрволе: `sudo ufw allow 80 && sudo ufw allow 443`

**База данных не запустилась:**
```bash
docker compose logs postgres
```

**Фото не загружаются:**
```bash
docker compose logs minio
```

Для помощи — сообщество: https://t.me/+QgiLIa1gFRY4Y2Iy