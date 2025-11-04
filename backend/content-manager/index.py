import json
import os
from typing import Dict, Any

def handle_faq(method: str, event: Dict[str, Any], cur, conn):
    '''Handle FAQ operations'''
    if method == 'GET':
        query_params = event.get('queryStringParameters') or {}
        include_inactive = query_params.get('include_inactive') == 'true'
        
        if include_inactive:
            cur.execute('SELECT id, question, answer, keywords, is_active, created_at, updated_at, sort_order FROM t_p77282076_fruit_shop_creation.faq ORDER BY sort_order ASC, id ASC')
        else:
            cur.execute('SELECT id, question, answer, keywords, is_active, created_at, updated_at, sort_order FROM t_p77282076_fruit_shop_creation.faq WHERE is_active = true ORDER BY sort_order ASC, id ASC')
        
        rows = cur.fetchall()
        faqs = []
        for row in rows:
            faqs.append({
                'id': row[0],
                'question': row[1],
                'answer': row[2],
                'keywords': row[3] or [],
                'is_active': row[4],
                'created_at': row[5].isoformat() if row[5] else None,
                'updated_at': row[6].isoformat() if row[6] else None,
                'sort_order': row[7] if len(row) > 7 else 0
            })
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'faqs': faqs}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        question = body_data.get('question', '').strip()
        answer = body_data.get('answer', '').strip()
        sort_order = body_data.get('sort_order', 0)
        keywords = body_data.get('keywords', [])
        
        if not question or not answer:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Question and answer are required'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            "INSERT INTO t_p77282076_fruit_shop_creation.faq (question, answer, sort_order, keywords) VALUES (%s, %s, %s, %s) RETURNING id, question, answer, keywords, is_active, created_at, updated_at, sort_order",
            (question, answer, sort_order, keywords)
        )
        conn.commit()
        row = cur.fetchone()
        
        faq = {
            'id': row[0],
            'question': row[1],
            'answer': row[2],
            'keywords': row[3] or [],
            'is_active': row[4],
            'created_at': row[5].isoformat() if row[5] else None,
            'updated_at': row[6].isoformat() if row[6] else None,
            'sort_order': row[7]
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'faq': faq}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        faq_id = body_data.get('id')
        question = body_data.get('question', '').strip()
        answer = body_data.get('answer', '').strip()
        sort_order = body_data.get('sort_order', 0)
        is_active = body_data.get('is_active', True)
        keywords = body_data.get('keywords', [])
        
        if not faq_id or not question or not answer:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'ID, question and answer are required'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            "UPDATE t_p77282076_fruit_shop_creation.faq SET question = %s, answer = %s, sort_order = %s, is_active = %s, keywords = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING id, question, answer, keywords, is_active, created_at, updated_at, sort_order",
            (question, answer, sort_order, is_active, keywords, faq_id)
        )
        conn.commit()
        row = cur.fetchone()
        
        if not row:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'FAQ not found'}),
                'isBase64Encoded': False
            }
        
        faq = {
            'id': row[0],
            'question': row[1],
            'answer': row[2],
            'keywords': row[3] or [],
            'is_active': row[4],
            'created_at': row[5].isoformat() if row[5] else None,
            'updated_at': row[6].isoformat() if row[6] else None,
            'sort_order': row[7]
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'faq': faq}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    if method == 'DELETE':
        body_data = json.loads(event.get('body', '{}'))
        faq_id = body_data.get('id')
        
        if not faq_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'ID is required'}),
                'isBase64Encoded': False
            }
        
        cur.execute("DELETE FROM t_p77282076_fruit_shop_creation.faq WHERE id = %s", (faq_id,))
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

def handle_gallery(method: str, event: Dict[str, Any], cur, conn):
    '''Handle gallery operations'''
    if method == 'GET':
        query_params = event.get('queryStringParameters') or {}
        include_inactive = query_params.get('include_inactive') == 'true'
        
        if include_inactive:
            cur.execute('SELECT * FROM gallery_images ORDER BY sort_order ASC, id ASC')
        else:
            cur.execute('SELECT * FROM gallery_images WHERE is_active = true ORDER BY sort_order ASC, id ASC')
        
        images = cur.fetchall()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'images': [dict(img) for img in images]}, default=str),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        image_url = body_data.get('image_url', '').strip().replace("'", "''")
        title = body_data.get('title', '').strip().replace("'", "''")
        description = body_data.get('description', '').strip().replace("'", "''")
        sort_order = body_data.get('sort_order', 0)
        
        if not image_url or not title:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Image URL and title are required'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            f"INSERT INTO gallery_images (image_url, title, description, sort_order) VALUES ('{image_url}', '{title}', '{description}', {sort_order}) RETURNING *"
        )
        conn.commit()
        image = cur.fetchone()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'image': dict(image)}, default=str),
            'isBase64Encoded': False
        }
    
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        image_id = body_data.get('id')
        image_url = body_data.get('image_url', '').strip().replace("'", "''")
        title = body_data.get('title', '').strip().replace("'", "''")
        description = body_data.get('description', '').strip().replace("'", "''")
        sort_order = body_data.get('sort_order', 0)
        is_active = body_data.get('is_active', True)
        
        if not image_id or not image_url or not title:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'ID, image URL and title are required'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            f"UPDATE gallery_images SET image_url = '{image_url}', title = '{title}', description = '{description}', sort_order = {sort_order}, is_active = {str(is_active).lower()}, updated_at = CURRENT_TIMESTAMP WHERE id = {image_id} RETURNING *"
        )
        conn.commit()
        image = cur.fetchone()
        
        if not image:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Image not found'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'image': dict(image)}, default=str),
            'isBase64Encoded': False
        }
    
    if method == 'DELETE':
        body_data = json.loads(event.get('body', '{}'))
        image_id = body_data.get('id')
        
        if not image_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'ID is required'}),
                'isBase64Encoded': False
            }
        
        cur.execute(f"DELETE FROM gallery_images WHERE id = {image_id}")
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

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage gallery images and bot FAQ
    Args: event with httpMethod, body, queryStringParameters, params.resource (gallery or faq)
    Returns: HTTP response with gallery/FAQ data
    '''
    import psycopg2
    from psycopg2.extras import RealDictCursor
    
    method: str = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters') or {}
    resource = query_params.get('resource', 'gallery')
    
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
        if resource == 'faq':
            return handle_faq(method, event, cur, conn)
        else:
            return handle_gallery(method, event, cur, conn)
    
    finally:
        cur.close()
        conn.close()