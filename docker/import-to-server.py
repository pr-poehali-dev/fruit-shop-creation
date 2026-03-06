"""
Импорт данных из папки export/ в локальный Docker-сервер.
Восстанавливает: базу данных + фотографии в MinIO.

Запуск (на вашем сервере, из папки проекта):
    pip install psycopg2-binary boto3
    python docker/import-to-server.py

Требования:
    - Docker Compose запущен (docker compose up -d)
    - Папка export/ находится рядом с этим скриптом
"""

import os
import sys
import subprocess
from pathlib import Path

# ─── НАСТРОЙКИ ──────────────────────────────────────────────────────────────
# Берутся из .env автоматически, или задайте вручную

def load_env():
    env = {}
    env_file = Path(".env")
    if env_file.exists():
        with open(env_file, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, val = line.partition("=")
                    env[key.strip()] = val.strip()
    return env

ENV = load_env()

POSTGRES_PASSWORD = ENV.get("POSTGRES_PASSWORD") or os.environ.get("POSTGRES_PASSWORD", "")
MINIO_ROOT_USER = ENV.get("MINIO_ROOT_USER") or os.environ.get("MINIO_ROOT_USER", "minioadmin")
MINIO_ROOT_PASSWORD = ENV.get("MINIO_ROOT_PASSWORD") or os.environ.get("MINIO_ROOT_PASSWORD", "")

DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "nursery"
DB_USER = "nursery_user"
DB_SCHEMA = "public"

MINIO_ENDPOINT = "http://localhost:9000"
MINIO_BUCKET = "files"

EXPORT_DIR = Path("export")
# ────────────────────────────────────────────────────────────────────────────


def check_requirements():
    missing = []
    try:
        import psycopg2
    except ImportError:
        missing.append("psycopg2-binary")
    try:
        import boto3
    except ImportError:
        missing.append("boto3")

    if missing:
        print(f"Установите зависимости: pip install {' '.join(missing)}")
        sys.exit(1)

    if not POSTGRES_PASSWORD:
        print("Ошибка: POSTGRES_PASSWORD не задан в .env")
        sys.exit(1)

    if not MINIO_ROOT_PASSWORD:
        print("Ошибка: MINIO_ROOT_PASSWORD не задан в .env")
        sys.exit(1)

    if not EXPORT_DIR.exists():
        print(f"Ошибка: папка {EXPORT_DIR} не найдена.")
        print("Скопируйте папку export/ рядом с проектом и попробуйте снова.")
        sys.exit(1)

    sql_file = EXPORT_DIR / "database.sql"
    if not sql_file.exists():
        print(f"Ошибка: файл export/database.sql не найден.")
        sys.exit(1)


def wait_for_docker():
    print("\n⏳ Проверяю Docker-сервисы...")
    result = subprocess.run(
        ["docker", "compose", "ps", "--services", "--filter", "status=running"],
        capture_output=True, text=True
    )
    running = result.stdout.strip().split("\n")
    needed = {"postgres", "minio", "backend"}
    missing = needed - set(running)

    if missing:
        print(f"   Сервисы не запущены: {', '.join(missing)}")
        print("   Запустите: docker compose up -d")
        print("   Подождите ~30 секунд и запустите скрипт снова.")
        sys.exit(1)

    print("   ✅ Docker сервисы работают")


def import_database():
    import psycopg2

    sql_file = EXPORT_DIR / "database.sql"
    size_mb = sql_file.stat().st_size / 1024 / 1024
    print(f"\n🗄️  Импорт базы данных ({size_mb:.1f} МБ)...")

    database_url = f"postgresql://{DB_USER}:{POSTGRES_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

    try:
        conn = psycopg2.connect(database_url)
        conn.autocommit = True
        cur = conn.cursor()
    except Exception as e:
        print(f"   Ошибка подключения к БД: {e}")
        print("   Убедитесь что Docker запущен: docker compose up -d")
        sys.exit(1)

    with open(sql_file, "r", encoding="utf-8") as f:
        sql_content = f.read()

    # Считаем количество INSERT-ов
    insert_count = sql_content.count("INSERT INTO")
    print(f"   Импортируем {insert_count} записей...")

    try:
        # Заменяем схему если нужно (поехали использует кастомную схему)
        # Нормализуем до public для локального сервера
        sql_normalized = sql_content
        for line in sql_content.split("\n")[:10]:
            if "Схема:" in line:
                original_schema = line.split("Схема:")[1].strip()
                if original_schema != "public" and original_schema != DB_SCHEMA:
                    print(f"   Конвертируем схему: {original_schema} → {DB_SCHEMA}")
                    sql_normalized = sql_content.replace(
                        f'"{original_schema}".',
                        f'"{DB_SCHEMA}".'
                    )
                break

        cur.execute(sql_normalized)
        print(f"   ✅ База данных импортирована успешно")
    except Exception as e:
        print(f"   Ошибка импорта: {e}")
        print("   Попробуйте сначала сбросить БД: docker compose down -v && docker compose up -d")
        sys.exit(1)
    finally:
        cur.close()
        conn.close()


def import_files():
    import boto3
    from botocore.exceptions import ClientError

    files_dir = EXPORT_DIR / "files"
    if not files_dir.exists():
        print("\n🖼️  Папка export/files/ не найдена, пропускаем.")
        return 0

    all_files = list(files_dir.rglob("*"))
    all_files = [f for f in all_files if f.is_file()]

    if not all_files:
        print("\n🖼️  Нет файлов для импорта.")
        return 0

    print(f"\n🖼️  Импорт файлов ({len(all_files)} шт)...")

    s3 = boto3.client(
        "s3",
        endpoint_url=MINIO_ENDPOINT,
        aws_access_key_id=MINIO_ROOT_USER,
        aws_secret_access_key=MINIO_ROOT_PASSWORD,
    )

    # Создаём bucket если нет
    try:
        s3.head_bucket(Bucket=MINIO_BUCKET)
    except ClientError:
        try:
            s3.create_bucket(Bucket=MINIO_BUCKET)
            # Открываем публичный доступ на чтение
            policy = json.dumps({
                "Version": "2012-10-17",
                "Statement": [{
                    "Effect": "Allow",
                    "Principal": {"AWS": ["*"]},
                    "Action": ["s3:GetObject"],
                    "Resource": [f"arn:aws:s3:::{MINIO_BUCKET}/*"]
                }]
            })
            s3.put_bucket_policy(Bucket=MINIO_BUCKET, Policy=policy)
        except Exception as e:
            print(f"   Ошибка создания bucket: {e}")

    uploaded = 0
    errors = 0

    for i, file_path in enumerate(all_files, 1):
        # Вычисляем ключ относительно папки files/
        key = str(file_path.relative_to(files_dir)).replace("\\", "/")

        # Определяем content-type
        suffix = file_path.suffix.lower()
        content_types = {
            ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
            ".png": "image/png", ".gif": "image/gif",
            ".webp": "image/webp", ".svg": "image/svg+xml",
            ".pdf": "application/pdf", ".mp4": "video/mp4",
        }
        content_type = content_types.get(suffix, "application/octet-stream")

        print(f"   [{i}/{len(all_files)}] {key}...", end="", flush=True)

        try:
            s3.upload_file(
                str(file_path),
                MINIO_BUCKET,
                key,
                ExtraArgs={"ContentType": content_type}
            )
            uploaded += 1
            print(" ✓")
        except Exception as e:
            errors += 1
            print(f" ✗ {e}")

    print(f"\n   ✅ Файлы: {uploaded} загружено, {errors} ошибок")
    return uploaded


def main():
    import json

    print("=" * 55)
    print("  Импорт данных в локальный сервер")
    print("=" * 55)

    check_requirements()
    wait_for_docker()

    # Читаем info если есть
    info_file = EXPORT_DIR / "export-info.txt"
    if info_file.exists():
        print(f"\n📄 Информация об экспорте:")
        with open(info_file, encoding="utf-8") as f:
            for line in f.readlines()[1:6]:
                print(f"   {line.rstrip()}")

    print("\nПредупреждение: существующие данные НЕ удаляются.")
    print("Используется INSERT ... ON CONFLICT DO NOTHING")
    answer = input("\nПродолжить? [y/N]: ").strip().lower()
    if answer != "y":
        print("Отменено.")
        sys.exit(0)

    import_database()
    import_files()

    print("\n" + "=" * 55)
    print("  ✅ Импорт завершён!")
    print("=" * 55)
    print(f"\nОткройте сайт: http://localhost")
    print("Фото доступны через: http://localhost:9000")


if __name__ == "__main__":
    main()
