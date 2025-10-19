'''
Business: Управление восстановлением пароля через админа с уведомлением в Telegram
Args: event с httpMethod, body (phone для POST, phone+code+new_password для PUT)
Returns: HTTP response с результатом операции
'''
import json
import os
import psycopg2
import bcrypt
import secrets
from datetime import datetime, timedelta
import requests
from typing import Dict, Any
import re

def normalize_phone(phone_raw: str) -> str:
    '''Нормализация телефона к формату базы данных: +7 (999) 123-45-67'''
    cleaned_phone = re.sub(r'\D', '', phone_raw)
    if cleaned_phone.startswith('8'):
        cleaned_phone = '7' + cleaned_phone[1:]
    elif not cleaned_phone.startswith('7'):
        cleaned_phone = '7' + cleaned_phone
    
    if len(cleaned_phone) >= 11:
        return f"+7 ({cleaned_phone[1:4]}) {cleaned_phone[4:7]}-{cleaned_phone[7:9]}-{cleaned_phone[9:11]}"
    else:
        return phone_raw

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
            'body': '',
            'isBase64Encoded': False
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
    conn.set_session(autocommit=True)
    cursor = conn.cursor()
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            phone_raw = body_data.get('phone', '').strip()
            
            if not phone_raw:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Телефон обязателен'})
                }
            
            phone = normalize_phone(phone_raw)
            phone_escaped = phone.replace("'", "''")
            
            cursor.execute(f"SELECT id, full_name FROM users WHERE phone = '{phone_escaped}'")
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
            created_at = datetime.now()
            
            # Сохраняем код в БД
            user_id = int(user[0])
            reset_code_escaped = reset_code.replace("'", "''")
            expires_str = expires_at.strftime('%Y-%m-%d %H:%M:%S')
            created_str = created_at.strftime('%Y-%m-%d %H:%M:%S')
            
            cursor.execute(f"""
                INSERT INTO password_reset_codes (user_id, phone, reset_code, created_at, expires_at)
                VALUES ({user_id}, '{phone_escaped}', '{reset_code_escaped}', '{created_str}', '{expires_str}')
            """)
            
            send_telegram_notification(
                user_name=user[1] or 'Пользователь',
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
            phone_raw = body_data.get('phone', '').strip()
            code = body_data.get('code', '').strip().upper()
            new_password = body_data.get('new_password', '').strip()
            
            if not all([phone_raw, code, new_password]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Все поля обязательны'})
                }
            
            phone = normalize_phone(phone_raw)
            phone_escaped = phone.replace("'", "''")
            code_escaped = code.replace("'", "''")
            
            # Получаем код из БД
            cursor.execute(f"""
                SELECT id, user_id, used_at, expires_at 
                FROM password_reset_codes 
                WHERE phone = '{phone_escaped}' AND reset_code = '{code_escaped}'
                ORDER BY created_at DESC
                LIMIT 1
            """)
            code_record = cursor.fetchone()
            
            if not code_record:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Неверный код'})
                }
            
            # Проверяем использован ли код
            if code_record[2] is not None:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Код уже использован'})
                }
            
            # Проверяем истёк ли код
            if datetime.now() > code_record[3]:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Код истёк'})
                }
            
            hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            hash_escaped = hashed_password.replace("'", "''")
            user_id = int(code_record[1])
            code_id = int(code_record[0])
            
            # Обновляем пароль
            cursor.execute(f"UPDATE users SET password = '{hash_escaped}' WHERE id = {user_id}")
            
            # Отмечаем код как использованный
            used_at_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            cursor.execute(f"UPDATE password_reset_codes SET used_at = '{used_at_str}' WHERE id = {code_id}")
            
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