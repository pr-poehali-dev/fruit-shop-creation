import json
import os
import secrets
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage loyalty cards with QR codes for users
    Args: event with httpMethod, body, queryStringParameters
    Returns: HTTP response with loyalty card data
    '''
    import psycopg2
    from psycopg2.extras import RealDictCursor
    
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            user_id = params.get('user_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                f"SELECT * FROM loyalty_cards WHERE user_id = {user_id} AND is_active = TRUE"
            )
            card = cur.fetchone()
            
            cur.execute("SELECT loyalty_card_price FROM site_settings LIMIT 1")
            settings = cur.fetchone()
            card_price = float(settings['loyalty_card_price']) if settings else 500.00
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'card': dict(card) if card else None,
                    'card_price': card_price
                }, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('user_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(f"SELECT * FROM loyalty_cards WHERE user_id = {user_id}")
            existing_card = cur.fetchone()
            
            if existing_card:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Карта уже куплена'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("SELECT loyalty_card_price FROM site_settings LIMIT 1")
            settings = cur.fetchone()
            card_price = float(settings['loyalty_card_price']) if settings else 500.00
            
            cur.execute(f"SELECT balance FROM users WHERE id = {user_id}")
            user = cur.fetchone()
            
            if not user or float(user['balance']) < card_price:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Недостаточно средств. Требуется {card_price}₽'}),
                    'isBase64Encoded': False
                }
            
            card_number = f"LC{secrets.token_hex(8).upper()}"
            qr_code = f"LOYALTY:{card_number}:{user_id}"
            
            cur.execute(
                f"UPDATE users SET balance = balance - {card_price} WHERE id = {user_id}"
            )
            
            cur.execute(
                f"""INSERT INTO loyalty_cards (user_id, card_number, qr_code) 
                   VALUES ({user_id}, '{card_number}', '{qr_code}') 
                   RETURNING *"""
            )
            new_card = cur.fetchone()
            
            cur.execute(
                f"INSERT INTO transactions (user_id, type, amount, description) VALUES ({user_id}, 'purchase', {card_price}, 'Покупка карты лояльности')"
            )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'card': dict(new_card)}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            card_number = body_data.get('card_number', '').replace("'", "''")
            purchase_amount = float(body_data.get('purchase_amount', 0))
            
            if not card_number:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'card_number required'}),
                    'isBase64Encoded': False
                }
            
            if purchase_amount < 100:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Минимальная сумма для начисления кэшбека - 100₽'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                f"""SELECT lc.*, u.full_name, u.phone, u.cashback 
                   FROM loyalty_cards lc
                   JOIN users u ON lc.user_id = u.id
                   WHERE lc.card_number = '{card_number}' AND lc.is_active = TRUE"""
            )
            card = cur.fetchone()
            
            if not card:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Карта не найдена'}),
                    'isBase64Encoded': False
                }
            
            cashback_amount = purchase_amount * 0.03
            
            cur.execute(
                f"UPDATE users SET cashback = cashback + {cashback_amount} WHERE id = {card['user_id']}"
            )
            
            cur.execute(
                f"""INSERT INTO transactions (user_id, type, amount, description) 
                   VALUES ({card['user_id']}, 'cashback_earned', {cashback_amount}, 
                   'Кэшбек 3% от покупки {purchase_amount}₽ по карте лояльности')"""
            )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'cashback_earned': cashback_amount,
                    'user_name': card['full_name'],
                    'user_phone': card['phone'],
                    'new_cashback': float(card['cashback']) + cashback_amount
                }, default=str),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()