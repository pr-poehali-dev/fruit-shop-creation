import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage site settings and information
    Args: event with httpMethod, body
    Returns: HTTP response with settings data
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
            cur.execute("SELECT * FROM site_settings WHERE id = 1")
            settings = cur.fetchone()
            
            if not settings:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'settings': {
                            'site_name': 'Питомник растений',
                            'site_description': 'Плодовые и декоративные культуры высокого качества',
                            'phone': '+7 (495) 123-45-67',
                            'email': 'info@plantsnursery.ru',
                            'address': 'Московская область, г. Пушкино, ул. Садовая, 15',
                            'work_hours': 'Пн-Вс: 9:00 - 19:00',
                            'promotions': '',
                            'additional_info': ''
                        }
                    }),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'settings': dict(settings)}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            
            site_name = body_data.get('site_name', '').replace("'", "''")
            site_desc = body_data.get('site_description', '').replace("'", "''")
            phone = body_data.get('phone', '').replace("'", "''")
            email = body_data.get('email', '').replace("'", "''")
            address = body_data.get('address', '').replace("'", "''")
            work_hours = body_data.get('work_hours', '').replace("'", "''")
            promotions = body_data.get('promotions', '').replace("'", "''")
            additional_info = body_data.get('additional_info', '').replace("'", "''")
            price_list_url = body_data.get('price_list_url', '').replace("'", "''")
            loyalty_card_price = body_data.get('loyalty_card_price', 500)
            
            cur.execute(
                f"""INSERT INTO site_settings (id, site_name, site_description, phone, email, address, work_hours, promotions, additional_info, price_list_url, loyalty_card_price)
                   VALUES (1, '{site_name}', '{site_desc}', '{phone}', '{email}', '{address}', '{work_hours}', '{promotions}', '{additional_info}', '{price_list_url}', {loyalty_card_price})
                   ON CONFLICT (id) DO UPDATE SET
                   site_name = EXCLUDED.site_name,
                   site_description = EXCLUDED.site_description,
                   phone = EXCLUDED.phone,
                   email = EXCLUDED.email,
                   address = EXCLUDED.address,
                   work_hours = EXCLUDED.work_hours,
                   promotions = EXCLUDED.promotions,
                   additional_info = EXCLUDED.additional_info,
                   price_list_url = EXCLUDED.price_list_url,
                   loyalty_card_price = EXCLUDED.loyalty_card_price,
                   updated_at = CURRENT_TIMESTAMP
                   RETURNING *"""
            )
            conn.commit()
            settings = cur.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'settings': dict(settings)}, default=str),
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