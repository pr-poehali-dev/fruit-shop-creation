'''
Business: Управление оценками заказов и тикетов
Args: event с httpMethod, body, queryStringParameters; context с request_id
Returns: HTTP response с данными о рейтингах
'''

import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Accept, Cache-Control, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('x-user-id') or headers.get('X-User-Id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'User ID required'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            entity_type = body_data.get('entity_type')
            entity_id = body_data.get('entity_id')
            rating = body_data.get('rating')
            comment = body_data.get('comment', '')
            
            if not entity_type or not entity_id or not rating:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'entity_type, entity_id and rating required'})
                }
            
            if rating not in [1, 2, 3, 4, 5]:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Rating must be between 1 and 5'})
                }
            
            entity_type_escaped = entity_type.replace("'", "''")
            comment_escaped = comment.replace("'", "''")
            
            cur.execute(
                f"SELECT id FROM ratings WHERE user_id = {user_id} AND entity_type = '{entity_type_escaped}' AND entity_id = {entity_id}"
            )
            existing = cur.fetchone()
            
            if existing:
                cur.execute(
                    f"UPDATE ratings SET rating = {rating}, comment = '{comment_escaped}' WHERE id = {existing[0]}"
                )
            else:
                cur.execute(
                    f"INSERT INTO ratings (user_id, entity_type, entity_id, rating, comment) VALUES ({user_id}, '{entity_type_escaped}', {entity_id}, {rating}, '{comment_escaped}')"
                )
            
            cur.execute(
                f"UPDATE notifications SET rating_given = TRUE WHERE user_id = {user_id} AND entity_type = '{entity_type_escaped}' AND entity_id = {entity_id}"
            )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        elif method == 'GET':
            params = event.get('queryStringParameters', {})
            entity_type = params.get('entity_type')
            entity_id = params.get('entity_id')
            
            if entity_type and entity_id:
                entity_type_escaped = entity_type.replace("'", "''")
                
                cur.execute(
                    f"SELECT AVG(rating)::FLOAT, COUNT(*), "
                    f"COUNT(CASE WHEN rating = 1 THEN 1 END), "
                    f"COUNT(CASE WHEN rating = 2 THEN 1 END), "
                    f"COUNT(CASE WHEN rating = 3 THEN 1 END), "
                    f"COUNT(CASE WHEN rating = 4 THEN 1 END), "
                    f"COUNT(CASE WHEN rating = 5 THEN 1 END) "
                    f"FROM ratings WHERE entity_type = '{entity_type_escaped}' AND entity_id = {entity_id}"
                )
                
                result = cur.fetchone()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'average_rating': round(result[0], 2) if result[0] else 0,
                        'total_ratings': result[1],
                        'rating_1': result[2],
                        'rating_2': result[3],
                        'rating_3': result[4],
                        'rating_4': result[5],
                        'rating_5': result[6]
                    })
                }
            
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'entity_type and entity_id required'})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cur.close()
        conn.close()