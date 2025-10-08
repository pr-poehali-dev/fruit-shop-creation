'''
Business: Управление зонами доставки - создание, чтение, обновление, удаление
Args: event с httpMethod, body, queryStringParameters
Returns: HTTP response с зонами доставки
'''
import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
            cur.execute("SELECT * FROM delivery_zones WHERE is_active = true ORDER BY zone_name")
            zones = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'zones': [dict(z) for z in zones]}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            zone_name = (body_data.get('zone_name') or '').replace("'", "''")
            delivery_price = body_data.get('delivery_price') or 0
            is_active = body_data.get('is_active', True)
            
            cur.execute(f"""
                INSERT INTO delivery_zones (zone_name, delivery_price, is_active)
                VALUES ('{zone_name}', {delivery_price}, {is_active})
                RETURNING *
            """)
            conn.commit()
            zone = cur.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'zone': dict(zone)}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            zone_id = body_data.get('id')
            
            if not zone_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Zone ID required'}),
                    'isBase64Encoded': False
                }
            
            zone_name = (body_data.get('zone_name') or '').replace("'", "''")
            delivery_price = body_data.get('delivery_price') or 0
            is_active = body_data.get('is_active', True)
            
            cur.execute(f"""
                UPDATE delivery_zones 
                SET zone_name = '{zone_name}', 
                    delivery_price = {delivery_price}, 
                    is_active = {is_active},
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = {zone_id}
                RETURNING *
            """)
            conn.commit()
            zone = cur.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'zone': dict(zone) if zone else None}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            zone_id = params.get('id')
            
            if not zone_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Zone ID required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(f"UPDATE delivery_zones SET is_active = false WHERE id = {zone_id}")
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
