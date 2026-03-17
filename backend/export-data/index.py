import os
import psycopg2
from datetime import datetime, date, time
from decimal import Decimal
from typing import Dict, Any, List


TABLES = [
    'users',
    'categories',
    'products',
    'product_variants',
    'product_images',
    'orders',
    'order_items',
    'site_settings',
    'delivery_zones',
    'loyalty_cards',
    'referral_codes',
    'gallery_images',
    'bot_faq',
    'faq',
    'notifications',
    'plants_inventory',
]


def format_value(val, col_type: str = '') -> str:
    """Format a Python value into a SQL literal."""
    if val is None:
        return 'NULL'

    if isinstance(val, bool):
        return 'true' if val else 'false'

    if isinstance(val, (int, float, Decimal)):
        return str(val)

    if isinstance(val, list):
        # PostgreSQL array — render as ARRAY[...]::text[]
        elements = []
        for item in val:
            if item is None:
                elements.append('NULL')
            else:
                escaped = str(item).replace("'", "''")
                elements.append(f"'{escaped}'")
        return f"ARRAY[{','.join(elements)}]::text[]"

    if isinstance(val, dict):
        # JSON / JSONB — output as a quoted JSON string cast
        import json
        json_str = json.dumps(val, ensure_ascii=False, default=str)
        escaped = json_str.replace("'", "''")
        return f"'{escaped}'::jsonb"

    if isinstance(val, (datetime, date, time)):
        s = str(val)
        return f"'{s}'"

    if isinstance(val, bytes):
        # bytea
        hex_str = val.hex()
        return f"'\\x{hex_str}'"

    # Default: treat as string, escape single quotes
    s = str(val)
    escaped = s.replace("'", "''")
    return f"'{escaped}'"


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Export all database tables as SQL INSERT statements."""

    method = event.get('httpMethod', 'GET')

    # CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization, X-Auth-Token, X-User-Id, X-Session-Id',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
            'isBase64Encoded': False,
        }

    database_url = os.environ['DATABASE_URL']
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')

    conn = None
    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()

        # Set search path to the project schema
        cur.execute(f"SET search_path TO {schema}")

        lines: List[str] = []
        lines.append(f"-- Export from schema: {schema}")
        lines.append(f"-- Generated at: {datetime.utcnow().isoformat()}Z")
        lines.append(f"SET search_path TO {schema};")
        lines.append("")
        lines.append("BEGIN;")
        lines.append("")

        for table in TABLES:
            # Check if table exists
            cur.execute(
                "SELECT EXISTS ("
                "  SELECT 1 FROM information_schema.tables "
                "  WHERE table_schema = %s AND table_name = %s"
                ")",
                (schema, table),
            )
            exists = cur.fetchone()[0]
            if not exists:
                lines.append(f"-- Table {table} does not exist, skipping")
                lines.append("")
                continue

            lines.append(f"-- =============================================")
            lines.append(f"-- Table: {table}")
            lines.append(f"-- =============================================")

            # TRUNCATE before inserts
            lines.append(f"TRUNCATE {table} CASCADE;")
            lines.append("")

            # Get column names and types
            cur.execute(
                "SELECT column_name, data_type "
                "FROM information_schema.columns "
                "WHERE table_schema = %s AND table_name = %s "
                "ORDER BY ordinal_position",
                (schema, table),
            )
            columns_info = cur.fetchall()
            if not columns_info:
                lines.append(f"-- No columns found for {table}")
                lines.append("")
                continue

            col_names = [c[0] for c in columns_info]
            col_types = [c[1] for c in columns_info]
            col_list = ', '.join(col_names)

            # Fetch all rows
            cur.execute(f'SELECT * FROM {table} ORDER BY 1')
            rows = cur.fetchall()

            if rows:
                for row in rows:
                    values = []
                    for i, val in enumerate(row):
                        ct = col_types[i] if i < len(col_types) else ''
                        values.append(format_value(val, ct))
                    values_str = ', '.join(values)
                    lines.append(f"INSERT INTO {table} ({col_list}) VALUES ({values_str});")

                lines.append("")

                # Reset sequence if there is an 'id' column
                if 'id' in col_names:
                    seq_name = f"{table}_id_seq"
                    lines.append(
                        f"SELECT setval('{seq_name}', "
                        f"(SELECT COALESCE(MAX(id), 0) + 1 FROM {table}), false);"
                    )
            else:
                lines.append(f"-- No data in {table}")

            lines.append("")

        lines.append("COMMIT;")
        lines.append("")

        sql_text = '\n'.join(lines)

        cur.close()
        conn.close()
        conn = None

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
            },
            'body': sql_text,
            'isBase64Encoded': False,
        }

    except Exception as e:
        import traceback
        error_msg = f"-- ERROR: {str(e)}\n-- {traceback.format_exc()}"
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
            },
            'body': error_msg,
            'isBase64Encoded': False,
        }

    finally:
        if conn is not None:
            try:
                conn.close()
            except Exception:
                pass
