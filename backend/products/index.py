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
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            category = params.get('category')
            
            if category:
                cat_escaped = category.replace("'", "''")
                cur.execute(
                    f"""SELECT p.*, c.name as category_name 
                       FROM products p 
                       LEFT JOIN categories c ON p.category_id = c.id 
                       WHERE c.slug = '{cat_escaped}' AND p.is_active = TRUE 
                       ORDER BY p.created_at DESC"""
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
            products_list = [dict(p) for p in products]
            
            for product in products_list:
                cur.execute(
                    f"""SELECT id, image_url, is_primary, sort_order 
                       FROM product_images 
                       WHERE product_id = {product['id']} AND image_url != '' AND image_url IS NOT NULL
                       ORDER BY sort_order"""
                )
                product['images'] = [dict(img) for img in cur.fetchall()]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'products': products_list
                }, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            name = body_data['name'].replace("'", "''")
            slug = body_data['slug'].replace("'", "''")
            desc = body_data.get('description', '').replace("'", "''")
            price = body_data['price']
            img = body_data.get('image_url', '').replace("'", "''")
            cat_id = body_data.get('category_id', 'NULL')
            stock = body_data.get('stock', 0)
            images = body_data.get('images', [])
            
            cur.execute(
                f"""INSERT INTO products (name, slug, description, price, image_url, category_id, stock) 
                   VALUES ('{name}', '{slug}', '{desc}', {price}, '{img}', {cat_id}, {stock}) 
                   RETURNING id, name, slug, description, price, image_url, stock"""
            )
            product = cur.fetchone()
            product_id = product['id']
            
            for image in images:
                img_url = image['image_url'].replace("'", "''")
                is_primary = 'TRUE' if image.get('is_primary', False) else 'FALSE'
                sort_order = image.get('sort_order', 0)
                cur.execute(
                    f"""INSERT INTO product_images (product_id, image_url, is_primary, sort_order) 
                       VALUES ({product_id}, '{img_url}', {is_primary}, {sort_order})"""
                )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'product': dict(product)}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            product_id = body_data.get('id')
            
            name = body_data['name'].replace("'", "''")
            desc = body_data.get('description', '').replace("'", "''")
            price = body_data['price']
            img = body_data.get('image_url', '').replace("'", "''")
            cat_id = body_data.get('category_id', 'NULL')
            stock = body_data.get('stock', 0)
            images = body_data.get('images', [])
            
            cur.execute(
                f"""UPDATE products 
                   SET name = '{name}', description = '{desc}', price = {price}, image_url = '{img}', 
                       category_id = {cat_id}, stock = {stock}, updated_at = CURRENT_TIMESTAMP
                   WHERE id = {product_id}
                   RETURNING id, name, slug, description, price, image_url, stock"""
            )
            product = cur.fetchone()
            
            cur.execute(f"SELECT id FROM product_images WHERE product_id = {product_id}")
            existing_ids = [row['id'] for row in cur.fetchall()]
            
            for image in images:
                img_url = image['image_url'].replace("'", "''")
                is_primary = 'TRUE' if image.get('is_primary', False) else 'FALSE'
                sort_order = image.get('sort_order', 0)
                
                if image.get('id') and image['id'] in existing_ids:
                    cur.execute(
                        f"""UPDATE product_images 
                           SET image_url = '{img_url}', is_primary = {is_primary}, sort_order = {sort_order}
                           WHERE id = {image['id']}"""
                    )
                    existing_ids.remove(image['id'])
                else:
                    cur.execute(
                        f"""INSERT INTO product_images (product_id, image_url, is_primary, sort_order) 
                           VALUES ({product_id}, '{img_url}', {is_primary}, {sort_order})"""
                    )
            
            for old_id in existing_ids:
                cur.execute(f"DELETE FROM product_images WHERE id = {old_id}")
            
            conn.commit()
            
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