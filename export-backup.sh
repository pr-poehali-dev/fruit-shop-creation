#!/bin/bash
# =============================================================================
#  ЭКСПОРТ ДАННЫХ со старого сервера (poehali.dev или другого)
#  Запуск на СТАРОМ сервере: bash export-backup.sh
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }

header() {
  echo -e "\n${GREEN}═══════════════════════════════════════${NC}"
  echo -e "${GREEN}  $1${NC}"
  echo -e "${GREEN}═══════════════════════════════════════${NC}\n"
}

BACKUP_DIR="/root/shop-backup-$(date +%Y%m%d_%H%M)"
mkdir -p "$BACKUP_DIR"

header "Экспорт базы данных"

docker exec nursery_db pg_dump -U nursery_user nursery > "$BACKUP_DIR/nursery_db.sql"
log "База данных: $BACKUP_DIR/nursery_db.sql ($(du -sh "$BACKUP_DIR/nursery_db.sql" | cut -f1))"

header "Экспорт файлов и картинок (MinIO)"

VOLUME=$(docker volume ls | grep minio_data | awk '{print $2}' | head -1)
if [ -n "$VOLUME" ]; then
  docker run --rm \
    -v "${VOLUME}:/data:ro" \
    -v "$BACKUP_DIR:/backup" \
    alpine tar -czf /backup/minio_backup.tar.gz /data
  log "Файлы: $BACKUP_DIR/minio_backup.tar.gz ($(du -sh "$BACKUP_DIR/minio_backup.tar.gz" | cut -f1))"
else
  warn "Том MinIO не найден — пропускаю"
fi

header "Упаковка всего в один архив"

cd /root
tar -czf "shop-backup-$(date +%Y%m%d_%H%M).tar.gz" "$(basename "$BACKUP_DIR")/"
ARCHIVE="/root/shop-backup-$(date +%Y%m%d_%H%M).tar.gz"

# Берём последний созданный архив
ARCHIVE=$(ls -t /root/shop-backup-*.tar.gz 2>/dev/null | head -1)

log "Итоговый архив: $ARCHIVE ($(du -sh "$ARCHIVE" | cut -f1))"

echo ""
echo "Теперь скачай этот файл на свой компьютер:"
echo ""
echo -e "  ${GREEN}scp root@$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}'):$ARCHIVE ./${NC}"
echo ""
echo "Затем загрузи на новый сервер:"
echo ""
echo -e "  ${GREEN}scp ./$(basename "$ARCHIVE") root@НОВЫЙ_IP:/root/${NC}"
echo ""
echo "И на новом сервере распакуй:"
echo ""
echo -e "  ${GREEN}cd /root && tar -xzf $(basename "$ARCHIVE") && cp $(basename "$BACKUP_DIR")/*.sql . && cp $(basename "$BACKUP_DIR")/*.tar.gz .${NC}"
echo ""
