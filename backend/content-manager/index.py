import json
import os
from typing import Dict, Any

def handle_faq(method: str, event: Dict[str, Any], cur, conn):
    '''Handle FAQ operations'''
    if method == 'GET':
        query_params = event.get('queryStringParameters') or {}
        include_inactive = query_params.get('include_inactive') == 'true'
        
        if include_inactive:
            cur.execute('SELECT * FROM bot_faq ORDER BY sort_order ASC, id ASC')
        else:
            cur.execute('SELECT * FROM bot_faq WHERE is_active = true ORDER BY sort_order ASC, id ASC')
        
        faqs = cur.fetchall()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'faqs': [dict(faq) for faq in faqs]}, default=str),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        question = body_data.get('question', '').strip().replace("'", "''")
        answer = body_data.get('answer', '').strip().replace("'", "''")
        sort_order = body_data.get('sort_order', 0)
        
        if not question or not answer:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Question and answer are required'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            f"INSERT INTO bot_faq (question, answer, sort_order) VALUES ('{question}', '{answer}', {sort_order}) RETURNING *"
        )
        conn.commit()
        faq = cur.fetchone()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'faq': dict(faq)}, default=str),
            'isBase64Encoded': False
        }
    
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        faq_id = body_data.get('id')
        question = body_data.get('question', '').strip().replace("'", "''")
        answer = body_data.get('answer', '').strip().replace("'", "''")
        sort_order = body_data.get('sort_order', 0)
        is_active = body_data.get('is_active', True)
        
        if not faq_id or not question or not answer:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'ID, question and answer are required'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            f"UPDATE bot_faq SET question = '{question}', answer = '{answer}', sort_order = {sort_order}, is_active = {str(is_active).lower()}, updated_at = CURRENT_TIMESTAMP WHERE id = {faq_id} RETURNING *"
        )
        conn.commit()
        faq = cur.fetchone()
        
        if not faq:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'FAQ not found'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'faq': dict(faq)}, default=str),
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
        
        cur.execute(f"DELETE FROM bot_faq WHERE id = {faq_id}")
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
