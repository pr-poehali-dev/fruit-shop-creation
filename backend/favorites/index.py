'''
Business: Управление избранными товарами пользователей
Args: event - dict с httpMethod, queryStringParameters, body
      context - object с attributes: request_id, function_name
Returns: HTTP response dict с избранными товарами или результатом операции
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    dsn = os.environ.get('DATABASE_URL')
    
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(dsn)
    
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            user_id = params.get('user_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                f"""SELECT f.id, f.product_id, f.created_at, 
                          p.name, p.description, p.price, p.image_url, p.slug,
                          p.stock, p.show_stock, p.expected_date
                   FROM t_p77282076_fruit_shop_creation.favorites f
                   JOIN t_p77282076_fruit_shop_creation.products p ON f.product_id = p.id
                   WHERE f.user_id = {user_id}
                   ORDER BY f.created_at DESC"""
            )
            favorites = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'favorites': [dict(f) for f in favorites]}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('user_id')
            product_id = body_data.get('product_id')
            
            if not user_id or not product_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id and product_id required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                f"""INSERT INTO t_p77282076_fruit_shop_creation.favorites (user_id, product_id)
                   VALUES ({user_id}, {product_id})
                   ON CONFLICT (user_id, product_id) DO NOTHING
                   RETURNING *"""
            )
            favorite = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'favorite': dict(favorite) if favorite else None}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('user_id')
            product_id = body_data.get('product_id')
            
            if not user_id or not product_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id and product_id required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                f"""DELETE FROM t_p77282076_fruit_shop_creation.favorites
                   WHERE user_id = {user_id} AND product_id = {product_id}"""
            )
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
        conn.close()