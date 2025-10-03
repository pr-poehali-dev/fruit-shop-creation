import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage products catalog
    Args: event with httpMethod, body, queryStringParameters
    Returns: HTTP response with products data
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
            'body': ''
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            category = params.get('category')
            
            if category:
                cur.execute(
                    """SELECT p.*, c.name as category_name 
                       FROM products p 
                       LEFT JOIN categories c ON p.category_id = c.id 
                       WHERE c.slug = %s AND p.is_active = TRUE 
                       ORDER BY p.created_at DESC""",
                    (category,)
                )
            else:
                cur.execute(
                    """SELECT p.*, c.name as category_name 
                       FROM products p 
                       LEFT JOIN categories c ON p.category_id = c.id 
                       WHERE p.is_active = TRUE 
                       ORDER BY p.created_at DESC"""
                )
            
            products = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'products': [dict(p) for p in products]
                }, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            cur.execute(
                """INSERT INTO products (name, slug, description, price, image_url, category_id, stock) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s) 
                   RETURNING id, name, slug, description, price, image_url, stock""",
                (
                    body_data['name'],
                    body_data['slug'],
                    body_data.get('description', ''),
                    body_data['price'],
                    body_data.get('image_url', ''),
                    body_data.get('category_id'),
                    body_data.get('stock', 0)
                )
            )
            conn.commit()
            product = cur.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'product': dict(product)}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            product_id = body_data.get('id')
            
            cur.execute(
                """UPDATE products 
                   SET name = %s, description = %s, price = %s, image_url = %s, 
                       category_id = %s, stock = %s, updated_at = CURRENT_TIMESTAMP
                   WHERE id = %s
                   RETURNING id, name, slug, description, price, image_url, stock""",
                (
                    body_data['name'],
                    body_data.get('description', ''),
                    body_data['price'],
                    body_data.get('image_url', ''),
                    body_data.get('category_id'),
                    body_data.get('stock', 0),
                    product_id
                )
            )
            conn.commit()
            product = cur.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'product': dict(product) if product else None}, default=str),
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
