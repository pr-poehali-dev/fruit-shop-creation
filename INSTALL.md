# Установка сайта на свой сервер

## Что потребуется

- Сервер или VPS с **Ubuntu 24.04 LTS** (Noble Numbat)
- 2 ГБ RAM минимум (рекомендуется 4 ГБ)
- 20 ГБ диска
- Открытые порты: 80 (сайт), 8000 (API), 9001 (управление файлами)

---

## Шаг 1. Установка Docker

Войдите на сервер по SSH и выполните все команды по очереди:

```bash
# Удаляем старые версии если были
sudo apt remove -y docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc 2>/dev/null; true

# Обновляем систему и ставим зависимости
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg lsb-release

# Добавляем официальный репозиторий Docker
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Устанавливаем Docker + Compose Plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Добавляем текущего пользователя в группу docker (чтобы не писать sudo)
sudo usermod -aG docker $USER
newgrp docker
```

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

## Шаг 4. Запуск

```bash
docker compose up -d --build
```

Первый запуск займёт 5–15 минут (скачивание и сборка).

Проверьте что всё работает:
```bash
docker compose ps
```

Все сервисы должны иметь статус `running`.

---

## Шаг 5. Открыть сайт

Откройте в браузере: `http://ВАШ_IP`

Если указали домен и настроили DNS — `http://ВАШ_ДОМЕН`.

---

## Управление файлами / фотографиями

Фотографии товаров хранятся в MinIO.  
Веб-интерфейс для управления: `http://ВАШ_IP:9001`

- Логин: значение `MINIO_ROOT_USER` из `.env` (по умолчанию `minioadmin`)
- Пароль: значение `MINIO_ROOT_PASSWORD` из `.env`

---

## Подключить домен (Nginx + SSL)

Установите Nginx и Certbot:

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

Создайте конфиг сайта:

```bash
sudo nano /etc/nginx/sites-available/myshop
```

Вставьте (замените `ВАШ_ДОМЕН`):

```nginx
server {
    listen 80;
    server_name ВАШ_ДОМЕН www.ВАШ_ДОМЕН;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Активируйте и получите SSL:

```bash
sudo ln -s /etc/nginx/sites-available/myshop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d ВАШ_ДОМЕН -d www.ВАШ_ДОМЕН
```

---

## Обновление сайта

После изменений в коде:

```bash
git pull
docker compose up -d --build
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
`http://ВАШ_ДОМЕН/payment/success`

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

**База данных не запустилась:**
```bash
docker compose logs postgres
```

**Фото не загружаются:**
```bash
docker compose logs minio
```

Для помощи — сообщество: https://t.me/+QgiLIa1gFRY4Y2Iy