"""
Экспорт данных из поехали.dev на локальный компьютер.
Сохраняет: базу данных (все таблицы) + фотографии (S3/MinIO).

Запуск:
    pip install psycopg2-binary boto3
    python export-from-poehali.py

Результат: папка export/ с файлами:
    export/database.sql         — дамп базы данных
    export/files/               — все фотографии и файлы
    export/export-info.txt      — информация об экспорте
"""

import os
import sys
import json
import subprocess
from datetime import datetime
from pathlib import Path

# ─── НАСТРОЙКИ ─────────────────────────────────────────────────────────────────
# Вставьте значения из раздела "Секреты" в поехали.dev

DATABASE_URL = os.environ.get("DATABASE_URL", "")
AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY", "")
MAIN_DB_SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")

# S3 endpoint поехали.dev (не менять!)
S3_ENDPOINT = "https://bucket.poehali.dev"
S3_BUCKET = "files"

OUTPUT_DIR = Path("export")
# ───────────────────────────────────────────────────────────────────────────────


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

    if not DATABASE_URL:
        print("Ошибка: переменная DATABASE_URL не задана.")
        print("Запустите: DATABASE_URL='...' python export-from-poehali.py")
        print("Или отредактируйте переменные в начале файла.")
        sys.exit(1)

    if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
        print("Ошибка: AWS_ACCESS_KEY_ID или AWS_SECRET_ACCESS_KEY не заданы.")
        print("Значения берите из раздела 'Секреты' в поехали.dev")
        sys.exit(1)


def export_database():
    import psycopg2
    from psycopg2 import sql

    print("\n📦 Экспорт базы данных...")

    db_dir = OUTPUT_DIR / "database"
    db_dir.mkdir(parents=True, exist_ok=True)

    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor()

    # Получаем список таблиц в нужной схеме
    cur.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = %s
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    """, (MAIN_DB_SCHEMA,))
    tables = [row[0] for row in cur.fetchall()]

    print(f"   Найдено таблиц: {len(tables)}")

    all_sql = []
    all_sql.append(f"-- Экспорт из поехали.dev")
    all_sql.append(f"-- Дата: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    all_sql.append(f"-- Схема: {MAIN_DB_SCHEMA}")
    all_sql.append(f"-- Таблиц: {len(tables)}")
    all_sql.append("")
    all_sql.append("BEGIN;")
    all_sql.append("")

    total_rows = 0

    for table in tables:
        print(f"   → {table}...", end="", flush=True)

        try:
            # Получаем структуру таблицы
            cur.execute("""
                SELECT column_name, data_type, character_maximum_length,
                       is_nullable, column_default
                FROM information_schema.columns
                WHERE table_schema = %s AND table_name = %s
                ORDER BY ordinal_position
            """, (MAIN_DB_SCHEMA, table))
            columns = cur.fetchall()

            # Получаем данные
            cur.execute(
                sql.SQL("SELECT * FROM {}.{}").format(
                    sql.Identifier(MAIN_DB_SCHEMA),
                    sql.Identifier(table)
                )
            )
            rows = cur.fetchall()
            col_names = [desc[0] for desc in cur.description]

            if rows:
                all_sql.append(f"-- Таблица: {table} ({len(rows)} строк)")

                # Генерируем INSERT с обработкой всех типов
                col_list = ", ".join(f'"{c}"' for c in col_names)

                for row in rows:
                    values = []
                    for val in row:
                        if val is None:
                            values.append("NULL")
                        elif isinstance(val, bool):
                            values.append("TRUE" if val else "FALSE")
                        elif isinstance(val, (int, float)):
                            values.append(str(val))
                        elif isinstance(val, (dict, list)):
                            escaped = json.dumps(val, ensure_ascii=False).replace("'", "''")
                            values.append(f"'{escaped}'")
                        else:
                            escaped = str(val).replace("'", "''")
                            values.append(f"'{escaped}'")

                    val_str = ", ".join(values)
                    all_sql.append(
                        f'INSERT INTO "{MAIN_DB_SCHEMA}"."{table}" ({col_list}) '
                        f'VALUES ({val_str}) ON CONFLICT DO NOTHING;'
                    )

                all_sql.append("")
                total_rows += len(rows)
                print(f" {len(rows)} строк ✓")
            else:
                print(f" пусто")

        except Exception as e:
            print(f" ОШИБКА: {e}")
            all_sql.append(f"-- ОШИБКА при экспорте таблицы {table}: {e}")

    all_sql.append("COMMIT;")

    sql_file = OUTPUT_DIR / "database.sql"
    with open(sql_file, "w", encoding="utf-8") as f:
        f.write("\n".join(all_sql))

    cur.close()
    conn.close()

    size_mb = sql_file.stat().st_size / 1024 / 1024
    print(f"\n   ✅ База данных: {total_rows} строк, {size_mb:.1f} МБ → export/database.sql")
    return total_rows, len(tables)


def export_files():
    import boto3
    from botocore.exceptions import ClientError

    print("\n🖼️  Экспорт фотографий и файлов...")

    files_dir = OUTPUT_DIR / "files"
    files_dir.mkdir(parents=True, exist_ok=True)

    s3 = boto3.client(
        "s3",
        endpoint_url=S3_ENDPOINT,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    )

    paginator = s3.get_paginator("list_objects_v2")

    all_objects = []
    try:
        for page in paginator.paginate(Bucket=S3_BUCKET):
            objects = page.get("Contents", [])
            all_objects.extend(objects)
    except ClientError as e:
        print(f"   Ошибка доступа к хранилищу: {e}")
        print("   Проверьте AWS_ACCESS_KEY_ID и AWS_SECRET_ACCESS_KEY")
        return 0, 0

    if not all_objects:
        print("   Файлов в хранилище нет")
        return 0, 0

    print(f"   Найдено файлов: {len(all_objects)}")

    downloaded = 0
    total_size = 0
    errors = 0

    for i, obj in enumerate(all_objects, 1):
        key = obj["Key"]
        size = obj.get("Size", 0)

        local_path = files_dir / key
        local_path.parent.mkdir(parents=True, exist_ok=True)

        # Пропускаем если уже скачан и размер совпадает
        if local_path.exists() and local_path.stat().st_size == size:
            downloaded += 1
            total_size += size
            continue

        print(f"   [{i}/{len(all_objects)}] {key} ({size/1024:.0f} КБ)...", end="", flush=True)
        try:
            s3.download_file(S3_BUCKET, key, str(local_path))
            downloaded += 1
            total_size += size
            print(" ✓")
        except Exception as e:
            errors += 1
            print(f" ✗ {e}")

    size_mb = total_size / 1024 / 1024
    print(f"\n   ✅ Файлы: {downloaded} скачано, {errors} ошибок, {size_mb:.1f} МБ → export/files/")
    return downloaded, errors


def write_info(db_rows, db_tables, files_count):
    info_file = OUTPUT_DIR / "export-info.txt"
    info = f"""Экспорт из поехали.dev
Дата: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

База данных:
  Таблиц:  {db_tables}
  Строк:   {db_rows}

Файлы:
  Скачано: {files_count}

Следующий шаг:
  Перенесите папку export/ на ваш сервер и запустите:
  python docker/import-to-server.py
"""
    with open(info_file, "w", encoding="utf-8") as f:
        f.write(info)
    print(f"\n📄 Информация сохранена: export/export-info.txt")


def main():
    print("=" * 55)
    print("  Экспорт данных из поехали.dev")
    print("=" * 55)

    check_requirements()

    OUTPUT_DIR.mkdir(exist_ok=True)

    db_rows, db_tables = export_database()
    files_count, _ = export_files()

    write_info(db_rows, db_tables, files_count)

    print("\n" + "=" * 55)
    print("  ✅ Экспорт завершён!")
    print(f"  Папка: {OUTPUT_DIR.resolve()}")
    print("=" * 55)
    print("\nСледующий шаг:")
    print("  Скопируйте папку export/ на ваш сервер:")
    print("  scp -r export/ user@ВАШ_IP:~/myshop/")
    print("  Затем на сервере запустите:")
    print("  python docker/import-to-server.py")


if __name__ == "__main__":
    main()
