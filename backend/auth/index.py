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
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
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
            
            if action == 'balance' and user_id:
                cur.execute(f"SELECT balance, cashback FROM users WHERE id = {user_id}")
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
                        'transactions': [dict(t) for t in transactions]
                    }, default=str),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """SELECT id, phone, full_name, is_admin, balance, cashback, created_at 
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
    phone = body_data.get('phone', '').strip()
    password = body_data.get('password', '')
    
    if action in ['update_balance']:
        from psycopg2.extras import RealDictCursor
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        try:
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
            elif transaction_type == 'cashback_used':
                cur.execute(
                    f"UPDATE users SET cashback = cashback - {amount}, balance = balance + {amount} WHERE id = {user_id} RETURNING balance, cashback"
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
            
            cur.execute("SELECT id FROM users WHERE phone = %s", (phone,))
            if cur.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь с таким телефоном уже существует'}),
                    'isBase64Encoded': False
                }
            
            phone_escaped = phone.replace("'", "''")
            password_escaped = password.replace("'", "''")
            full_name_escaped = full_name.replace("'", "''")
            
            cur.execute(
                f"INSERT INTO users (phone, password, full_name, balance, cashback) VALUES ('{phone_escaped}', '{password_escaped}', '{full_name_escaped}', 0.00, 0.00) RETURNING id, phone, full_name, is_admin, balance, cashback"
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
                        'cashback': float(user[5]) if user[5] else 0.00
                    }
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'login':
            phone_escaped = phone.replace("'", "''")
            password_escaped = password.replace("'", "''")
            
            cur.execute(
                f"SELECT id, phone, full_name, is_admin, balance, cashback FROM users WHERE phone = '{phone_escaped}' AND password = '{password_escaped}'"
            )
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный телефон или пароль'}),
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
                        'cashback': float(user[5]) if user[5] else 0.00
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