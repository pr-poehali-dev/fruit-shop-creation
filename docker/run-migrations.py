"""
Запускает все SQL-миграции из папки /migrations в нужном порядке.
Создаёт таблицу migration_history чтобы не применять одно дважды.
"""

import os
import sys
import psycopg2
import glob
import re

DATABASE_URL = os.environ.get("DATABASE_URL")
MIGRATIONS_DIR = "/migrations"


def get_version(filename):
    match = re.match(r"V(\d+)__", os.path.basename(filename))
    return int(match.group(1)) if match else 0


def main():
    print(f"Connecting to database...")
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS migration_history (
            id SERIAL PRIMARY KEY,
            filename VARCHAR(255) UNIQUE NOT NULL,
            applied_at TIMESTAMP DEFAULT NOW()
        )
    """)
    print("Migration history table ready.")

    migration_files = sorted(
        glob.glob(os.path.join(MIGRATIONS_DIR, "*.sql")),
        key=get_version
    )

    if not migration_files:
        print("No migration files found.")
        return

    cur.execute("SELECT filename FROM migration_history")
    applied = {row[0] for row in cur.fetchall()}

    pending = [f for f in migration_files if os.path.basename(f) not in applied]
    print(f"Total migrations: {len(migration_files)}, pending: {len(pending)}")

    for filepath in pending:
        filename = os.path.basename(filepath)
        print(f"  Applying {filename}...")
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                sql = f.read()
            cur.execute(sql)
            cur.execute(
                "INSERT INTO migration_history (filename) VALUES (%s)",
                (filename,)
            )
            print(f"  ✓ {filename}")
        except Exception as e:
            print(f"  ✗ {filename}: {e}")
            conn.close()
            sys.exit(1)

    print("All migrations applied successfully.")
    conn.close()


if __name__ == "__main__":
    main()
