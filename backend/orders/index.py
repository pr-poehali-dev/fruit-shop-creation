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
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            user_id = params.get('user_id')
            
            if user_id:
                cur.execute(
                    """SELECT o.*, 
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
                       WHERE o.user_id = %s
                       GROUP BY o.id
                       ORDER BY o.created_at DESC""",
                    (user_id,)
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
            delivery_address = body_data.get('delivery_address', '')
            
            total_amount = sum(item['price'] * item['quantity'] for item in items)
            
            cur.execute(
                """INSERT INTO orders (user_id, total_amount, payment_method, delivery_address) 
                   VALUES (%s, %s, %s, %s) 
                   RETURNING id""",
                (user_id, total_amount, payment_method, delivery_address)
            )
            order_id = cur.fetchone()['id']
            
            for item in items:
                cur.execute(
                    """INSERT INTO order_items (order_id, product_id, quantity, price) 
                       VALUES (%s, %s, %s, %s)""",
                    (order_id, item['product_id'], item['quantity'], item['price'])
                )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'order_id': order_id}),
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
