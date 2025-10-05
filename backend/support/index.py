import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage support tickets and messages
    Args: event with httpMethod, body, queryStringParameters
    Returns: HTTP response with tickets data
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
            user_id = params.get('user_id')
            get_all = params.get('all')
            ticket_id = params.get('ticket_id')
            
            if ticket_id:
                mark_as_read = params.get('mark_as_read')
                
                if mark_as_read == 'true':
                    cur.execute(
                        f"""UPDATE support_messages 
                           SET is_read = TRUE 
                           WHERE ticket_id = {ticket_id} AND is_admin = TRUE AND is_read = FALSE"""
                    )
                    conn.commit()
                
                cur.execute(
                    f"""SELECT t.*, u.full_name as user_name, u.phone as user_phone,
                       json_agg(json_build_object(
                           'id', m.id,
                           'message', m.message,
                           'is_admin', m.is_admin,
                           'is_read', m.is_read,
                           'created_at', m.created_at
                       ) ORDER BY m.created_at ASC) as messages
                       FROM support_tickets t
                       LEFT JOIN users u ON t.user_id = u.id
                       LEFT JOIN support_messages m ON t.id = m.ticket_id
                       WHERE t.id = {ticket_id}
                       GROUP BY t.id, u.full_name, u.phone"""
                )
                ticket = cur.fetchone()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'ticket': dict(ticket) if ticket else None}, default=str),
                    'isBase64Encoded': False
                }
            
            if get_all == 'true':
                cur.execute(
                    """SELECT t.*, u.full_name as user_name, u.phone as user_phone
                       FROM support_tickets t
                       LEFT JOIN users u ON t.user_id = u.id
                       ORDER BY t.created_at DESC"""
                )
                tickets = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'tickets': [dict(t) for t in tickets]}, default=str),
                    'isBase64Encoded': False
                }
            
            if user_id:
                cur.execute(
                    f"""SELECT t.*, u.full_name as user_name, u.phone as user_phone,
                       json_agg(json_build_object(
                           'id', m.id,
                           'message', m.message,
                           'is_admin', m.is_admin,
                           'is_read', m.is_read,
                           'created_at', m.created_at
                       ) ORDER BY m.created_at ASC) as messages
                       FROM support_tickets t
                       LEFT JOIN users u ON t.user_id = u.id
                       LEFT JOIN support_messages m ON t.id = m.ticket_id
                       WHERE t.user_id = {user_id} AND t.status IN ('open', 'in_progress')
                       GROUP BY t.id, u.full_name, u.phone
                       ORDER BY t.created_at DESC
                       LIMIT 1"""
                )
                active_ticket = cur.fetchone()
                
                if active_ticket:
                    cur.execute(
                        f"""UPDATE support_messages 
                           SET is_read = TRUE 
                           WHERE ticket_id = {active_ticket['id']} AND is_admin = TRUE AND is_read = FALSE"""
                    )
                    conn.commit()
                    
                    cur.execute(
                        f"""SELECT COUNT(*) FROM support_messages 
                           WHERE ticket_id = {active_ticket['id']} AND is_admin = TRUE AND is_read = FALSE"""
                    )
                    unread_result = cur.fetchone()
                    unread_count = unread_result['count'] if unread_result else 0
                    active_ticket_dict = dict(active_ticket)
                    active_ticket_dict['unread_count'] = unread_count
                else:
                    active_ticket_dict = None
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'active_ticket': active_ticket_dict
                    }, default=str),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id or all=true required'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action', 'create_ticket')
            
            if action == 'create_ticket':
                user_id = body_data.get('user_id')
                subject = body_data.get('subject', '').replace("'", "''")
                message = body_data.get('message', '').replace("'", "''")
                priority = body_data.get('priority', 'medium').replace("'", "''")
                
                cur.execute(
                    f"""SELECT id FROM support_tickets 
                       WHERE user_id = {user_id} AND status IN ('open', 'in_progress')
                       LIMIT 1"""
                )
                existing = cur.fetchone()
                
                if existing:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'У вас уже есть открытое обращение'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    f"""INSERT INTO support_tickets (user_id, subject, message, priority) 
                       VALUES ({user_id}, '{subject}', '{message}', '{priority}') 
                       RETURNING id"""
                )
                ticket_id = cur.fetchone()['id']
                
                cur.execute(
                    f"""INSERT INTO support_messages (ticket_id, user_id, is_admin, message) 
                       VALUES ({ticket_id}, {user_id}, FALSE, '{message}')"""
                )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'ticket_id': ticket_id}),
                    'isBase64Encoded': False
                }
            
            elif action == 'add_message':
                ticket_id = body_data.get('ticket_id')
                user_id = body_data.get('user_id')
                message = body_data.get('message', '').replace("'", "''")
                is_admin = body_data.get('is_admin', False)
                
                cur.execute(
                    f"""INSERT INTO support_messages (ticket_id, user_id, is_admin, message) 
                       VALUES ({ticket_id}, {user_id}, {is_admin}, '{message}')"""
                )
                
                cur.execute(
                    f"UPDATE support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = {ticket_id}"
                )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            elif action == 'rate_ticket':
                ticket_id = body_data.get('ticket_id')
                rating = body_data.get('rating')
                rating_comment = body_data.get('rating_comment', '').replace("'", "''")
                
                if not ticket_id or not rating:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'ticket_id and rating required'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    f"""UPDATE support_tickets 
                       SET rating = {rating}, rating_comment = '{rating_comment}', updated_at = CURRENT_TIMESTAMP 
                       WHERE id = {ticket_id}"""
                )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            ticket_id = body_data.get('ticket_id')
            status = body_data.get('status', '').replace("'", "''")
            
            if not ticket_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ticket_id required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                f"UPDATE support_tickets SET status = '{status}', updated_at = CURRENT_TIMESTAMP WHERE id = {ticket_id}"
            )
            
            if status == 'closed':
                cur.execute(f"SELECT user_id FROM support_tickets WHERE id = {ticket_id}")
                ticket_user = cur.fetchone()
                if ticket_user:
                    user_id_for_notif = ticket_user['user_id']
                    title = 'Тикет закрыт'
                    message = 'Ваш тикет был закрыт. Оцените качество поддержки'
                    
                    cur.execute(
                        f"INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, requires_rating) VALUES ({user_id_for_notif}, 'ticket_closed', '{title}', '{message}', 'ticket', {ticket_id}, TRUE)"
                    )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            ticket_id = body_data.get('ticket_id')
            
            if not ticket_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ticket_id required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(f"DELETE FROM support_messages WHERE ticket_id = {ticket_id}")
            cur.execute(f"DELETE FROM support_tickets WHERE id = {ticket_id}")
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