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
import re

reset_codes_cache = {}

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
    conn.autocommit = True
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
            
            reset_codes_cache[phone] = {
                'code': reset_code,
                'expires_at': expires_at,
                'user_id': user[0]
            }
            
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
            
            if phone not in reset_codes_cache:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Код не найден или истёк'})
                }
            
            cached_data = reset_codes_cache[phone]
            
            if cached_data['code'] != code:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Неверный код'})
                }
            
            if datetime.now() > cached_data['expires_at']:
                del reset_codes_cache[phone]
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Код истёк'})
                }
            
            hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            hash_escaped = hashed_password.replace("'", "''")
            user_id = int(cached_data['user_id'])
            
            sql = f"UPDATE users SET password_hash = '{hash_escaped}' WHERE id = {user_id}"
            cursor.execute(sql)
            
            del reset_codes_cache[phone]
            
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