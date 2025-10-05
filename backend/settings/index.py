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
            
            site_name = (body_data.get('site_name') or '').replace("'", "''")
            logo_url = (body_data.get('logo_url') or '').replace("'", "''")
            site_desc = (body_data.get('site_description') or '').replace("'", "''")
            phone = (body_data.get('phone') or '').replace("'", "''")
            email = (body_data.get('email') or '').replace("'", "''")
            address = (body_data.get('address') or '').replace("'", "''")
            work_hours = (body_data.get('work_hours') or '').replace("'", "''")
            promotions = (body_data.get('promotions') or '').replace("'", "''")
            additional_info = (body_data.get('additional_info') or '').replace("'", "''")
            price_list_url = (body_data.get('price_list_url') or '').replace("'", "''")
            holiday_theme = (body_data.get('holiday_theme') or 'none').replace("'", "''")
            loyalty_card_price = body_data.get('loyalty_card_price') or 500
            loyalty_unlock_amount = body_data.get('loyalty_unlock_amount') or 5000
            loyalty_cashback_percent = body_data.get('loyalty_cashback_percent') or 5
            admin_pin = (body_data.get('admin_pin') or '0000').replace("'", "''")
            delivery_enabled = body_data.get('delivery_enabled', True)
            delivery_price = body_data.get('delivery_price') or 0
            
            about_title = (body_data.get('about_title') or '').replace("'", "''")
            about_text = (body_data.get('about_text') or '').replace("'", "''")
            care_title = (body_data.get('care_title') or '').replace("'", "''")
            care_watering_title = (body_data.get('care_watering_title') or '').replace("'", "''")
            care_watering_text = (body_data.get('care_watering_text') or '').replace("'", "''")
            care_lighting_title = (body_data.get('care_lighting_title') or '').replace("'", "''")
            care_lighting_text = (body_data.get('care_lighting_text') or '').replace("'", "''")
            care_pruning_title = (body_data.get('care_pruning_title') or '').replace("'", "''")
            care_pruning_text = (body_data.get('care_pruning_text') or '').replace("'", "''")
            delivery_title = (body_data.get('delivery_title') or '').replace("'", "''")
            delivery_courier_title = (body_data.get('delivery_courier_title') or '').replace("'", "''")
            delivery_courier_text = (body_data.get('delivery_courier_text') or '').replace("'", "''")
            delivery_transport_title = (body_data.get('delivery_transport_title') or '').replace("'", "''")
            delivery_transport_text = (body_data.get('delivery_transport_text') or '').replace("'", "''")
            delivery_pickup_title = (body_data.get('delivery_pickup_title') or '').replace("'", "''")
            delivery_pickup_text = (body_data.get('delivery_pickup_text') or '').replace("'", "''")
            payment_title = (body_data.get('payment_title') or '').replace("'", "''")
            
            payment_methods = body_data.get('payment_methods', '')
            if isinstance(payment_methods, str):
                payment_methods_json = json.dumps([m.strip() for m in payment_methods.split('\n') if m.strip()])
            else:
                payment_methods_json = json.dumps(payment_methods)
            payment_methods_json = payment_methods_json.replace("'", "''")
            
            cur.execute(
                f"""INSERT INTO site_settings (
                    id, site_name, logo_url, site_description, phone, email, address, work_hours, promotions, additional_info, price_list_url, 
                    holiday_theme, loyalty_card_price, loyalty_unlock_amount, loyalty_cashback_percent, admin_pin,
                    delivery_enabled, delivery_price,
                    about_title, about_text, care_title, care_watering_title, care_watering_text, care_lighting_title, care_lighting_text,
                    care_pruning_title, care_pruning_text, delivery_title, delivery_courier_title, delivery_courier_text,
                    delivery_transport_title, delivery_transport_text, delivery_pickup_title, delivery_pickup_text,
                    payment_title, payment_methods
                   )
                   VALUES (1, '{site_name}', '{logo_url}', '{site_desc}', '{phone}', '{email}', '{address}', '{work_hours}', '{promotions}', '{additional_info}', '{price_list_url}', 
                    '{holiday_theme}', {loyalty_card_price}, {loyalty_unlock_amount}, {loyalty_cashback_percent}, '{admin_pin}',
                    {delivery_enabled}, {delivery_price},
                    '{about_title}', '{about_text}', '{care_title}', '{care_watering_title}', '{care_watering_text}', '{care_lighting_title}', '{care_lighting_text}',
                    '{care_pruning_title}', '{care_pruning_text}', '{delivery_title}', '{delivery_courier_title}', '{delivery_courier_text}',
                    '{delivery_transport_title}', '{delivery_transport_text}', '{delivery_pickup_title}', '{delivery_pickup_text}',
                    '{payment_title}', '{payment_methods_json}'::jsonb
                   )
                   ON CONFLICT (id) DO UPDATE SET
                   site_name = EXCLUDED.site_name,
                   logo_url = EXCLUDED.logo_url,
                   site_description = EXCLUDED.site_description,
                   phone = EXCLUDED.phone,
                   email = EXCLUDED.email,
                   address = EXCLUDED.address,
                   work_hours = EXCLUDED.work_hours,
                   promotions = EXCLUDED.promotions,
                   additional_info = EXCLUDED.additional_info,
                   price_list_url = EXCLUDED.price_list_url,
                   holiday_theme = EXCLUDED.holiday_theme,
                   loyalty_card_price = EXCLUDED.loyalty_card_price,
                   loyalty_unlock_amount = EXCLUDED.loyalty_unlock_amount,
                   loyalty_cashback_percent = EXCLUDED.loyalty_cashback_percent,
                   admin_pin = EXCLUDED.admin_pin,
                   delivery_enabled = EXCLUDED.delivery_enabled,
                   delivery_price = EXCLUDED.delivery_price,
                   about_title = EXCLUDED.about_title,
                   about_text = EXCLUDED.about_text,
                   care_title = EXCLUDED.care_title,
                   care_watering_title = EXCLUDED.care_watering_title,
                   care_watering_text = EXCLUDED.care_watering_text,
                   care_lighting_title = EXCLUDED.care_lighting_title,
                   care_lighting_text = EXCLUDED.care_lighting_text,
                   care_pruning_title = EXCLUDED.care_pruning_title,
                   care_pruning_text = EXCLUDED.care_pruning_text,
                   delivery_title = EXCLUDED.delivery_title,
                   delivery_courier_title = EXCLUDED.delivery_courier_title,
                   delivery_courier_text = EXCLUDED.delivery_courier_text,
                   delivery_transport_title = EXCLUDED.delivery_transport_title,
                   delivery_transport_text = EXCLUDED.delivery_transport_text,
                   delivery_pickup_title = EXCLUDED.delivery_pickup_title,
                   delivery_pickup_text = EXCLUDED.delivery_pickup_text,
                   payment_title = EXCLUDED.payment_title,
                   payment_methods = EXCLUDED.payment_methods,
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