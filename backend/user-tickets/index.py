import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage support tickets - get tickets, update status, add comments
    Args: event with httpMethod (GET/PUT/POST), various parameters for different operations
    Returns: HTTP response with tickets, comments, or update confirmation
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
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
    
    status_map = {
        'new': 'Новое',
        'open': 'Открыто',
        'in_progress': 'В обработке',
        'resolved': 'Решено',
        'closed': 'Закрыто'
    }
    
    try:
        if method == 'GET':
            query_params = event.get('queryStringParameters', {})
            user_id = query_params.get('user_id') if query_params else None
            ticket_number = query_params.get('ticket_number') if query_params else None
            admin_mode = query_params.get('admin') if query_params else None
            get_comments = query_params.get('comments') if query_params else None
            ticket_id = query_params.get('ticket_id') if query_params else None
            
            if get_comments and ticket_id:
                cur.execute(
                    """
                    SELECT tc.id, tc.comment, tc.is_admin, tc.created_at, u.full_name, u.phone
                    FROM t_p77282076_fruit_shop_creation.ticket_comments tc
                    JOIN t_p77282076_fruit_shop_creation.users u ON tc.user_id = u.id
                    WHERE tc.ticket_id = %s
                    ORDER BY tc.created_at ASC
                    """,
                    (int(ticket_id),)
                )
                
                comments = []
                for row in cur.fetchall():
                    comments.append({
                        'id': row[0],
                        'comment': row[1],
                        'is_admin': row[2],
                        'created_at': row[3].isoformat() if row[3] else None,
                        'author_name': row[4] or row[5] or 'Пользователь'
                    })
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'comments': comments
                    })
                }
            
            if admin_mode:
                auth_user_id = event.get('headers', {}).get('X-User-Id')
                if not auth_user_id:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Authentication required'})
                    }
                
                cur.execute(
                    "SELECT is_admin FROM t_p77282076_fruit_shop_creation.users WHERE id = %s",
                    (int(auth_user_id),)
                )
                admin_check = cur.fetchone()
                
                if not admin_check or not admin_check[0]:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Admin access required'})
                    }
                
                status_filter = query_params.get('status') if query_params else None
                
                query = """
                    SELECT id, ticket_number, user_id, name, phone, email, category, 
                           subject, message, status, priority, created_at, updated_at, attachments
                    FROM t_p77282076_fruit_shop_creation.support_tickets
                """
                
                if status_filter:
                    query += " WHERE status = %s"
                    query += " ORDER BY created_at DESC LIMIT 100"
                    cur.execute(query, (status_filter,))
                else:
                    query += " ORDER BY created_at DESC LIMIT 100"
                    cur.execute(query)
                
                tickets = []
                for row in cur.fetchall():
                    tickets.append({
                        'id': row[0],
                        'ticket_number': row[1],
                        'user_id': row[2],
                        'name': row[3],
                        'phone': row[4],
                        'email': row[5],
                        'category': row[6],
                        'subject': row[7],
                        'message': row[8],
                        'status': row[9],
                        'status_text': status_map.get(row[9], row[9]),
                        'priority': row[10],
                        'created_at': row[11].isoformat() if row[11] else None,
                        'updated_at': row[12].isoformat() if row[12] else None,
                        'attachments': row[13] if row[13] else []
                    })
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'tickets': tickets,
                        'count': len(tickets)
                    })
                }
            
            if ticket_number:
                cur.execute(
                    """SELECT id, ticket_number, subject, message, status, priority, created_at, updated_at, category, name, attachments, user_id
                       FROM t_p77282076_fruit_shop_creation.support_tickets 
                       WHERE ticket_number = %s 
                       LIMIT 1""",
                    (ticket_number,)
                )
                
                row = cur.fetchone()
                
                if not row:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'success': False,
                            'error': 'Ticket not found'
                        })
                    }
                
                ticket = {
                    'id': row[0],
                    'ticket_number': row[1],
                    'subject': row[2],
                    'message': row[3],
                    'status': row[4],
                    'status_text': status_map.get(row[4], row[4]),
                    'priority': row[5],
                    'created_at': row[6].isoformat() if row[6] else None,
                    'updated_at': row[7].isoformat() if row[7] else None,
                    'category': row[8],
                    'name': row[9],
                    'attachments': row[10] if row[10] else [],
                    'user_id': row[11]
                }
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'ticket': ticket
                    })
                }
            
            if not user_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id or ticket_number is required'})
                }
            
            cur.execute(
                """SELECT id, ticket_number, subject, message, status, priority, created_at 
                   FROM t_p77282076_fruit_shop_creation.support_tickets 
                   WHERE user_id = %s 
                   ORDER BY created_at DESC
                   LIMIT 50""",
                (int(user_id),)
            )
            
            tickets = []
            for row in cur.fetchall():
                tickets.append({
                    'id': row[0],
                    'ticket_number': row[1],
                    'subject': row[2],
                    'message': row[3],
                    'status': row[4],
                    'status_text': status_map.get(row[4], row[4]),
                    'priority': row[5],
                    'created_at': row[6].isoformat() if row[6] else None
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'tickets': tickets,
                    'count': len(tickets)
                })
            }
        
        if method == 'PUT':
            user_id = event.get('headers', {}).get('X-User-Id')
            if not user_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Authentication required'})
                }
            
            cur.execute(
                "SELECT is_admin FROM t_p77282076_fruit_shop_creation.users WHERE id = %s",
                (int(user_id),)
            )
            admin_check = cur.fetchone()
            
            if not admin_check or not admin_check[0]:
                cur.close()
                conn.close()
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Admin access required'})
                }
            
            body_data = json.loads(event.get('body', '{}'))
            ticket_id = body_data.get('ticket_id')
            new_status = body_data.get('status')
            admin_notes = body_data.get('admin_notes')
            
            if not ticket_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ticket_id is required'})
                }
            
            update_fields = []
            update_values = []
            
            if new_status:
                update_fields.append("status = %s")
                update_values.append(new_status)
                if new_status in ['resolved', 'closed']:
                    update_fields.append("resolved_at = CURRENT_TIMESTAMP")
            
            if admin_notes is not None:
                update_fields.append("admin_notes = %s")
                update_values.append(admin_notes)
            
            if not update_fields:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'No fields to update'})
                }
            
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            update_values.append(int(ticket_id))
            
            update_query = f"""
                UPDATE t_p77282076_fruit_shop_creation.support_tickets 
                SET {', '.join(update_fields)}
                WHERE id = %s
            """
            
            cur.execute(update_query, tuple(update_values))
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Ticket updated successfully'
                })
            }
        
        if method == 'POST':
            user_id = event.get('headers', {}).get('X-User-Id')
            if not user_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Authentication required'})
                }
            
            cur.execute(
                "SELECT is_admin FROM t_p77282076_fruit_shop_creation.users WHERE id = %s",
                (int(user_id),)
            )
            admin_check = cur.fetchone()
            is_admin = admin_check[0] if admin_check else False
            
            body_data = json.loads(event.get('body', '{}'))
            ticket_id = body_data.get('ticket_id')
            comment = body_data.get('comment', '').strip()
            
            if not ticket_id or not comment:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ticket_id and comment are required'})
                }
            
            cur.execute(
                """
                INSERT INTO t_p77282076_fruit_shop_creation.ticket_comments 
                (ticket_id, user_id, comment, is_admin)
                VALUES (%s, %s, %s, %s)
                RETURNING id
                """,
                (int(ticket_id), int(user_id), comment, is_admin)
            )
            
            comment_id = cur.fetchone()[0]
            
            cur.execute(
                "UPDATE t_p77282076_fruit_shop_creation.support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                (int(ticket_id),)
            )
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'comment_id': comment_id,
                    'message': 'Comment added successfully'
                })
            }
        
        cur.close()
        conn.close()
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
        
    except Exception as e:
        cur.close()
        conn.close()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
