#!/bin/bash
# =============================================================================
#  УСТАНОВЩИК FRUIT-SHOP  —  автоматическое развёртывание на Debian/Ubuntu
#  Запуск: bash install.sh
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()    { echo -e "${GREEN}[✓]${NC} $1"; }
warn()   { echo -e "${YELLOW}[!]${NC} $1"; }
error()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }
header() { echo -e "\n${BLUE}═══════════════════════════════════════${NC}"; echo -e "${BLUE}  $1${NC}"; echo -e "${BLUE}═══════════════════════════════════════${NC}\n"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# =============================================================================
#  ШАГ 0: Проверки
# =============================================================================
header "Проверка системы"

if [ "$EUID" -ne 0 ]; then
  error "Запускай от root: sudo bash install.sh"
fi

OS=$(grep -oP '(?<=^ID=).+' /etc/os-release | tr -d '"')
if [[ "$OS" != "debian" && "$OS" != "ubuntu" ]]; then
  warn "Скрипт тестировался на Debian/Ubuntu. Текущая ОС: $OS"
fi

log "ОС: $(grep PRETTY_NAME /etc/os-release | cut -d'"' -f2)"

# =============================================================================
#  ШАГ 1: Установка Docker
# =============================================================================
header "Установка Docker"

if command -v docker &>/dev/null && docker compose version &>/dev/null; then
  log "Docker уже установлен: $(docker --version)"
else
  log "Устанавливаю Docker..."
  apt-get update -qq
  apt-get install -y -qq ca-certificates curl gnupg lsb-release

  install -m 0755 -d /etc/apt/keyrings
  if [ "$OS" = "ubuntu" ]; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
      https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
      | tee /etc/apt/sources.list.d/docker.list > /dev/null
  else
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
      https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
      | tee /etc/apt/sources.list.d/docker.list > /dev/null
  fi

  chmod a+r /etc/apt/keyrings/docker.gpg
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
  systemctl enable docker
  systemctl start docker
  log "Docker установлен: $(docker --version)"
fi

# =============================================================================
#  ШАГ 2: Определение IP сервера
# =============================================================================
header "Настройка сети"

SERVER_IP=$(curl -s --max-time 5 ifconfig.me 2>/dev/null || \
            curl -s --max-time 5 api.ipify.org 2>/dev/null || \
            hostname -I | awk '{print $1}')

log "IP сервера: $SERVER_IP"

# =============================================================================
#  ШАГ 3: Создание .env файла
# =============================================================================
header "Настройка переменных окружения"

ENV_FILE="$SCRIPT_DIR/.env"

if [ -f "$ENV_FILE" ]; then
  warn ".env уже существует — использую его"
else
  log "Генерирую .env файл..."

  POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d '/@+=' | head -c 24)
  MINIO_PASSWORD=$(openssl rand -base64 24 | tr -d '/@+=' | head -c 24)

  cat > "$ENV_FILE" << EOF
# ─── База данных ─────────────────────────────────────────────────────────────
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# ─── Хранилище файлов (MinIO) ─────────────────────────────────────────────────
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}

# ─── Сервер ──────────────────────────────────────────────────────────────────
SERVER_HOST=${SERVER_IP}

# ─── URL для картинок и файлов ────────────────────────────────────────────────
# Если используешь домен — замени IP на домен
S3_PUBLIC_URL=http://${SERVER_IP}:9000

# ─── API для фронтенда ────────────────────────────────────────────────────────
# Если используешь домен — замени http://IP:8000 на https://домен/api
VITE_API_BASE_URL=http://${SERVER_IP}:8000

# ─── Платёжная система Альфа-Банк (опционально) ───────────────────────────────
ALFABANK_API_TOKEN=

# ─── Telegram-бот для уведомлений (опционально) ───────────────────────────────
TELEGRAM_BOT_TOKEN=
ADMIN_TELEGRAM_CHAT_ID=

# ─── Google авторизация (опционально) ─────────────────────────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ─── Код для входа в админку (опционально) ────────────────────────────────────
ADMIN_CODE=

# ─── HTTPS домен (заполни если есть домен + запускай с --profile https) ───────
# DOMAIN=myshop.ru
# ACME_EMAIL=my@email.ru
EOF

  log ".env создан с автоматически сгенерированными паролями"
  echo ""
  warn "Сохрани эти пароли!"
  echo "  PostgreSQL пароль: $POSTGRES_PASSWORD"
  echo "  MinIO пароль:      $MINIO_PASSWORD"
  echo ""
fi

# =============================================================================
#  ШАГ 4: Запуск сервисов
# =============================================================================
header "Запуск приложения"

cd "$SCRIPT_DIR"

# Проверяем есть ли данные для восстановления
DB_BACKUP=""
MINIO_BACKUP=""

if [ -f "/root/nursery_db.sql" ]; then
  DB_BACKUP="/root/nursery_db.sql"
  log "Найден дамп БД: $DB_BACKUP"
fi

if [ -f "/root/minio_backup.tar.gz" ]; then
  MINIO_BACKUP="/root/minio_backup.tar.gz"
  log "Найден архив файлов: $MINIO_BACKUP"
fi

log "Собираю и запускаю контейнеры..."
docker compose up -d --build 2>&1

# Ждём пока всё запустится
log "Жду запуска сервисов..."
for i in {1..60}; do
  if docker compose ps | grep -q "nursery_frontend" && \
     docker compose ps | grep "nursery_frontend" | grep -q "Up"; then
    break
  fi
  sleep 3
  echo -n "."
done
echo ""

# =============================================================================
#  ШАГ 5: Восстановление данных (если есть бэкапы)
# =============================================================================

if [ -n "$DB_BACKUP" ]; then
  header "Восстановление базы данных"
  log "Жду готовности PostgreSQL..."
  sleep 10

  # Восстанавливаем данные (пропускаем ошибки дублирования из миграций)
  docker exec -i nursery_db psql -U nursery_user -d nursery \
    --set ON_ERROR_STOP=off -q < "$DB_BACKUP" 2>/dev/null || true

  log "База данных восстановлена"
fi

if [ -n "$MINIO_BACKUP" ]; then
  header "Восстановление файлов и картинок"

  VOLUME_NAME=$(docker volume ls | grep minio_data | awk '{print $2}' | head -1)
  if [ -n "$VOLUME_NAME" ]; then
    docker run --rm \
      -v "${VOLUME_NAME}:/data" \
      -v "/root:/backup" \
      alpine sh -c "cd / && tar -xzf /backup/minio_backup.tar.gz --strip-components=1 -C /data" 2>/dev/null || true
    log "Файлы и картинки восстановлены"
  fi

  # Перезапускаем MinIO чтобы увидел файлы
  docker compose restart minio 2>/dev/null || true
  sleep 5
fi

# =============================================================================
#  ШАГ 6: Проверка
# =============================================================================
header "Проверка работоспособности"

sleep 5

echo "Статус контейнеров:"
docker compose ps

echo ""

# Проверяем доступность сайта
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://localhost" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  log "Сайт доступен!"
else
  warn "Сайт отвечает кодом $HTTP_CODE — подождите 1-2 минуты и проверьте снова"
fi

# Проверяем бэкенд
BACKEND_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://localhost:8000/health" 2>/dev/null || echo "000")
if [ "$BACKEND_CODE" = "200" ]; then
  log "Бэкенд (API) работает!"
else
  warn "Бэкенд отвечает кодом $BACKEND_CODE"
fi

# =============================================================================
#  ШАГ 7: Итоговая информация
# =============================================================================
header "Установка завершена!"

source "$ENV_FILE"

echo -e "  ${GREEN}Сайт:${NC}           http://${SERVER_IP}"
echo -e "  ${GREEN}API:${NC}            http://${SERVER_IP}:8000"
echo -e "  ${GREEN}Хранилище:${NC}      http://${SERVER_IP}:9000"
echo -e "  ${GREEN}MinIO консоль:${NC}  http://${SERVER_IP}:9001"
echo ""
echo -e "  ${YELLOW}MinIO логин:${NC}    ${MINIO_ROOT_USER:-minioadmin}"
echo -e "  ${YELLOW}MinIO пароль:${NC}   ${MINIO_ROOT_PASSWORD}"
echo ""
echo "  Полезные команды:"
echo "    Логи:          docker compose logs -f"
echo "    Перезапуск:    docker compose restart"
echo "    Обновление:    docker compose up -d --build"
echo "    Остановка:     docker compose down"
echo ""

# =============================================================================
#  ШАГ 8: Настройка бэкапа (автоматический ежедневный)
# =============================================================================
header "Настройка автоматических бэкапов"

BACKUP_SCRIPT="/usr/local/bin/shop-backup.sh"
cat > "$BACKUP_SCRIPT" << 'BACKUP_EOF'
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M)
mkdir -p "$BACKUP_DIR"

# Бэкап БД
docker exec nursery_db pg_dump -U nursery_user nursery > "$BACKUP_DIR/db_${DATE}.sql"

# Удаляем старые бэкапы (старше 7 дней)
find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "Backup done: $DATE"
BACKUP_EOF

chmod +x "$BACKUP_SCRIPT"

# Добавляем в cron (каждый день в 3:00)
(crontab -l 2>/dev/null | grep -v "shop-backup"; echo "0 3 * * * $BACKUP_SCRIPT >> /root/backups/backup.log 2>&1") | crontab -

log "Автобэкап настроен: каждый день в 3:00 → /root/backups/"

echo ""
echo -e "${GREEN}✓ Всё готово! Открывай http://${SERVER_IP}${NC}"
echo ""
