import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: User authentication and registration
    Args: event with httpMethod, body
    Returns: HTTP response with user data or error
    '''
    import psycopg2
    
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id, X-Api-Key',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        from psycopg2.extras import RealDictCursor
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        try:
            params = event.get('queryStringParameters', {})
            action = params.get('action', 'users')
            user_id = params.get('user_id')
            
            if action == 'ban_status' and user_id:
                from datetime import datetime
                
                cur.execute(f"SELECT banned, ban_reason, ban_until FROM users WHERE id = {user_id}")
                user = cur.fetchone()
                
                if user and user['banned'] and user['ban_until']:
                    ban_until = user['ban_until']
                    if isinstance(ban_until, str):
                        ban_until = datetime.fromisoformat(ban_until.replace('Z', '+00:00'))
                    
                    if datetime.now(ban_until.tzinfo) >= ban_until:
                        cur.execute(f"UPDATE users SET banned = false, ban_reason = NULL, ban_until = NULL WHERE id = {user_id}")
                        conn.commit()
                        user['banned'] = False
                        user['ban_reason'] = None
                        user['ban_until'] = None
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'banned': user['banned'] if user else False,
                        'ban_reason': user['ban_reason'] if user else None,
                        'ban_until': str(user['ban_until']) if user and user['ban_until'] else None
                    }, default=str),
                    'isBase64Encoded': False
                }
            
            if action == 'user' and user_id:
                cur.execute(f"SELECT id, phone, full_name, is_admin, balance, cashback, avatar FROM users WHERE id = {user_id}")
                user = cur.fetchone()
                
                if not user:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'User not found'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'user': {
                            'id': user['id'],
                            'phone': user['phone'],
                            'full_name': user['full_name'],
                            'is_admin': user['is_admin'],
                            'balance': float(user['balance']) if user['balance'] else 0.00,
                            'cashback': float(user['cashback']) if user['cashback'] else 0.00,
                            'avatar': user['avatar'] if user['avatar'] else '👤'
                        }
                    }, default=str),
                    'isBase64Encoded': False
                }
            
            if action == 'balance' and user_id:
                cur.execute(f"SELECT balance, cashback, is_admin, avatar FROM users WHERE id = {user_id}")
                user = cur.fetchone()
                
                cur.execute(
                    f"SELECT * FROM transactions WHERE user_id = {user_id} ORDER BY created_at DESC LIMIT 50"
                )
                transactions = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'balance': float(user['balance']) if user else 0.00,
                        'cashback': float(user['cashback']) if user else 0.00,
                        'is_admin': user['is_admin'] if user else False,
                        'avatar': user['avatar'] if user else '👤',
                        'transactions': [dict(t) for t in transactions]
                    }, default=str),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """SELECT id, phone, full_name, is_admin, balance, cashback, avatar, created_at 
                   FROM users 
                   ORDER BY created_at DESC"""
            )
            users = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'users': [dict(u) for u in users]}, default=str),
                'isBase64Encoded': False
            }
        finally:
            cur.close()
            conn.close()
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    action = body_data.get('action')
    phone_raw = body_data.get('phone', '').strip()
    password = body_data.get('password', '')
    login_code = body_data.get('login_code', '')
    
    import re
    cleaned_phone = re.sub(r'\D', '', phone_raw)
    if cleaned_phone.startswith('8'):
        cleaned_phone = '7' + cleaned_phone[1:]
    elif not cleaned_phone.startswith('7'):
        cleaned_phone = '7' + cleaned_phone
    
    if len(cleaned_phone) >= 11:
        phone = f"+7 ({cleaned_phone[1:4]}) {cleaned_phone[4:7]}-{cleaned_phone[7:9]}-{cleaned_phone[9:11]}"
    else:
        phone = phone_raw
    
    print(f"Phone normalization: raw='{phone_raw}' -> cleaned='{cleaned_phone}' -> formatted='{phone}'")
    
    if action in ['update_balance', 'update_cashback', 'toggle_admin', 'ban_user', 'unban_user', 'update_avatar']:
        from psycopg2.extras import RealDictCursor
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        try:
            if action == 'toggle_admin':
                user_id = body_data.get('user_id')
                is_admin = body_data.get('is_admin')
                
                if not user_id or is_admin is None:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'user_id and is_admin are required'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    f"UPDATE users SET is_admin = {str(is_admin).lower()} WHERE id = {user_id} RETURNING id, is_admin"
                )
                conn.commit()
                user = cur.fetchone()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'user': dict(user)
                    }, default=str),
                    'isBase64Encoded': False
                }
            
            if action == 'ban_user':
                user_id = body_data.get('user_id')
                ban_reason = body_data.get('ban_reason', '').replace("'", "''")
                duration_hours = body_data.get('duration_hours')
                
                if not user_id or not ban_reason:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'user_id and ban_reason are required'}),
                        'isBase64Encoded': False
                    }
                
                from datetime import datetime, timedelta
                
                if duration_hours == 'permanent':
                    ban_until = None
                    cur.execute(
                        f"UPDATE users SET banned = true, ban_reason = '{ban_reason}', ban_until = NULL WHERE id = {user_id}"
                    )
                else:
                    ban_until = datetime.now() + timedelta(hours=int(duration_hours))
                    cur.execute(
                        f"UPDATE users SET banned = true, ban_reason = '{ban_reason}', ban_until = '{ban_until.isoformat()}' WHERE id = {user_id}"
                    )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            if action == 'unban_user':
                user_id = body_data.get('user_id')
                
                if not user_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'user_id is required'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    f"UPDATE users SET banned = false, ban_reason = NULL, ban_until = NULL WHERE id = {user_id}"
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            if action == 'update_avatar':
                user_id = body_data.get('user_id')
                avatar = body_data.get('avatar', '').replace("'", "''")
                
                if not user_id or not avatar:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'user_id and avatar are required'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    f"UPDATE users SET avatar = '{avatar}' WHERE id = {user_id} RETURNING avatar"
                )
                conn.commit()
                updated_user = cur.fetchone()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'avatar': updated_user['avatar']
                    }),
                    'isBase64Encoded': False
                }
            
            user_id = body_data.get('user_id')
            amount = body_data.get('amount')
            transaction_type = body_data.get('type')
            description = body_data.get('description', '').replace("'", "''")
            
            if not all([user_id, amount, transaction_type]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id, amount and type are required'}),
                    'isBase64Encoded': False
                }
            
            if transaction_type == 'deposit':
                cur.execute(
                    f"UPDATE users SET balance = balance + {amount} WHERE id = {user_id} RETURNING balance"
                )
            elif transaction_type == 'withdraw':
                cur.execute(f"SELECT balance FROM users WHERE id = {user_id}")
                user = cur.fetchone()
                if not user or float(user['balance']) < float(amount):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Insufficient balance'}),
                        'isBase64Encoded': False
                    }
                cur.execute(
                    f"UPDATE users SET balance = balance - {amount} WHERE id = {user_id} RETURNING balance"
                )
            elif transaction_type == 'cashback_deposit':
                cur.execute(
                    f"UPDATE users SET cashback = cashback + {amount} WHERE id = {user_id} RETURNING cashback"
                )
            elif transaction_type == 'cashback_used':
                cur.execute(
                    f"UPDATE users SET cashback = cashback - {amount}, balance = balance + {amount} WHERE id = {user_id} RETURNING balance, cashback"
                )
            elif transaction_type == 'cashback_exchange':
                cashback_amount = body_data.get('cashback_amount', 0)
                
                cur.execute(f"SELECT cashback FROM users WHERE id = {user_id}")
                user = cur.fetchone()
                if not user or float(user['cashback']) < float(cashback_amount):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Недостаточно кэшбека'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    f"UPDATE users SET cashback = cashback - {cashback_amount}, balance = balance + {amount} WHERE id = {user_id} RETURNING balance, cashback"
                )
            
            cur.execute(
                f"INSERT INTO transactions (user_id, type, amount, description) VALUES ({user_id}, '{transaction_type}', {amount}, '{description}') RETURNING *"
            )
            
            conn.commit()
            transaction = cur.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'transaction': dict(transaction)
                }, default=str),
                'isBase64Encoded': False
            }
        finally:
            cur.close()
            conn.close()
    
    if method == 'DELETE':
        from psycopg2.extras import RealDictCursor
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        try:
            body_data = json.loads(event.get('body', '{}'))
            transaction_ids = body_data.get('transaction_ids', [])
            
            if not transaction_ids:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'transaction_ids required'}),
                    'isBase64Encoded': False
                }
            
            ids_str = ','.join(str(id) for id in transaction_ids)
            cur.execute(f"DELETE FROM transactions WHERE id IN ({ids_str})")
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'deleted_count': cur.rowcount
                }),
                'isBase64Encoded': False
            }
        finally:
            cur.close()
            conn.close()
    
    if action == 'verify_code':
        user_id = body_data.get('user_id')
        if not user_id or not login_code:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'user_id и login_code обязательны'}),
                'isBase64Encoded': False
            }
        
        from datetime import datetime
        
        db_url = os.environ.get('DATABASE_URL')
        if not db_url:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database not configured'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        code_escaped = login_code.replace("'", "''")
        
        cur.execute(
            f"SELECT id, user_id, used_at, expires_at FROM admin_login_codes WHERE login_code = '{code_escaped}' AND user_id = {user_id}"
        )
        code_record = cur.fetchone()
        
        if not code_record:
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный код'}),
                'isBase64Encoded': False
            }
        
        if code_record[2] is not None:
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Код уже использован'}),
                'isBase64Encoded': False
            }
        
        expires_at = datetime.fromisoformat(str(code_record[3]).replace('Z', '+00:00'))
        if expires_at < datetime.now(expires_at.tzinfo or None):
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Код истёк'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            f"UPDATE admin_login_codes SET used_at = CURRENT_TIMESTAMP WHERE id = {code_record[0]}"
        )
        conn.commit()
        
        cur.execute(
            f"SELECT id, phone, full_name, is_admin, balance, cashback, avatar FROM users WHERE id = {user_id}"
        )
        user = cur.fetchone()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'user': {
                    'id': user[0],
                    'phone': user[1],
                    'full_name': user[2],
                    'is_admin': user[3],
                    'balance': float(user[4]) if user[4] else 0.00,
                    'cashback': float(user[5]) if user[5] else 0.00,
                    'avatar': user[6] if user[6] else '👤'
                }
            }),
            'isBase64Encoded': False
        }
    
    if not phone or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Телефон и пароль обязательны'}),
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    try:
        if action == 'register':
            full_name = body_data.get('full_name', '')
            
            phone_escaped = phone.replace("'", "''")
            password_escaped = password.replace("'", "''")
            full_name_escaped = full_name.replace("'", "''")
            
            cur.execute(f"SELECT id FROM users WHERE phone = '{phone_escaped}'")
            if cur.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь с таким телефоном уже существует'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                f"INSERT INTO users (phone, password, full_name, balance, cashback, avatar) VALUES ('{phone_escaped}', '{password_escaped}', '{full_name_escaped}', 0.00, 0.00, '👤') RETURNING id, phone, full_name, is_admin, balance, cashback, avatar"
            )
            conn.commit()
            user = cur.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'user': {
                        'id': user[0],
                        'phone': user[1],
                        'full_name': user[2],
                        'is_admin': user[3],
                        'balance': float(user[4]) if user[4] else 0.00,
                        'cashback': float(user[5]) if user[5] else 0.00,
                        'avatar': user[6] if user[6] else '👤'
                    }
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'login':
            phone_escaped = phone.replace("'", "''")
            password_escaped = password.replace("'", "''")
            
            print(f"Login attempt: phone='{phone_escaped}', password='{password_escaped}'")
            
            cur.execute(
                f"SELECT id, phone, full_name, is_admin, balance, cashback, banned, ban_reason, ban_until, avatar FROM users WHERE phone = '{phone_escaped}' AND password = '{password_escaped}'"
            )
            user = cur.fetchone()
            
            print(f"User found: {user is not None}")
            
            if user and user[3]:
                import random
                import string
                from datetime import datetime, timedelta
                
                login_code = ''.join(random.choices(string.digits, k=6))
                expires_at = datetime.now() + timedelta(minutes=10)
                
                cur.execute(
                    f"INSERT INTO admin_login_codes (user_id, login_code, expires_at) VALUES ({user[0]}, '{login_code}', '{expires_at.isoformat()}') RETURNING id"
                )
                conn.commit()
                
                telegram_bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
                telegram_chat_id = os.environ.get('ADMIN_TELEGRAM_CHAT_ID')
                
                if telegram_bot_token and telegram_chat_id:
                    import urllib.request
                    import urllib.parse
                    message = f"🔐 *Код для входа в админку*\n\n`{login_code}`\n\n⏱ Действителен 10 минут\n👤 {user[2]}\n📱 {user[1]}"
                    url = f"https://api.telegram.org/bot{telegram_bot_token}/sendMessage"
                    data = urllib.parse.urlencode({
                        'chat_id': telegram_chat_id, 
                        'text': message,
                        'parse_mode': 'Markdown'
                    }).encode()
                    try:
                        req = urllib.request.Request(url, data=data, method='POST')
                        urllib.request.urlopen(req, timeout=5)
                    except Exception as e:
                        print(f"Telegram send error: {e}")
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный телефон или пароль'}),
                    'isBase64Encoded': False
                }
            
            if user[3]:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'requires_code': True,
                        'user': {
                            'id': user[0],
                            'phone': user[1],
                            'full_name': user[2],
                            'is_admin': user[3]
                        }
                    }),
                    'isBase64Encoded': False
                }
            
            if user[6]:
                from datetime import datetime
                ban_until = user[8]
                if ban_until:
                    ban_until_dt = datetime.fromisoformat(str(ban_until).replace('Z', '+00:00'))
                    if ban_until_dt > datetime.now(ban_until_dt.tzinfo):
                        return {
                            'statusCode': 200,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({
                                'banned': True,
                                'ban_reason': user[7],
                                'ban_until': str(ban_until)
                            }),
                            'isBase64Encoded': False
                        }
                    else:
                        cur.execute(f"UPDATE users SET banned = false, ban_reason = NULL, ban_until = NULL WHERE id = {user[0]}")
                        conn.commit()
                else:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'banned': True,
                            'ban_reason': user[7],
                            'ban_until': None
                        }),
                        'isBase64Encoded': False
                    }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'user': {
                        'id': user[0],
                        'phone': user[1],
                        'full_name': user[2],
                        'is_admin': user[3],
                        'balance': float(user[4]) if user[4] else 0.00,
                        'cashback': float(user[5]) if user[5] else 0.00,
                        'avatar': user[9] if user[9] else '👤'
                    }
                }),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверное действие'}),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()