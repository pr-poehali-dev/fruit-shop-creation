'''
Business: Управление восстановлением пароля через админа с уведомлением в Telegram
Args: event с httpMethod, body (phone для POST, phone+code+new_password для PUT)
Returns: HTTP response с результатом операции
'''
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
import secrets
from datetime import datetime, timedelta
import requests
from typing import Dict, Any

def ensure_table_exists(cursor, conn):
    '''Создание таблицы при первом запуске'''
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS password_reset_codes (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                code VARCHAR(16) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT unique_user_reset UNIQUE (user_id)
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_codes(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_password_reset_code ON password_reset_codes(code)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_codes(expires_at)")
        conn.commit()
    except Exception:
        pass

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Database URL not configured'})
        }
    
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    ensure_table_exists(cursor, conn)
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            phone = body_data.get('phone', '').strip()
            
            if not phone:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Телефон обязателен'})
                }
            
            cursor.execute("SELECT id, full_name FROM users WHERE phone = %s", (phone,))
            user = cursor.fetchone()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Пользователь не найден'})
                }
            
            reset_code = secrets.token_hex(4).upper()
            expires_at = datetime.now() + timedelta(hours=24)
            
            cursor.execute("""
                INSERT INTO password_reset_codes (user_id, code, expires_at)
                VALUES (%s, %s, %s)
                ON CONFLICT (user_id) 
                DO UPDATE SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at, created_at = NOW()
            """, (user['id'], reset_code, expires_at))
            conn.commit()
            
            send_telegram_notification(
                user_name=user['full_name'] or 'Пользователь',
                phone=phone,
                reset_code=reset_code
            )
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'message': 'Код отправлен администратору',
                    'admin_code': reset_code
                })
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            phone = body_data.get('phone', '').strip()
            code = body_data.get('code', '').strip().upper()
            new_password = body_data.get('new_password', '').strip()
            
            if not all([phone, code, new_password]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Все поля обязательны'})
                }
            
            cursor.execute("""
                SELECT u.id, prc.code, prc.expires_at
                FROM users u
                JOIN password_reset_codes prc ON prc.user_id = u.id
                WHERE u.phone = %s
            """, (phone,))
            result = cursor.fetchone()
            
            if not result:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Код не найден или истёк'})
                }
            
            if result['code'] != code:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Неверный код'})
                }
            
            if datetime.now() > result['expires_at']:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Код истёк'})
                }
            
            hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            cursor.execute("UPDATE users SET password_hash = %s WHERE id = %s", (hashed_password, result['id']))
            cursor.execute("UPDATE password_reset_codes SET expires_at = NOW() - INTERVAL '1 day' WHERE user_id = %s", (result['id'],))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'message': 'Пароль успешно изменён'})
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    finally:
        cursor.close()
        conn.close()


def send_telegram_notification(user_name: str, phone: str, reset_code: str):
    '''Отправка уведомления администратору в Telegram'''
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    chat_id = os.environ.get('ADMIN_TELEGRAM_CHAT_ID')
    
    if not bot_token or not chat_id:
        return
    
    message = f"""
🔐 Запрос восстановления пароля

👤 Пользователь: {user_name}
📱 Телефон: {phone}
🔑 Код для сброса: <code>{reset_code}</code>

Отправьте этот код пользователю для восстановления пароля.
Код действителен 24 часа.
"""
    
    try:
        requests.post(
            f'https://api.telegram.org/bot{bot_token}/sendMessage',
            json={
                'chat_id': chat_id,
                'text': message,
                'parse_mode': 'HTML'
            },
            timeout=5
        )
    except Exception:
        pass