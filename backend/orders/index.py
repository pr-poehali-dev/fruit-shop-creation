import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage customer orders and order history
    Args: event with httpMethod, body, queryStringParameters
    Returns: HTTP response with orders data
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
            get_all = params.get('all')
            
            if get_all == 'true':
                cur.execute(
                    """SELECT o.*, 
                       u.full_name as user_name,
                       u.phone as user_phone,
                       json_agg(json_build_object(
                           'id', oi.id,
                           'product_id', oi.product_id,
                           'product_name', p.name,
                           'quantity', oi.quantity,
                           'price', oi.price
                       )) as items
                       FROM orders o
                       LEFT JOIN users u ON o.user_id = u.id
                       LEFT JOIN order_items oi ON o.id = oi.order_id
                       LEFT JOIN products p ON oi.product_id = p.id
                       GROUP BY o.id, u.full_name, u.phone
                       ORDER BY o.created_at DESC"""
                )
                orders = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'orders': [dict(o) for o in orders]}, default=str),
                    'isBase64Encoded': False
                }
            
            if user_id:
                cur.execute(
                    f"""SELECT o.*, 
                       json_agg(json_build_object(
                           'id', oi.id,
                           'product_id', oi.product_id,
                           'product_name', p.name,
                           'quantity', oi.quantity,
                           'price', oi.price
                       )) as items
                       FROM orders o
                       LEFT JOIN order_items oi ON o.id = oi.order_id
                       LEFT JOIN products p ON oi.product_id = p.id
                       WHERE o.user_id = {user_id}
                       GROUP BY o.id
                       ORDER BY o.created_at DESC"""
                )
                orders = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'orders': [dict(o) for o in orders]}, default=str),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id required'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('user_id')
            items = body_data.get('items', [])
            payment_method = body_data.get('payment_method', 'card')
            delivery_address = body_data.get('delivery_address', '').replace("'", "''")
            
            total_amount = sum(float(item['price']) * int(item['quantity']) for item in items)
            
            if payment_method == 'balance':
                cur.execute(f"SELECT balance FROM users WHERE id = {user_id}")
                user = cur.fetchone()
                if not user or float(user['balance']) < total_amount:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Недостаточно средств на балансе'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    f"UPDATE users SET balance = balance - {total_amount} WHERE id = {user_id}"
                )
                
                cashback_amount = total_amount * 0.05
                cur.execute(
                    f"UPDATE users SET cashback = cashback + {cashback_amount} WHERE id = {user_id}"
                )
                
                cur.execute(
                    f"INSERT INTO transactions (user_id, type, amount, description) VALUES ({user_id}, 'purchase', {total_amount}, 'Оплата заказа')"
                )
                cur.execute(
                    f"INSERT INTO transactions (user_id, type, amount, description) VALUES ({user_id}, 'cashback_earned', {cashback_amount}, 'Кэшбек 5% от заказа')"
                )
            
            cur.execute(
                f"INSERT INTO orders (user_id, total_amount, payment_method, delivery_address) VALUES ({user_id}, {total_amount}, '{payment_method}', '{delivery_address}') RETURNING id"
            )
            order_id = cur.fetchone()['id']
            
            for item in items:
                product_id = item['product_id']
                quantity = item['quantity']
                price = item['price']
                cur.execute(
                    f"INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ({order_id}, {product_id}, {quantity}, {price})"
                )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'order_id': order_id}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            order_id = body_data.get('order_id')
            status = body_data.get('status', 'pending').replace("'", "''")
            rejection_reason = body_data.get('rejection_reason', '').replace("'", "''")
            
            if not order_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'order_id required'}),
                    'isBase64Encoded': False
                }
            
            if rejection_reason:
                cur.execute(
                    f"UPDATE orders SET status = '{status}', rejection_reason = '{rejection_reason}', updated_at = CURRENT_TIMESTAMP WHERE id = {order_id}"
                )
            else:
                cur.execute(
                    f"UPDATE orders SET status = '{status}', updated_at = CURRENT_TIMESTAMP WHERE id = {order_id}"
                )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            order_id = body_data.get('order_id')
            
            if not order_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'order_id required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(f"DELETE FROM order_items WHERE order_id = {order_id}")
            cur.execute(f"DELETE FROM orders WHERE id = {order_id}")
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
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