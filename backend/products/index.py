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
                
                cur.execute(
                    f"""SELECT id, size, price, stock, sort_order 
                       FROM product_variants 
                       WHERE product_id = {product['id']} 
                       ORDER BY sort_order"""
                )
                product['variants'] = [dict(v) for v in cur.fetchall()]
            
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
            stock_val = body_data.get('stock')
            stock = stock_val if stock_val not in [None, ''] else 'NULL'
            show_stock = 'TRUE' if body_data.get('show_stock', True) else 'FALSE'
            hide_main_price = 'TRUE' if body_data.get('hide_main_price', False) else 'FALSE'
            images = body_data.get('images', [])
            variants = body_data.get('variants', [])
            
            cur.execute(
                f"""INSERT INTO products (name, slug, description, price, image_url, category_id, stock, show_stock, hide_main_price) 
                   VALUES ('{name}', '{slug}', '{desc}', {price}, '{img}', {cat_id}, {stock}, {show_stock}, {hide_main_price}) 
                   RETURNING id, name, slug, description, price, image_url, stock, show_stock, hide_main_price"""
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
            
            for variant in variants:
                size = variant['size'].replace("'", "''")
                var_price = variant['price']
                var_stock = variant.get('stock', 0)
                var_sort = variant.get('sort_order', 0)
                cur.execute(
                    f"""INSERT INTO product_variants (product_id, size, price, stock, sort_order) 
                       VALUES ({product_id}, '{size}', {var_price}, {var_stock}, {var_sort})"""
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
            stock_val = body_data.get('stock')
            stock = stock_val if stock_val not in [None, ''] else 'NULL'
            show_stock = 'TRUE' if body_data.get('show_stock', True) else 'FALSE'
            hide_main_price = 'TRUE' if body_data.get('hide_main_price', False) else 'FALSE'
            images = body_data.get('images', [])
            variants = body_data.get('variants', [])
            
            cur.execute(
                f"""UPDATE products 
                   SET name = '{name}', description = '{desc}', price = {price}, image_url = '{img}', 
                       category_id = {cat_id}, stock = {stock}, show_stock = {show_stock}, hide_main_price = {hide_main_price}, updated_at = CURRENT_TIMESTAMP
                   WHERE id = {product_id}
                   RETURNING id, name, slug, description, price, image_url, stock, show_stock, hide_main_price"""
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
            
            cur.execute(f"SELECT id FROM product_variants WHERE product_id = {product_id}")
            existing_variant_ids = [row['id'] for row in cur.fetchall()]
            
            for variant in variants:
                size = variant['size'].replace("'", "''")
                var_price = variant['price']
                var_stock = variant.get('stock', 0)
                var_sort = variant.get('sort_order', 0)
                
                if variant.get('id') and variant['id'] in existing_variant_ids:
                    cur.execute(
                        f"""UPDATE product_variants 
                           SET size = '{size}', price = {var_price}, stock = {var_stock}, sort_order = {var_sort}
                           WHERE id = {variant['id']}"""
                    )
                    existing_variant_ids.remove(variant['id'])
                else:
                    cur.execute(
                        f"""INSERT INTO product_variants (product_id, size, price, stock, sort_order) 
                           VALUES ({product_id}, '{size}', {var_price}, {var_stock}, {var_sort})"""
                    )
            
            for old_var_id in existing_variant_ids:
                cur.execute(f"DELETE FROM product_variants WHERE id = {old_var_id}")
            
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