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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
                f"SELECT * FROM t_p77282076_fruit_shop_creation.loyalty_cards WHERE user_id = {user_id} AND is_active = TRUE"
            )
            card = cur.fetchone()
            
            cur.execute("SELECT loyalty_card_price, loyalty_unlock_amount, loyalty_cashback_percent FROM t_p77282076_fruit_shop_creation.site_settings LIMIT 1")
            settings = cur.fetchone()
            card_price = float(settings['loyalty_card_price']) if settings else 500.00
            unlock_amount = float(settings['loyalty_unlock_amount']) if settings else 5000.00
            cashback_percent = float(settings['loyalty_cashback_percent']) if settings else 5.00
            
            cur.execute(
                f"""SELECT COALESCE(SUM(total_amount), 0) as total_spent
                   FROM t_p77282076_fruit_shop_creation.orders 
                   WHERE user_id = {user_id} AND status = 'completed'"""
            )
            spent_data = cur.fetchone()
            total_spent = float(spent_data['total_spent']) if spent_data else 0.0
            can_unlock = total_spent >= unlock_amount
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'card': dict(card) if card else None,
                    'card_price': card_price,
                    'unlock_amount': unlock_amount,
                    'cashback_percent': cashback_percent,
                    'total_spent': total_spent,
                    'can_unlock': can_unlock
                }, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('user_id')
            unlock_free = body_data.get('unlock_free', False)
            admin_issue = body_data.get('admin_issue', False)
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(f"SELECT * FROM t_p77282076_fruit_shop_creation.loyalty_cards WHERE user_id = {user_id} AND is_active = TRUE")
            existing_card = cur.fetchone()
            
            if existing_card:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Карта уже куплена'}),
                    'isBase64Encoded': False
                }
            
            if admin_issue:
                # Удаляем все старые неактивные карты перед выдачей новой
                cur.execute(
                    f"DELETE FROM t_p77282076_fruit_shop_creation.loyalty_cards WHERE user_id = {user_id} AND is_active = FALSE"
                )
                
                card_number = f"LC{secrets.token_hex(8).upper()}"
                qr_code = f"LOYALTY:{card_number}:{user_id}"
                
                cur.execute(
                    f"""INSERT INTO t_p77282076_fruit_shop_creation.loyalty_cards 
                       (user_id, card_number, qr_code, expires_at) 
                       VALUES ({user_id}, '{card_number}', '{qr_code}', NOW() + INTERVAL '6 months') 
                       RETURNING *"""
                )
                new_card = cur.fetchone()
                
                cur.execute(
                    f"INSERT INTO t_p77282076_fruit_shop_creation.transactions (user_id, type, amount, description) VALUES ({user_id}, 'loyalty_admin_issue', 0, 'Карта лояльности выдана администратором')"
                )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'card': dict(new_card), 'admin_issued': True}, default=str),
                    'isBase64Encoded': False
                }
            
            cur.execute("SELECT loyalty_card_price, loyalty_unlock_amount FROM t_p77282076_fruit_shop_creation.site_settings LIMIT 1")
            settings = cur.fetchone()
            card_price = float(settings['loyalty_card_price']) if settings else 500.00
            unlock_amount = float(settings['loyalty_unlock_amount']) if settings else 5000.00
            
            if unlock_free:
                cur.execute(
                    f"""SELECT COALESCE(SUM(total_amount), 0) as total_spent
                       FROM t_p77282076_fruit_shop_creation.orders 
                       WHERE user_id = {user_id} AND status = 'completed'"""
                )
                spent_data = cur.fetchone()
                total_spent = float(spent_data['total_spent']) if spent_data else 0.0
                
                if total_spent < unlock_amount:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': f'Недостаточная сумма покупок. Требуется {unlock_amount}₽, у вас {total_spent}₽'}),
                        'isBase64Encoded': False
                    }
                
                # Удаляем все старые неактивные карты перед выдачей новой
                cur.execute(
                    f"DELETE FROM t_p77282076_fruit_shop_creation.loyalty_cards WHERE user_id = {user_id} AND is_active = FALSE"
                )
                
                card_number = f"LC{secrets.token_hex(8).upper()}"
                qr_code = f"LOYALTY:{card_number}:{user_id}"
                
                cur.execute(
                    f"""INSERT INTO t_p77282076_fruit_shop_creation.loyalty_cards 
                       (user_id, card_number, qr_code, activated_at, expires_at) 
                       VALUES ({user_id}, '{card_number}', '{qr_code}', NOW(), NOW() + INTERVAL '6 months') 
                       RETURNING *"""
                )
                new_card = cur.fetchone()
                
                cur.execute(
                    f"INSERT INTO t_p77282076_fruit_shop_creation.transactions (user_id, type, amount, description) VALUES ({user_id}, 'loyalty_unlocked', 0, 'Карта лояльности разблокирована за сумму покупок {total_spent}₽')"
                )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'card': dict(new_card), 'unlocked_free': True}, default=str),
                    'isBase64Encoded': False
                }
            else:
                cur.execute(f"SELECT balance FROM t_p77282076_fruit_shop_creation.users WHERE id = {user_id}")
                user = cur.fetchone()
                
                if not user or float(user['balance']) < card_price:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': f'Недостаточно средств. Требуется {card_price}₽'}),
                        'isBase64Encoded': False
                    }
                
                # Удаляем все старые неактивные карты перед выдачей новой
                cur.execute(
                    f"DELETE FROM t_p77282076_fruit_shop_creation.loyalty_cards WHERE user_id = {user_id} AND is_active = FALSE"
                )
                
                card_number = f"LC{secrets.token_hex(8).upper()}"
                qr_code = f"LOYALTY:{card_number}:{user_id}"
                
                cur.execute(
                    f"UPDATE t_p77282076_fruit_shop_creation.users SET balance = balance - {card_price} WHERE id = {user_id}"
                )
                
                cur.execute(
                    f"""INSERT INTO t_p77282076_fruit_shop_creation.loyalty_cards 
                       (user_id, card_number, qr_code, activated_at, expires_at) 
                       VALUES ({user_id}, '{card_number}', '{qr_code}', NOW(), NOW() + INTERVAL '6 months') 
                       RETURNING *"""
                )
                new_card = cur.fetchone()
                
                cur.execute(
                    f"INSERT INTO t_p77282076_fruit_shop_creation.transactions (user_id, type, amount, description) VALUES ({user_id}, 'purchase', {card_price}, 'Покупка карты лояльности')"
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
                   FROM t_p77282076_fruit_shop_creation.loyalty_cards lc
                   JOIN t_p77282076_fruit_shop_creation.users u ON lc.user_id = u.id
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
            
            # Проверка срока действия при начислении кэшбека
            if card.get('expires_at'):
                cur.execute(f"SELECT '{card['expires_at']}'::timestamp < NOW() as is_expired")
                expired_check = cur.fetchone()
                if expired_check and expired_check['is_expired']:
                    cur.execute(
                        f"UPDATE t_p77282076_fruit_shop_creation.loyalty_cards SET is_active = FALSE WHERE id = {card['id']}"
                    )
                    conn.commit()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Срок действия карты истёк'}),
                        'isBase64Encoded': False
                    }
            
            cur.execute("SELECT loyalty_cashback_percent FROM t_p77282076_fruit_shop_creation.site_settings LIMIT 1")
            settings = cur.fetchone()
            cashback_percent = float(settings['loyalty_cashback_percent']) if settings else 5.00
            
            cashback_amount = purchase_amount * (cashback_percent / 100)
            
            cur.execute(
                f"UPDATE t_p77282076_fruit_shop_creation.users SET cashback = cashback + {cashback_amount} WHERE id = {card['user_id']}"
            )
            
            cur.execute(
                f"""INSERT INTO t_p77282076_fruit_shop_creation.transactions (user_id, type, amount, description) 
                   VALUES ({card['user_id']}, 'cashback_earned', {cashback_amount}, 
                   'Кэшбек {cashback_percent}% от покупки {purchase_amount}₽ по карте лояльности')"""
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
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('user_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                f"SELECT * FROM t_p77282076_fruit_shop_creation.loyalty_cards WHERE user_id = {user_id} AND is_active = TRUE"
            )
            card = cur.fetchone()
            
            if not card:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Карта не найдена или уже отозвана'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                f"UPDATE t_p77282076_fruit_shop_creation.loyalty_cards SET is_active = FALSE WHERE user_id = {user_id}"
            )
            
            cur.execute(
                f"INSERT INTO t_p77282076_fruit_shop_creation.transactions (user_id, type, amount, description) VALUES ({user_id}, 'loyalty_revoked', 0, 'Карта лояльности отозвана администратором')"
            )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'Карта лояльности отозвана'}),
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