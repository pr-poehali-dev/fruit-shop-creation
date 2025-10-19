import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Create support ticket for authenticated and non-authenticated users
    Args: event with httpMethod, body containing name, phone, email (optional), category, subject, message
    Returns: HTTP response with ticket_id and ticket_number
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        name = body_data.get('name', '').strip()
        phone = body_data.get('phone', '').strip()
        email = body_data.get('email', '').strip()
        category = body_data.get('category', '').strip()
        subject = body_data.get('subject', '').strip()
        message = body_data.get('message', '').strip()
        
        user_id = event.get('headers', {}).get('X-User-Id')
        
        if not name:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Name is required'})
            }
        
        if not phone:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Phone is required'})
            }
        
        if not category:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Category is required'})
            }
        
        if not subject:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Subject is required'})
            }
        
        if not message:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Message is required'})
            }
        
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database configuration missing'})
            }
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        cur.execute(
            """SELECT id FROM t_p77282076_fruit_shop_creation.users WHERE phone = %s LIMIT 1""",
            (phone,)
        )
        existing_user = cur.fetchone()
        
        if existing_user:
            user_id_to_use = existing_user[0]
        elif user_id:
            user_id_to_use = int(user_id)
        else:
            cur.execute(
                """INSERT INTO t_p77282076_fruit_shop_creation.users (phone, full_name, password) 
                   VALUES (%s, %s, '') RETURNING id""",
                (phone, name)
            )
            user_id_to_use = cur.fetchone()[0]
        
        insert_query = """
            INSERT INTO t_p77282076_fruit_shop_creation.support_tickets 
            (user_id, name, phone, email, category, subject, message, status, priority)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'new', 'normal')
            RETURNING id
        """
        cur.execute(insert_query, (user_id_to_use, name, phone, email if email else None, category, subject, message))
        
        ticket_id = cur.fetchone()[0]
        ticket_number = f'T{str(ticket_id).zfill(6)}'
        
        cur.execute(
            "UPDATE t_p77282076_fruit_shop_creation.support_tickets SET ticket_number = %s WHERE id = %s",
            (ticket_number, ticket_id)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'ticket_id': ticket_id,
                'ticket_number': ticket_number,
                'message': 'Ticket created successfully'
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }