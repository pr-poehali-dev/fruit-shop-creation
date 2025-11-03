import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage product categories
    Args: event with httpMethod, body
    Returns: HTTP response with categories data
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
                'Access-Control-Allow-Headers': 'Content-Type, Accept, Cache-Control, X-User-Id, X-Auth-Token, X-Session-Id',
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
            cur.execute("SELECT * FROM categories ORDER BY id")
            categories = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'categories': [dict(c) for c in categories]}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            name = body_data['name'].replace("'", "''")
            slug = body_data['slug'].replace("'", "''")
            desc = body_data.get('description', '').replace("'", "''")
            
            cur.execute(
                f"""INSERT INTO categories (name, slug, description) 
                   VALUES ('{name}', '{slug}', '{desc}') 
                   RETURNING id, name, slug, description"""
            )
            conn.commit()
            category = cur.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'category': dict(category)}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            category_id = body_data.get('id')
            
            name = body_data['name'].replace("'", "''")
            slug = body_data['slug'].replace("'", "''")
            desc = body_data.get('description', '').replace("'", "''")
            
            cur.execute(
                f"""UPDATE categories 
                   SET name = '{name}', slug = '{slug}', description = '{desc}'
                   WHERE id = {category_id}
                   RETURNING id, name, slug, description"""
            )
            conn.commit()
            category = cur.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'category': dict(category) if category else None}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            category_id = params.get('id')
            
            if not category_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Category ID required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(f"SELECT COUNT(*) as count FROM products WHERE category_id = {category_id}")
            result = cur.fetchone()
            products_count = result['count']
            
            if products_count > 0:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Cannot delete category with {products_count} products'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(f"DELETE FROM categories WHERE id = {category_id}")
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